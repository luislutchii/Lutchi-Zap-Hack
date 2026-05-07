const axios = require("axios");

const API_URL = "https://api.signals-house.com/validate/results?tableId=1";

const PADROES = {
  "🔵,🔴":         "🔵",
  "🔴,🔵":         "🔴",
  "🔵,🔵,🔵":     "🔴",
  "🔴,🔴,🔴":     "🔵",
  "🔴,🔴,🔵":     "🔵",
  "🔵,🔵,🔴":     "🔴",
};

const RESULT_MAP = {
  "Player": "🔵",
  "Banker": "🔴",
  "Tie":    "🟡",
};

// Estado global por grupo
const estado = {};

function getEstado(groupId) {
  if (!estado[groupId]) {
    estado[groupId] = {
      ativo: false,
      history: [],
      processedIds: new Set(),
      lastRoundId: null,
      waitingResult: false,
      lastSignalColor: null,
      martingaleCount: 0,
      stats: { vitorias: 0, empates: 0, loss: 0 },
      interval: null,
      currentDate: new Date().toDateString(),
    };
  }
  return estado[groupId];
}

function checkDateReset(e) {
  const today = new Date().toDateString();
  if (e.currentDate !== today) {
    e.currentDate = today;
    e.stats = { vitorias: 0, empates: 0, loss: 0 };
  }
}

function findPattern(history) {
  for (const [seq, sinal] of Object.entries(PADROES)) {
    const arr = seq.split(",");
    const n = arr.length;
    if (history.length >= n && history.slice(-n).join(",") === arr.join(",")) {
      return sinal;
    }
  }
  return null;
}

function formatPlacar(e) {
  const total = e.stats.vitorias + e.stats.loss;
  const hoje = new Date().toLocaleDateString("pt-AO");
  return (
    "🏆 *PLACAR DO DIA*\n" +
    "📅 " + hoje + "\n" +
    "━━━━━━━━━━━━━━━━\n" +
    "✅ *Vitórias:* " + e.stats.vitorias + "\n" +
    "🤝 *Empates:* " + e.stats.empates + "\n" +
    "❌ *Loss:* " + e.stats.loss + "\n" +
    "━━━━━━━━━━━━━━━━\n" +
    "📊 *Total:* " + total
  );
}

async function fetchLatestGame() {
  try {
    const res = await axios.get(API_URL, { timeout: 5000 });
    const latest = res.data?.data?.[0];
    if (!latest) return null;
    return {
      id: latest.id,
      result: latest.result,
    };
  } catch (_) { return null; }
}

async function tick(sock, groupId) {
  const e = getEstado(groupId);
  if (!e.ativo) return;

  checkDateReset(e);

  const game = await fetchLatestGame();
  if (!game?.id || e.processedIds.has(game.id)) return;

  e.processedIds.add(game.id);
  e.lastRoundId = game.id;
  if (e.processedIds.size > 100) {
    const arr = [...e.processedIds];
    e.processedIds = new Set(arr.slice(-100));
  }

  const raw = game.result || "";
  let emoji = RESULT_MAP[raw];
  if (!emoji) {
    if (raw.toLowerCase().includes("player")) emoji = "🔵";
    else if (raw.toLowerCase().includes("banker")) emoji = "🔴";
    else if (raw.toLowerCase().includes("tie")) emoji = "🟡";
    else return;
  }

  e.history.push(emoji);
  if (e.history.length > 200) e.history.shift();

  if (e.waitingResult) {
    await resolveResult(sock, groupId, emoji);
  } else {
    await checkPatterns(sock, groupId);
  }
}

async function resolveResult(sock, groupId, emoji) {
  const e = getEstado(groupId);
  const target = e.lastSignalColor;

  if (emoji === "🟡" || emoji === target) {
    e.stats.vitorias++;
    if (emoji === "🟡") e.stats.empates++;
    e.waitingResult = false;
    e.martingaleCount = 0;
    await sock.sendMessage(groupId, { text: "🤑✅ *BATEU!* ✅🤑\n\n" + formatPlacar(e) });
    return;
  }

  if (e.martingaleCount === 0) {
    e.martingaleCount = 1;
    await sock.sendMessage(groupId, { text: "🔄 *Fazer 1º Gale!*\n\nAposte novamente em " + target });
    return;
  }

  e.stats.loss++;
  e.waitingResult = false;
  e.martingaleCount = 0;
  await sock.sendMessage(groupId, { text: "⭕ *Não pegamos!*\n\n" + formatPlacar(e) });
}

async function checkPatterns(sock, groupId) {
  const e = getEstado(groupId);
  if (e.waitingResult || e.history.length < 2) return;

  const sinal = findPattern(e.history);
  if (!sinal) return;

  e.waitingResult = true;
  e.lastSignalColor = sinal;
  e.martingaleCount = 0;

  const cor = sinal === "🔴" ? "🔴 *Banker*" : "🔵 *Player*";
  await sock.sendMessage(groupId, {
    text:
      "🎲 *SINAL BAC BO*\n\n" +
      "━━━━━━━━━━━━━━━━\n" +
      "🎯 *Jogar na cor:* " + cor + "\n" +
      "🛡️ Proteger o empate 🟡\n" +
      "━━━━━━━━━━━━━━━━\n" +
      "⚙️ _1 Gale disponível_\n" +
      "_🤖 Lutchi Zap Hack_",
  });
}

// ── COMANDO .bacbo ─────────────────────────────────────────────
async function bacbo(ctx) {
  const { sock, from, args, reply, isOwner, isGroup } = ctx;
  if (!isOwner) return reply("🔒 Apenas o *dono do bot* pode usar este comando!");
  if (!isGroup) return reply("❌ Apenas em grupos!");

  const option = args[0]?.toLowerCase();
  const e = getEstado(from);

  if (!option || option === "status") {
    return reply(
      "🎲 *BAC BO - SINAIS*\n\n" +
      "Status: " + (e.ativo ? "✅ Ativo" : "❌ Inativo") + "\n\n" +
      formatPlacar(e) + "\n\n" +
      "Comandos:\n" +
      "• *.bacbo on* — ativar sinais\n" +
      "• *.bacbo off* — desativar\n" +
      "• *.bacbo placar* — ver placar\n" +
      "• *.bacbo reset* — resetar placar"
    );
  }

  if (option === "on") {
    if (e.ativo) return reply("⚠️ Sinais já estão ativos!");
    e.ativo = true;
    e.history = [];
    e.waitingResult = false;
    e.martingaleCount = 0;
    if (e.interval) clearInterval(e.interval);
    e.interval = setInterval(() => tick(sock, from), 2000);
    return reply(
      "✅ *Sinais Bac Bo ativados!*\n\n" +
      "🎲 Analisando padrões em tempo real...\n" +
      "⚙️ Estratégia: Sinal + 1 Gale\n" +
      "📡 Fonte: Signals House API\n\n" +
      "_🤖 Lutchi Zap Hack_"
    );
  }

  if (option === "off") {
    e.ativo = false;
    if (e.interval) { clearInterval(e.interval); e.interval = null; }
    return reply("⛔ *Sinais Bac Bo desativados!*");
  }

  if (option === "placar") {
    return reply(formatPlacar(e));
  }

  if (option === "reset") {
    e.stats = { vitorias: 0, empates: 0, loss: 0 };
    return reply("🔄 *Placar resetado!*");
  }

  return reply("❌ Use: .bacbo on/off/placar/reset");
}

module.exports = { bacbo };
