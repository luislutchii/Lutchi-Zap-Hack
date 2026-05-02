// ╔══════════════════════════════════════════════════╗
// ║      LUTCHI ZAP HACK - Comandos Admin            ║
// ╚══════════════════════════════════════════════════╝

const config = require("../config/config");
const p = config.prefix;

// Helper: extrair menções
function getMentioned(msg, args) {
  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentions.length > 0) return mentions;
  // Tentar pelo número no argumento
  if (args[0] && /\d+/.test(args[0])) {
    const num = args[0].replace(/[^0-9]/g, "");
    return [`${num}@s.whatsapp.net`];
  }
  return [];
}

// ── BAN ───────────────────────────────────────────────────────
async function ban(ctx) {
  const { sock, from, msg, reply, args, groupMeta, isBotAdmin } = ctx;

  if (!isBotAdmin) return reply("❌ Preciso ser admin para banir membros!");

  const mentioned = getMentioned(msg, args);
  if (mentioned.length === 0) return reply(`❌ Mencione alguém! Use: ${p}ban @membro`);

  for (const jid of mentioned) {
    const num = jid.split("@")[0];
    const isTargetAdmin = groupMeta?.participants
      .filter((p) => p.admin)
      .some((p) => p.id.includes(num));

    if (isTargetAdmin) {
      await reply(`❌ Não posso banir um admin!`);
      continue;
    }

    await sock.groupParticipantsUpdate(from, [jid], "remove");
    await reply(`🔨 *@${num}* foi banido do grupo!`, { mentions: [jid] });
  }
}

// ── KICK ──────────────────────────────────────────────────────
async function kick(ctx) {
  return ban(ctx); // Kick = remover sem motivo especial
}

// ── ADD ───────────────────────────────────────────────────────
async function add(ctx) {
  const { sock, from, args, reply, isBotAdmin } = ctx;

  if (!isBotAdmin) return reply("❌ Preciso ser admin para adicionar membros!");
  if (!args[0]) return reply(`❌ Use: ${p}add 244XXXXXXXXX`);

  let num = args[0].replace(/[^0-9]/g, "");
  if (!num.startsWith("244") && num.length <= 9) num = "244" + num;
  const jid = `${num}@s.whatsapp.net`;

  try {
    const result = await sock.groupParticipantsUpdate(from, [jid], "add");
    if (result[0]?.status === "200") {
      return reply(`✅ *+244 ${num.slice(3)}* foi adicionado ao grupo!`);
    } else {
      return reply(`❌ Não foi possível adicionar o número. Verifique se está no WhatsApp.`);
    }
  } catch (e) {
    return reply("❌ Erro ao adicionar: " + e.message);
  }
}

// ── PROMOVER ──────────────────────────────────────────────────
async function promover(ctx) {
  const { sock, from, msg, args, reply, isBotAdmin } = ctx;

  if (!isBotAdmin) return reply("❌ Preciso ser admin para promover membros!");

  const mentioned = getMentioned(msg, args);
  if (mentioned.length === 0) return reply(`❌ Use: ${p}promover @membro`);

  for (const jid of mentioned) {
    await sock.groupParticipantsUpdate(from, [jid], "promote");
    await reply(`⭐ *@${jid.split("@")[0]}* foi promovido a administrador!`, {
      mentions: [jid],
    });
  }
}

// ── REBAIXAR ──────────────────────────────────────────────────
async function rebaixar(ctx) {
  const { sock, from, msg, args, reply, isBotAdmin } = ctx;

  if (!isBotAdmin) return reply("❌ Preciso ser admin para rebaixar membros!");

  const mentioned = getMentioned(msg, args);
  if (mentioned.length === 0) return reply(`❌ Use: ${p}rebaixar @membro`);

  for (const jid of mentioned) {
    await sock.groupParticipantsUpdate(from, [jid], "demote");
    await reply(`⬇️ *@${jid.split("@")[0]}* foi rebaixado de administrador!`, {
      mentions: [jid],
    });
  }
}

// ── TODOS ─────────────────────────────────────────────────────
async function todos(ctx) {
  const { sock, from, args, reply, groupMeta } = ctx;

  if (!groupMeta) return reply("❌ Erro ao obter dados do grupo!");

  const message = args.join(" ") || "📣 Atenção a todos!";
  const participants = groupMeta.participants.map((p) => p.id);
  const mentions = participants;

  const mentionText = participants.map((p) => `@${p.split("@")[0]}`).join(" ");

  return sock.sendMessage(from, {
    text: `📢 *${message}*\n\n${mentionText}`,
    mentions,
  });
}

// ── FECHAR ────────────────────────────────────────────────────
async function fechar(ctx) {
  const { sock, from, reply, isBotAdmin } = ctx;

  if (!isBotAdmin) return reply("❌ Preciso ser admin para fechar o grupo!");

  await sock.groupSettingUpdate(from, "announcement");
  return reply("🔒 *Grupo fechado!* Apenas admins podem enviar mensagens.");
}

// ── ABRIR ─────────────────────────────────────────────────────
async function abrir(ctx) {
  const { sock, from, reply, isBotAdmin } = ctx;

  if (!isBotAdmin) return reply("❌ Preciso ser admin para abrir o grupo!");

  await sock.groupSettingUpdate(from, "not_announcement");
  return reply("🔓 *Grupo aberto!* Todos podem enviar mensagens.");
}

// ── NOME ──────────────────────────────────────────────────────
async function nome(ctx) {
  const { sock, from, args, reply, isBotAdmin } = ctx;

  if (!isBotAdmin) return reply("❌ Preciso ser admin para mudar o nome!");
  if (!args.length) return reply(`❌ Use: ${p}nome Novo Nome do Grupo`);

  const newName = args.join(" ");
  await sock.groupUpdateSubject(from, newName);
  return reply(`✅ Nome do grupo alterado para: *${newName}*`);
}

// ── DESC ──────────────────────────────────────────────────────
async function desc(ctx) {
  const { sock, from, args, reply, isBotAdmin } = ctx;

  if (!isBotAdmin) return reply("❌ Preciso ser admin para mudar a descrição!");
  if (!args.length) return reply(`❌ Use: ${p}desc Nova descrição do grupo`);

  const newDesc = args.join(" ");
  await sock.groupUpdateDescription(from, newDesc);
  return reply(`✅ Descrição do grupo atualizada!`);
}

// ── FOTO ──────────────────────────────────────────────────────
async function foto(ctx) {
  const { sock, from, msg, reply, isBotAdmin } = ctx;

  if (!isBotAdmin) return reply("❌ Preciso ser admin para mudar a foto!");

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;

  if (!imageMsg) return reply(`❌ Responda ou envie uma imagem com *${p}foto*`);

  try {
    const stream = await sock.downloadContentFromMessage(imageMsg, "image");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    await sock.updateProfilePicture(from, buffer);
    return reply("✅ Foto do grupo atualizada!");
  } catch (e) {
    return reply("❌ Erro ao mudar foto: " + e.message);
  }
}

module.exports = {
  ban,
  kick,
  add,
  promover,
  rebaixar,
  todos,
  fechar,
  abrir,
  nome,
  desc,
  foto,
};
