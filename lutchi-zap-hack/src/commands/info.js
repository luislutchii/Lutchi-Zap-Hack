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
    "🤖 *LUTCHI ZAP HACK* 🤖\n" +
    "〘 Bot de Grupos WhatsApp 〙\n\n" +
    "👑 *Dono:* " + config.owner.name + "\n" +
    "📸 *Instagram:* @" + config.owner.instagram + "\n" +
    "🇦🇴 *País:* Angola\n" +
    "🔖 *Versão:* v1.0.0\n" +
    "⚡ *Prefixo:* " + p + "\n\n" +

    "─────────────────────\n" +
    "📋 *INFORMAÇÕES*\n" +
    "─────────────────────\n" +
    p + "lutchi — Menu principal\n" +
    p + "ping — Testar o bot\n" +
    p + "info — Info do bot\n" +
    p + "dono — Contato do dono\n" +
    p + "sobre — Sobre o bot\n" +
    p + "link — Link do grupo\n" +
    p + "regras — Ver regras\n" +
    p + "setregras — Definir regras\n\n" +

    "─────────────────────\n" +
    "👥 *MEMBROS* _(Admin)_\n" +
    "─────────────────────\n" +
    p + "ban — Banir membro\n" +
    p + "kick — Expulsar membro\n" +
    p + "add — Adicionar membro\n" +
    p + "promover — Tornar admin\n" +
    p + "rebaixar — Remover admin\n" +
    p + "todos — Marcar todos\n" +
    p + "clonar — Clonar grupo\n\n" +

    "─────────────────────\n" +
    "⚙️ *GRUPO* _(Admin)_\n" +
    "─────────────────────\n" +
    p + "fechar — Fechar grupo\n" +
    p + "abrir — Abrir grupo\n" +
    p + "nome — Mudar nome\n" +
    p + "desc — Mudar descrição\n" +
    p + "foto — Mudar foto\n" +
    p + "revogar — Revogar link\n" +
    p + "apagar — Apagar mensagem\n" +
    p + "boasvindas — on/off\n\n" +

    "─────────────────────\n" +
    "🛡️ *MODERAÇÃO* _(Admin)_\n" +
    "─────────────────────\n" +
    p + "warn — Advertir membro\n" +
    p + "warnings — Ver advertências\n" +
    p + "resetwarn — Resetar warns\n" +
    p + "mute — Mutar membro\n" +
    p + "unmute — Desmutar membro\n" +
    p + "antilink — on/off\n" +
    p + "antiflood — on/off\n" +
    p + "banword — Banir palavra\n" +
    p + "delbanword — Remover palavra\n" +
    p + "limparbanword — Limpar tudo\n\n" +

    "─────────────────────\n" +
    "🤖 *CONTROLE DO BOT* _(Dono)_\n" +
    "─────────────────────\n" +
    p + "ligarbot — Ligar bot\n" +
    p + "desligarbot — Desligar bot\n" +
    p + "modobot — todos/admins\n\n" +

    "─────────────────────\n" +
    "🎙️ *DEBATE*\n" +
    "─────────────────────\n" +
    p + "debate — Iniciar debate\n" +
    p + "favor — Votar a favor\n" +
    p + "contra — Votar contra\n" +
    p + "votos — Ver votos\n" +
    p + "fimdebate — Encerrar\n\n" +

    "─────────────────────\n" +
    "📥 *DOWNLOADS*\n" +
    "─────────────────────\n" +
    p + "play — Baixar música\n" +
    p + "playvid — Baixar vídeo\n" +
    p + "youtube — Pesquisar YT\n" +
    p + "tiktok — Baixar TikTok\n" +
    p + "instagram — Baixar IG\n" +
    p + "facebook — Baixar FB\n" +
    p + "kwai — Baixar Kwai\n" +
    p + "spotify — Baixar Spotify\n" +
    p + "soundcloud — Baixar SC\n" +
    p + "mediafire — Baixar MF\n" +
    p + "tomp3 — Vídeo para MP3\n" +
    p + "revelarft — Revelar foto\n\n" +

    "─────────────────────\n" +
    "🎨 *STICKERS*\n" +
    "─────────────────────\n" +
    p + "sticker — Criar sticker\n" +
    p + "toimg — Sticker para img\n" +
    p + "togif — Sticker para gif\n" +
    p + "attp — Texto animado\n" +
    p + "ttp — Texto para sticker\n" +
    p + "brat — Sticker brat\n" +
    p + "emojimix — Misturar emojis\n" +
    p + "stickerinfo — Info sticker\n" +
    p + "gerarlink — Link da imagem\n\n" +

    "─────────────────────\n" +
    "🔍 *PESQUISAS*\n" +
    "─────────────────────\n" +
    p + "wikipedia — Pesquisar Wiki\n" +
    p + "traduzir — Traduzir texto\n" +
    p + "clima — Ver clima\n" +
    p + "dicionario — Ver definição\n" +
    p + "noticias — Ver notícias\n" +
    p + "movie — Info de filme\n" +
    p + "serie — Info de série\n" +
    p + "receita — Ver receita\n" +
    p + "chatgpt — Perguntar IA\n" +
    p + "signo — Ver signo\n" +
    p + "obesidade — Calcular IMC\n" +
    p + "flagpedia — Bandeira país\n" +
    p + "tinyurl — Encurtar link\n" +
    p + "googlesrc — Pesquisar Google\n" +
    p + "gimage — Buscar imagem\n\n" +

    "─────────────────────\n" +
    "🎮 *DIVERSÃO*\n" +
    "─────────────────────\n" +
    p + "dado — Lançar dado\n" +
    p + "flip — Cara ou coroa\n" +
    p + "sorteio — Sortear membro\n" +
    p + "enquete — Criar enquete\n" +
    p + "citar — Citar mensagem\n" +
    p + "cantadas — Enviar cantada\n" +
    p + "conselhos — Ver conselho\n" +
    p + "conselhobiblico — Bíblia\n" +
    p + "spoiler — Texto spoiler\n" +
    p + "fazernick — Criar nick\n" +
    p + "calcular — Calcular\n" +
    p + "letramusica — Letra música\n" +
    p + "perfil — Ver perfil\n" +
    p + "tabela — Tabela do nick\n" +
    p + "ddd — Consultar DDD\n\n" +

    "─────────────────────\n" +
    "🌐 github.com/luislutchii/Lutchi-Zap-Hack\n" +
    "📸 @luislutchii | 🇦🇴 Angola | v1.0.0";

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
    "⚡ *Versão:* v1.0.0\n" +
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
    "Bot completo de gerenciamento de grupos WhatsApp\n" +
    "desenvolvido por *Luís Lutchi*.\n\n" +
    "🛡️ Moderação avançada\n" +
    "📥 Downloads (YouTube, TikTok, Instagram...)\n" +
    "🎨 Stickers e conversões\n" +
    "🔍 Pesquisas e tradutor\n" +
    "🎮 Diversão e debates\n" +
    "👥 Clonar grupos\n" +
    "🔓 Revelar fotos únicas\n\n" +
    "📚 *Tecnologia:* Baileys + Node.js + yt-dlp\n" +
    "🌍 *Feito em Angola* 🇦🇴\n" +
    "🌐 github.com/luislutchii/Lutchi-Zap-Hack\n" +
    "📸 @" + config.owner.instagram;
  if (image) {
    await sock.sendMessage(from, { image, caption: text }, { quoted: msg });
  } else {
    await sock.sendMessage(from, { text }, { quoted: msg });
  }
}

module.exports = { lutchi, menu, ping, info, link, regras, setregras, sticker, dono, sobre };
