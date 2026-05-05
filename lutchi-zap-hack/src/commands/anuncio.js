const config = require("../config/config");

const ANUNCIO_TEXT =
  "📢 *ANÚNCIO DO LUTCHI ZAP HACK* 📢\n\n" +
  "🤖 Este grupo usa o *Lutchi Zap Hack*\n" +
  "o bot mais completo de Angola! 🇦🇴\n\n" +
  "📸 Segue o criador no Instagram:\n" +
  "👉 https://instagram.com/luislutchii\n\n" +
  "⚡ *@luislutchii* — Luís Lutchi\n" +
  "_Desenvolvedor do Lutchi Zap Hack_\n\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "🌐 github.com/luislutchii/Lutchi-Zap-Hack";

// Controlo por grupo — ativo por padrão
const anuncioStatus = new Map(); // groupId -> false (desativado)
const anuncioTimers = new Map(); // groupId -> intervalId

// Inicia o anúncio num grupo
function iniciarAnuncio(sock, groupId) {
  if (anuncioTimers.has(groupId)) return; // já está a correr
  const interval = setInterval(async () => {
    if (anuncioStatus.get(groupId) === false) return;
    await sock.sendMessage(groupId, { text: ANUNCIO_TEXT }).catch(() => {});
  }, 30 * 60 * 1000); // 30 minutos
  anuncioTimers.set(groupId, interval);
}

// Para o anúncio num grupo
function pararAnuncio(groupId) {
  const interval = anuncioTimers.get(groupId);
  if (interval) {
    clearInterval(interval);
    anuncioTimers.delete(groupId);
  }
}

// Inicia anúncios em todos os grupos ao ligar o bot
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

// Comando .anuncio — ver status ou ligar/desligar
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
    return reply("📢 *Anúncio desativado!* ❌\n_O anúncio não será mais enviado neste grupo._");
  }

  if (option === "on") {
    anuncioStatus.set(from, true);
    iniciarAnuncio(sock, from);
    return reply("📢 *Anúncio ativado!* ✅\n_Será enviado a cada 30 minutos._");
  }

  if (option === "agora") {
    await sock.sendMessage(from, { text: ANUNCIO_TEXT });
    return reply("✅ Anúncio enviado!");
  }

  return reply("❌ Use: .anuncio on/off/agora");
}

module.exports = { anuncio, iniciarAnunciosTodos, iniciarAnuncio };
