const axios  = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const p      = ".";
const rulesStore = new Map();
const MENU_IMAGE = "https://i.ibb.co/NnNcQnj0/Picsart-26-05-03-21-22-37-529.png";

async function lutchi(ctx) { return menu(ctx); }

async function menu(ctx) {
  const { sock, from, msg } = ctx;
  const text =
`╔═══════════════════════════════════╗
║   🤖  *LUTCHI ZAP HACK*  🤖      ║
╚═══════════════════════════════════╝
👑 *Dono:* Luís Lutchi
📸 *Instagram:* @luislutchii
🇦🇴 *Angola* | 🔖 *v1.0.0* | ⚡ *Prefixo:* .
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *INFORMAÇÕES*
${p}lutchi ${p}menu ${p}ping ${p}info
${p}dono ${p}sobre ${p}sistema ${p}link
${p}regras ${p}setregras ${p}wame ${p}reportar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 *CONTROLO DO BOT* _(dono)_
${p}ligarbot — Liga o bot no grupo
${p}desligarbot — Desliga o bot
${p}modobot todos/admins — Quem usa o bot
${p}boasvindas on/off — Boas-vindas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 *MEMBROS* _(admin)_
${p}ban @ ${p}kick @ ${p}add 244X
${p}promover @ ${p}rebaixar @
${p}todos <msg> ${p}marcar <msg>
${p}marcaradmin ${p}hidetag
${p}clonar <link>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ *GRUPO* _(admin)_
${p}fechar ${p}abrir ${p}nome <nome>
${p}desc <texto> ${p}foto
${p}redefinirlink ${p}agendarmsg <min> <msg>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *MODERAÇÃO* _(admin)_
${p}warn @ ${p}warnings @ ${p}resetwarn @
${p}mute @ <min> ${p}unmute @
${p}antilink on/off ${p}antiflood on/off
${p}antisticker on/off ${p}antiaudio on/off
${p}antimage on/off ${p}antivideo on/off
${p}antidocumento on/off
${p}banword <palavra> — Adicionar
${p}delbanword <palavra> — Remover
${p}limparbanword — Limpar tudo
${p}whitelist @ ${p}verwhitelist ${p}delwhitelist @
${p}blacklist @ ${p}verblacklist ${p}delblacklist @

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎙️ *DEBATE*
${p}debate <tema> — Inicia (ou automático)
${p}novotema — Novo tema aleatório
${p}temadebate — Sugestão de tema
${p}favor ${p}contra ${p}votos ${p}fimdebate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 *DOWNLOADS*
${p}play <nome> — YouTube MP3
${p}playvid <nome> — YouTube MP4
${p}youtube <pesquisa>
${p}tiktok <link> ${p}tiktokmp3 <link>
${p}instagram <link> ${p}facebook <link>
${p}twitter <link> ${p}kwai <link>
${p}spotify <link> ${p}spotifysearch <nome>
${p}soundcloud <link> ${p}mediafire <link>
${p}pinterest <link> ${p}tomp3
${p}tts <texto> ${p}revelarft ${p}wallpaper

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 *STICKERS*
${p}sticker ${p}toimg ${p}togif
${p}attp <texto> ${p}ttp <texto>
${p}brat <texto> ${p}emojimix 😀🔥
${p}stickerinfo ${p}gerarlink

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 *PESQUISAS*
${p}wikipedia <assunto>
${p}traduzir <lang> <texto>
${p}clima <cidade> ${p}dicionario <palavra>
${p}noticias <tema> ${p}movie <filme>
${p}serie <série> ${p}receita <prato>
${p}chatgpt <pergunta> ${p}tts <texto>
${p}signo <nome> ${p}obesidade <peso> <altura>
${p}flagpedia <país> ${p}tinyurl <link>
${p}googlesrc <pesquisa> ${p}gimage <pesquisa>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 *DIVERSÃO*
${p}dado <faces> ${p}flip ${p}sorteio
${p}enquete P? | Op1 | Op2
${p}citar ${p}cantadas @ ${p}conselhos
${p}conselhobiblico ${p}spoiler <texto>
${p}fazernick <nome> ${p}calcular <expr>
${p}letramusica <nome> ${p}perfil @
${p}tabela <nick> ${p}ddd <código>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 _github.com/luislutchii/lutchi-zap-hack_
📸 _@luislutchii_ | 🇦🇴 _Angola_`;

  try {
    const res    = await axios.get(MENU_IMAGE, { responseType: "arraybuffer", timeout: 8000 });
    await sock.sendMessage(from, { image: Buffer.from(res.data), caption: text }, { quoted: msg });
  } catch {
    await sock.sendMessage(from, { text }, { quoted: msg });
  }
}

async function dono(ctx) {
  return ctx.reply(
    `👑 *DONO DO BOT*\n\n` +
    `🧑 *Nome:* Luís Lutchi\n` +
    `📸 *Instagram:* @luislutchii\n` +
    `🇦🇴 *País:* Angola\n` +
    `🌐 _github.com/luislutchii/lutchi-zap-hack_\n\n` +
    `_Para bugs use: ${p}reportar_`
  );
}

async function sobre(ctx) {
  return ctx.reply(
    `🤖 *LUTCHI ZAP HACK v1.0.0*\n\n` +
    `⚡ *Prefixo:* \`.\`\n` +
    `🛠️ Node.js + Baileys\n` +
    `👑 Luís Lutchi | 📸 @luislutchii\n` +
    `🇦🇴 Angola\n\n` +
    `_Bot completo de gerenciamento_ 💜`
  );
}

async function ping(ctx) {
  const { sock, from, msg } = ctx;
  const start = Date.now();
  const sent  = await sock.sendMessage(from, { text: "🏓 Calculando..." }, { quoted: msg });
  await sock.sendMessage(from, {
    text: `🏓 *Pong!* ⚡ *${Date.now() - start}ms*\n🤖 Online! ✅`,
    edit: sent.key,
  });
}

async function info(ctx) {
  const { sock, from, msg, groupMeta, reply } = ctx;
  if (!groupMeta) return reply("❌ Apenas em grupos!");
  const admins  = groupMeta.participants.filter((p) => p.admin).length;
  const members = groupMeta.participants.length;
  return sock.sendMessage(from, {
    text:
      `📋 *INFORMAÇÕES DO GRUPO*\n\n` +
      `👥 *Nome:* ${groupMeta.subject}\n` +
      `📆 *Criado:* ${new Date(groupMeta.creation * 1000).toLocaleDateString("pt-AO")}\n` +
      `👤 *Membros:* ${members} | 👑 *Admins:* ${admins}\n` +
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
  const text = rulesStore.get(from) ?? "Nenhuma regra definida.\nUse *.setregras* para definir.";
  return sock.sendMessage(from, { text: `📜 *REGRAS*\n\n${text}\n\n_🤖 Lutchi Zap Hack_` }, { quoted: msg });
}

async function setregras(ctx) {
  const { from, args, reply } = ctx;
  const text = args.join(" ");
  if (!text) return reply(`❌ Ex: ${p}setregras 1. Respeito 2. Sem spam`);
  rulesStore.set(from, text);
  return reply("✅ Regras actualizadas!");
}

async function sticker(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg = msg.message?.imageMessage || quoted?.imageMessage ||
                   msg.message?.videoMessage || quoted?.videoMessage;
    if (!imgMsg) return reply(`❌ Envie ou responda uma imagem com *${p}sticker*`);
    const isVideo = !!imgMsg.seconds || imgMsg?.mimetype?.includes("video");
    const stream  = await downloadContentFromMessage(imgMsg, isVideo ? "video" : "image");
    let buffer    = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

module.exports = { lutchi, menu, dono, sobre, ping, info, link, regras, setregras, sticker };
