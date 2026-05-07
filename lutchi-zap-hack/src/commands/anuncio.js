const config = require("../config/config");

const ANUNCIO_TEXT =
  "Siga o Instagram do Bot com humildade\n" +
  "https://instagram.com/luislutchii";

const anuncioStatus = new Map();
const anuncioTimers = new Map();

// Envia anúncio com menção silenciosa (sem listar nomes)
async function enviarAnuncio(sock, groupId) {
  try {
    const meta = await sock.groupMetadata(groupId).catch(() => null);
    const mentions = meta ? meta.participants.map(p => p.id) : [];
    await sock.sendMessage(groupId, {
      text: ANUNCIO_TEXT,
      mentions, // menção silenciosa — notifica sem listar
    });
  } catch (_) {}
}

function iniciarAnuncio(sock, groupId) {
  if (anuncioTimers.has(groupId)) return;
  // Envia imediatamente ao iniciar
  enviarAnuncio(sock, groupId);
  const interval = setInterval(() => {
    if (anuncioStatus.get(groupId) === false) return;
    enviarAnuncio(sock, groupId);
  }, 30 * 60 * 1000);
  anuncioTimers.set(groupId, interval);
}

function pararAnuncio(groupId) {
  const interval = anuncioTimers.get(groupId);
  if (interval) {
    clearInterval(interval);
    anuncioTimers.delete(groupId);
  }
}

async function iniciarAnunciosTodos(sock) {
  try {
    const grupos = await sock.groupFetchAllParticipating();
    for (const groupId of Object.keys(grupos)) {
      if (anuncioStatus.get(groupId) !== false) {
        iniciarAnuncio(sock, groupId);
      }
    }
    console.log("📢 Anúncios iniciados em", Object.keys(grupos).length, "grupos");
  } catch (e) {
    console.error("❌ Erro ao iniciar anúncios:", e.message);
  }
}

async function anuncio(ctx) {
  const { from, args, reply, isOwner, sock, isGroup } = ctx;
  if (!isGroup) return reply("❌ Apenas em grupos!");
  if (!isOwner) return reply("🔒 Apenas o *dono do bot* pode usar este comando!");

  const option = args[0]?.toLowerCase();

  if (!option) {
    const ativo = anuncioStatus.get(from) !== false;
    return reply(
      "📢 *ANÚNCIO*\n\n" +
      "Status: " + (ativo ? "✅ Ativo" : "❌ Desativado") + "\n\n" +
      "Use:\n" +
      "• *.anuncio off* — desativar\n" +
      "• *.anuncio on* — ativar\n" +
      "• *.anuncio agora* — enviar agora"
    );
  }

  if (option === "off") {
    anuncioStatus.set(from, false);
    pararAnuncio(from);
    return reply("📢 *Anúncio desativado!* ❌");
  }

  if (option === "on") {
    anuncioStatus.set(from, true);
    iniciarAnuncio(sock, from);
    return reply("📢 *Anúncio ativado!* ✅\n_Enviado a cada 30 minutos com menção silenciosa._");
  }

  if (option === "agora") {
    await enviarAnuncio(sock, from);
    return reply("✅ Anúncio enviado!");
  }

  return reply("❌ Use: .anuncio on/off/agora");
}

module.exports = { anuncio, iniciarAnunciosTodos, iniciarAnuncio };
