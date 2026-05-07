const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const pino     = require("pino");
const qrcode   = require("qrcode-terminal");
const { Boom } = require("@hapi/boom");
const path     = require("path");
const axios    = require("axios");
const config   = require("./config/config");
const NodeCache = require("node-cache");
const messageHandler = require("./utils/messageHandler");
const { iniciarAnunciosTodos } = require("./commands/anuncio");
const { loadDatabase, getRules, getBoasvindas } = require("./utils/database");

const bannedByBot = new Set();
global.bannedByBot = bannedByBot;

async function startBot() {
  console.log(`
╔══════════════════════════════════════════╗
║         LUTCHI ZAP HACK v1.0.0          ║
║   Bot de Gerenciamento WhatsApp 🤖      ║
║   Dono: Luís Lutchi @luislutchii        ║
╚══════════════════════════════════════════╝`);

  const { version }          = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(__dirname, "../data/session")
  );

  loadDatabase();

  const msgRetryCounterCache = new NodeCache();
  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Lutchi Zap Hack", "Chrome", "1.0.0"],
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    retryRequestDelayMs: 2000,
    maxMsgRetryCount: 3,
    msgRetryCounterCache: {},
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 25000,
  });

  // ── Conexão ───────────────────────────────────────────────────
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 Escaneie o QR Code abaixo:\n");
      qrcode.generate(qr, { small: true });
      console.log("\n🔗 WhatsApp → Aparelhos Conectados → Conectar Aparelho\n");
    }

    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconectando em 5s...");
        setTimeout(() => startBot(), 5000);
      } else {
        console.log("🚪 Sessão encerrada. Delete data/session e reinicie.");
        process.exit(0);
      }
    } else if (connection === "open") {
      console.log("\n✅ Lutchi Zap Hack conectado!");
      console.log(`📌 Prefixo: ${config.prefix}`);
      console.log(`📋 Menu: ${config.prefix}lutchi\n`);
      setTimeout(() => iniciarAnunciosTodos(sock), 5000);
      await sock.sendMessage(`${config.owner.number}@s.whatsapp.net`, {
        text:
          `🤖 *${config.botName}* iniciou!\n\n` +
          `⚡ Prefixo: *${config.prefix}*\n` +
          `📋 Menu: *${config.prefix}lutchi*\n` +
          `🕐 ${new Date().toLocaleString("pt-AO")}`,
      }).catch(() => {});
    }
  });

  sock.ev.on("creds.update", saveCreds);
  
  // ── Mensagens ─────────────────────────────────────────────────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    console.log("📨 upsert type:", type, "msgs:", messages.length);
    if (type === "notify") console.log("📨 NOTIFY MSG:", JSON.stringify(messages[0]?.key, null, 2));
    if (type !== "notify" && type !== "append") return;
    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.remoteJid === "status@broadcast") continue;
      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text || "";
      if (msg.key.fromMe && !body.startsWith(".")) continue;
      await messageHandler(sock, msg, null);
    }
  });

  // ── Entradas / Saídas ─────────────────────────────────────────
  // ── Anti-Call ─────────────────────────────────────────────
  sock.ev.on("call", async (calls) => {
    for (const call of calls) {
      if (!call.isGroup || call.status !== "offer") continue;
      const { getAntiCall } = require("./commands/mod");
      // getAntiCall via database
      const { getAntiCall: getAC } = require("./utils/database");
      if (!getAC(call.chatId)) continue;
      const caller = call.from;
      const num    = caller.split("@")[0].replace(/:.*/, "");
      global.bannedByBot?.add(caller);
      await sock.sendMessage(call.chatId, {
        text: "📵 *ANTI-CALL*\n\n@" + num + " foi *banido* por fazer uma chamada no grupo!",
        mentions: [caller],
      }).catch(() => {});
      await sock.groupParticipantsUpdate(call.chatId, [caller], "remove").catch(() => {});
      await sock.rejectCall(call.id, call.from).catch(() => {});
    }
  });

  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    const groupMeta = await sock.groupMetadata(id).catch(() => null);
    if (!groupMeta) return;

    for (const participant of participants) {
      const num = (typeof participant === "string" ? participant : (participant?.id || participant?.jid || "")).split("@")[0];

      if (action === "add") {
        if (!getBoasvindas(id)) continue;

        const regras      = getRules(id) || config.defaultRules;
        const welcomeText =
          `👋 *Bem-vindo(a)* @${num} ao *${groupMeta.subject}*!\n\n` +
          `📸 Por favor apresenta-te com:\n` +
          `› 👤 *Nome:*\n` +
          `› 🎂 *Idade:*\n` +
          `› 📍 *Morada:*\n` +
          `› 🌍 *País:*\n\n` +
          `📋 *REGRAS DO GRUPO:*\n${regras}\n\n` +
          `_🤖 Lutchi Zap Hack_`;

        try {
          const ppUrl = await sock.profilePictureUrl(participant, "image").catch(() => null);
          if (ppUrl) {
            const res = await axios.get(ppUrl, { responseType: "arraybuffer", timeout: 8000 });
            await sock.sendMessage(id, {
              image: Buffer.from(res.data),
              caption: welcomeText,
              mentions: [participant],
            });
          } else {
            await sock.sendMessage(id, { text: welcomeText, mentions: [participant] });
          }
        } catch {
          await sock.sendMessage(id, { text: welcomeText, mentions: [participant] }).catch(() => {});
        }

      } else if (action === "remove") {
        if (global.bannedByBot.has(participant)) {
          global.bannedByBot.delete(participant);
          continue;
        }
        await sock.sendMessage(id, {
          text: `😢 @${num} saiu do grupo.`,
          mentions: [participant],
        }).catch(() => {});
      }
    }
  });
}



startBot().catch(console.error);
process.on("uncaughtException",  (err) => console.error("❌", err.message));
process.on("unhandledRejection", (err) => console.error("❌", err?.message || err));


