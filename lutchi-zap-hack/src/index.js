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
const { iniciarAnunciosTodos } = require("./commands/anuncio");
const { loadDatabase, getRules, getBoasvindas } = require("./utils/database");

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
    auth: state,
    browser: ["Lutchi Zap Hack", "Chrome", "1.0.0"],
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });

  // ── Conexão ───────────────────────────────────────────────────
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 Escaneie o QR Code:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconectando em 5s...");
        setTimeout(() => startBot(), 5000);
      } else {
        console.log("🚪 Sessão encerrada.");
        process.exit(0);
      }
    } else if (connection === "open") {
      console.log("\n✅ Lutchi Zap Hack conectado!");
      console.log(`📌 Prefixo: ${config.prefix}`);
      console.log(`📋 Menu: ${config.prefix}lutchi\n`);
      setTimeout(() => iniciarAnunciosTodos(sock), 10000);
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
    for (const msg of messages) {
      try {
        if (!msg.message) continue;
        if (msg.key.remoteJid === "status@broadcast") continue;

        // Ignorar tipos irrelevantes
        const msgType = Object.keys(msg.message)[0];
        const skipTypes = [
          "senderKeyDistributionMessage",
          "reactionMessage",
          "messageContextInfo",
          "protocolMessage",
          "pollUpdateMessage",
        ];
        if (skipTypes.includes(msgType)) continue;

        // Extrair body
        const body =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.imageMessage?.caption ||
          msg.message?.videoMessage?.caption || "";

        // Ignorar fromMe que não sejam comandos
        if (msg.key.fromMe && !body.startsWith(config.prefix)) continue;

        // Só processar se tiver prefixo OU for do dono
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwnerMsg = sender.includes(config.owner.number) ||
          (config.owner.lid && sender.includes(config.owner.lid));

        if (!body.startsWith(config.prefix) && !isOwnerMsg) continue;
        if (!body.startsWith(config.prefix)) continue;

        await messageHandler(sock, msg, null);
      } catch (e) {
        console.error("❌ Erro upsert:", e.message);
      }
    }
  });

  // ── Entradas / Saídas ─────────────────────────────────────────
  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    try {
      const groupMeta = await sock.groupMetadata(id).catch(() => null);
      if (!groupMeta) return;

      for (const participant of participants) {
        const jid = typeof participant === "string" ? participant : (participant?.id || "");
        const num = jid.split("@")[0];

        if (action === "add") {
          if (!getBoasvindas(id)) continue;
          const regras = getRules(id) || config.defaultRules;
          const welcomeText =
            `👋 *Bem-vindo(a)* @${num} ao *${groupMeta.subject}*!\n\n` +
            `📸 Por favor apresenta-te:\n` +
            `› 👤 *Nome:*\n› 🎂 *Idade:*\n› 📍 *Morada:*\n› 🌍 *País:*\n\n` +
            `📋 *REGRAS:*\n${regras}\n\n` +
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
    } catch (e) {}
  });

  // ── Anti-chamada ──────────────────────────────────────────────
  sock.ev.on("call", async (calls) => {
    for (const call of calls) {
      try {
        if (!call.chatId?.endsWith("@g.us")) continue;
        const { getAntiCall } = require("./utils/database");
        if (!getAntiCall(call.chatId)) continue;
        const meta = await sock.groupMetadata(call.chatId).catch(() => null);
        if (!meta) continue;
        const admins = meta.participants.filter(p => p.admin).map(p => p.id);
        const isAdmin = admins.some(a => a.includes(call.from?.split("@")[0]));
        if (isAdmin) continue;
        await sock.groupParticipantsUpdate(call.chatId, [call.from], "remove").catch(() => {});
        await sock.sendMessage(call.chatId, {
          text: `📵 @${call.from?.split("@")[0]} foi banido por iniciar uma chamada!`,
          mentions: [call.from],
        }).catch(() => {});
      } catch (_) {}
    }
  });
}

startBot().catch(console.error);
process.on("uncaughtException", (err) => console.error("❌", err.message));
process.on("unhandledRejection", (err) => console.error("❌", err?.message || err));
