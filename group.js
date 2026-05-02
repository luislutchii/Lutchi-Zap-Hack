// ============================================================
//  src/commands/group.js — Gestão de Grupo
//  🤖 Lutchi Zap Hack | by Luís Lutchi (@luislutchii)
// ============================================================

import { reply, mentionFromMsg, parseJid, requireBotAdmin } from "../utils/helpers.js";

const FOOTER = "\n\n_🤖 Lutchi Zap Hack_";

// ── .ban / .kick — Remove membro ─────────────────────────────
export async function ban({ sock, msg, jid, args, groupMeta, botAdmin }) {
  if (!requireBotAdmin(sock, msg, botAdmin)) return;
  const target = mentionFromMsg(msg) ?? parseJid(args[0]);
  if (!target) return reply(sock, msg, `❓ Marque alguém ou informe o número.\nEx: *.ban @fulano*${FOOTER}`);

  const inGroup = groupMeta.participants.find((p) => p.id === target);
  if (!inGroup) return reply(sock, msg, `❌ Esse membro não está no grupo.${FOOTER}`);
  if (inGroup.admin) return reply(sock, msg, `⛔ Não posso remover um administrador.${FOOTER}`);

  await sock.groupParticipantsUpdate(jid, [target], "remove");
  await reply(sock, msg, `✅ @${target.split("@")[0]} foi removido do grupo.${FOOTER}`, [target]);
}

export const kick = ban;

// ── .add — Adiciona membro ────────────────────────────────────
export async function add({ sock, msg, jid, args, botAdmin }) {
  if (!requireBotAdmin(sock, msg, botAdmin)) return;
  const number = args[0]?.replace(/\D/g, "");
  if (!number) return reply(sock, msg, `❓ Ex: *.add 5511999999999*${FOOTER}`);

  const target = `${number}@s.whatsapp.net`;
  const result = await sock.groupParticipantsUpdate(jid, [target], "add");
  const status = result?.[0]?.status;

  if (status === "200") return reply(sock, msg, `✅ @${number} adicionado!${FOOTER}`, [target]);
  if (status === "403") return reply(sock, msg, `🚫 Usuário bloqueou convites.${FOOTER}`);
  if (status === "408") return reply(sock, msg, `⚠️ Número inválido ou não existe no WhatsApp.${FOOTER}`);
  reply(sock, msg, `⚠️ Status: ${status}${FOOTER}`);
}

// ── .promover ─────────────────────────────────────────────────
export async function promote({ sock, msg, jid, args, botAdmin }) {
  if (!requireBotAdmin(sock, msg, botAdmin)) return;
  const target = mentionFromMsg(msg) ?? parseJid(args[0]);
  if (!target) return reply(sock, msg, `❓ Ex: *.promover @fulano*${FOOTER}`);
  await sock.groupParticipantsUpdate(jid, [target], "promote");
  await reply(sock, msg, `⬆️ @${target.split("@")[0]} agora é administrador!${FOOTER}`, [target]);
}

// ── .rebaixar ────────────────────────────────────────────────
export async function demote({ sock, msg, jid, args, botAdmin }) {
  if (!requireBotAdmin(sock, msg, botAdmin)) return;
  const target = mentionFromMsg(msg) ?? parseJid(args[0]);
  if (!target) return reply(sock, msg, `❓ Ex: *.rebaixar @fulano*${FOOTER}`);
  await sock.groupParticipantsUpdate(jid, [target], "demote");
  await reply(sock, msg, `⬇️ @${target.split("@")[0]} foi rebaixado a membro.${FOOTER}`, [target]);
}

// ── .todos — Marca todos ──────────────────────────────────────
export async function tagAll({ sock, msg, jid, args, groupMeta }) {
  const participants = groupMeta.participants.map((p) => p.id);
  const tags = participants.map((p) => `@${p.split("@")[0]}`).join(" ");
  const text = args.length ? args.join(" ") : "📢 *Atenção, pessoal!*";
  await sock.sendMessage(jid, { text: `${text}\n\n${tags}${FOOTER}`, mentions: participants });
}

// ── .fechar / .abrir ─────────────────────────────────────────
export async function closeGroup({ sock, msg, jid, botAdmin }) {
  if (!requireBotAdmin(sock, msg, botAdmin)) return;
  await sock.groupSettingUpdate(jid, "announcement");
  await reply(sock, msg, `🔒 Grupo *fechado*. Apenas admins podem enviar mensagens.${FOOTER}`);
}

export async function openGroup({ sock, msg, jid, botAdmin }) {
  if (!requireBotAdmin(sock, msg, botAdmin)) return;
  await sock.groupSettingUpdate(jid, "not_announcement");
  await reply(sock, msg, `🔓 Grupo *aberto*. Todos podem enviar mensagens.${FOOTER}`);
}

// ── .nome ─────────────────────────────────────────────────────
export async function setName({ sock, msg, jid, args, botAdmin }) {
  if (!requireBotAdmin(sock, msg, botAdmin)) return;
  const name = args.join(" ");
  if (!name) return reply(sock, msg, `❓ Ex: *.nome Novo Nome Aqui*${FOOTER}`);
  await sock.groupUpdateSubject(jid, name);
  await reply(sock, msg, `✅ Nome alterado para *${name}*!${FOOTER}`);
}

// ── .desc ─────────────────────────────────────────────────────
export async function setDesc({ sock, msg, jid, args, botAdmin }) {
  if (!requireBotAdmin(sock, msg, botAdmin)) return;
  const desc = args.join(" ");
  if (!desc) return reply(sock, msg, `❓ Ex: *.desc Nova descrição aqui*${FOOTER}`);
  await sock.groupUpdateDescription(jid, desc);
  await reply(sock, msg, `✅ Descrição atualizada!${FOOTER}`);
}

// ── .foto — Responda uma imagem ───────────────────────────────
export async function setPhoto({ sock, msg, jid, botAdmin }) {
  if (!requireBotAdmin(sock, msg, botAdmin)) return;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imgMsg = quoted?.imageMessage ?? msg.message?.imageMessage;
  if (!imgMsg) return reply(sock, msg, `🖼️ Responda a uma imagem para definir como foto do grupo.${FOOTER}`);
  const buffer = await sock.downloadMediaMessage({ message: { imageMessage: imgMsg } });
  await sock.updateProfilePicture(jid, buffer);
  await reply(sock, msg, `✅ Foto do grupo atualizada!${FOOTER}`);
}

// ── .limpar ───────────────────────────────────────────────────
export async function clearChat({ sock, msg, jid }) {
  await reply(sock, msg, `🧹 *Limpeza anunciada!*\nEsta ação deve ser feita manualmente pelos membros.${FOOTER}`);
}