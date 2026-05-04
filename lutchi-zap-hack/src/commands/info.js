const config = require("../config/config");
const { getRules, setRules } = require("../utils/database");
const axios = require("axios");
const p = config.prefix;

const MENU_IMAGE_URL = "https://i.ibb.co/NnNcQnj0/Picsart-26-05-03-21-22-37-529.png";

async function getMenuImage() {
  try {
    const res = await axios.get(MENU_IMAGE_URL, { responseType: "arraybuffer", timeout: 10000 });
    return Buffer.from(res.data);
  } catch { return null; }
}

async function lutchi(ctx) {
  const { sock, from, msg } = ctx;

  const caption =
    "╔══════════════════════════════════════╗\n" +
    "║   🤖  *LUTCHI ZAP HACK*  🤖         ║\n" +
    "║      Bot de Grupos WhatsApp          ║\n" +
    "╚══════════════════════════════════════╝\n\n" +
    "👑 *Dono:* " + config.owner.name + "\n" +
    "📸 *Instagram:* @" + config.owner.instagram + "\n" +
    "🇦🇴 *País:* Angola\n" +
    "🔖 *Versão:* v1.0.0\n" +
    "⚡ *Prefixo:* `" + p + "`\n\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
    "╭──「 📋 *INFORMAÇÕES* 」──╮\n" +
    "│ .lutchi .menu .ping .info\n" +
    "│ .dono .sobre .link .regras\n" +
    "╰──────────────────────╯\n\n" +
    "╭──「 👥 *MEMBROS* (Admin) 」──╮\n" +
    "│ .ban .kick .add .promover\n" +
    "│ .rebaixar .todos .clonar\n" +
    "╰──────────────────────╯\n\n" +
    "╭──「 ⚙️ *GRUPO* (Admin) 」──╮\n" +
    "│ .fechar .abrir .nome .desc\n" +
    "│ .foto .revogar .apagar .boasvindas\n" +
    "╰──────────────────────╯\n\n" +
    "╭──「 🛡️ *MODERAÇÃO* (Admin) 」──╮\n" +
    "│ .warn .warnings .resetwarn\n" +
    "│ .mute .unmute .antilink\n" +
    "│ .antiflood .banword\n" +
    "╰──────────────────────╯\n\n" +
    "╭──「 📥 *DOWNLOADS* 」──╮\n" +
    "│ .play .playvid .youtube .tiktok\n" +
    "│ .instagram .facebook .kwai\n" +
    "│ .spotify .tomp3 .revelarft\n" +
    "╰──────────────────────╯\n\n" +
    "╭──「 🎨 *STICKERS* 」──╮\n" +
    "│ .sticker .toimg .togif\n" +
    "│ .attp .ttp .brat .emojimix\n" +
    "╰──────────────────────╯\n\n" +
    "╭──「 🔍 *PESQUISAS* 」──╮\n" +
    "│ .wikipedia .traduzir .clima\n" +
    "│ .chatgpt .movie .serie .receita\n" +
    "╰──────────────────────╯\n\n" +
    "╭──「 🎮 *DIVERSÃO* 」──╮\n" +
    "│ .dado .flip .sorteio .enquete\n" +
    "│ .cantadas .conselhos .calcular\n" +
    "╰──────────────────────╯\n\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
    "🌐 _github.com/luislutchii/Lutchi-Zap-Hack_\n" +
    "📸 _@luislutchii_ | 🇦🇴 _Angola_ | 🤖 _v1.0.0_";

  const image = await getMenuImage();
  if (image) {
    await sock.sendMessage(from, { image, caption }, { quoted: msg });
  } else {
    await sock.sendMessage(from, { text: caption }, { quoted: msg });
  }
}

async function menu(ctx) { return lutchi(ctx); }

async function ping(ctx) {
  const { sock, from, msg } = ctx;
  const start = Date.now();
  const latencia = Date.now() - start;

  await sock.sendMessage(from, {
    text:
      "🏓 *PONG!*\n\n" +
      "⚡ Latência: *" + latencia + "ms*\n" +
      "🟢 Status: *Online*\n" +
      "🤖 Bot: *Lutchi Zap Hack*",
    }, { quoted: msg });
}

async function info(ctx) {
  const { sock, from, msg } = ctx;
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);

  const image = await getMenuImage();
  const text =
    "🤖 *INFORMAÇÕES DO BOT*\n\n" +
    "📛 *Nome:* " + config.botName + "\n" +
    "👑 *Dono:* " + config.owner.name + "\n" +
    "📸 *Instagram:* @" + config.owner.instagram + "\n" +
    "📞 *Número:* +244 " + config.owner.number.slice(3) + "\n" +
    "🔖 *Prefixo:* " + config.prefix + "\n" +
    "📚 *Biblioteca:* Baileys + yt-dlp\n" +
    "⏱️ *Uptime:* " + h + "h " + m + "m " + s + "s\n" +
    "⚡ *Versão:* 1.0.0\n" +
    "🌍 *País:* Angola 🇦🇴\n" +
    "🌐 *GitHub:* github.com/luislutchii/Lutchi-Zap-Hack";

  if (image) {
    await sock.sendMessage(from, { image, caption: text }, { quoted: msg });
  } else {
    await sock.sendMessage(from, { text }, { quoted: msg });
  }
}

async function link(ctx) {
  const { reply, sock, from, isGroup } = ctx;
  if (!isGroup) return reply("❌ Apenas em grupos!");
  try {
    const code = await sock.groupInviteCode(from);
    return reply("🔗 *Link do Grupo:*\nhttps://chat.whatsapp.com/" + code);
  } catch (e) { return reply("❌ Erro ao obter link: " + e.message); }
}

async function regras(ctx) {
  const { reply, from, isGroup } = ctx;
  if (!isGroup) return reply("❌ Apenas em grupos!");
  const rules = getRules(from) || config.defaultRules;
  return reply(rules);
}

async function setregras(ctx) {
  const { reply, from, args, isGroup } = ctx;
  if (!isGroup) return reply("❌ Apenas em grupos!");
  const newRules = args.join(" ");
  if (!newRules) return reply("❌ Use: .setregras <texto das regras>");
  setRules(from, "📋 *REGRAS DO GRUPO*\n\n" + newRules);
  return reply("✅ Regras atualizadas!");
}

async function sticker(ctx) {
  const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
  const { sock, from, msg, reply } = ctx;
  try {
    const m = msg.message;
    const q = m?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mediaMsg = m?.imageMessage || m?.videoMessage || q?.imageMessage || q?.videoMessage;
    if (!mediaMsg) return reply("❌ Envie ou responda uma imagem/vídeo com *.sticker*");
    const isVideo = !!(mediaMsg.seconds) || (mediaMsg?.mimetype || "").includes("video");
    const stream = await downloadContentFromMessage(mediaMsg, isVideo ? "video" : "image");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function dono(ctx) {
  const { sock, from, msg } = ctx;
  const image = await getMenuImage();
  const text =
    "👑 *DONO DO BOT*\n\n" +
    "📛 *Nome:* " + config.owner.name + "\n" +
    "📱 *WhatsApp:* wa.me/" + config.owner.number + "\n" +
    "📸 *Instagram:* instagram.com/" + config.owner.instagram + "\n\n" +
    "_Entre em contato para mais informações!_";

  if (image) {
    await sock.sendMessage(from, { image, caption: text }, { quoted: msg });
  } else {
    await sock.sendMessage(from, { text }, { quoted: msg });
  }
}

async function sobre(ctx) {
  const { sock, from, msg } = ctx;
  const image = await getMenuImage();
  const text =
    "🤖 *SOBRE O LUTCHI ZAP HACK*\n\n" +
    "Bot completo de gerenciamento de grupos WhatsApp desenvolvido por *Luís Lutchi*.\n\n" +
    "🛡️ Moderação avançada\n" +
    "📥 Downloads (YouTube, TikTok, Instagram...)\n" +
    "🎨 Stickers e conversões\n" +
    "🔍 Pesquisas e tradutor\n" +
    "🎮 Diversão e debates\n" +
    "👥 Clonar grupos\n" +
    "🔓 Revelar fotos únicas\n\n" +
    "📚 *Tecnologia:* Baileys + Node.js + yt-dlp\n" +
    "🌍 *Feito em Angola* 🇦🇴\n" +
    "🌐 *GitHub:* github.com/luislutchii/Lutchi-Zap-Hack\n" +
    "📸 *@" + config.owner.instagram + "*";

  if (image) {
    await sock.sendMessage(from, { image, caption: text }, { quoted: msg });
  } else {
    await sock.sendMessage(from, { text }, { quoted: msg });
  }
}

module.exports = { lutchi, menu, ping, info, link, regras, setregras, sticker, dono, sobre };
