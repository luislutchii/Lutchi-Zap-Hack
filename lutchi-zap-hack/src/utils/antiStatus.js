const { getAntiStatus } = require("./database");

function normalizeId(jid = "") {
  return jid.replace(/:.*@/, "@").replace(/@.*/, "");
}

// Detecta se é uma mensagem de status com menção de grupo
function isStatusMention(msg) {
  const m = msg.message;
  if (!m) return false;

  // Formato exacto detectado nos logs:
  // remoteJid = "status@broadcast" + imageMessage.contextInfo.statusSourceType
  if (msg.key?.remoteJid === "status@broadcast") {
    const ctx = m?.imageMessage?.contextInfo
              || m?.videoMessage?.contextInfo
              || m?.extendedTextMessage?.contextInfo;
    if (ctx?.statusSourceType) return true;
  }

  // Formatos alternativos
  if (m?.groupMentionedMessage) return true;
  if (m?.statusMentionMessage)  return true;

  return false;
}

// Chamado quando chega um status — verifica em todos os grupos com antistatus activo
async function handleStatusBroadcast(sock, msg, sender) {
  try {
    if (!isStatusMention(msg)) return;

    const senderPhone = normalizeId(sender);

    // Busca todos os grupos onde o bot está
    const groups = await sock.groupFetchAllParticipating().catch(() => ({}));

    for (const [groupId, groupMeta] of Object.entries(groups)) {
      if (!getAntiStatus(groupId)) continue;

      // Verifica se o sender está no grupo
      const member = groupMeta.participants.find(
        (p) => normalizeId(p.id) === senderPhone
      );
      if (!member) continue;

      // Admins não são banidos
      if (member.admin) continue;

      // Resolve JID real para ban
      let banJid = sender;
      for (const p of groupMeta.participants) {
        if (normalizeId(p.id) === senderPhone && p.id.endsWith("@s.whatsapp.net")) {
          banJid = p.id; break;
        }
      }

      global.bannedByBot?.add(banJid);
      global.bannedByBot?.add(sender);

      await sock.sendMessage(groupId, {
        text:
          `🚫 *ANTI-STATUS*\n\n` +
          `@${senderPhone} foi *removido* por marcar este grupo no status do WhatsApp.\n\n` +
          `⚠️ Não é permitido marcar o grupo no status.`,
        mentions: [banJid],
      });

      await sock.groupParticipantsUpdate(groupId, [banJid], "remove").catch(() => {});
      console.log(`[ANTI-STATUS] ${senderPhone} removido do grupo ${groupMeta.subject}`);
    }

  } catch (e) { console.error("[ANTI-STATUS] Erro:", e.message); }
}

// Chamado para mensagens de grupo normais (backup)
async function handleAntiStatus(sock, msg, from, sender) {
  try {
    if (!getAntiStatus(from))  return;
    if (!isStatusMention(msg)) return;
    await handleStatusBroadcast(sock, msg, sender);
  } catch (e) { console.error("[ANTI-STATUS]", e.message); }
}

module.exports = { handleAntiStatus, handleStatusBroadcast, isStatusMention };
