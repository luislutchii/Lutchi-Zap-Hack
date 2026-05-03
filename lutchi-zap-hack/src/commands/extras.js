// ╔══════════════════════════════════════════════════╗
// ║      LUTCHI ZAP HACK - Comandos Extras           ║
// ╚══════════════════════════════════════════════════╝

const axios  = require("axios");
const p      = ".";

function normalizeId(jid = "") {
  return jid.replace(/:.*@/, "@").replace(/@.*/, "");
}

// ── AGENDAR MENSAGEM ──────────────────────────────────────────
const agendamentos = [];

async function agendarmsg(ctx) {
  const { sock, from, args, reply } = ctx;
  // Uso: .agendarmsg 10 Mensagem aqui (10 = minutos)
  const minutos = parseInt(args[0]);
  const texto   = args.slice(1).join(" ");
  if (!minutos || !texto) return reply(`❌ Use: ${p}agendarmsg <minutos> <mensagem>\nEx: ${p}agendarmsg 10 Reunião em 10 minutos!`);
  if (minutos < 1 || minutos > 1440) return reply("❌ Mínimo 1 minuto, máximo 1440 (24h).");
  const enviarEm = Date.now() + minutos * 60 * 1000;
  agendamentos.push({ from, texto, enviarEm });
  setTimeout(async () => {
    await sock.sendMessage(from, { text: `⏰ *MENSAGEM AGENDADA*\n\n${texto}` });
  }, minutos * 60 * 1000);
  return reply(`⏰ Mensagem agendada para *${minutos} minuto(s)*!\n\n📝 _${texto}_`);
}

// ── MARCAR TODOS ──────────────────────────────────────────────
async function marcar(ctx) {
  const { sock, from, args, groupMeta, reply } = ctx;
  if (!groupMeta) return reply("❌ Apenas em grupos!");
  const message      = args.join(" ") || "📣 Atenção!";
  const participants = groupMeta.participants.map((p) => p.id);
  const mentionText  = participants.map((p) => `@${p.split("@")[0]}`).join(" ");
  return sock.sendMessage(from, { text: `📢 *${message}*\n\n${mentionText}`, mentions: participants });
}

// ── MARCAR ADMINS ─────────────────────────────────────────────
async function marcaradmin(ctx) {
  const { sock, from, args, groupMeta, reply } = ctx;
  if (!groupMeta) return reply("❌ Apenas em grupos!");
  const admins      = groupMeta.participants.filter((p) => p.admin).map((p) => p.id);
  if (!admins.length) return reply("❌ Nenhum admin encontrado!");
  const message     = args.join(" ") || "📣 Atenção admins!";
  const mentionText = admins.map((p) => `@${p.split("@")[0]}`).join(" ");
  return sock.sendMessage(from, { text: `👑 *${message}*\n\n${mentionText}`, mentions: admins });
}

// ── HIDETAG — Marca todos sem aparecer ───────────────────────
async function hidetag(ctx) {
  const { sock, from, args, groupMeta, msg } = ctx;
  if (!groupMeta) return;
  const participants = groupMeta.participants.map((p) => p.id);
  const message      = args.join(" ") || "📣";
  return sock.sendMessage(from, { text: message, mentions: participants }, { quoted: msg });
}

// ── EXCLUIR INATIVOS ──────────────────────────────────────────
// (Apenas marca — WhatsApp não expõe actividade via API)
async function excluirinativo(ctx) {
  const { reply } = ctx;
  return reply(
    `⚠️ *Excluir Inativos*\n\n` +
    `O WhatsApp não permite verificar actividade via API.\n\n` +
    `💡 *Alternativa:* Use o comando *.todos* para marcar todos e peça que reajam — quem não reagir pode ser removido manualmente.`
  );
}

// ── REDEFINIR LINK ────────────────────────────────────────────
async function redefinirlink(ctx) {
  const { sock, from, reply, isBotAdmin } = ctx;
  if (!isBotAdmin) return reply("❌ Preciso ser admin!");
  try {
    await sock.groupRevokeInvite(from);
    const newCode = await sock.groupInviteCode(from);
    return reply(`✅ *Link redefinido!*\n\n🔗 Novo link:\nhttps://chat.whatsapp.com/${newCode}`);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── ANTI-STICKER ─────────────────────────────────────────────
const antiStickerGroups = new Set();

async function antisticker(ctx) {
  const { from, args, reply } = ctx;
  const mode = args[0]?.toLowerCase();
  if (!["on", "off"].includes(mode)) return reply(`❌ Use: ${p}antisticker on/off`);
  if (mode === "on") antiStickerGroups.add(from);
  else antiStickerGroups.delete(from);
  return reply(`🎭 Anti-sticker *${mode === "on" ? "ativado ✅" : "desativado ❌"}*`);
}

function isAntiSticker(groupId) { return antiStickerGroups.has(groupId); }

// ── ANTI-ÁUDIO ────────────────────────────────────────────────
const antiAudioGroups = new Set();

async function antiaudio(ctx) {
  const { from, args, reply } = ctx;
  const mode = args[0]?.toLowerCase();
  if (!["on", "off"].includes(mode)) return reply(`❌ Use: ${p}antiaudio on/off`);
  if (mode === "on") antiAudioGroups.add(from);
  else antiAudioGroups.delete(from);
  return reply(`🎵 Anti-áudio *${mode === "on" ? "ativado ✅" : "desativado ❌"}*`);
}

function isAntiAudio(groupId) { return antiAudioGroups.has(groupId); }

// ── ANTI-IMAGEM ───────────────────────────────────────────────
const antiImageGroups = new Set();

async function antimage(ctx) {
  const { from, args, reply } = ctx;
  const mode = args[0]?.toLowerCase();
  if (!["on", "off"].includes(mode)) return reply(`❌ Use: ${p}antimage on/off`);
  if (mode === "on") antiImageGroups.add(from);
  else antiImageGroups.delete(from);
  return reply(`🖼️ Anti-imagem *${mode === "on" ? "ativado ✅" : "desativado ❌"}*`);
}

function isAntiImage(groupId) { return antiImageGroups.has(groupId); }

// ── ANTI-VÍDEO ────────────────────────────────────────────────
const antiVideoGroups = new Set();

async function antivideo(ctx) {
  const { from, args, reply } = ctx;
  const mode = args[0]?.toLowerCase();
  if (!["on", "off"].includes(mode)) return reply(`❌ Use: ${p}antivideo on/off`);
  if (mode === "on") antiVideoGroups.add(from);
  else antiVideoGroups.delete(from);
  return reply(`🎬 Anti-vídeo *${mode === "on" ? "ativado ✅" : "desativado ❌"}*`);
}

function isAntiVideo(groupId) { return antiVideoGroups.has(groupId); }

// ── ANTI-DOCUMENTO ────────────────────────────────────────────
const antiDocGroups = new Set();

async function antidocumento(ctx) {
  const { from, args, reply } = ctx;
  const mode = args[0]?.toLowerCase();
  if (!["on", "off"].includes(mode)) return reply(`❌ Use: ${p}antidocumento on/off`);
  if (mode === "on") antiDocGroups.add(from);
  else antiDocGroups.delete(from);
  return reply(`📄 Anti-documento *${mode === "on" ? "ativado ✅" : "desativado ❌"}*`);
}

function isAntiDoc(groupId) { return antiDocGroups.has(groupId); }

// ── WHITELIST ─────────────────────────────────────────────────
const whitelistMap = new Map();

async function whitelist(ctx) {
  const { from, msg, args, reply } = ctx;
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const target    = mentioned[0] || (args[0] ? `${args[0].replace(/\D/g,"")}@s.whatsapp.net` : null);
  if (!target) return reply(`❌ Use: ${p}whitelist @membro`);
  if (!whitelistMap.has(from)) whitelistMap.set(from, new Set());
  whitelistMap.get(from).add(normalizeId(target));
  return reply(`✅ @${normalizeId(target)} adicionado à whitelist!\n_Este membro pode enviar links livremente._`, { mentions: [target] });
}

async function verwhitelist(ctx) {
  const { from, reply } = ctx;
  const list = whitelistMap.get(from);
  if (!list || list.size === 0) return reply("📋 Whitelist vazia.");
  return reply(`📋 *WHITELIST*\n\n${[...list].map((n, i) => `${i+1}. +${n}`).join("\n")}`);
}

async function delwhitelist(ctx) {
  const { from, msg, args, reply } = ctx;
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const target    = mentioned[0] || (args[0] ? `${args[0].replace(/\D/g,"")}@s.whatsapp.net` : null);
  if (!target) return reply(`❌ Use: ${p}delwhitelist @membro`);
  whitelistMap.get(from)?.delete(normalizeId(target));
  return reply(`✅ @${normalizeId(target)} removido da whitelist!`, { mentions: [target] });
}

function isWhitelisted(groupId, sender) {
  return whitelistMap.get(groupId)?.has(normalizeId(sender)) ?? false;
}

// ── BLACKLIST ─────────────────────────────────────────────────
const blacklistMap = new Map();

async function blacklist(ctx) {
  const { from, msg, args, reply, sock } = ctx;
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const target    = mentioned[0] || (args[0] ? `${args[0].replace(/\D/g,"")}@s.whatsapp.net` : null);
  if (!target) return reply(`❌ Use: ${p}blacklist @membro`);
  if (!blacklistMap.has(from)) blacklistMap.set(from, new Set());
  blacklistMap.get(from).add(normalizeId(target));
  await sock.groupParticipantsUpdate(from, [target], "remove").catch(() => {});
  return reply(`🚫 @${normalizeId(target)} adicionado à blacklist e removido do grupo!`, { mentions: [target] });
}

async function verblacklist(ctx) {
  const { from, reply } = ctx;
  const list = blacklistMap.get(from);
  if (!list || list.size === 0) return reply("📋 Blacklist vazia.");
  return reply(`🚫 *BLACKLIST*\n\n${[...list].map((n, i) => `${i+1}. +${n}`).join("\n")}`);
}

async function delblacklist(ctx) {
  const { from, msg, args, reply } = ctx;
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const target    = mentioned[0] || (args[0] ? `${args[0].replace(/\D/g,"")}@s.whatsapp.net` : null);
  if (!target) return reply(`❌ Use: ${p}delblacklist @membro`);
  blacklistMap.get(from)?.delete(normalizeId(target));
  return reply(`✅ @${normalizeId(target)} removido da blacklist!`, { mentions: [target] });
}

function isBlacklisted(groupId, sender) {
  return blacklistMap.get(groupId)?.has(normalizeId(sender)) ?? false;
}

// ── WALLPAPER ─────────────────────────────────────────────────
async function wallpaper(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const query = args.join(" ");
  if (!query) return reply(`❌ Use: ${p}wallpaper Natureza`);
  await reply(`🖼️ Buscando wallpaper de *${query}*...`);
  try {
    const res = await axios.get(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=your_unsplash_key`,
      { timeout: 10000 }
    );
    const url = res.data?.urls?.regular;
    if (!url) throw new Error("sem resultado");
    const buffer = await axios.get(url, { responseType: "arraybuffer" });
    await sock.sendMessage(from, { image: Buffer.from(buffer.data), caption: `🖼️ *Wallpaper: ${query}*\n\n_🤖 Lutchi Zap Hack_` }, { quoted: msg });
  } catch {
    return reply(`🖼️ *Wallpaper: ${query}*\n\nPesquise em:\nhttps://unsplash.com/search/photos/${encodeURIComponent(query)}`);
  }
}

// ── WAME — Link de conversa ───────────────────────────────────
async function wame(ctx) {
  const { args, reply } = ctx;
  let num = args[0]?.replace(/\D/g, "");
  if (!num) return reply(`❌ Use: ${p}wame 244923456789`);
  if (!num.startsWith("244") && num.length <= 9) num = "244" + num;
  return reply(`🔗 *Link de conversa:*\nhttps://wa.me/${num}`);
}

// ── SISTEMA — Info do bot ─────────────────────────────────────
async function sistema(ctx) {
  const { reply } = ctx;
  const uptime  = process.uptime();
  const h       = Math.floor(uptime / 3600);
  const m       = Math.floor((uptime % 3600) / 60);
  const s       = Math.floor(uptime % 60);
  const mem     = process.memoryUsage();
  return reply(
    `⚙️ *SISTEMA — Lutchi Zap Hack*\n\n` +
    `🕐 Uptime: *${h}h ${m}m ${s}s*\n` +
    `💾 RAM: *${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB*\n` +
    `🖥️ Node: *${process.version}*\n` +
    `📅 Data: *${new Date().toLocaleDateString("pt-AO")}*\n` +
    `🕑 Hora: *${new Date().toLocaleTimeString("pt-AO")}*\n\n` +
    `🤖 *Lutchi Zap Hack v1.0.0*\n` +
    `👑 Luís Lutchi | 📸 @luislutchii`
  );
}

// ── REPORTAR ─────────────────────────────────────────────────
async function reportar(ctx) {
  const { args, reply, config } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply(`❌ Use: ${p}reportar Descreva o problema`);
  return reply(
    `📢 *REPORTE ENVIADO!*\n\n` +
    `📝 _${texto}_\n\n` +
    `Entre em contacto com o dono:\n📸 Instagram: @luislutchii`
  );
}

module.exports = {
  agendarmsg, marcar, marcaradmin, hidetag, excluirinativo,
  redefinirlink,
  antisticker, isAntiSticker,
  antiaudio,   isAntiAudio,
  antimage,    isAntiImage,
  antivideo,   isAntiVideo,
  antidocumento, isAntiDoc,
  whitelist, verwhitelist, delwhitelist, isWhitelisted,
  blacklist, verblacklist, delblacklist, isBlacklisted,
  wallpaper, wame, sistema, reportar,
};
