const config = require("../config/config");                                      const { getRules, setRules } = require("../utils/database");
const p = config.prefix;
                                                                                 async function lutchi(ctx) {                                                       const { sock, from, msg, isAdmin, isOwner } = ctx;
  if (!isAdmin && !isOwner) return;                                              
  const menu =                                                                       "╔══════════════════════════════════════╗\n" +                                   "║   🤖  *LUTCHI ZAP HACK*  🤖         ║\n" +
    "║      Bot de Grupos WhatsApp          ║\n" +
    "╚══════════════════════════════════════╝\n\n" +
    "👑 *Dono:* " + config.owner.name + "\n" +
    "📸 *Instagram:* @" + config.owner.instagram + "\n" +
    "🇦🇴 *País:* Angola\n" +
    "🔖 *Versão:* v1.0.0\n" +
    "⚡ *Prefixo:* `" + p + "`\n\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +

    "╭──「 📋 *INFORMAÇÕES* 」──╮\n" +
    "│ .lutchi\n" +
    "│ .menu\n" +
    "│ .ping\n" +
    "│ .info\n" +
    "│ .dono\n" +
    "│ .sobre\n" +
    "│ .link\n" +                                                                    "│ .regras\n" +                                                                  "│ .setregras\n" +                                                               "╰──────────────────────╯\n\n" +

    "╭──「 👥 *MEMBROS* (Admin) 」──╮\n" +
    "│ .ban @membro\n" +
    "│ .kick @membro\n" +
    "│ .add 244XXXXXXXXX\n" +
    "│ .promover @membro\n" +
    "│ .rebaixar @membro\n" +
    "│ .todos <mensagem>\n" +
    "│ .clonar <link do grupo>\n" +
    "╰──────────────────────╯\n\n" +

    "╭──「 ⚙️ *GRUPO* (Admin) 」──╮\n" +
    "│ .fechar\n" +
    "│ .abrir\n" +
    "│ .nome <novo nome>\n" +
    "│ .desc <nova descrição>\n" +
    "│ .foto (responda imagem)\n" +
    "│ .revogar\n" +
    "│ .apagar\n" +
    "│ .boasvindas on/off\n" +
    "╰──────────────────────╯\n\n" +

    "╭──「 🛡️ *MODERAÇÃO* (Admin) 」──╮\n" +
    "│ .warn @membro\n" +
    "│ .warnings @membro\n" +
    "│ .resetwarn @membro\n" +
    "│ .mute @membro <minutos>\n" +
    "│ .unmute @membro\n" +
    "│ .antilink on/off\n" +
    "│ .antiflood on/off\n" +
    "│ .banword <palavra>\n" +
    "│ .delbanword <palavra>\n" +
    "│ .limparbanword\n" +
    "╰──────────────────────╯\n\n" +

    "╭──「 🤖 *CONTROLE DO BOT* (Dono) 」──╮\n" +
    "│ .ligarbot\n" +
    "│ .desligarbot\n" +
    "│ .modobot todos/admins\n" +
    "╰──────────────────────╯\n\n" +

    "╭──「 🎙️ *DEBATE* 」──╮\n" +
    "│ .debate <tema>\n" +
    "╰──────────────────────╯\n\n" +

    "╭──「 📥 *DOWNLOADS* 」──╮\n" +
    "│ .play <nome da música>\n" +
    "│ .playvid <nome do vídeo>\n" +
    "│ .youtube <pesquisa>\n" +
    "│ .tiktok <link>\n" +
    "│ .instagram <link>\n" +
    "│ .facebook <link>\n" +
    "│ .kwai <link>\n" +
    "│ .spotify <link>\n" +
    "│ .soundcloud <link>\n" +
    "│ .mediafire <link>\n" +
    "│ .tomp3 (responda vídeo)\n" +
    "│ .revelarft (responda ft)\n" +
    "╰──────────────────────╯\n\n" +

    "╭──「 🎨 *STICKERS* 」──╮\n" +
    "│ .sticker (responda img/vid)\n" +
    "│ .toimg (responda sticker)\n" +
    "│ .togif (responda sticker)\n" +
    "│ .attp <texto>\n" +
    "│ .ttp <texto>\n" +
    "│ .brat <texto>\n" +
    "│ .emojimix 😀🔥\n" +
    "│ .stickerinfo (responda)\n" +
    "│ .gerarlink (responda img)\n" +
    "╰──────────────────────╯\n\n" +

    "╭──「 🔍 *PESQUISAS* 」──╮\n" +
    "│ .wikipedia <assunto>\n" +
    "│ .traduzir <lang> <texto>\n" +
    "│ .clima <cidade>\n" +
    "│ .dicionario <palavra>\n" +
    "│ .noticias <tema>\n" +
    "│ .movie <nome do filme>\n" +
    "│ .serie <nome da série>\n" +
    "│ .receita <prato>\n" +
    "│ .chatgpt <pergunta>\n" +
    "│ .signo <nome>\n" +
    "│ .obesidade <peso> <altura>\n" +
    "│ .flagpedia <país>\n" +
    "│ .tinyurl <link>\n" +
    "│ .googlesrc <pesquisa>\n" +
    "│ .gimage <pesquisa>\n" +
    "╰──────────────────────╯\n\n" +

    "╭──「 🎮 *DIVERSÃO* 」──╮\n" +
    "│ .dado <faces>\n" +
    "│ .flip\n" +
    "│ .sorteio\n" +
    "│ .enquete P? | Op1 | Op2\n" +
    "│ .citar (responda msg)\n" +
    "│ .cantadas @membro\n" +
    "│ .conselhos\n" +
    "│ .conselhobiblico\n" +
    "│ .spoiler <texto>\n" +
    "│ .fazernick <nome>\n" +
    "│ .calcular <expressão>\n" +
    "│ .letramusica <nome>\n" +
    "│ .perfil @membro\n" +
    "│ .tabela <nick>\n" +
    "│ .ddd <código>\n" +
    "╰──────────────────────╯\n\n" +

    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
    "🌐 _github.com/luislutchii/Lutchi-Zap-Hack_\n" +
    "📸 _@luislutchii_ | 🇦🇴 _Angola_ | 🤖 _v1.0.0_";

  return sock.sendMessage(from, { image: { url: "https://i.ibb.co/NnNcQnj0/Picsart-26-05-03-21-22-37-529.png" }, caption: menu }, { quoted: msg });
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
    "📚 *Biblioteca:* Baileys + yt-dlp\n" +
    "⏱️ *Uptime:* " + h + "h " + m + "m " + s + "s\n" +
    "⚡ *Versão:* 1.0.0\n" +
    "🌍 *País:* Angola 🇦🇴\n" +
    "🌐 *GitHub:* github.com/luislutchii/Lutchi-Zap-Hack"
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
    "📚 *Tecnologia:* Baileys + Node.js + yt-dlp\n" +
    "🌍 *Feito em Angola* 🇦🇴\n" +
    "🌐 *GitHub:* github.com/luislutchii/Lutchi-Zap-Hack\n" +
    "📸 *@" + config.owner.instagram + "*"
  );
}

module.exports = { lutchi, menu, ping, info, link, regras, setregras, sticker, dono, sobre };
