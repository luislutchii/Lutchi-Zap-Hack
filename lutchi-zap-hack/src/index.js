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
const messageHandler = require("./utils/messageHandler");
const { handleAntiStatus, handleStatusBroadcast } = require("./utils/antiStatus");
const { loadDatabase, getRules, getBoasVindas } = require("./utils/database");

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

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Lutchi Zap Hack", "Chrome", "1.0.0"],
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
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
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const remoteJid = msg.key.remoteJid;
      const sender    = msg.key.participant || msg.key.remoteJid;

      // ── Mensagem de STATUS (status@broadcast) ─────────────────
      if (remoteJid === "status@broadcast") {
        await handleStatusBroadcast(sock, msg, sender);
        continue;
      }

      // ── Mensagem de GRUPO ─────────────────────────────────────
      if (remoteJid?.endsWith("@g.us")) {
        await messageHandler(sock, msg, null);
        await handleAntiStatus(sock, msg, remoteJid, sender);
        continue;
      }

      // ── Mensagem PRIVADA ──────────────────────────────────────
      await messageHandler(sock, msg, null);
    }
  });

  // ── Entradas / Saídas ─────────────────────────────────────────
  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    const groupMeta = await sock.groupMetadata(id).catch(() => null);
    if (!groupMeta) return;

    for (const participant of participants) {
      const num = (typeof participant === "string" ? participant : (participant?.id || participant?.jid || "")).split("@")[0];

      if (action === "add") {
        if (!getBoasVindas(id)) continue;

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
