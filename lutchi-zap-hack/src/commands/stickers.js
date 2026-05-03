const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const axios = require("axios");
const p = ".";

async function dlFromMsg(mediaMsg, type) {
  const stream = await downloadContentFromMessage(mediaMsg, type);
  let buf = Buffer.from([]);
  for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
  return buf;
}

async function dlBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 20000, headers: { "User-Agent": "Mozilla/5.0" } });
  return Buffer.from(res.data);
}

async function sticker(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const m = msg.message;
    const q = m?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mediaMsg = m?.imageMessage || m?.videoMessage || q?.imageMessage || q?.videoMessage;
    if (!mediaMsg) return reply("❌ Envie ou responda uma imagem/vídeo com *.sticker*");
    const isVideo = !!(mediaMsg.seconds) || (mediaMsg?.mimetype || "").includes("video");
    const buffer = await dlFromMsg(mediaMsg, isVideo ? "video" : "image");
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function toimg(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const m = msg.message;
    const q = m?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = m?.stickerMessage || q?.stickerMessage;
    if (!stickerMsg) return reply("❌ Responda um sticker com *.toimg*");
    const buffer = await dlFromMsg(stickerMsg, "sticker");
    await sock.sendMessage(from, { image: buffer, caption: "🖼️ *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function togif(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const m = msg.message;
    const q = m?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = m?.stickerMessage || q?.stickerMessage;
    if (!stickerMsg) return reply("❌ Responda um sticker animado com *.togif*");
    const buffer = await dlFromMsg(stickerMsg, "sticker");
    await sock.sendMessage(from, { video: buffer, mimetype: "video/mp4", gifPlayback: true }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function attp(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply("❌ Use: .attp Seu texto");
  await reply("⏳ Criando sticker animado...");
  const apis = [
    async () => { const r = await axios.get("https://api.agatz.xyz/api/attp?text=" + encodeURIComponent(texto), { timeout: 15000 }); const url = r.data?.data || r.data?.url; return url?.startsWith("http") ? await dlBuffer(url) : null; },
    async () => { const r = await axios.get("https://api.siputzx.my.id/api/sticker/attp?text=" + encodeURIComponent(texto), { timeout: 15000, responseType: "arraybuffer" }); return r.data?.byteLength > 500 ? Buffer.from(r.data) : null; },
  ];
  for (const fn of apis) {
    try { const buf = await fn(); if (buf?.length > 500) { await sock.sendMessage(from, { sticker: buf }, { quoted: msg }); return; } } catch (_) {}
  }
  return reply("❌ Não foi possível criar. Tente mais tarde!");
}

async function ttp(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply("❌ Use: .ttp Seu texto");
  await reply("⏳ Criando sticker de texto...");
  const apis = [
    async () => { const r = await axios.get("https://api.agatz.xyz/api/ttp?text=" + encodeURIComponent(texto), { timeout: 15000 }); const url = r.data?.data || r.data?.url; return url?.startsWith("http") ? await dlBuffer(url) : null; },
    async () => { const r = await axios.get("https://api.siputzx.my.id/api/sticker/ttp?text=" + encodeURIComponent(texto), { timeout: 15000, responseType: "arraybuffer" }); return r.data?.byteLength > 500 ? Buffer.from(r.data) : null; },
  ];
  for (const fn of apis) {
    try { const buf = await fn(); if (buf?.length > 500) { await sock.sendMessage(from, { sticker: buf }, { quoted: msg }); return; } } catch (_) {}
  }
  return reply("❌ Não foi possível criar. Tente mais tarde!");
}

async function brat(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply("❌ Use: .brat Seu texto");
  await reply("⏳ Criando sticker brat...");
  const apis = [
    async () => { const r = await axios.get("https://api.agatz.xyz/api/brat?text=" + encodeURIComponent(texto), { timeout: 15000 }); const url = r.data?.data || r.data?.url; return url?.startsWith("http") ? await dlBuffer(url) : null; },
  ];
  for (const fn of apis) {
    try { const buf = await fn(); if (buf?.length > 500) { await sock.sendMessage(from, { sticker: buf }, { quoted: msg }); return; } } catch (_) {}
  }
  return reply("❌ Não foi possível criar. Tente mais tarde!");
}

async function emojimix(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const input = args.join("");
  const emojis = [...input].filter(c => /\p{Emoji_Presentation}/u.test(c));
  if (emojis.length < 2) return reply("❌ Use: .emojimix 😀🔥");
  await reply("⏳ Misturando emojis...");
  try {
    const e1 = emojis[0].codePointAt(0).toString(16).padStart(4, "0");
    const e2 = emojis[1].codePointAt(0).toString(16).padStart(4, "0");
    const url = "https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u" + e1 + "/u" + e1 + "_u" + e2 + ".png";
    const buffer = await dlBuffer(url);
    if (buffer.length < 500) return reply("❌ Esses emojis não podem ser misturados!");
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Esses emojis não podem ser misturados!"); }
}

async function stickerinfo(ctx) {
  const { msg, reply } = ctx;
  const m = msg.message;
  const q = m?.extendedTextMessage?.contextInfo?.quotedMessage;
  const s = m?.stickerMessage || q?.stickerMessage;
  if (!s) return reply("❌ Responda um sticker com *.stickerinfo*");
  return reply("🎨 *INFO DO STICKER*\n\n📦 Pack: " + (s?.name || "Desconhecido") + "\n✏️ Autor: " + (s?.publisher || "Desconhecido") + "\n🎞️ Animado: " + (s?.isAnimated ? "Sim ✅" : "Não ❌"));
}

async function gerarlink(ctx) {
  const { sock, from, msg, reply } = ctx;
  const m = msg.message;
  const q = m?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imageMsg = m?.imageMessage || q?.imageMessage;
  if (!imageMsg) return reply("❌ Envie ou responda uma imagem com *.gerarlink*");
  await reply("⏳ Gerando link...");
  try {
    const buffer = await dlFromMsg(imageMsg, "image");
    const b64 = buffer.toString("base64");
    const form = new URLSearchParams({ key: "2e47462e8d27b8cb6cdc3c0d0ec4dc42", image: b64 });
    const res = await axios.post("https://api.imgbb.com/1/upload", form, { timeout: 20000 });
    const url = res.data?.data?.url;
    if (!url) return reply("❌ Erro ao gerar link!");
    return reply("🔗 *Link da imagem:*\n" + url);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

module.exports = { sticker, toimg, togif, attp, ttp, brat, emojimix, stickerinfo, gerarlink };
