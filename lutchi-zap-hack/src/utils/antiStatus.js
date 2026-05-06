const { getAntiStatus } = require("./database");

function normalizeId(jid = "") {
  return jid.replace(/:.*@/, "@").replace(/@.*/, "");
}

// protocolType 14 = menção de grupo no status do WhatsApp
function isStatusMention(msg) {
  const m = msg.message;
  if (!m) return false;

  // Formato detectado nos logs: protocolMessage com type 14
  if (m?.protocolMessage?.type === 14) return true;

  // Formatos alternativos
  if (m?.groupMentionedMessage)    return true;
  if (m?.statusMentionMessage)     return true;
  const ctx = m?.extendedTextMessage?.contextInfo;
  if (ctx?.remoteJid === "status@broadcast") return true;

  return false;
}

async function handleAntiStatus(sock, msg, from, sender) {
  try {
    if (!getAntiStatus(from))  return;
    if (!isStatusMention(msg)) return;

    const num       = normalizeId(sender);
    const groupMeta = await sock.groupMetadata(from).catch(() => null);

    // Admins não são banidos
    if (groupMeta) {
      const isAdmin = groupMeta.participants
        .filter((p) => p.admin)
        .some((p) => normalizeId(p.id) === num);
      if (isAdmin) return;
    }

    // Apaga a mensagem
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});

    // Resolve JID real para o ban (LID → @s.whatsapp.net)
    let banJid = sender;
    if (groupMeta) {
      for (const p of groupMeta.participants) {
        if (normalizeId(p.id) === num && p.id.endsWith("@s.whatsapp.net")) {
          banJid = p.id; break;
        }
      }
    }

    // Marca como banido — sem mensagem de saída
    global.bannedByBot?.add(banJid);
    global.bannedByBot?.add(sender);

    await sock.sendMessage(from, {
      text:
        `🚫 *ANTI-STATUS*\n\n` +
        `@${num} foi *removido* por marcar este grupo no status do WhatsApp.\n\n` +
        `⚠️ Não é permitido marcar o grupo no status.`,
      mentions: [sender],
    });

    await sock.groupParticipantsUpdate(from, [banJid], "remove").catch(() => {});

    console.log(`[ANTI-STATUS] Removido: ${num}`);

  } catch (e) { console.error("[ANTI-STATUS] Erro:", e.message); }
}

module.exports = { handleAntiStatus, isStatusMention };
