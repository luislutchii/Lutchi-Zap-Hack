// ╔══════════════════════════════════════════════════╗
// ║           LUTCHI ZAP HACK - Database             ║
// ╚══════════════════════════════════════════════════╝

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../../data/database.json");

let db = {
  groups: {},
  warnings: {},
  muted: {},
  banwords: {},
  antilink: {},
  antiflood: {},
  rules: {},
};

function loadDatabase() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      db = JSON.parse(data);
      console.log("✅ Banco de dados carregado!");
    } else {
      saveDatabase();
      console.log("✅ Banco de dados criado!");
    }
  } catch (e) {
    console.error("❌ Erro ao carregar banco de dados:", e);
    saveDatabase();
  }
}

function saveDatabase() {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("❌ Erro ao salvar banco de dados:", e);
  }
}

function getGroup(groupId) {
  if (!db.groups[groupId]) {
    db.groups[groupId] = { polls: [] };
    saveDatabase();
  }
  return db.groups[groupId];
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
  const key = `${groupId}:${userId}`;
  return db.warnings[key] || 0;
}

function resetWarnings(groupId, userId) {
  const key = `${groupId}:${userId}`;
  db.warnings[key] = 0;
  saveDatabase();
}

// ── Mute ──────────────────────────────────────────────────────
function muteMember(groupId, userId, minutes) {
  const key = `${groupId}:${userId}`;
  const until = Date.now() + minutes * 60 * 1000;
  db.muted[key] = until;
  saveDatabase();
}

function unmuteMember(groupId, userId) {
  const key = `${groupId}:${userId}`;
  delete db.muted[key];
  saveDatabase();
}

function isMuted(groupId, userId) {
  const key = `${groupId}:${userId}`;
  if (!db.muted[key]) return false;
  if (Date.now() > db.muted[key]) {
    delete db.muted[key];
    saveDatabase();
    return false;
  }
  return true;
}

// ── AntiLink ──────────────────────────────────────────────────
function setAntiLink(groupId, status) {
  db.antilink[groupId] = status;
  saveDatabase();
}

function getAntiLink(groupId) {
  return db.antilink[groupId] || false;
}

// ── AntiFlood ─────────────────────────────────────────────────
function setAntiFlood(groupId, status) {
  db.antiflood[groupId] = status;
  saveDatabase();
}

function getAntiFlood(groupId) {
  return db.antiflood[groupId] || false;
}

// ── Banwords ──────────────────────────────────────────────────
function addBanword(groupId, word) {
  if (!db.banwords[groupId]) db.banwords[groupId] = [];
  const w = word.toLowerCase();
  if (!db.banwords[groupId].includes(w)) {
    db.banwords[groupId].push(w);
    saveDatabase();
    return true;
  }
  return false;
}

function getBanwords(groupId) {
  return db.banwords[groupId] || [];
}

// ── Rules ─────────────────────────────────────────────────────
function setRules(groupId, rules) {
  db.rules[groupId] = rules;
  saveDatabase();
}

function getRules(groupId) {
  return db.rules[groupId] || null;
}

module.exports = {
  loadDatabase,
  saveDatabase,
  getGroup,
  addWarning,
  getWarnings,
  resetWarnings,
  muteMember,
  unmuteMember,
  isMuted,
  setAntiLink,
  getAntiLink,
  setAntiFlood,
  getAntiFlood,
  addBanword,
  getBanwords,
  setRules,
  getRules,
};
