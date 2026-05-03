const config = require("../config/config");
const { getRules, setRules } = require("../utils/database");
const p = config.prefix;

async function lutchi(ctx) {
  const { sock, from, msg, isAdmin, isOwner } = ctx;
  if (!isAdmin && !isOwner) return;
  const menu =
    "\n╔══════════════════════════════╗" +
    "\n║   🤖  *LUTCHI ZAP HACK*   🤖  ║" +
    "\n╚══════════════════════════════╝\n\n" +
    "👑 *Dono:* " + config.owner.name + "\n" +
    "📸 *Instagram:* @" + config.owner.instagram + "\n" +
    "📞 *Contato:* +244 " + config.owner.number.slice(3) + "\n" +
    "🔖 *Prefixo:* `" + p + "`  ⚡ *Versão:* 1.0.0\n\n" +

    "━━━━ 📋 *INFO* ━━━━\n" +
    "`" + p + "ping` • `" + p + "info` • `" + p + "dono` • `" + p + "sobre`\n" +
    "`" + p + "regras` • `" + p + "setregras`\n\n" +

    "━━━━ 👥 *MEMBROS (Admin)* ━━━━\n" +
    "`" + p + "ban @` - Banir membro\n" +
    "`" + p + "kick @` - Remover membro\n" +
    "`" + p + "add 244X` - Adicionar membro\n" +
    "`" + p + "promover @` - Promover a admin\n" +
    "`" + p + "rebaixar @` - Rebaixar admin\n" +
    "`" + p + "todos msg` - Mencionar todos\n" +
    "`" + p + "clonar link` - Clonar membros de grupo\n\n" +

    "━━━━ 🏠 *GRUPO (Admin)* ━━━━\n" +
    "`" + p + "fechar` • `" + p + "abrir`\n" +
    "`" + p + "nome` • `" + p + "desc` • `" + p + "foto`\n" +
    "`" + p + "link` • `" + p + "revogar` • `" + p + "apagar`\n\n" +

    "━━━━ 🛡️ *MODERAÇÃO (Admin)* ━━━━\n" +
    "`" + p + "warn @` • `" + p + "warnings @` • `" + p + "resetwarn @`\n" +
    "`" + p + "mute @ 10` • `" + p + "unmute @`\n" +
    "`" + p + "antilink on/off`\n" +
    "`" + p + "antiflood on/off`\n" +
    "`" + p + "banword palavra`\n\n" +

    "━━━━ 📥 *DOWNLOADS* ━━━━\n" +
    "`" + p + "play` - YouTube MP3\n" +
    "`" + p + "playvid` - YouTube MP4\n" +
    "`" + p + "youtube` - Buscar no YouTube\n" +
    "`" + p + "tiktok` - TikTok sem marca\n" +
    "`" + p + "instagram` - Instagram foto/vídeo\n" +
    "`" + p + "facebook` - Vídeo Facebook\n" +
    "`" + p + "kwai` - Vídeo Kwai\n" +
    "`" + p + "spotify` - Música Spotify\n" +
    "`" + p + "soundcloud` - SoundCloud\n" +
    "`" + p + "mediafire` - Link Mediafire\n" +
    "`" + p + "tomp3` - Vídeo para MP3\n\n" +

    "━━━━ 🔓 *REVELAR* ━━━━\n" +
    "`" + p + "revelarft` - Revelar foto/vídeo único (Admin)\n\n" +

    "━━━━ 🎨 *STICKERS* ━━━━\n" +
    "`" + p + "sticker` - Imagem para sticker\n" +
    "`" + p + "toimg` - Sticker para imagem\n" +
    "`" + p + "togif` - Sticker para GIF\n" +
    "`" + p + "attp` - Texto animado\n" +
    "`" + p + "ttp` - Texto simples\n" +
    "`" + p + "brat` - Estilo Brat\n" +
    "`" + p + "emojimix` - Misturar emojis\n" +
    "`" + p + "stickerinfo` - Info do sticker\n" +
    "`" + p + "gerarlink` - Imagem para link\n\n" +

    "━━━━ 🔍 *PESQUISAS* ━━━━\n" +
    "`" + p + "wikipedia` - Wikipedia\n" +
    "`" + p + "traduzir` - Tradutor de texto\n" +
    "`" + p + "clima` - Previsão do tempo\n" +
    "`" + p + "dicionario` - Dicionário\n" +
    "`" + p + "noticias` - Últimas notícias\n" +
    "`" + p + "movie` - Buscar filme\n" +
    "`" + p + "serie` - Buscar série\n" +
    "`" + p + "receita` - Receita culinária\n" +
    "`" + p + "chatgpt` - Inteligência Artificial\n" +
    "`" + p + "signo` - Signo do zodíaco\n" +
    "`" + p + "obesidade` - Calcular IMC\n" +
    "`" + p + "flagpedia` - Bandeira de país\n" +
    "`" + p + "tinyurl` - Encurtar link\n" +
    "`" + p + "googlesrc` - Pesquisar Google\n" +
    "`" + p + "gimage` - Imagens Google\n\n" +

    "━━━━ 🎮 *DIVERSÃO* ━━━━\n" +
    "`" + p + "dado 6` • `" + p + "flip` • `" + p + "sorteio`\n" +
    "`" + p + "enquete` • `" + p + "citar`\n" +
    "`" + p + "cantadas @` • `" + p + "conselhos`\n" +
    "`" + p + "conselhobiblico` • `" + p + "spoiler`\n" +
    "`" + p + "fazernick` • `" + p + "calcular`\n" +
    "`" + p + "letramusica` • `" + p + "perfil`\n" +
    "`" + p + "tabela` • `" + p + "ddd`\n" +
    "`" + p + "debate` - Sugerir debate no grupo\n\n" +

    "━━━━━━━━━━━━━━━━━━━━━\n" +
    "🌐 _Lutchi Zap Hack © 2024_\n" +
    "📸 _@luislutchii_ | 🇦🇴 _Angola_";

  return sock.sendMessage(from, { text: menu }, { quoted: msg });
}

async function menu(ctx) { return lutchi(ctx); }

async function ping(ctx) {
  const { reply } = ctx;
  const start = Date.now();
  await reply("🏓 Calculando...");
  return reply("🏓 *Pong!*\n\n⚡ Latência: *" + (Date.now() - start) + "ms*");
}

async function info(ctx) {
  const { reply } = ctx;
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  return reply(
    "🤖 *INFORMAÇÕES DO BOT*\n\n" +
    "📛 *Nome:* " + config.botName + "\n" +
    "👑 *Dono:* " + config.owner.name + "\n" +
    "📸 *Instagram:* @" + config.owner.instagram + "\n" +
    "📞 *Número:* +244 " + config.owner.number.slice(3) + "\n" +
    "🔖 *Prefixo:* " + config.prefix + "\n" +
    "📚 *Biblioteca:* Baileys\n" +
    "⏱️ *Uptime:* " + h + "h " + m + "m " + s + "s\n" +
    "⚡ *Versão:* 1.0.0\n" +
    "🌍 *País:* Angola 🇦🇴"
  );
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
  if (!newRules) return reply("❌ Use: " + p + "setregras <texto das regras>");
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
    if (!mediaMsg) return reply("❌ Envie ou responda uma imagem/vídeo com *" + p + "sticker*");
    const isVideo = !!(mediaMsg.seconds) || (mediaMsg?.mimetype || "").includes("video");
    const stream = await downloadContentFromMessage(mediaMsg, isVideo ? "video" : "image");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function dono(ctx) {
  return ctx.reply(
    "👑 *DONO DO BOT*\n\n" +
    "📛 *Nome:* " + config.owner.name + "\n" +
    "📱 *WhatsApp:* wa.me/" + config.owner.number + "\n" +
    "📸 *Instagram:* instagram.com/" + config.owner.instagram + "\n\n" +
    "_Entre em contato para mais informações!_"
  );
}

async function sobre(ctx) {
  return ctx.reply(
    "🤖 *SOBRE O LUTCHI ZAP HACK*\n\n" +
    "Bot completo de gerenciamento de grupos WhatsApp desenvolvido por *Luís Lutchi*.\n\n" +
    "🛡️ Moderação avançada\n" +
    "📥 Downloads (YouTube, TikTok, Instagram...)\n" +
    "🎨 Stickers e conversões\n" +
    "🔍 Pesquisas e tradutor\n" +
    "🎮 Diversão e debates\n" +
    "👥 Clonar grupos\n" +
    "🔓 Revelar fotos únicas\n\n" +
    "📚 *Tecnologia:* Baileys + Node.js\n" +
    "🌍 *Feito em Angola* 🇦🇴\n" +
    "📸 *@" + config.owner.instagram + "*"
  );
}

module.exports = { lutchi, menu, ping, info, link, regras, setregras, sticker, dono, sobre };
