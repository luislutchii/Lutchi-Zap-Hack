const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
} = require("@whiskeysockets/baileys");
const pino   = require("pino");
const { Boom } = require("@hapi/boom");
const path   = require("path");
const config = require("./config/config");
const messageHandler = require("./utils/messageHandler");
const { loadDatabase, getRules } = require("./utils/database");

// JIDs banidos pelo antilink — não recebem mensagem de saída
const bannedByBot = new Set();
global.bannedByBot = bannedByBot;

async function startBot() {
  console.log(`
╔══════════════════════════════════════════╗
║         LUTCHI ZAP HACK v1.0            ║
║   Bot de Gerenciamento WhatsApp 🤖      ║
║   Dono: Luís Lutchi                     ║
║   Instagram: @luislutchii               ║
╚══════════════════════════════════════════╝
  `);

  const { version }          = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(__dirname, "../data/session")
  );

  loadDatabase();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: ["Lutchi Zap Hack", "Chrome", "1.0.0"],
    generateHighQualityLinkPreview: true,
  });

  // ── Conexão ───────────────────────────────────────────────────
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      try { const generateQR = require("./qr"); generateQR(qr); } catch (_) {}
      console.log("\n📱 Escaneie o QR Code!\n");
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
      const ownerJid = `${config.owner.number}@s.whatsapp.net`;
      await sock.sendMessage(ownerJid, {
        text: `🤖 *${config.botName}* iniciou com sucesso!\n\n⚡ Prefixo: *${config.prefix}*\n📋 Menu: *${config.prefix}lutchi*`,
      }).catch(() => {});
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ── Mensagens ─────────────────────────────────────────────────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;
      await messageHandler(sock, msg, null);
    }
  });

  // ── Entradas e saídas ─────────────────────────────────────────
  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    const groupMeta = await sock.groupMetadata(id).catch(() => null);
    if (!groupMeta) return;

    for (const participant of participants) {
      const num = participant.split("@")[0];

      if (action === "add") {
        // Busca regras do grupo
        const regras = getRules(id) || config.defaultRules;

        // Mensagem de boas-vindas com pedido de apresentação
        const welcomeText =
          `👋 *Bem-vindo(a)* @${num} ao grupo *${groupMeta.subject}*!\n\n` +
          `📸 Por favor, apresenta-te com:\n` +
          `• *Nome:*\n` +
          `• *Idade:*\n` +
          `• *Morada:*\n` +
          `• *País:*\n\n` +
          `📋 *REGRAS DO GRUPO:*\n${regras}\n\n` +
          `_🤖 Lutchi Zap Hack_`;

        // Tenta enviar com foto de perfil
        try {
          const ppUrl = await sock.profilePictureUrl(participant, "image").catch(() => null);
          if (ppUrl) {
            const axios = require("axios");
            const res   = await axios.get(ppUrl, { responseType: "arraybuffer" });
            await sock.sendMessage(id, {
              image: Buffer.from(res.data),
              caption: welcomeText,
              mentions: [participant],
            });
          } else {
            await sock.sendMessage(id, {
              text: welcomeText,
              mentions: [participant],
            });
          }
        } catch {
          await sock.sendMessage(id, {
            text: welcomeText,
            mentions: [participant],
          });
        }

      } else if (action === "remove") {
        // Não envia mensagem se foi banido pelo bot (antilink, blacklist)
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
process.on("uncaughtException",  (err) => console.error("❌ Erro:", err.message));
process.on("unhandledRejection", (err) => console.error("❌ Promise:", err?.message || err));
