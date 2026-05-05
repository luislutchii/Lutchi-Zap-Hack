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
    "╔═════════════════════════════════╗\n" +
    "║   🤖  *LUTCHI ZAP HACK*  🤖    ║\n" +
    "║      Bot de Grupos WhatsApp     ║\n" +
    "╚═════════════════════════════════╝\n\n" +
    "👑 *Dono:* " + config.owner.name + "\n" +
    "📸 *Instagram:* @" + config.owner.instagram + "\n" +
    "🇦🇴 *País:* Angola\n" +
    "🔖 *Versão:* v1.0.0\n" +
    "⚡ *Prefixo:* `" + p + "`\n\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +

    "╭──「 📋 *INFORMAÇÕES* 」\n" +
    "│ " + p + "lutchi\n" +
    "│ " + p + "menu\n" +
    "│ " + p + "ping\n" +
    "│ " + p + "info\n" +
    "│ " + p + "dono\n" +
    "│ " + p + "sobre\n" +
    "│ " + p + "link\n" +
    "│ " + p + "regras\n" +
    "│ " + p + "setregras\n" +
    "╰─────────────────\n\n" +

    "╭──「 👥 *MEMBROS* (Admin) 」\n" +
    "│ " + p + "ban @membro\n" +
    "│ " + p + "kick @membro\n" +
    "│ " + p + "add 244XXXXXXXXX\n" +
    "│ " + p + "promover @membro\n" +
    "│ " + p + "rebaixar @membro\n" +
    "│ " + p + "todos <mensagem>\n" +
    "│ " + p + "clonar <link>\n" +
    "╰──────────────────\n\n" +

    "╭──「 ⚙️ *GRUPO* (Admin) 」\n" +
    "│ " + p + "fechar\n" +
    "│ " + p + "abrir\n" +
    "│ " + p + "nome <novo nome>\n" +
    "│ " + p + "desc <descrição>\n" +
    "│ " + p + "foto (responda imagem)\n" +
    "│ " + p + "revogar\n" +
    "│ " + p + "apagar\n" +
    "│ " + p + "boasvindas on/off\n" +
    "╰───────────────────\n\n" +

    "╭──「 🛡️ *MODERAÇÃO* (Admin) 」\n" +
    "│ " + p + "warn @membro\n" +
    "│ " + p + "warnings @membro\n" +
    "│ " + p + "resetwarn @membro\n" +
    "│ " + p + "mute @membro <min>\n" +
    "│ " + p + "unmute @membro\n" +
    "│ " + p + "antilink on/off\n" +
    "│ " + p + "antiflood on/off\n" +
    "│ " + p + "banword <palavra>\n" +
    "│ " + p + "delbanword <palavra>\n" +
    "│ " + p + "limparbanword\n" +
    "╰────────────────────\n\n" +

    "╭──「 🤖 *CONTROLE DO BOT* (Dono) 」\n" +
    "│ " + p + "ligarbot\n" +
    "│ " + p + "desligarbot\n" +
    "│ " + p + "modobot todos/admins\n" +
    "╰────────────────────\n\n" +

    "╭──「 🎙️ *DEBATE* 」\n" +
    "│ " + p + "debate <tema>\n" +
    "╰──────────────────\n\n" +

    "╭──「 📥 *DOWNLOADS* 」\n" +
    "│ " + p + "play <nome da música>\n" +
    "│ " + p + "playvid <nome do vídeo>\n" +
    "│ " + p + "youtube <pesquisa>\n" +
    "│ " + p + "tiktok <link>\n" +
    "│ " + p + "instagram <link>\n" +
    "│ " + p + "facebook <link>\n" +
    "│ " + p + "kwai <link>\n" +
    "│ " + p + "spotify <link>\n" +
    "│ " + p + "soundcloud <link>\n" +
    "│ " + p + "mediafire <link>\n" +
    "│ " + p + "tomp3 (responda vídeo)\n" +
    "│ " + p + "revelarft (responda ft)\n" +
    "╰──────────────────\n\n" +

    "╭──「 🎨 *STICKERS* 」\n" +
    "│ " + p + "sticker (responda img/vid)\n" +
    "│ " + p + "toimg (responda sticker)\n" +
    "│ " + p + "togif (responda sticker)\n" +
    "│ " + p + "attp <texto>\n" +
    "│ " + p + "ttp <texto>\n" +
    "│ " + p + "brat <texto>\n" +
    "│ " + p + "emojimix 😀🔥\n" +
    "│ " + p + "stickerinfo (responda)\n" +
    "│ " + p + "gerarlink (responda img)\n" +
    "╰──────────────────\n\n" +

    "╭──「 🔍 *PESQUISAS* 」\n" +
    "│ " + p + "wikipedia <assunto>\n" +
    "│ " + p + "traduzir <lang> <texto>\n" +
    "│ " + p + "clima <cidade>\n" +
    "│ " + p + "dicionario <palavra>\n" +
    "│ " + p + "noticias <tema>\n" +
    "│ " + p + "movie <nome do filme>\n" +
    "│ " + p + "serie <nome da série>\n" +
    "│ " + p + "receita <prato>\n" +
    "│ " + p + "chatgpt <pergunta>\n" +
    "│ " + p + "signo <nome>\n" +
    "│ " + p + "obesidade <peso> <altura>\n" +
    "│ " + p + "flagpedia <país>\n" +
    "│ " + p + "tinyurl <link>\n" +
    "│ " + p + "googlesrc <pesquisa>\n" +
    "│ " + p + "gimage <pesquisa>\n" +
    "╰──────────────────\n\n" +

    "╭──「 🎮 *DIVERSÃO* 」\n" +
    "│ " + p + "dado <faces>\n" +
    "│ " + p + "flip\n" +
    "│ " + p + "sorteio\n" +
    "│ " + p + "enquete P? | Op1 | Op2\n" +
    "│ " + p + "citar (responda msg)\n" +
    "│ " + p + "cantadas @membro\n" +
    "│ " + p + "conselhos\n" +
    "│ " + p + "conselhobiblico\n" +
    "│ " + p + "spoiler <texto>\n" +
    "│ " + p + "fazernick <nome>\n" +
    "│ " + p + "calcular <expressão>\n" +
    "│ " + p + "letramusica <nome>\n" +
    "│ " + p + "perfil @membro\n" +
    "│ " + p + "tabela <nick>\n" +
    "│ " + p + "ddd <código>\n" +
    "╰──────────────────\n\n" +

    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
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
      "🤖 Bot: *" + config.botName + "*",
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
