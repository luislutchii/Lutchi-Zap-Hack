const fs   = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../../data/database.json");

let db = {
  boasvindas: {},
  antimentadmin: {},
  groups:      {},
  warnings:    {},
  muted:       {},
  banwords:    {},
  antilink:    {},
  antiflood:   {},
  rules:       {},
  botStatus:   {},   // on/off por grupo
  modoBot:     {},   // "admins" ou "todos"
  boasVindas:  {},   // true/false por grupo
};

function loadDatabase() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      const parsed = JSON.parse(data);
      db = { ...db, ...parsed };
      console.log("✅ Banco de dados carregado!");
    } else {
      saveDatabase();
      console.log("✅ Banco de dados criado!");
    }
  } catch (e) {
    console.error("❌ Erro ao carregar banco de dados:", e.message);
    saveDatabase();
  }
}

function saveDatabase() {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("❌ Erro ao salvar:", e.message);
  }
}

// ── Warnings ──────────────────────────────────────────────────
function addWarning(groupId, userId) {
  const key = `${groupId}:${userId}`;
  if (!db.warnings[key]) db.warnings[key] = 0;
  db.warnings[key]++;
  saveDatabase();
  return db.warnings[key];
}
function getWarnings(groupId, userId) {
  return db.warnings[`${groupId}:${userId}`] || 0;
}
function resetWarnings(groupId, userId) {
  db.warnings[`${groupId}:${userId}`] = 0;
  saveDatabase();
}

// ── Mute ──────────────────────────────────────────────────────
function muteMember(groupId, userId, minutes) {
  db.muted[`${groupId}:${userId}`] = Date.now() + minutes * 60 * 1000;
  saveDatabase();
}
function unmuteMember(groupId, userId) {
  delete db.muted[`${groupId}:${userId}`];
  saveDatabase();
}
function isMuted(groupId, userId) {
  const key = `${groupId}:${userId}`;
  if (!db.muted[key]) return false;
  if (Date.now() > db.muted[key]) { delete db.muted[key]; saveDatabase(); return false; }
  return true;
}

// ── AntiLink ──────────────────────────────────────────────────
function setAntiLink(groupId, status) { db.antilink[groupId] = status; saveDatabase(); }
function getAntiLink(groupId)         { return db.antilink[groupId] || false; }

// ── AntiFlood ─────────────────────────────────────────────────
function setAntiFlood(groupId, status) { db.antiflood[groupId] = status; saveDatabase(); }
function getAntiFlood(groupId)         { return db.antiflood[groupId] || false; }

// ── Banwords ──────────────────────────────────────────────────
function addBanword(groupId, word) {
  if (!db.banwords[groupId]) db.banwords[groupId] = [];
  const w = word.toLowerCase();
  if (db.banwords[groupId].includes(w)) return false;
  db.banwords[groupId].push(w);
  saveDatabase();
  return true;
}
function removeBanword(groupId, word) {
  if (!db.banwords[groupId]) return false;
  const w     = word.toLowerCase();
  const antes = db.banwords[groupId].length;
  db.banwords[groupId] = db.banwords[groupId].filter((b) => b !== w);
  if (db.banwords[groupId].length < antes) { saveDatabase(); return true; }
  return false;
}
function getBanwords(groupId)  { return db.banwords[groupId] || []; }
function clearBanwords(groupId){ db.banwords[groupId] = []; saveDatabase(); }

// ── Rules ─────────────────────────────────────────────────────
function setRules(groupId, rules) { db.rules[groupId] = rules; saveDatabase(); }
function getRules(groupId)        { return db.rules[groupId] || null; }

// ── Status do Bot (ligar/desligar por grupo) ──────────────────
function setBotStatus(groupId, status) { db.botStatus[groupId] = status; saveDatabase(); }
function getBotStatus(groupId)         { return db.botStatus[groupId] !== false; } // padrão: ligado

// ── Modo do Bot (todos / admins) ──────────────────────────────
function setModoBot(groupId, modo) { db.modoBot[groupId] = modo; saveDatabase(); }
function getModoBot(groupId)       { return db.modoBot[groupId] || "admins"; } // padrão: só admins

// ── Boas-vindas ───────────────────────────────────────────────
function setBoasVindas(groupId, status) { db.boasVindas[groupId] = status; saveDatabase(); }
function getBoasVindas(groupId)         { return db.boasVindas[groupId] || false; } // padrão: desligado


function setAntiMentAdmin(groupId, status) {
  db.antimentadmin[groupId] = status;
  saveDatabase();
}

function getAntiMentAdmin(groupId) {
  return db.antimentadmin[groupId] || false;
}

function setBoasvindas(groupId, status) {
  db.boasvindas[groupId] = status;
  saveDatabase();
}

function getBoasvindas(groupId) {
  return db.boasvindas[groupId] !== undefined ? db.boasvindas[groupId] : true;
}

module.exports = {
  loadDatabase, saveDatabase,
  addWarning, getWarnings, resetWarnings,
  muteMember, unmuteMember, isMuted,
  setAntiLink, getAntiLink,
  setAntiFlood, getAntiFlood,
  addBanword, removeBanword, getBanwords, clearBanwords,
  setRules, getRules,
  setBotStatus, getBotStatus,
  setModoBot, getModoBot,
  setBoasVindas, getBoasVindas,
};

function saveOwnerLid(lid) {
  db.ownerLid = lid;
  saveDatabase();
}

function getOwnerLid() {
  return db.ownerLid || null;
}

module.exports = Object.assign(module.exports, { saveOwnerLid, getOwnerLid });

// ── Anti-mention Admin ────────────────────────────────────────
function setAntiMention(groupId, status) { db.antiMention = db.antiMention || {}; db.antiMention[groupId] = status; saveDatabase(); }
function getAntiMention(groupId)         { return db.antiMention?.[groupId] || false; }

module.exports = Object.assign(module.exports, { setAntiMention, getAntiMention });
