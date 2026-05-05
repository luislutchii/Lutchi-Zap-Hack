const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const config = require("../config/config");
const p      = config.prefix;

function getMentioned(msg, args) {
  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentions.length > 0) return mentions;
  if (args[0] && /\d+/.test(args[0])) {
    const num = args[0].replace(/[^0-9]/g, "");
    return [`${num}@s.whatsapp.net`];
  }
  return [];
}

async function ban(ctx) {
  const { sock, from, msg, reply, args, groupMeta, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("❌ Preciso ser admin para banir membros!");
  const mentioned = getMentioned(msg, args);
  if (mentioned.length === 0) return reply(`❌ Use: ${p}ban @membro`);
  for (const jid of mentioned) {
    const num = jid.split("@")[0];
    const isTargetAdmin = groupMeta?.participants.filter((p) => p.admin).some((p) => p.id.includes(num));
    if (isTargetAdmin) { await reply(`❌ Não posso banir um admin!`); continue; }
    global.bannedByBot?.add(jid);
    await sock.groupParticipantsUpdate(from, [jid], "remove");
    await reply(`🔨 *@${num}* foi banido do grupo!`, { mentions: [jid] });
  }
}

async function kick(ctx) { return ban(ctx); }

async function add(ctx) {
  const { sock, from, args, reply, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("❌ Preciso ser admin para adicionar membros!");
  if (!args[0]) return reply(`❌ Use: ${p}add 244XXXXXXXXX`);
  let num = args[0].replace(/[^0-9]/g, "");
  if (!num.startsWith("244") && num.length <= 9) num = "244" + num;
  const jid = `${num}@s.whatsapp.net`;
  await reply(`⏳ Verificando *+${num}*...`);
  try {
    const check = await sock.onWhatsApp(jid).catch(() => []);
    if (!check?.[0]?.exists) return reply(`❌ O número *+${num}* não tem WhatsApp!`);
    const result = await sock.groupParticipantsUpdate(from, [jid], "add");
    const status = result?.[0]?.status;
    if (status === "200") return reply(`✅ *+${num}* foi adicionado ao grupo!`);
    if (status === "403") return reply(`🚫 *+${num}* bloqueou adições a grupos.\n\n*Configurações → Privacidade → Grupos*`);
    if (status === "408") return reply(`❌ Número inválido.`);
    if (status === "409") return reply(`⚠️ *+${num}* já está no grupo!`);
    return reply(`⚠️ Status: ${status}`);
  } catch (e) {
    if (e.message?.toLowerCase().includes("timed") || e.message?.toLowerCase().includes("timeout"))
      return reply(`⏱️ *Tempo esgotado!*\n\n• Pessoa bloqueou adições\n• Tente novamente em 30s`);
    return reply("❌ Erro: " + e.message);
  }
}

async function promover(ctx) {
  const { sock, from, msg, args, reply, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("❌ Preciso ser admin para promover membros!");
  const mentioned = getMentioned(msg, args);
  if (!mentioned.length) return reply(`❌ Use: ${p}promover @membro`);
  for (const jid of mentioned) {
    await sock.groupParticipantsUpdate(from, [jid], "promote");
    await reply(`⭐ *@${jid.split("@")[0]}* foi promovido a administrador!`, { mentions: [jid] });
  }
}

async function rebaixar(ctx) {
  const { sock, from, msg, args, reply, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("❌ Preciso ser admin para rebaixar membros!");
  const mentioned = getMentioned(msg, args);
  if (!mentioned.length) return reply(`❌ Use: ${p}rebaixar @membro`);
  for (const jid of mentioned) {
    await sock.groupParticipantsUpdate(from, [jid], "demote");
    await reply(`⬇️ *@${jid.split("@")[0]}* foi rebaixado!`, { mentions: [jid] });
  }
}

async function todos(ctx) {
  const { sock, from, args, reply, groupMeta } = ctx;
  if (!groupMeta) return reply("❌ Erro ao obter dados do grupo!");
  const message      = args.join(" ") || "📣 Atenção a todos!";
  const participants = groupMeta.participants.map((p) => p.id);
  const mentionText  = participants.map((p) => `@${p.split("@")[0]}`).join(" ");
  return sock.sendMessage(from, { text: `📢 *${message}*\n\n${mentionText}`, mentions: participants });
}

async function fechar(ctx) {
  const { sock, from, reply, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("❌ Preciso ser admin para fechar o grupo!");
  await sock.groupSettingUpdate(from, "announcement");
  return reply("🔒 *Grupo fechado!* Apenas admins podem enviar mensagens.");
}

async function abrir(ctx) {
  const { sock, from, reply, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("❌ Preciso ser admin para abrir o grupo!");
  await sock.groupSettingUpdate(from, "not_announcement");
  return reply("🔓 *Grupo aberto!* Todos podem enviar mensagens.");
}

async function nome(ctx) {
  const { sock, from, args, reply, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("❌ Preciso ser admin para mudar o nome!");
  if (!args.length) return reply(`❌ Use: ${p}nome Novo Nome`);
  await sock.groupUpdateSubject(from, args.join(" "));
  return reply(`✅ Nome alterado para: *${args.join(" ")}*`);
}

async function desc(ctx) {
  const { sock, from, args, reply, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("❌ Preciso ser admin para mudar a descrição!");
  if (!args.length) return reply(`❌ Use: ${p}desc Nova descrição`);
  await sock.groupUpdateDescription(from, args.join(" "));
  return reply(`✅ Descrição atualizada!`);
}

async function foto(ctx) {
  const { sock, from, msg, reply, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("❌ Preciso ser admin para mudar a foto!");
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;
  if (!imageMsg) return reply(`❌ Responda ou envie uma imagem com *${p}foto*`);
  try {
    // FIX: usa downloadContentFromMessage importado directamente
    const stream = await downloadContentFromMessage(imageMsg, "image");
    let buffer   = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    await sock.updateProfilePicture(from, buffer);
    return reply("✅ Foto do grupo atualizada!");
  } catch (e) { return reply("❌ Erro ao mudar foto: " + e.message); }
}


async function apagar(ctx) {
  const { sock, from, msg, reply, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("❌ Preciso ser admin para apagar mensagens!");
  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  if (!quoted?.stanzaId) return reply("❌ Responda a mensagem que deseja apagar!");
  try {
    await sock.sendMessage(from, {
      delete: {
        remoteJid: from,
        fromMe: false,
        id: quoted.stanzaId,
        participant: quoted.participant,
      }
    });
    return reply("🗑️ Mensagem apagada!");
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function revogar(ctx) {
  const { sock, from, reply, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("❌ Preciso ser admin para revogar o link!");
  try {
    await sock.groupRevokeInvite(from);
    const newCode = await sock.groupInviteCode(from);
    return reply("✅ *Link revogado!*\n\n🔗 Novo link:\nhttps://chat.whatsapp.com/" + newCode);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function boasvindas(ctx) {
  const { from, args, reply, isGroup } = ctx;
  if (!isGroup) return reply("❌ Apenas em grupos!");
  const { setBoasVindas, getBoasVindas } = require("../utils/database");
  const option = args[0]?.toLowerCase();
  if (!["on", "off"].includes(option)) {
    const status = getBoasVindas(from);
    return reply("👋 *Boas-Vindas:* " + (status ? "✅ Ativado" : "❌ Desativado") + "\n\nUse: .boasvindas on/off");
  }
  setBoasVindas(from, option === "on");
  return reply(option === "on"
    ? "👋 *Boas-Vindas ativado!* ✅\n_Novos membros serão saudados automaticamente._"
    : "👋 *Boas-Vindas desativado!* ❌"
  );
}

module.exports = { ban, kick, add, promover, rebaixar, todos, fechar, abrir, nome, desc, foto, apagar, revogar, boasvindas };
