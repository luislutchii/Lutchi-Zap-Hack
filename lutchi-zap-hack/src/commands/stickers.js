const axios  = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const p = ".";

async function downloadMedia(mediaMsg, type) {
  const stream = await downloadContentFromMessage(mediaMsg, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function downloadUrl(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer", timeout: 20000,
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  return Buffer.from(res.data);
}

async function sticker(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const m      = msg.message;
    const quoted = m?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg = m?.imageMessage  || quoted?.imageMessage  || null;
    const vidMsg = m?.videoMessage  || quoted?.videoMessage  || null;
    const media  = imgMsg || vidMsg;

    if (!media) return reply(
      `❌ *Nenhuma imagem detectada!*\n\n` +
      `📌 Como usar:\n` +
      `› Envie a imagem com *${p}sticker* na legenda\n` +
      `› OU responda uma imagem com *${p}sticker*`
    );

    await reply("⏳ Criando sticker...");

    const type   = vidMsg && !imgMsg ? "video" : "image";
    const buffer = await downloadMedia(media, type);

    if (!buffer || buffer.length < 100)
      return reply("❌ Não foi possível baixar a mídia!");

    await sock.sendMessage(from, {
      sticker: buffer,
      mimetype: type === "video" ? "video/webp" : "image/webp",
    }, { quoted: msg });

  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function toimg(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const m          = msg.message;
    const quoted     = m?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = m?.stickerMessage || quoted?.stickerMessage;
    if (!stickerMsg) return reply(`❌ Responda um *sticker* com *${p}toimg*`);
    await reply("⏳ Convertendo...");
    const buffer = await downloadMedia(stickerMsg, "sticker");
    if (!buffer || buffer.length < 100) return reply("❌ Não foi possível converter!");
    await sock.sendMessage(from, { image: buffer, caption: "🖼️ *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function togif(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const m          = msg.message;
    const quoted     = m?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = m?.stickerMessage || quoted?.stickerMessage;
    if (!stickerMsg) return reply(`❌ Responda um *sticker animado* com *${p}togif*`);
    await reply("⏳ Convertendo para GIF...");
    const buffer = await downloadMedia(stickerMsg, "sticker");
    if (!buffer || buffer.length < 100) return reply("❌ Não foi possível converter!");
    await sock.sendMessage(from, { video: buffer, mimetype: "video/mp4", gifPlayback: true }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function attp(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply(`❌ Use: ${p}attp Seu texto`);
  await reply("⏳ Criando sticker animado...");
  try {
    let buffer = null;
    for (const url of [
      `https://api.agatz.xyz/api/attp?text=${encodeURIComponent(texto)}`,
      `https://api.siputzx.my.id/api/sticker/attp?text=${encodeURIComponent(texto)}`,
    ]) {
      try {
        const res = await axios.get(url, { timeout: 15000, responseType: "arraybuffer" });
        const buf = Buffer.from(res.data);
        if (buf.length > 500) { buffer = buf; break; }
        const json = JSON.parse(buf.toString());
        const link = json?.data || json?.url || json?.result;
        if (link) { const r = await axios.get(link, { responseType: "arraybuffer", timeout: 15000 }); buffer = Buffer.from(r.data); if (buffer.length > 500) break; }
      } catch (_) {}
    }
    if (!buffer || buffer.length < 100) return reply("❌ Não foi possível criar o sticker.");
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function ttp(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply(`❌ Use: ${p}ttp Seu texto`);
  await reply("⏳ Criando sticker...");
  try {
    let buffer = null;
    for (const url of [
      `https://api.agatz.xyz/api/ttp?text=${encodeURIComponent(texto)}`,
      `https://api.siputzx.my.id/api/sticker/ttp?text=${encodeURIComponent(texto)}`,
    ]) {
      try {
        const res = await axios.get(url, { timeout: 15000, responseType: "arraybuffer" });
        const buf = Buffer.from(res.data);
        if (buf.length > 500) { buffer = buf; break; }
        const json = JSON.parse(buf.toString());
        const link = json?.data || json?.url || json?.result;
        if (link) { const r = await axios.get(link, { responseType: "arraybuffer", timeout: 15000 }); buffer = Buffer.from(r.data); if (buffer.length > 500) break; }
      } catch (_) {}
    }
    if (!buffer || buffer.length < 100) return reply("❌ Não foi possível criar o sticker.");
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function brat(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply(`❌ Use: ${p}brat Seu texto`);
  await reply("⏳ Criando sticker brat...");
  try {
    const res = await axios.get(`https://api.agatz.xyz/api/brat?text=${encodeURIComponent(texto)}`, { timeout: 15000, responseType: "arraybuffer" });
    const buf = Buffer.from(res.data);
    let buffer;
    if (buf.length > 500) { buffer = buf; }
    else {
      const json = JSON.parse(buf.toString());
      const link = json?.data || json?.url;
      if (!link) return reply("❌ Erro ao gerar!");
      const r = await axios.get(link, { responseType: "arraybuffer", timeout: 15000 });
      buffer = Buffer.from(r.data);
    }
    if (!buffer || buffer.length < 100) return reply("❌ Não foi possível criar.");
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function emojimix(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const emojis = args.join("").match(/\p{Emoji}/gu);
  if (!emojis || emojis.length < 2) return reply(`❌ Use: ${p}emojimix 😀🔥`);
  await reply("⏳ Misturando emojis...");
  try {
    const res = await axios.get(
      `https://api.agatz.xyz/api/emojimix?emoji1=${encodeURIComponent(emojis[0])}&emoji2=${encodeURIComponent(emojis[1])}`,
      { timeout: 15000, responseType: "arraybuffer" }
    );
    const buffer = Buffer.from(res.data);
    if (!buffer || buffer.length < 100) return reply("❌ Esses emojis não podem ser misturados!");
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function stickerinfo(ctx) {
  const { msg, reply } = ctx;
  const m          = msg.message;
  const quoted     = m?.extendedTextMessage?.contextInfo?.quotedMessage;
  const stickerMsg = m?.stickerMessage || quoted?.stickerMessage;
  if (!stickerMsg) return reply(`❌ Responda um sticker com *${p}stickerinfo*`);
  return reply(
    `🎨 *INFO DO STICKER*\n\n` +
    `📦 *Pack:* ${stickerMsg?.name      || "Desconhecido"}\n` +
    `✏️ *Autor:* ${stickerMsg?.publisher || "Desconhecido"}\n` +
    `🎞️ *Animado:* ${stickerMsg?.isAnimated ? "Sim ✅" : "Não ❌"}\n\n` +
    `_🤖 Lutchi Zap Hack_`
  );
}

async function gerarlink(ctx) {
  const { msg, reply } = ctx;
  const m      = msg.message;
  const quoted = m?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imgMsg = m?.imageMessage || quoted?.imageMessage;
  if (!imgMsg) return reply(`❌ Envie ou responda uma imagem com *${p}gerarlink*`);
  await reply("⏳ Gerando link...");
  try {
    const buffer = await downloadMedia(imgMsg, "image");
    if (!buffer || buffer.length < 100) return reply("❌ Não foi possível processar!");
    const formData = new URLSearchParams();
    formData.append("key", "ba98535942568dba040e79936b8075ab");
    formData.append("image", buffer.toString("base64"));
    const res = await axios.post("https://api.imgbb.com/1/upload", formData, {
      timeout: 20000, headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const url = res.data?.data?.url;
    if (!url) return reply("❌ Erro ao gerar link!");
    return reply(`🔗 *Link da Imagem:*\n${url}\n\n_🤖 Lutchi Zap Hack_`);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

module.exports = { sticker, toimg, togif, attp, ttp, brat, emojimix, stickerinfo, gerarlink };
