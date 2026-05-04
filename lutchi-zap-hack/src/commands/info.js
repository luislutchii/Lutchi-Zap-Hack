const axios    = require("axios");
const path     = require("path");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const p        = ".";
const rulesStore = new Map();

const MENU_IMAGE = "https://i.ibb.co/NnNcQnj0/Picsart-26-05-03-21-22-37-529.png";

async function lutchi(ctx) { return menu(ctx); }

async function menu(ctx) {
  const { sock, from, msg } = ctx;

  const menuText =
`╔══════════════════════════════════════╗
║   🤖  *LUTCHI ZAP HACK*  🤖         ║
║      Bot de Grupos WhatsApp          ║
╚══════════════════════════════════════╝

👑 *Dono:* Luís Lutchi
📸 *Instagram:* @luislutchii
🇦🇴 *País:* Angola
🔖 *Versão:* v1.0.0
⚡ *Prefixo:* \`${p}\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╭──「 📋 *INFORMAÇÕES* 」──╮
│ ${p}lutchi
│ ${p}menu
│ ${p}ping
│ ${p}info
│ ${p}dono
│ ${p}sobre
│ ${p}sistema
│ ${p}link
│ ${p}regras
│ ${p}setregras
│ ${p}reportar
│ ${p}wame
╰──────────────────────╯

╭──「 👥 *MEMBROS* (admin) 」──╮
│ ${p}ban @membro
│ ${p}kick @membro
│ ${p}add 244XXXXXXXXX
│ ${p}promover @membro
│ ${p}rebaixar @membro
│ ${p}todos <mensagem>
│ ${p}marcar <mensagem>
│ ${p}marcaradmin <mensagem>
│ ${p}hidetag <mensagem>
│ ${p}clonar <link do grupo>
╰──────────────────────╯

╭──「 ⚙️ *GRUPO* (admin) 」──╮
│ ${p}fechar
│ ${p}abrir
│ ${p}nome <novo nome>
│ ${p}desc <nova descrição>
│ ${p}foto (responda imagem)
│ ${p}redefinirlink
│ ${p}agendarmsg <min> <msg>
│ ${p}excluirinativo
╰──────────────────────╯

╭──「 🛡️ *MODERAÇÃO* (admin) 」──╮
│ ${p}warn @membro
│ ${p}warnings @membro
│ ${p}resetwarn @membro
│ ${p}mute @membro <minutos>
│ ${p}unmute @membro
│ ${p}antilink on/off
│ ${p}antiflood on/off
│ ${p}antisticker on/off
│ ${p}antiaudio on/off
│ ${p}antimage on/off
│ ${p}antivideo on/off
│ ${p}antidocumento on/off
│ ${p}banword <palavra>
│ ${p}whitelist @membro
│ ${p}verwhitelist
│ ${p}delwhitelist @membro
│ ${p}blacklist @membro
│ ${p}verblacklist
│ ${p}delblacklist @membro
╰──────────────────────╯

╭──「 🎙️ *DEBATE* 」──╮
│ ${p}debate <tema>
│ ${p}favor
│ ${p}contra
│ ${p}votos
│ ${p}fimdebate
╰──────────────────────╯

╭──「 📥 *DOWNLOADS* 」──╮
│ ${p}play <nome da música>
│ ${p}playvid <nome do vídeo>
│ ${p}youtube <pesquisa>
│ ${p}tiktok <link>
│ ${p}tiktokmp3 <link>
│ ${p}instagram <link>
│ ${p}facebook <link>
│ ${p}twitter <link>
│ ${p}kwai <link>
│ ${p}spotify <link>
│ ${p}spotifysearch <nome>
│ ${p}soundcloud <link>
│ ${p}mediafire <link>
│ ${p}pinterest <link>
│ ${p}tomp3 (responda vídeo)
│ ${p}revelarft (responda ft)
│ ${p}wallpaper <tema>
│ ${p}shazam (responda áudio)
╰──────────────────────╯

╭──「 🎨 *STICKERS* 」──╮
│ ${p}sticker (responda img/vid)
│ ${p}toimg (responda sticker)
│ ${p}togif (responda sticker)
│ ${p}attp <texto>
│ ${p}ttp <texto>
│ ${p}brat <texto>
│ ${p}emojimix 😀🔥
│ ${p}stickerinfo (responda)
│ ${p}gerarlink (responda img)
╰──────────────────────╯

╭──「 🔍 *PESQUISAS* 」──╮
│ ${p}wikipedia <assunto>
│ ${p}traduzir <lang> <texto>
│ ${p}clima <cidade>
│ ${p}dicionario <palavra>
│ ${p}noticias <tema>
│ ${p}movie <nome do filme>
│ ${p}serie <nome da série>
│ ${p}receita <prato>
│ ${p}chatgpt <pergunta>
│ ${p}tts <texto>
│ ${p}signo <nome>
│ ${p}obesidade <peso> <altura>
│ ${p}flagpedia <país>
│ ${p}tinyurl <link>
│ ${p}googlesrc <pesquisa>
│ ${p}gimage <pesquisa>
╰──────────────────────╯

╭──「 🎮 *DIVERSÃO* 」──╮
│ ${p}dado <faces>
│ ${p}flip
│ ${p}sorteio
│ ${p}enquete P? | Op1 | Op2
│ ${p}citar (responda msg)
│ ${p}cantadas @membro
│ ${p}conselhos
│ ${p}conselhobiblico
│ ${p}spoiler <texto>
│ ${p}fazernick <nome>
│ ${p}calcular <expressão>
│ ${p}letramusica <nome>
│ ${p}perfil @membro
│ ${p}tabela <nick>
│ ${p}ddd <código>
╰──────────────────────╯

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 _github.com/luislutchii/lutchi-zap-hack_
📸 _@luislutchii_ | 🇦🇴 _Angola_ | 🤖 _v1.0.0_`;

  try {
    const res    = await axios.get(MENU_IMAGE, { responseType: "arraybuffer", timeout: 8000 });
    const buffer = Buffer.from(res.data);
    await sock.sendMessage(from, { image: buffer, caption: menuText }, { quoted: msg });
  } catch {
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
    `_Para reportar bugs use: ${p}reportar_\n\n` +
    `_🤖 Lutchi Zap Hack_`
  );
}

async function sobre(ctx) {
  const { reply } = ctx;
  return reply(
    `🤖 *LUTCHI ZAP HACK*\n\n` +
    `📌 *Versão:* 1.0.0\n` +
    `⚡ *Prefixo:* \`${p}\`\n` +
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
  const { sock, from, msg, groupMeta, reply } = ctx;
  if (!groupMeta) return reply("❌ Apenas em grupos!");
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
  return sock.sendMessage(from, {
    text: `📜 *REGRAS DO GRUPO*\n\n${text}\n\n_🤖 Lutchi Zap Hack_`,
  }, { quoted: msg });
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
  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg =
      msg.message?.imageMessage || quoted?.imageMessage ||
      msg.message?.videoMessage || quoted?.videoMessage;
    if (!imgMsg) return reply(`❌ Envie ou responda uma imagem/vídeo com *${p}sticker*`);
    const isVideo = !!imgMsg.seconds || imgMsg?.mimetype?.includes("video");
    const type    = isVideo ? "video" : "image";
    const stream  = await downloadContentFromMessage(imgMsg, type);
    let buffer    = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro ao criar sticker: " + e.message); }
}

module.exports = { lutchi, menu, dono, sobre, ping, info, link, regras, setregras, sticker };
