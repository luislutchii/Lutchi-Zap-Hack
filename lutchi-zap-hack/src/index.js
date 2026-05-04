const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const path = require("path");
const axios = require("axios");
const config = require("./config/config");
const messageHandler = require("./utils/messageHandler");
const { loadDatabase, getRules, getBoasVindas } = require("./utils/database");

const qrcode = require("qrcode-terminal");

const bannedByBot = new Set();
global.bannedByBot = bannedByBot;

async function startBot() {
  console.log(`
╔══════════════════════════════════════════╗
║         LUTCHI ZAP HACK v1.0.0          ║
║   Bot de Gerenciamento WhatsApp 🤖      ║
║   Dono: Luís Lutchi @luislutchii        ║
╚══════════════════════════════════════════╝`);

  const { version } = await fetchLatestBaileysVersion();

  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(__dirname, "../data/session")
  );

  loadDatabase();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Lutchi Zap Hack", "Chrome", "1.0.0"],
    printQRInTerminal: false
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      console.clear();
      console.log("📱 Escaneie o QR Code abaixo:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ Lutchi Zap Hack conectado!");
    }

    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;

      if (code !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconectando em 5s...");
        setTimeout(startBot, 5000);
      } else {
        console.log("🚪 Sessão encerrada. Delete data/session e reinicie.");
        process.exit(0);
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;
      await messageHandler(sock, msg, null);
    }
  });

  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    const groupMeta = await sock.groupMetadata(id).catch(() => null);
    if (!groupMeta) return;

    for (const participant of participants) {
      const num = participant.split("@")[0];

      if (action === "add") {
        if (!getBoasVindas(id)) continue;

        const regras = getRules(id) || config.defaultRules;

        const welcomeText =
          `👋 *Bem-vindo(a)* @${num} ao *${groupMeta.subject}*!\n\n` +
          `📋 *REGRAS DO GRUPO:*\n${regras}\n\n` +
          `_🤖 Lutchi Zap Hack_`;

        await sock.sendMessage(id, {
          text: welcomeText,
          mentions: [participant],
        });

      } else if (action === "remove") {
        if (global.bannedByBot.has(participant)) {
          global.bannedByBot.delete(participant);
          continue;
        }

        await sock.sendMessage(id, {
          text: `😢 @${num} saiu do grupo.`,
          mentions: [participant],
        });
      }
    }
  });
}

startBot().catch(console.error);

process.on("uncaughtException", (err) => console.error("❌", err.message));
process.on("unhandledRejection", (err) => console.error("❌", err?.message || err));
