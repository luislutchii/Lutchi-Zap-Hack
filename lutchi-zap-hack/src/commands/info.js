// ╔══════════════════════════════════════════════════╗
// ║       LUTCHI ZAP HACK - Comandos Info/Menu       ║
// ╚══════════════════════════════════════════════════╝

const config = require("../config/config");
const { getRules, setRules } = require("../utils/database");
const fs = require("fs");
const path = require("path");

const p = config.prefix;

// ── MENU PRINCIPAL ─────────────────────────────────────────────
async function lutchi(ctx) {
  const { reply, sock, from, msg } = ctx;

  const menu = `
╔══════════════════════════════╗
║   🤖  *LUTCHI ZAP HACK*   🤖  ║
╚══════════════════════════════╝

👑 *Dono:* ${config.owner.name}
📱 *Instagram:* @${config.owner.instagram}
📞 *Contato:* +244 ${config.owner.number.slice(3)}
🔖 *Prefixo:* \`${p}\`
⚡ *Versão:* 1.0.0

━━━━ 📋 *MENU & INFO* ━━━━
\`${p}lutchi\`  - Menu principal
\`${p}menu\`    - Lista de comandos
\`${p}ping\`    - Verificar latência
\`${p}info\`    - Info do bot
\`${p}link\`    - Link do grupo
\`${p}regras\`  - Ver regras
\`${p}setregras\` - Definir regras
\`${p}sticker\` - Criar sticker
\`${p}dono\`    - Contato do dono
\`${p}sobre\`   - Sobre o bot

━━━━ 👥 *MEMBROS (Admin)* ━━━━
\`${p}ban @\`      - Banir membro
\`${p}kick @\`     - Remover membro
\`${p}add 244X\`   - Adicionar membro
\`${p}promover @\` - Promover a admin
\`${p}rebaixar @\` - Rebaixar admin
\`${p}todos msg\`  - Mencionar todos

━━━━ 🏠 *GRUPO (Admin)* ━━━━
\`${p}fechar\`   - Fechar grupo
\`${p}abrir\`    - Abrir grupo
\`${p}nome\`     - Mudar nome
\`${p}desc\`     - Mudar descrição
\`${p}foto\`     - Mudar foto

━━━━ 🛡️ *MODERAÇÃO (Admin)* ━━━━
\`${p}warn @\`      - Advertir membro
\`${p}warnings @\`  - Ver advertências
\`${p}resetwarn @\` - Resetar advertências
\`${p}mute @ 10\`   - Mutar por minutos
\`${p}unmute @\`    - Desmutar membro
\`${p}antilink on\` - Anti-link
\`${p}antiflood\`   - Anti-flood
\`${p}banword\`     - Palavra proibida

━━━━ 🎮 *DIVERSÃO* ━━━━
\`${p}dado 6\`     - Jogar dado
\`${p}flip\`       - Cara ou coroa
\`${p}sorteio\`    - Sortear membro
\`${p}enquete\`    - Criar enquete
\`${p}citar\`      - Citar mensagem
\`${p}calcular\`   - Calculadora
\`${p}clima\`      - Previsão do tempo

━━━━━━━━━━━━━━━━━━━━━
🌐 _Lutchi Zap Hack © 2024_
📸 _@luislutchii_
`;

  return sock.sendMessage(from, { text: menu }, { quoted: msg });
}

// ── MENU ─────────────────────────────────────────────────────
async function menu(ctx) {
  return lutchi(ctx);
}

// ── PING ─────────────────────────────────────────────────────
async function ping(ctx) {
  const { reply } = ctx;
  const start = Date.now();
  await reply("🏓 Calculando...");
  const end = Date.now();
  return reply(`🏓 *Pong!*\n\n⚡ Latência: *${end - start}ms*`);
}

// ── INFO ──────────────────────────────────────────────────────
async function info(ctx) {
  const { reply } = ctx;
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return reply(
    `🤖 *INFORMAÇÕES DO BOT*\n\n` +
    `📛 *Nome:* ${config.botName}\n` +
    `👑 *Dono:* ${config.owner.name}\n` +
    `📸 *Instagram:* @${config.owner.instagram}\n` +
    `📞 *Número:* +244 ${config.owner.number.slice(3)}\n` +
    `🔖 *Prefixo:* ${config.prefix}\n` +
    `📚 *Biblioteca:* Baileys\n` +
    `⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n` +
    `⚡ *Versão:* 1.0.0\n` +
    `🌍 *País:* Angola 🇦🇴`
  );
}

// ── LINK ──────────────────────────────────────────────────────
async function link(ctx) {
  const { reply, sock, from, isGroup, isAdmin, isOwner } = ctx;

  if (!isGroup) return reply("❌ Apenas em grupos!");
  if (!isAdmin && !isOwner) return reply("❌ Apenas admins podem pegar o link!");

  const code = await sock.groupInviteCode(from);
  return reply(`🔗 *Link do Grupo:*\nhttps://chat.whatsapp.com/${code}`);
}

// ── REGRAS ────────────────────────────────────────────────────
async function regras(ctx) {
  const { reply, from, isGroup } = ctx;

  if (!isGroup) return reply("❌ Apenas em grupos!");

  const rules = getRules(from) || config.defaultRules;
  return reply(rules);
}

// ── SETREGRAS ─────────────────────────────────────────────────
async function setregras(ctx) {
  const { reply, from, args, isGroup, isAdmin, isOwner } = ctx;

  if (!isGroup) return reply("❌ Apenas em grupos!");
  if (!isAdmin && !isOwner) return reply("❌ Apenas admins!");

  const newRules = args.join(" ");
  if (!newRules) return reply(`❌ Use: ${p}setregras <texto das regras>`);

  setRules(from, `📋 *REGRAS DO GRUPO*\n\n${newRules}`);
  return reply("✅ Regras atualizadas com sucesso!");
}

// ── STICKER ───────────────────────────────────────────────────
async function sticker(ctx) {
  const { sock, from, msg, reply } = ctx;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!quoted) return reply(`❌ Responda uma imagem/vídeo com *${p}sticker*`);

  const imageMsg = quoted?.imageMessage || quoted?.videoMessage;
  if (!imageMsg) return reply("❌ Responda apenas imagens ou vídeos curtos!");

  try {
    const stream = await sock.downloadContentFromMessage(imageMsg, imageMsg === quoted?.imageMessage ? "image" : "video");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    await sock.sendMessage(from, {
      sticker: buffer,
    }, { quoted: msg });
  } catch (e) {
    return reply("❌ Erro ao criar sticker: " + e.message);
  }
}

// ── DONO ──────────────────────────────────────────────────────
async function dono(ctx) {
  const { reply } = ctx;
  return reply(
    `👑 *DONO DO BOT*\n\n` +
    `📛 *Nome:* ${config.owner.name}\n` +
    `📱 *WhatsApp:* wa.me/${config.owner.number}\n` +
    `📸 *Instagram:* instagram.com/${config.owner.instagram}\n\n` +
    `_Entre em contato para mais informações!_`
  );
}

// ── SOBRE ─────────────────────────────────────────────────────
async function sobre(ctx) {
  const { reply } = ctx;
  return reply(
    `🤖 *SOBRE O LUTCHI ZAP HACK*\n\n` +
    `O *Lutchi Zap Hack* é um bot completo de gerenciamento de grupos para WhatsApp, desenvolvido por *Luís Lutchi*.\n\n` +
    `🛡️ *Funcionalidades:*\n` +
    `• Gerenciamento completo de grupos\n` +
    `• Sistema de advertências\n` +
    `• Anti-link e Anti-flood\n` +
    `• Palavras proibidas\n` +
    `• Comandos de diversão\n` +
    `• E muito mais!\n\n` +
    `📚 *Tecnologia:* Baileys + Node.js\n` +
    `🌍 *Feito em Angola* 🇦🇴\n\n` +
    `📸 *@${config.owner.instagram}*`
  );
}

module.exports = {
  lutchi,
  menu,
  ping,
  info,
  link,
  regras,
  setregras,
  sticker,
  dono,
  sobre,
};
