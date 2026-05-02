// ╔══════════════════════════════════════════════════╗
// ║       LUTCHI ZAP HACK - Message Handler          ║
// ╚══════════════════════════════════════════════════╝

const config = require("../config/config");
const { getAntiLink, getAntiFlood, getBanwords, isMuted } = require("./database");

// Importar comandos
const infoCommands = require("../commands/info");
const adminCommands = require("../commands/admin");
const modCommands = require("../commands/mod");
const funCommands = require("../commands/fun");

// Anti-flood tracker
const floodTracker = {};

async function messageHandler(sock, msg, store) {
  try {
    const messageContent = msg.message;
    const type = Object.keys(messageContent)[0];
    const isGroup = msg.key.remoteJid.endsWith("@g.us");
    const from = msg.key.remoteJid;
    const sender = isGroup
      ? msg.key.participant || msg.key.remoteJid
      : msg.key.remoteJid;

    // Texto da mensagem
    let body =
      messageContent?.conversation ||
      messageContent?.extendedTextMessage?.text ||
      messageContent?.imageMessage?.caption ||
      messageContent?.videoMessage?.caption ||
      "";

    // Verifica prefixo
    if (!body.startsWith(config.prefix)) {
      // Moderação passiva
      if (isGroup) {
        await passiveModeration(sock, msg, from, sender, body);
      }
      return;
    }

    const args = body.slice(config.prefix.length).trim().split(/\s+/);
    const command = args[0].toLowerCase();
    args.shift();

    // Metadados do grupo
    let groupMeta = null;
    let isAdmin = false;
    let isBotAdmin = false;

    if (isGroup) {
      groupMeta = await sock.groupMetadata(from).catch(() => null);
      if (groupMeta) {
        const senderNum = sender.split("@")[0];
        const botNum = sock.user?.id?.split(":")[0] || sock.user?.id?.split("@")[0];
        isAdmin = groupMeta.participants
          .filter((p) => p.admin)
          .some((p) => p.id.includes(senderNum));
        isBotAdmin = groupMeta.participants
          .filter((p) => p.admin)
          .some((p) => p.id.includes(botNum));
      }
    }

    const isOwner = sender.includes(config.owner.number);

    const ctx = {
      sock,
      msg,
      from,
      sender,
      args,
      body,
      isGroup,
      isAdmin,
      isBotAdmin,
      isOwner,
      groupMeta,
      store,
      config,
      reply: async (text) => {
        return sock.sendMessage(from, { text }, { quoted: msg });
      },
    };

    // Roteamento de comandos
    await routeCommand(command, ctx);
  } catch (err) {
    console.error("❌ Erro no handler:", err);
  }
}

async function routeCommand(command, ctx) {
  // Info / Menu
  const infoList = ["lutchi", "menu", "ping", "info", "link", "regras", "setregras", "sticker", "dono", "sobre"];
  if (infoList.includes(command)) {
    return infoCommands[command]?.(ctx) || ctx.reply(`❌ Comando *${command}* em desenvolvimento.`);
  }

  // Admin de membros
  const adminList = ["ban", "kick", "add", "promover", "rebaixar", "todos"];
  if (adminList.includes(command)) {
    if (!ctx.isGroup) return ctx.reply("❌ Esse comando só funciona em grupos!");
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply("❌ Apenas administradores podem usar este comando!");
    return adminCommands[command]?.(ctx) || ctx.reply(`❌ Comando *${command}* em desenvolvimento.`);
  }

  // Admin de grupo
  const groupList = ["fechar", "abrir", "nome", "desc", "foto"];
  if (groupList.includes(command)) {
    if (!ctx.isGroup) return ctx.reply("❌ Esse comando só funciona em grupos!");
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply("❌ Apenas administradores podem usar este comando!");
    return adminCommands[command]?.(ctx) || ctx.reply(`❌ Comando *${command}* em desenvolvimento.`);
  }

  // Moderação
  const modList = ["warn", "warnings", "resetwarn", "mute", "unmute", "antilink", "antiflood", "banword"];
  if (modList.includes(command)) {
    if (!ctx.isGroup) return ctx.reply("❌ Esse comando só funciona em grupos!");
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply("❌ Apenas administradores podem usar este comando!");
    return modCommands[command]?.(ctx) || ctx.reply(`❌ Comando *${command}* em desenvolvimento.`);
  }

  // Diversão
  const funList = ["dado", "flip", "sorteio", "enquete", "citar", "calcular", "clima"];
  if (funList.includes(command)) {
    return funCommands[command]?.(ctx) || ctx.reply(`❌ Comando *${command}* em desenvolvimento.`);
  }

  await ctx.reply(`❌ Comando *${command}* não encontrado!\n\nDigite *${config.menuPrefix}* para ver o menu.`);
}

async function passiveModeration(sock, msg, from, sender, body) {
  // Verificar mute
  if (isMuted(from, sender)) {
    await sock.sendMessage(from, {
      delete: msg.key,
    }).catch(() => {});
    return;
  }

  // Anti-link
  if (getAntiLink(from)) {
    const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi;
    if (linkRegex.test(body)) {
      await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
      await sock.sendMessage(from, {
        text: `⚠️ @${sender.split("@")[0]} links não são permitidos neste grupo!`,
        mentions: [sender],
      });
      return;
    }
  }

  // Anti-flood
  if (getAntiFlood(from)) {
    const key = `${from}:${sender}`;
    const now = Date.now();
    if (!floodTracker[key]) floodTracker[key] = [];
    floodTracker[key] = floodTracker[key].filter((t) => now - t < 5000);
    floodTracker[key].push(now);
    if (floodTracker[key].length > config.floodLimit) {
      await sock.sendMessage(from, {
        text: `⚠️ @${sender.split("@")[0]} pare de fazer flood!`,
        mentions: [sender],
      });
      floodTracker[key] = [];
      return;
    }
  }

  // Banwords
  const banwords = getBanwords(from);
  if (banwords.length > 0) {
    const lowerBody = body.toLowerCase();
    if (banwords.some((w) => lowerBody.includes(w))) {
      await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
      await sock.sendMessage(from, {
        text: `⚠️ @${sender.split("@")[0]} palavra proibida detectada!`,
        mentions: [sender],
      });
    }
  }
}

module.exports = messageHandler;
