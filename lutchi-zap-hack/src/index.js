const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const path = require("path");
const fs = require("fs");
const config = require("./config/config");
const messageHandler = require("./utils/messageHandler");
const { loadDatabase } = require("./utils/database");

async function startBot() {
  console.log(`
╔══════════════════════════════════════════╗
║         LUTCHI ZAP HACK v1.0            ║
║   Bot de Gerenciamento WhatsApp 🤖      ║
║   Dono: Luís Lutchi                     ║
║   Instagram: @luislutchii               ║
╚══════════════════════════════════════════╝
  `);

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
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      const qrcode = require("qrcode-terminal");
      qrcode.generate(qr, { small: true });
      console.log("\n📱 Escaneie o QR Code acima!\n");
    }
    if (connection === "close") {
      const shouldReconnect =
        new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log("🔄 Reconectando...");
        setTimeout(() => startBot(), 5000);
      } else {
        console.log("🚪 Sessão encerrada.");
        process.exit(0);
      }
    } else if (connection === "open") {
      console.log("✅ Bot conectado com sucesso!");
      const ownerJid = config.owner.number + "@s.whatsapp.net";
      await sock.sendMessage(ownerJid, {
        text: "🤖 *" + config.botName + "* iniciou com sucesso!\n\n✅ Online e pronto!\n\n_" + new Date().toLocaleString("pt-AO") + "_",
      }).catch(() => {});
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;
      await messageHandler(sock, msg, null);
    }
  });

  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    const groupMeta = await sock.groupMetadata(id).catch(() => null);
    if (!groupMeta) return;
    for (const participant of participants) {
      const num = participant.split("@")[0];
      if (action === "add") {
        await sock.sendMessage(id, {
          text: "👋 Bem-vindo(a) @" + num + "!\n\nDigite *" + config.menuPrefix + "* para ver o menu.",
          mentions: [participant],
        });
      } else if (action === "remove") {
        await sock.sendMessage(id, {
          text: "😢 @" + num + " saiu do grupo.",
          mentions: [participant],
        });
      }
    }
  });
}

startBot().catch(console.error);
process.on("uncaughtException", (err) => console.error("❌ Erro:", err));
process.on("unhandledRejection", (err) => console.error("❌ Promise:", err));
