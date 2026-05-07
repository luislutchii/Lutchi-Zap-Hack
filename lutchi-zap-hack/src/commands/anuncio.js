const config = require("../config/config");
const fs = require("fs");
const path = require("path");

const STATUS_FILE = path.join(__dirname, "../../data/anuncio_status.json");

// Carregar status do arquivo
function carregarStatus() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      return JSON.parse(fs.readFileSync(STATUS_FILE, "utf8"));
    }
  } catch (e) {}
  return {};
}

// Salvar status no arquivo
function salvarStatus(status) {
  try {
    const dir = path.dirname(STATUS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
  } catch (e) {}
}

const anuncioStatus = new Map();
const anuncioTimers = new Map();

// Inicializar status do arquivo
function initStatus() {
  const saved = carregarStatus();
  for (const [groupId, status] of Object.entries(saved)) {
    anuncioStatus.set(groupId, status);
  }
}

// ANUNCIO_TEXT fixo (ou pode ser personalizado depois)
const ANUNCIO_TEXT = "Siga o Instagram do Bot com humildade\nhttps://instagram.com/luislutchii";

// Envia anúncio com menção silenciosa
async function enviarAnuncio(sock, groupId) {
  try {
    const meta = await sock.groupMetadata(groupId).catch(() => null);
    if (!meta) return;

    // Só envia se o bot for administrador
    const botId = (sock.user?.id ?? "").replace(/:.*@/, "@").replace(/@.*/, "");
    const botLid = (sock.user?.lid ?? "").replace(/:.*@/, "@").replace(/@.*/, "");
    const isBotAdmin = meta.participants
      .filter(p => p.admin)
      .some(p => {
        const n = p.id.replace(/:.*@/, "@").replace(/@.*/, "");
        return n === botId || n === botLid;
      });

    if (!isBotAdmin) return;

    const mentions = meta.participants.map(p => p.id);
    await sock.sendMessage(groupId, {
      text: ANUNCIO_TEXT,
      mentions,
    });
  } catch (_) {}
}

function iniciarAnuncio(sock, groupId) {
  if (anuncioTimers.has(groupId)) return;
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
      "• *.anuncio agora* — enviar agora\n\n" +
      "💡 *Dica:* O dono pode usar .anunciar para enviar mensagens apenas para grupos com anúncio ativo!"
    );
  }

  if (option === "off") {
    anuncioStatus.set(from, false);
    pararAnuncio(from);
    salvarStatus(Object.fromEntries(anuncioStatus));
    return reply("📢 *Anúncio desativado!* ❌\n\nEste grupo não receberá mais anúncios automáticos.");
  }

  if (option === "on") {
    anuncioStatus.set(from, true);
    salvarStatus(Object.fromEntries(anuncioStatus));
    iniciarAnuncio(sock, from);
    return reply("📢 *Anúncio ativado!* ✅\n_Enviado a cada 30 minutos com menção silenciosa._");
  }

  if (option === "agora") {
    await enviarAnuncio(sock, from);
    return reply("✅ Anúncio enviado neste grupo!");
  }

  return reply("❌ Use: .anuncio on/off/agora");
}

// Exportar também o status para outros módulos
module.exports = { anuncio, iniciarAnunciosTodos, iniciarAnuncio, getAnuncioStatus: () => Object.fromEntries(anuncioStatus), initStatus };
