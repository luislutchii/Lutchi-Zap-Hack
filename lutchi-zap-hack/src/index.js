const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const pino      = require("pino");
const qrcode    = require("qrcode-terminal");
const { Boom }  = require("@hapi/boom");
const path      = require("path");
const axios     = require("axios");
const NodeCache = require("node-cache");
const config    = require("./config/config");
const messageHandler = require("./utils/messageHandler");
const { loadDatabase, getRules, getBoasVindas } = require("./utils/database");

global.bannedByBot = new Set();

// Controla reconexões para evitar listeners duplicados
let isConnected = false;

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
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    retryRequestDelayMs: 250,
    maxMsgRetryCount: 5,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 Escaneie o QR Code abaixo:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      isConnected = false;
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log(`\n❌ Conexão encerrada. Código: ${code}`);

      if (code === DisconnectReason.loggedOut) {
        console.log("🚪 Sessão encerrada. Delete data/session e reinicie.");
        process.exit(0);
      }

      const delay = code === 428 ? 10000 : 5000;
      console.log(`🔄 Reconectando em ${delay/1000}s...\n`);
      setTimeout(() => startBot(), delay);

    } else if (connection === "open") {
      if (isConnected) return; // evita duplicar ao reconectar
      isConnected = true;

      console.log("\n✅ Lutchi Zap Hack conectado!");
      console.log(`📌 Prefixo: ${config.prefix}`);
      console.log(`📋 Menu: ${config.prefix}lutchi\n`);

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

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    console.log("📨 UPSERT:", type, messages.length);
    if (type !== "notify") return;
    for (const msg of messages) {
      const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
      const types = Object.keys(msg.message || {});
      console.log("  → from:", msg.key.remoteJid, "fromMe:", msg.key.fromMe, "body:", body.slice(0,20), "types:", types);
      if (!msg.message || msg.key.fromMe) continue;
      await messageHandler(sock, msg, null).catch(e => console.error("❌ Handler:", e.message));
    }
  });

  sock.ev.on("call", async (calls) => {
    for (const call of calls) {
      if (!call.isGroup || call.status !== "offer") continue;
      const { getAntiCall } = require("./utils/database");
      if (!getAntiCall(call.chatId)) continue;
      const caller = call.from;
      const num    = caller.split("@")[0].replace(/:.*/, "");
      global.bannedByBot?.add(caller);
      await sock.rejectCall(call.id, call.from).catch(() => {});
      await sock.sendMessage(call.chatId, {
        text: `📵 *ANTI-CALL*\n\n@${num} foi *banido* por fazer uma chamada no grupo!`,
        mentions: [caller],
      }).catch(() => {});
      await sock.groupParticipantsUpdate(call.chatId, [caller], "remove").catch(() => {});
    }
  });

  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    const groupMeta = await sock.groupMetadata(id).catch(() => null);
    if (!groupMeta) return;

    for (const participant of participants) {
      const jid = typeof participant === "string" ? participant : participant?.id || "";
      const num = jid.includes("@") ? jid.split("@")[0] : jid;

      if (action === "add") {
        if (!getBoasVindas(id)) continue;
        const regras      = getRules(id) || config.defaultRules;
        const welcomeText =
          `👋 *Bem-vindo(a)* @${num} ao *${groupMeta.subject}*!\n\n` +
          `📸 Por favor apresenta-te com:\n` +
          `› 👤 *Nome:*\n› 🎂 *Idade:*\n› 📍 *Morada:*\n› 🌍 *País:*\n\n` +
          `📋 *REGRAS DO GRUPO:*\n${regras}\n\n` +
          `_🤖 Lutchi Zap Hack_`;
        try {
          const ppUrl = await sock.profilePictureUrl(jid, "image").catch(() => null);
          if (ppUrl) {
            const res = await axios.get(ppUrl, { responseType: "arraybuffer", timeout: 8000 });
            await sock.sendMessage(id, { image: Buffer.from(res.data), caption: welcomeText, mentions: [jid] });
          } else {
            await sock.sendMessage(id, { text: welcomeText, mentions: [jid] });
          }
        } catch {
          await sock.sendMessage(id, { text: welcomeText, mentions: [jid] }).catch(() => {});
        }

      } else if (action === "remove") {
        if (global.bannedByBot.has(jid)) {
          global.bannedByBot.delete(jid);
          continue;
        }
        await sock.sendMessage(id, {
          text: `😢 @${num} saiu do grupo.`,
          mentions: [jid],
        }).catch(() => {});
      }
    }
  });
}

startBot().catch(console.error);
process.on("uncaughtException",  (err) => console.error("❌", err.message));
process.on("unhandledRejection", (err) => console.error("❌", err?.message || err));
