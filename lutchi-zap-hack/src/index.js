// ╔══════════════════════════════════════════════════════════════╗
// ║                  LUTCHI ZAP HACK v1.0                       ║
// ║        Bot de Gerenciamento de Grupos WhatsApp              ║
// ║  Dono: Luís Lutchi | Instagram: @luislutchii               ║
// ║  Número: +244 924 319 522                                   ║
// ╚══════════════════════════════════════════════════════════════╝

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecode,
  proto,
  getContentType,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const path = require("path");
const fs = require("fs");
const config = require("./config/config");
const messageHandler = require("./utils/messageHandler");
const { loadDatabase } = require("./utils/database");

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

async function startBot() {
  console.log(`
╔══════════════════════════════════════════╗
║         LUTCHI ZAP HACK v1.0            ║
║   Bot de Gerenciamento WhatsApp 🤖      ║
║   Dono: Luís Lutchi                     ║
║   Instagram: @luislutchii               ║
╚══════════════════════════════════════════╝
  `);

  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`✅ Baileys versão: ${version.join(".")} | Mais recente: ${isLatest}`);

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
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg?.message || undefined;
      }
      return proto.Message.fromObject({});
    },
  });

  store?.bind(sock.ev);

  // Conexão e reconexão
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 Escaneie o QR Code acima com o WhatsApp!\n");
    }

    if (connection === "close") {
      const shouldReconnect =
        new Boom(lastDisconnect?.error)?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log(
        `❌ Conexão encerrada. Reconectando: ${shouldReconnect}`,
        lastDisconnect?.error
      );

      if (shouldReconnect) {
        console.log("🔄 Reconectando em 5 segundos...");
        setTimeout(() => startBot(), 5000);
      } else {
        console.log("🚪 Sessão encerrada. Delete a pasta data/session e reinicie.");
        process.exit(0);
      }
    } else if (connection === "open") {
      console.log(`\n✅ Bot conectado com sucesso!`);
      console.log(`🤖 Nome: ${config.botName}`);
      console.log(`👑 Dono: ${config.owner.name}`);
      console.log(`📱 Prefixo: ${config.prefix}`);
      console.log(`💬 Menu: ${config.menuPrefix}\n`);

      // Notifica o dono
      const ownerJid = `${config.owner.number}@s.whatsapp.net`;
      await sock.sendMessage(ownerJid, {
        text: `🤖 *${config.botName}* iniciou com sucesso!\n\n✅ Conectado e pronto para uso!\n\n_${new Date().toLocaleString("pt-AO")}_`,
      }).catch(() => {});
    }
  });

  // Salvar credenciais
  sock.ev.on("creds.update", saveCreds);

  // Handler de mensagens
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;
      await messageHandler(sock, msg, store);
    }
  });

  // Handler de participantes (entrada/saída)
  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    const groupMeta = await sock.groupMetadata(id).catch(() => null);
    if (!groupMeta) return;

    for (const participant of participants) {
      const num = participant.split("@")[0];
      const name = groupMeta.participants.find((p) => p.id === participant)?.name || num;

      if (action === "add") {
        await sock.sendMessage(id, {
          text: `👋 Bem-vindo(a) ao grupo, @${num}!\n\nDigite *${config.menuPrefix}* para ver o menu.`,
          mentions: [participant],
        });
      } else if (action === "remove") {
        await sock.sendMessage(id, {
          text: `😢 @${num} saiu do grupo.`,
          mentions: [participant],
        });
      }
    }
  });

  return sock;
}

// Iniciar
startBot().catch(console.error);

process.on("uncaughtException", (err) => {
  console.error("❌ Erro não capturado:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Promise rejeitada:", err);
});
