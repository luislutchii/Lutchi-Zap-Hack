const axios   = require("axios");
const ffmpeg  = require("fluent-ffmpeg");
const fs      = require("fs");
const path    = require("path");
const os      = require("os");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const p = ".";

const STICKER_PACK   = "Lutchi Zap Hack";
const STICKER_AUTHOR = "@luislutchii";

async function downloadMedia(mediaMsg, type) {
  const stream = await downloadContentFromMessage(mediaMsg, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function convertToWebP(inputBuffer, isVideo = false) {
  return new Promise((resolve, reject) => {
    const ext    = isVideo ? "mp4" : "jpg";
    const tmpIn  = path.join(os.tmpdir(), "stk_in_" + Date.now() + "." + ext);
    const tmpOut = path.join(os.tmpdir(), "stk_out_" + Date.now() + ".webp");
    fs.writeFileSync(tmpIn, inputBuffer);
    ffmpeg(tmpIn)
      .outputOptions([
        "-vf", "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
        "-vcodec", "libwebp",
        "-loop", isVideo ? "0" : "1",
        "-preset", "icon",
        "-an", "-vsync", "0",
        "-t", "00:00:05",
      ])
      .toFormat("webp")
      .save(tmpOut)
      .on("end", () => {
        const buf = fs.readFileSync(tmpOut);
        try { fs.unlinkSync(tmpIn); } catch (_) {}
        try { fs.unlinkSync(tmpOut); } catch (_) {}
        resolve(buf);
      })
      .on("error", (err) => {
        try { fs.unlinkSync(tmpIn); } catch (_) {}
        try { fs.unlinkSync(tmpOut); } catch (_) {}
        reject(err);
      });
  });
}

async function sendSticker(sock, from, msg, buffer) {
  // Envia sem modificar o buffer — sticker funciona, EXIF é cosmético
  await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
}

async function sticker(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const m      = msg.message;
    const quoted = m?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg = m?.imageMessage || quoted?.imageMessage || null;
    const vidMsg = m?.videoMessage || quoted?.videoMessage || null;
    const media  = imgMsg || vidMsg;
    if (!media) return reply(
      "❌ *Nenhuma imagem detectada!*\n\n" +
      "📌 Como usar:\n" +
      "> Envie a imagem com *" + p + "sticker* na legenda\n" +
      "> OU responda uma imagem com *" + p + "sticker*"
    );
    await reply("⏳ Criando sticker...");
    const isVideo    = !!(vidMsg && !imgMsg);
    const buffer     = await downloadMedia(media, isVideo ? "video" : "image");
    if (!buffer || buffer.length < 100) return reply("❌ Nao foi possivel baixar a midia!");
    const webpBuffer = await convertToWebP(buffer, isVideo);
    await sendSticker(sock, from, msg, webpBuffer);
  } catch (e) {
    console.error("[STICKER]", e.message);
    return reply("❌ Erro ao criar sticker: " + e.message);
  }
}

async function toimg(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const m          = msg.message;
    const quoted     = m?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = m?.stickerMessage || quoted?.stickerMessage;
    if (!stickerMsg) return reply("❌ Responda um *sticker* com *" + p + "toimg*");
    await reply("⏳ Convertendo...");
    const buffer = await downloadMedia(stickerMsg, "sticker");
    if (!buffer || buffer.length < 100) return reply("❌ Nao foi possivel converter!");
    const pngBuffer = await new Promise((resolve, reject) => {
      const tmpIn  = path.join(os.tmpdir(), "toimg_in_" + Date.now() + ".webp");
      const tmpOut = path.join(os.tmpdir(), "toimg_out_" + Date.now() + ".png");
      fs.writeFileSync(tmpIn, buffer);
      ffmpeg(tmpIn).toFormat("png").save(tmpOut)
        .on("end", () => {
          const buf = fs.readFileSync(tmpOut);
          try { fs.unlinkSync(tmpIn); } catch (_) {}
          try { fs.unlinkSync(tmpOut); } catch (_) {}
          resolve(buf);
        })
        .on("error", (e) => {
          try { fs.unlinkSync(tmpIn); } catch (_) {}
          try { fs.unlinkSync(tmpOut); } catch (_) {}
          reject(e);
        });
    });
    await sock.sendMessage(from, { image: pngBuffer, caption: "🖼️ *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function togif(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const m          = msg.message;
    const quoted     = m?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = m?.stickerMessage || quoted?.stickerMessage;
    if (!stickerMsg) return reply("❌ Responda um *sticker animado* com *" + p + "togif*");
    await reply("⏳ Convertendo para GIF...");
    const buffer = await downloadMedia(stickerMsg, "sticker");
    if (!buffer || buffer.length < 100) return reply("❌ Nao foi possivel converter!");
    await sock.sendMessage(from, { video: buffer, mimetype: "video/mp4", gifPlayback: true }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function attp(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply("❌ Use: " + p + "attp Seu texto");
  await reply("⏳ Criando sticker animado...");
  try {
    let buffer = null;
    const apis = [
      "https://api.agatz.xyz/api/attp?text=" + encodeURIComponent(texto),
      "https://api.siputzx.my.id/api/sticker/attp?text=" + encodeURIComponent(texto),
    ];
    for (const url of apis) {
      try {
        const res = await axios.get(url, { timeout: 15000, responseType: "arraybuffer" });
        const buf = Buffer.from(res.data);
        if (buf.length > 500) { buffer = buf; break; }
        const json = JSON.parse(buf.toString());
        const link = json?.data || json?.url || json?.result;
        if (link) {
          const r = await axios.get(link, { responseType: "arraybuffer", timeout: 15000 });
          buffer  = Buffer.from(r.data);
          if (buffer.length > 500) break;
        }
      } catch (_) {}
    }
    if (!buffer || buffer.length < 100) return reply("❌ Nao foi possivel criar o sticker.");
    await sendSticker(sock, from, msg, buffer);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function ttp(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply("❌ Use: " + p + "ttp Seu texto");
  await reply("⏳ Criando sticker de texto...");
  try {
    let buffer = null;
    const apis = [
      "https://api.agatz.xyz/api/ttp?text=" + encodeURIComponent(texto),
      "https://api.siputzx.my.id/api/sticker/ttp?text=" + encodeURIComponent(texto),
    ];
    for (const url of apis) {
      try {
        const res = await axios.get(url, { timeout: 15000, responseType: "arraybuffer" });
        const buf = Buffer.from(res.data);
        if (buf.length > 500) { buffer = buf; break; }
        const json = JSON.parse(buf.toString());
        const link = json?.data || json?.url || json?.result;
        if (link) {
          const r = await axios.get(link, { responseType: "arraybuffer", timeout: 15000 });
          buffer  = Buffer.from(r.data);
          if (buffer.length > 500) break;
        }
      } catch (_) {}
    }
    if (!buffer || buffer.length < 100) return reply("❌ Nao foi possivel criar o sticker.");
    await sendSticker(sock, from, msg, buffer);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function brat(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply("❌ Use: " + p + "brat Seu texto");
  await reply("⏳ Criando sticker brat...");
  try {
    const res = await axios.get(
      "https://api.agatz.xyz/api/brat?text=" + encodeURIComponent(texto),
      { timeout: 15000, responseType: "arraybuffer" }
    );
    const buf = Buffer.from(res.data);
    let buffer;
    if (buf.length > 500) {
      buffer = buf;
    } else {
      const json = JSON.parse(buf.toString());
      const link = json?.data || json?.url;
      if (!link) return reply("❌ Erro ao gerar!");
      const r = await axios.get(link, { responseType: "arraybuffer", timeout: 15000 });
      buffer  = Buffer.from(r.data);
    }
    if (!buffer || buffer.length < 100) return reply("❌ Nao foi possivel criar o sticker.");
    await sendSticker(sock, from, msg, buffer);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function emojimix(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const emojis = args.join("").match(/\p{Emoji}/gu);
  if (!emojis || emojis.length < 2) return reply("❌ Use: " + p + "emojimix 😀🔥");
  await reply("⏳ Misturando emojis...");
  try {
    const res = await axios.get(
      "https://api.agatz.xyz/api/emojimix?emoji1=" + encodeURIComponent(emojis[0]) + "&emoji2=" + encodeURIComponent(emojis[1]),
      { timeout: 15000, responseType: "arraybuffer" }
    );
    const buffer = Buffer.from(res.data);
    if (!buffer || buffer.length < 100) return reply("❌ Esses emojis nao podem ser misturados!");
    await sendSticker(sock, from, msg, buffer);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function stickerinfo(ctx) {
  const { msg, reply } = ctx;
  try {
    const m          = msg.message;
    const quoted     = m?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = m?.stickerMessage || quoted?.stickerMessage;
    if (!stickerMsg) return reply("❌ Responda um sticker com *" + p + "stickerinfo*");

    const buffer = await downloadMedia(stickerMsg, "sticker");

    // Tenta extrair JSON de metadados do binário do WebP
    let pack  = "Desconhecido";
    let autor = "Desconhecido";
    try {
      const str   = buffer.toString("latin1");
      const start = str.indexOf('{"sticker-pack-name"');
      if (start !== -1) {
        const end  = str.indexOf("}", start) + 1;
        const meta = JSON.parse(str.slice(start, end));
        pack  = meta["sticker-pack-name"]     || pack;
        autor = meta["sticker-pack-publisher"] || autor;
      }
    } catch (_) {}

    const anim = stickerMsg?.isAnimated ? "Sim ✅" : "Nao ❌";
    return reply(
      "🎨 *INFO DO STICKER*\n\n" +
      "📦 *Pack:* " + pack + "\n" +
      "✏️ *Autor:* " + autor + "\n" +
      "🎞️ *Animado:* " + anim + "\n\n" +
      "_🤖 Lutchi Zap Hack_"
    );
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function gerarlink(ctx) {
  const { msg, reply } = ctx;
  const m      = msg.message;
  const quoted = m?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imgMsg = m?.imageMessage || quoted?.imageMessage;
  if (!imgMsg) return reply("❌ Envie ou responda uma imagem com *" + p + "gerarlink*");
  await reply("⏳ Gerando link...");
  try {
    const buffer = await downloadMedia(imgMsg, "image");
    if (!buffer || buffer.length < 100) return reply("❌ Nao foi possivel processar!");
    const formData = new URLSearchParams();
    formData.append("key", "ba98535942568dba040e79936b8075ab");
    formData.append("image", buffer.toString("base64"));
    const res = await axios.post("https://api.imgbb.com/1/upload", formData, {
      timeout: 20000,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const url = res.data?.data?.url;
    if (!url) return reply("❌ Erro ao gerar link!");
    return reply("🔗 *Link da Imagem:*\n" + url + "\n\n_🤖 Lutchi Zap Hack_");
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

module.exports = {
  sticker, toimg, togif,
  attp, ttp, brat,
  emojimix, stickerinfo, gerarlink,
};
