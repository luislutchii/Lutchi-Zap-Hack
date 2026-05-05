const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");
const pino     = require("pino");
const qrcode   = require("qrcode-terminal");
const { Boom } = require("@hapi/boom");
const path     = require("path");
const axios    = require("axios");
const config   = require("./config/config");
const messageHandler = require("./utils/messageHandler");
const { loadDatabase, getRules, getBoasVindas } = require("./utils/database");

global.bannedByBot = new Set();

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

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    browser: ["Lutchi Zap Hack", "Chrome", "1.0.0"],
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    keepAliveIntervalMs: 15000,
    connectTimeoutMs: 60000,
    retryRequestDelayMs: 2000,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 Escaneie o QR Code abaixo:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log(`\n❌ Conexão encerrada. Código: ${code}`);

      // 440 = sessão substituída por outro aparelho
      if (code === DisconnectReason.loggedOut) {
        console.log("🚪 Sessão encerrada. Delete data/session e reinicie.");
        process.exit(0);
      }

      const delay = code === 428 ? 10000 : 5000;
      console.log(`🔄 Reconectando em ${delay/1000}s...\n`);
      setTimeout(() => startBot(), delay);

    } else if (connection === "open") {
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
    if (type !== "notify") return;
    for (const msg of messages) {
      if (!msg.message) continue;
      const msgBody = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
      if (msg.key.fromMe && !msgBody.startsWith(".")) continue;
      await messageHandler(sock, msg, null);
    }
  });

  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    const groupMeta = await sock.groupMetadata(id).catch(() => null);
    if (!groupMeta) return;

    for (const participant of participants) {
      const jid = typeof participant === "string" ? participant : participant?.id || "";
      const num = jid.includes("@") ? jid.split("@")[0] : jid;

      const { getBoasvindas } = require("./utils/database");
        if (action === "add") {
          if (!getBoasvindas(id)) continue;
        if (!getBoasVindas(id)) continue;
        const regras      = getRules(id) || config.defaultRules;
        const welcomeText =
          `👋 *Bem-vindo(a)* @${num} ao *${groupMeta.subject}*!\n\n` +
          `📸 Por favor apresenta-te com:\n` +
          `› 👤 *Nome:*\n› 🎂 *Idade:*\n› 📍 *Morada:*\n› 🌍 *País:*\n\n` +
          `📋 *REGRAS DO GRUPO:*\n${regras}\n\n` +
          `_🤖 Lutchi Zap Hack_`;
        try {
          const ppUrl = await sock.profilePictureUrl(participant, "image").catch(() => null);
          if (ppUrl) {
            const res = await axios.get(ppUrl, { responseType: "arraybuffer", timeout: 8000 });
            await sock.sendMessage(id, { image: Buffer.from(res.data), caption: welcomeText, mentions: [participant] });
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
