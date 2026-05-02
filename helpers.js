// ============================================================
//  src/utils/helpers.js — Funções Auxiliares
//  🤖 Lutchi Zap Hack | by Luís Lutchi (@luislutchii)
// ============================================================

export async function reply(sock, msg, text, mentions = []) {
  return sock.sendMessage(
    msg.key.remoteJid,
    { text, mentions },
    { quoted: msg }
  );
}

export function mentionFromMsg(msg) {
  const mentions =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ??
    msg.message?.contextInfo?.mentionedJid ??
    [];
  return mentions[0] ?? null;
}

export function parseJid(numberStr) {
  if (!numberStr) return null;
  const clean = numberStr.replace(/\D/g, "");
  if (!clean) return null;
  return `${clean}@s.whatsapp.net`;
}

export function isAdmin(sender, groupMeta) {
  if (!groupMeta) return false;
  const p = groupMeta.participants.find((m) => m.id === sender);
  return p?.admin === "admin" || p?.admin === "superadmin";
}

export async function isBotAdmin(sock, jid, groupMeta) {
  if (!groupMeta) return false;
  const botId = sock.user?.id?.replace(/:.*@/, "@");
  const p = groupMeta.participants.find(
    (m) => m.id === botId || m.id.split(":")[0] + "@s.whatsapp.net" === botId
  );
  return p?.admin === "admin" || p?.admin === "superadmin";
}

export function isOwner(sender, config) {
  const normalized = sender.replace(/:.*@/, "@");
  return normalized === config.ownerNumber;
}

export function requireBotAdmin(sock, msg, botAdmin) {
  if (!botAdmin) {
    reply(sock, msg, "⚠️ O bot precisa ser *administrador* do grupo para isso.\n\n_🤖 Lutchi Zap Hack_");
    return false;
  }
  return true;
}

export function containsLink(text) {
  return /(https?:\/\/[^\s]+|wa\.me\/[^\s]+|chat\.whatsapp\.com\/[^\s]+)/gi.test(text);
}

export function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}