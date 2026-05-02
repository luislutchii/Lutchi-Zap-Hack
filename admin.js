// ============================================================
//  src/commands/admin.js — Moderação Avançada
//  🤖 Lutchi Zap Hack | by Luís Lutchi (@luislutchii)
// ============================================================

import NodeCache from "node-cache";
import { reply, mentionFromMsg, parseJid, requireBotAdmin } from "../utils/helpers.js";

const warningsStore  = new NodeCache({ stdTTL: 0 });
const mutedUsers     = new NodeCache({ stdTTL: 0 });
const antiLinkGroups = new NodeCache({ stdTTL: 0 });
const antiFloodData  = new NodeCache({ stdTTL: 10 });
const bannedWordsMap = new NodeCache({ stdTTL: 0 });

const FOOTER = "\n\n_🤖 Lutchi Zap Hack_";

// ── .antilink on|off ─────────────────────────────────────────
export async function antilink({ sock, msg, jid, args }) {
  const mode = args[0]?.toLowerCase();
  if (!["on", "off"].includes(mode))
    return reply(sock, msg, `❓ Use *.antilink on* ou *.antilink off*${FOOTER}`);

  antiLinkGroups.set(jid, mode === "on");
  reply(
    sock, msg,
    mode === "on"
      ? `🔗 Anti-link *ativado*! Links serão removidos e usuário avisado.${FOOTER}`
      : `🔗 Anti-link *desativado*.${FOOTER}`
  );
}

export function checkAntiLink(jid) {
  return !!antiLinkGroups.get(jid);
}

// ── .antiflood on|off ────────────────────────────────────────
export async function antiflood({ sock, msg, jid, args, config }) {
  const mode = args[0]?.toLowerCase();
  if (!["on", "off"].includes(mode))
    return reply(sock, msg, `❓ Use *.antiflood on* ou *.antiflood off*${FOOTER}`);

  antiLinkGroups.set(`flood_${jid}`, mode === "on");
  reply(
    sock, msg,
    mode === "on"
      ? `🌊 Anti-flood *ativado*! Máx. ${config.antiFloodMessages} msgs em ${config.antiFloodSeconds}s.${FOOTER}`
      : `🌊 Anti-flood *desativado*.${FOOTER}`
  );
}

export function checkFlood(jid, sender, limit) {
  const key   = `${jid}:${sender}`;
  const count = (antiFloodData.get(key) ?? 0) + 1;
  antiFloodData.set(key, count);
  return count > limit;
}

// ── .warn @membro [motivo] ───────────────────────────────────
export async function warn({ sock, msg, jid, args, config }) {
  const target = mentionFromMsg(msg) ?? parseJid(args[0]);
  if (!target) return reply(sock, msg, `❓ Ex: *.warn @fulano spam*${FOOTER}`);

  const reason  = args.slice(1).join(" ") || "Sem motivo informado";
  const key     = `${jid}:${target}`;
  const current = (warningsStore.get(key) ?? 0) + 1;
  warningsStore.set(key, current);

  const max = config.antiLinkWarnings ?? 3;

  if (current >= max) {
    await sock.groupParticipantsUpdate(jid, [target], "remove");
    warningsStore.del(key);
    await reply(
      sock, msg,
      `⛔ @${target.split("@")[0]} atingiu *${max} avisos* e foi removido!\n📋 Motivo: ${reason}${FOOTER}`,
      [target]
    );
  } else {
    await reply(
      sock, msg,
      `⚠️ *Aviso ${current}/${max}* para @${target.split("@")[0]}\n📋 Motivo: ${reason}${FOOTER}`,
      [target]
    );
  }
}

// ── .warnings @membro ────────────────────────────────────────
export async function warnings({ sock, msg, jid, args, config }) {
  const target = mentionFromMsg(msg) ?? parseJid(args[0]);
  if (!target) return reply(sock, msg, `❓ Ex: *.warnings @fulano*${FOOTER}`);

  const count = warningsStore.get(`${jid}:${target}`) ?? 0;
  await reply(
    sock, msg,
    `📊 @${target.split("@")[0]} tem *${count}/${config.antiLinkWarnings ?? 3}* avisos.${FOOTER}`,
    [target]
  );
}

// ── .resetwarn @membro ───────────────────────────────────────
export async function resetWarn({ sock, msg, jid, args }) {
  const target = mentionFromMsg(msg) ?? parseJid(args[0]);
  if (!target) return reply(sock, msg, `❓ Ex: *.resetwarn @fulano*${FOOTER}`);

  warningsStore.del(`${jid}:${target}`);
  await reply(sock, msg, `✅ Avisos de @${target.split("@")[0]} zerados!${FOOTER}`, [target]);
}

// ── .banword palavra ─────────────────────────────────────────
export async function banWord({ sock, msg, jid, args }) {
  const word = args[0]?.toLowerCase();
  if (!word) return reply(sock, msg, `❓ Ex: *.banword spam*${FOOTER}`);

  const list = bannedWordsMap.get(jid) ?? [];
  if (list.includes(word))
    return reply(sock, msg, `🚫 A palavra *${word}* já está na lista.${FOOTER}`);

  list.push(word);
  bannedWordsMap.set(jid, list);
  await reply(sock, msg, `🚫 Palavra *${word}* banida com sucesso!${FOOTER}`);
}

export function containsBannedWord(jid, text) {
  const list = bannedWordsMap.get(jid) ?? [];
  return list.some((w) => text.toLowerCase().includes(w));
}

// ── .mute @membro [minutos] ──────────────────────────────────
export async function mute({ sock, msg, jid, args, botAdmin }) {
  if (!requireBotAdmin(sock, msg, botAdmin)) return;
  const target  = mentionFromMsg(msg) ?? parseJid(args[0]);
  const minutes = parseInt(args[1] ?? args[0]) || 5;
  if (!target) return reply(sock, msg, `❓ Ex: *.mute @fulano 10*${FOOTER}`);

  const until = Date.now() + minutes * 60 * 1000;
  mutedUsers.set(`${jid}:${target}`, until, minutes * 60);

  await reply(
    sock, msg,
    `🔇 @${target.split("@")[0]} silenciado por *${minutes} minuto(s)*.${FOOTER}`,
    [target]
  );
}

// ── .unmute @membro ──────────────────────────────────────────
export async function unmute({ sock, msg, jid, args }) {
  const target = mentionFromMsg(msg) ?? parseJid(args[0]);
  if (!target) return reply(sock, msg, `❓ Ex: *.unmute @fulano*${FOOTER}`);

  mutedUsers.del(`${jid}:${target}`);
  await reply(sock, msg, `🔊 @${target.split("@")[0]} desmutado!${FOOTER}`, [target]);
}

export function isMuted(jid, sender) {
  return !!mutedUsers.get(`${jid}:${sender}`);
}