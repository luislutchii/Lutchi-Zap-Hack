// ╔══════════════════════════════════════════════════╗
// ║      LUTCHI ZAP HACK - Info & Menu               ║
// ╚══════════════════════════════════════════════════╝

const axios  = require("axios");
const p      = ".";
const rulesStore = new Map();

// URL da imagem do menu (substitua por um link da sua imagem)
const MENU_IMAGE = "https://i.ibb.co/NnNcQnj0/Picsart-26-05-03-21-22-37-529.png";

async function lutchi(ctx) { return menu(ctx); }

async function menu(ctx) {
  const { sock, from, msg, config } = ctx;

  const menuText =
`╔══════════════════════════════════════╗
║   🤖  *LUTCHI ZAP HACK*  🤖         ║
║      Bot de Grupos WhatsApp          ║
╚══════════════════════════════════════╝

👑 *Dono:* Luís Lutchi
📸 *Instagram:* @luislutchii
🇦🇴 *País:* Angola
🔖 *Versão:* v1.0.0  |  ⚡ *Prefixo:* \`${p}\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╭──「 📋 *INFORMAÇÕES* 」
│ ${p}lutchi  • ${p}ping  • ${p}info
│ ${p}dono  • ${p}sobre  • ${p}sistema
│ ${p}regras  • ${p}setregras  • ${p}link
│ ${p}reportar  • ${p}wame  • ${p}sticker
╰────────────────────

╭──「 👥 *MEMBROS* (admin) 」
│ ${p}ban  • ${p}kick  • ${p}add
│ ${p}promover  • ${p}rebaixar
│ ${p}todos  • ${p}marcar  • ${p}marcaradmin
│ ${p}hidetag  • ${p}clonar
╰────────────────────

╭──「 ⚙️ *GRUPO* (admin) 」
│ ${p}fechar  • ${p}abrir
│ ${p}nome  • ${p}desc  • ${p}foto
│ ${p}redefinirlink  • ${p}agendarmsg
│ ${p}excluirinativo
╰────────────────────

╭──「 🛡️ *MODERAÇÃO* (admin) 」
│ ${p}warn  • ${p}warnings  • ${p}resetwarn
│ ${p}mute  • ${p}unmute
│ ${p}antilink on/off
│ ${p}antiflood on/off
│ ${p}antisticker on/off
│ ${p}antiaudio on/off
│ ${p}antimage on/off
│ ${p}antivideo on/off
│ ${p}antidocumento on/off
│ ${p}banword  • ${p}whitelist
│ ${p}blacklist  • ${p}verwhitelist
│ ${p}verblacklist
╰────────────────────

╭──「 📥 *DOWNLOADS* 」
│ ${p}play  • ${p}playvid  • ${p}youtube
│ ${p}tiktok  • ${p}tiktokmp3
│ ${p}instagram  • ${p}facebook
│ ${p}twitter  • ${p}kwai
│ ${p}spotify  • ${p}spotifysearch
│ ${p}soundcloud  • ${p}mediafire
│ ${p}pinterest  • ${p}tomp3
│ ${p}revelarft  • ${p}wallpaper
╰────────────────────

╭──「 🎨 *STICKERS* 」
│ ${p}sticker  • ${p}toimg  • ${p}togif
│ ${p}attp  • ${p}ttp  • ${p}brat
│ ${p}emojimix  • ${p}stickerinfo
│ ${p}gerarlink
╰────────────────────

╭──「 🔍 *PESQUISAS* 」
│ ${p}wikipedia  • ${p}traduzir
│ ${p}clima  • ${p}dicionario
│ ${p}noticias  • ${p}movie  • ${p}serie
│ ${p}receita  • ${p}chatgpt  • ${p}tts
│ ${p}signo  • ${p}obesidade
│ ${p}flagpedia  • ${p}tinyurl
│ ${p}googlesrc  • ${p}gimage
╰────────────────────

╭──「 🎮 *DIVERSÃO* 」
│ ${p}dado  • ${p}flip  • ${p}sorteio
│ ${p}enquete  • ${p}citar  • ${p}cantadas
│ ${p}conselhos  • ${p}conselhobiblico
│ ${p}spoiler  • ${p}fazernick
│ ${p}calcular  • ${p}letramusica
│ ${p}perfil  • ${p}tabela  • ${p}ddd
╰────────────────────

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 _github.com/luislutchii/lutchi-zap-hack_
📸 _@luislutchii_ | 🇦🇴 _Angola_`;

  // Tenta enviar com imagem
  try {
    const res = await axios.get(MENU_IMAGE, { responseType: "arraybuffer", timeout: 8000 });
    const buffer = Buffer.from(res.data);
    await sock.sendMessage(from, {
      image: buffer,
      caption: menuText,
    }, { quoted: msg });
  } catch {
    // Se falhar a imagem, envia só o texto
    await sock.sendMessage(from, { text: menuText }, { quoted: msg });
  }
}

async function dono(ctx) {
  const { reply } = ctx;
  return reply(
    `👑 *DONO DO BOT*\n\n` +
    `🧑 *Nome:* Luís Lutchi\n` +
    `📸 *Instagram:* @luislutchii\n` +
    `🇦🇴 *País:* Angola\n` +
    `🌐 *GitHub:* github.com/luislutchii/lutchi-zap-hack\n\n` +
    `_Para reportar bugs use: ${p}reportar_`
  );
}

async function sobre(ctx) {
  const { reply } = ctx;
  return reply(
    `🤖 *LUTCHI ZAP HACK*\n\n` +
    `📌 *Versão:* 1.0.0\n` +
    `⚡ *Prefixo:* \`.\`\n` +
    `🛠️ *Tecnologia:* Node.js + Baileys\n` +
    `👑 *Desenvolvedor:* Luís Lutchi\n` +
    `📸 *Instagram:* @luislutchii\n` +
    `🇦🇴 *País:* Angola\n` +
    `🌐 *GitHub:* github.com/luislutchii/lutchi-zap-hack\n\n` +
    `_Bot completo de gerenciamento de grupos_ 💜`
  );
}

async function ping(ctx) {
  const { sock, from, msg } = ctx;
  const start = Date.now();
  const sent  = await sock.sendMessage(from, { text: "🏓 Calculando..." }, { quoted: msg });
  const ms    = Date.now() - start;
  await sock.sendMessage(from, {
    text: `🏓 *Pong!*\n\n⚡ Latência: *${ms}ms*\n🤖 *Lutchi Zap Hack* online! ✅`,
    edit: sent.key,
  });
}

async function info(ctx) {
  const { sock, from, msg, groupMeta } = ctx;
  if (!groupMeta) return ctx.reply("❌ Apenas em grupos!");
  const admins  = groupMeta.participants.filter((p) => p.admin).length;
  const members = groupMeta.participants.length;
  const created = new Date(groupMeta.creation * 1000).toLocaleDateString("pt-AO");
  return sock.sendMessage(from, {
    text:
      `📋 *INFORMAÇÕES DO GRUPO*\n\n` +
      `👥 *Nome:* ${groupMeta.subject}\n` +
      `📆 *Criado em:* ${created}\n` +
      `👤 *Membros:* ${members}\n` +
      `👑 *Admins:* ${admins}\n` +
      `📝 *Descrição:*\n${groupMeta.desc ?? "Sem descrição."}\n\n` +
      `_🤖 Lutchi Zap Hack_`,
  }, { quoted: msg });
}

async function link(ctx) {
  const { sock, from, msg, reply, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("⚠️ Preciso ser admin para obter o link.");
  const code = await sock.groupInviteCode(from);
  return sock.sendMessage(from, {
    text: `🔗 *Link do Grupo:*\nhttps://chat.whatsapp.com/${code}\n\n_🤖 Lutchi Zap Hack_`,
  }, { quoted: msg });
}

async function regras(ctx) {
  const { from, sock, msg } = ctx;
  const text = rulesStore.get(from) ?? "📜 Nenhuma regra definida.\nUse *.setregras* para definir.";
  return sock.sendMessage(from, { text: `📜 *REGRAS DO GRUPO*\n\n${text}\n\n_🤖 Lutchi Zap Hack_` }, { quoted: msg });
}

async function setregras(ctx) {
  const { from, args, reply } = ctx;
  const text = args.join(" ");
  if (!text) return reply(`❌ Ex: ${p}setregras 1. Respeito 2. Sem spam`);
  rulesStore.set(from, text);
  return reply("✅ Regras atualizadas! Use *.regras* para ver.");
}

async function sticker(ctx) {
  const { sock, from, msg, reply } = ctx;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imgMsg = msg.message?.imageMessage || quoted?.imageMessage ||
                 msg.message?.videoMessage || quoted?.videoMessage;
  if (!imgMsg) return reply(`❌ Envie ou responda uma imagem/vídeo com *${p}sticker*`);
  const isVideo = !!imgMsg.seconds || imgMsg?.mimetype?.includes("video");
  const type    = isVideo ? "video" : "image";
  const stream  = await sock.downloadContentFromMessage(imgMsg, type);
  let buffer    = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
}

module.exports = { lutchi, menu, dono, sobre, ping, info, link, regras, setregras, sticker };
