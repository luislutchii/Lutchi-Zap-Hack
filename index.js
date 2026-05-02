// ============================================================
//  🤖 LUTCHI ZAP HACK — src/index.js
//  Dono: Luís Lutchi | Instagram: @luislutchii
//  Powered by @whiskeysockets/baileys
// ============================================================

import "dotenv/config";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidGroup,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import pino from "pino";
import { handleCommand } from "./commands/handler.js";
import { loadConfig } from "./config.js";

const logger = pino({ level: "silent" });
const config = loadConfig();

function printBanner() {
  console.clear();
  console.log(`
\x1b[35m╔══════════════════════════════════════════════════╗
║                                                  ║
║   ██╗     ██╗   ██╗████████╗ ██████╗██╗  ██╗    ║
║   ██║     ██║   ██║╚══██╔══╝██╔════╝██║  ██║    ║
║   ██║     ██║   ██║   ██║   ██║     ███████║    ║
║   ██║     ██║   ██║   ██║   ██║     ██╔══██║    ║
║   ███████╗╚██████╔╝   ██║   ╚██████╗██║  ██║    ║
║   ╚══════╝ ╚═════╝    ╚═╝    ╚═════╝╚═╝  ╚═╝    ║
║                                                  ║
║         🤖  Z A P   H A C K   B O T  🤖         ║
║                                                  ║
║   👑 Dono    : Luís Lutchi                       ║
║   📸 Instagram: @luislutchii                     ║
║   🔖 Versão  : v1.0.0                            ║
║   ⚡ Prefixo : .                                 ║
╚══════════════════════════════════════════════════╝\x1b[0m
`);
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
  const { version } = await fetchLatestBaileysVersion();

  printBanner();
  console.log(`\x1b[36m[INFO]\x1b[0m Baileys v${version.join(".")} | Node ${process.version}`);
  console.log(`\x1b[36m[INFO]\x1b[0m Iniciando conexão...\n`);

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ["Lutchi Zap Hack", "Chrome", "1.0.0"],
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
  });

  // ── QR Code ──────────────────────────────────────────────
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\x1b[33m[QR]\x1b[0m Escaneie o código abaixo com o WhatsApp:\n");
      qrcode.generate(qr, { small: true });
      console.log("\x1b[90mWhatsApp → Aparelhos conectados → Conectar aparelho\x1b[0m\n");
    }

    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log("\x1b[33m[WARN]\x1b[0m Reconectando em 3s...");
        setTimeout(() => connectToWhatsApp(), 3000);
      } else {
        console.log("\x1b[31m[ERROR]\x1b[0m Sessão encerrada. Delete a pasta auth_info/ e reinicie.");
      }
    } else if (connection === "open") {
      const user = sock.user?.id?.split(":")[0];
      console.log(`\x1b[32m[OK]\x1b[0m Bot conectado! Número: \x1b[35m${user}\x1b[0m`);
      console.log(`\x1b[32m[OK]\x1b[0m Prefixo ativo: \x1b[35m${config.prefix}\x1b[0m`);
      console.log(`\x1b[32m[OK]\x1b[0m Menu: \x1b[35m${config.prefix}lutchi\x1b[0m`);
      console.log(`\x1b[90m${"─".repeat(50)}\x1b[0m\n`);
    }
  });

  // ── Salva credenciais ─────────────────────────────────────
  sock.ev.on("creds.update", saveCreds);

  // ── Mensagens recebidas ───────────────────────────────────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const jid    = msg.key.remoteJid;
      const isGroup = isJidGroup(jid);

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        "";

      if (!text.startsWith(config.prefix)) continue;

      const [rawCmd, ...args] = text
        .slice(config.prefix.length)
        .trim()
        .split(/\s+/);
      const command = rawCmd.toLowerCase();

      const sender = msg.key.participant ?? msg.key.remoteJid;
      console.log(
        `\x1b[36m[CMD]\x1b[0m ${config.prefix}${command} | de: ${sender?.split("@")[0]} | grupo: ${isGroup}`
      );

      await handleCommand({ sock, msg, jid, isGroup, command, args, config });
    }
  });

  // ── Boas-vindas / Saída ───────────────────────────────────
  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    if (!config.welcomeEnabled) return;

    const meta = await sock.groupMetadata(id).catch(() => null);
    if (!meta) return;

    for (const participant of participants) {
      const tag = `@${participant.split("@")[0]}`;

      if (action === "add") {
        const msgText = config.welcomeMessage
          .replace("{name}", tag)
          .replace("{group}", meta.subject);
        await sock.sendMessage(id, { text: msgText, mentions: [participant] });
      } else if (action === "remove") {
        const msgText = config.goodbyeMessage
          .replace("{name}", tag)
          .replace("{group}", meta.subject);
        await sock.sendMessage(id, { text: msgText, mentions: [participant] });
      }
    }
  });

  return sock;
}

connectToWhatsApp();