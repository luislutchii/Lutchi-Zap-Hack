const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const p = ".";

// ── Download de media via stream ──────────────────────────────
async function downloadMedia(mediaMsg, type) {
  const stream = await downloadContentFromMessage(mediaMsg, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

// ── Download via URL ──────────────────────────────────────────
async function downloadUrl(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 20000,
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  return Buffer.from(res.data);
}

// ── .sticker — Imagem/vídeo para sticker ─────────────────────
async function sticker(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const quoted  = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg  = msg.message?.imageMessage  || quoted?.imageMessage;
    const vidMsg  = msg.message?.videoMessage  || quoted?.videoMessage;
    const media   = imgMsg || vidMsg;

    if (!media) return reply(
      `❌ Envie ou responda uma *imagem/vídeo* com *${p}sticker*\n\n` +
      `_Imagens e vídeos curtos (até 10s) funcionam!_`
    );

    await reply("⏳ Criando sticker...");

    const type   = vidMsg ? "video" : "image";
    const buffer = await downloadMedia(media, type);

    if (!buffer || buffer.length === 0) return reply("❌ Não foi possível processar a mídia!");

    await sock.sendMessage(from, {
      sticker: buffer,
    }, { quoted: msg });

  } catch (e) { return reply("❌ Erro ao criar sticker: " + e.message); }
}

// ── .toimg — Sticker para imagem ─────────────────────────────
async function toimg(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const quoted     = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = msg.message?.stickerMessage || quoted?.stickerMessage;
    if (!stickerMsg) return reply(`❌ Responda um *sticker* com *${p}toimg*`);

    await reply("⏳ Convertendo...");
    const buffer = await downloadMedia(stickerMsg, "sticker");
    if (!buffer || buffer.length === 0) return reply("❌ Não foi possível converter!");

    await sock.sendMessage(from, {
      image: buffer,
      caption: "🖼️ *Lutchi Zap Hack*",
    }, { quoted: msg });

  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── .togif — Sticker animado para GIF ────────────────────────
async function togif(ctx) {
  const { sock, from, msg, reply } = ctx;
  try {
    const quoted     = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = msg.message?.stickerMessage || quoted?.stickerMessage;
    if (!stickerMsg) return reply(`❌ Responda um *sticker animado* com *${p}togif*`);

    await reply("⏳ Convertendo para GIF...");
    const buffer = await downloadMedia(stickerMsg, "sticker");
    if (!buffer || buffer.length === 0) return reply("❌ Não foi possível converter!");

    await sock.sendMessage(from, {
      video: buffer,
      mimetype: "video/mp4",
      gifPlayback: true,
      caption: "🎞️ *Lutchi Zap Hack*",
    }, { quoted: msg });

  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── .attp — Texto animado para sticker ───────────────────────
async function attp(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply(`❌ Use: ${p}attp Seu texto`);
  await reply("⏳ Criando sticker animado...");
  try {
    const apis = [
      `https://api.agatz.xyz/api/attp?text=${encodeURIComponent(texto)}`,
      `https://api.siputzx.my.id/api/sticker/attp?text=${encodeURIComponent(texto)}`,
    ];
    let buffer = null;
    for (const url of apis) {
      try {
        const res = await axios.get(url, { timeout: 15000, responseType: "arraybuffer" });
        const ct  = res.headers?.["content-type"] ?? "";
        if (ct.includes("image") || ct.includes("webp") || res.data?.byteLength > 500) {
          buffer = Buffer.from(res.data); break;
        }
        const json    = JSON.parse(Buffer.from(res.data).toString());
        const urlRes  = json?.data || json?.url || json?.result;
        if (urlRes) { buffer = await downloadUrl(urlRes); break; }
      } catch (_) {}
    }
    if (!buffer || buffer.length === 0) return reply("❌ Não foi possível criar o sticker.");
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── .ttp — Texto simples para sticker ────────────────────────
async function ttp(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply(`❌ Use: ${p}ttp Seu texto`);
  await reply("⏳ Criando sticker de texto...");
  try {
    const apis = [
      `https://api.agatz.xyz/api/ttp?text=${encodeURIComponent(texto)}`,
      `https://api.siputzx.my.id/api/sticker/ttp?text=${encodeURIComponent(texto)}`,
    ];
    let buffer = null;
    for (const url of apis) {
      try {
        const res = await axios.get(url, { timeout: 15000, responseType: "arraybuffer" });
        const ct  = res.headers?.["content-type"] ?? "";
        if (ct.includes("image") || ct.includes("webp") || res.data?.byteLength > 500) {
          buffer = Buffer.from(res.data); break;
        }
        const json   = JSON.parse(Buffer.from(res.data).toString());
        const urlRes = json?.data || json?.url || json?.result;
        if (urlRes) { buffer = await downloadUrl(urlRes); break; }
      } catch (_) {}
    }
    if (!buffer || buffer.length === 0) return reply("❌ Não foi possível criar o sticker.");
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── .brat — Estilo Brat ───────────────────────────────────────
async function brat(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply(`❌ Use: ${p}brat Seu texto`);
  await reply("⏳ Criando sticker brat...");
  try {
    const res = await axios.get(
      `https://api.agatz.xyz/api/brat?text=${encodeURIComponent(texto)}`,
      { timeout: 15000, responseType: "arraybuffer" }
    );
    const ct = res.headers?.["content-type"] ?? "";
    let buffer;
    if (ct.includes("image") || ct.includes("webp")) {
      buffer = Buffer.from(res.data);
    } else {
      const json = JSON.parse(Buffer.from(res.data).toString());
      const url  = json?.data || json?.url;
      if (!url) return reply("❌ Erro ao gerar sticker brat!");
      buffer = await downloadUrl(url);
    }
    if (!buffer || buffer.length === 0) return reply("❌ Não foi possível criar o sticker.");
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── .emojimix — Mistura de emojis ────────────────────────────
async function emojimix(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const emojis = args.join("").match(/\p{Emoji}/gu);
  if (!emojis || emojis.length < 2) return reply(`❌ Use: ${p}emojimix 😀🔥`);
  await reply("⏳ Misturando emojis...");
  try {
    const e1  = encodeURIComponent(emojis[0]);
    const e2  = encodeURIComponent(emojis[1]);
    const res = await axios.get(
      `https://api.agatz.xyz/api/emojimix?emoji1=${e1}&emoji2=${e2}`,
      { timeout: 15000, responseType: "arraybuffer" }
    );
    const buffer = Buffer.from(res.data);
    if (!buffer || buffer.length < 100) return reply("❌ Esses emojis não podem ser misturados!");
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── .stickerinfo — Info do sticker ───────────────────────────
async function stickerinfo(ctx) {
  const { msg, reply } = ctx;
  const quoted     = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const stickerMsg = msg.message?.stickerMessage || quoted?.stickerMessage;
  if (!stickerMsg) return reply(`❌ Responda um sticker com *${p}stickerinfo*`);
  const pack     = stickerMsg?.name      || "Desconhecido";
  const author   = stickerMsg?.publisher || "Desconhecido";
  const animated = stickerMsg?.isAnimated ? "Sim ✅" : "Não ❌";
  return reply(
    `🎨 *INFO DO STICKER*\n\n` +
    `📦 *Pack:* ${pack}\n` +
    `✏️ *Autor:* ${author}\n` +
    `🎞️ *Animado:* ${animated}\n\n` +
    `_🤖 Lutchi Zap Hack_`
  );
}

// ── .gerarlink — Imagem para link (ImgBB) ────────────────────
async function gerarlink(ctx) {
  const { sock, from, msg, reply } = ctx;
  const quoted  = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imgMsg  = msg.message?.imageMessage || quoted?.imageMessage;
  if (!imgMsg) return reply(`❌ Envie ou responda uma imagem com *${p}gerarlink*`);
  await reply("⏳ Gerando link...");
  try {
    const buffer = await downloadMedia(imgMsg, "image");
    if (!buffer || buffer.length === 0) return reply("❌ Não foi possível processar a imagem!");

    const b64 = buffer.toString("base64");

    // Usa ImgBB com a API key fornecida
    const formData = new URLSearchParams();
    formData.append("key", "ba98535942568dba040e79936b8075ab");
    formData.append("image", b64);

    const res = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      { timeout: 20000, headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const url = res.data?.data?.url;
    if (!url) return reply("❌ Erro ao gerar link!");

    return reply(
      `🔗 *Link da Imagem:*\n${url}\n\n` +
      `🗑️ _Expira em 10 minutos_\n\n` +
      `_🤖 Lutchi Zap Hack_`
    );
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

module.exports = {
  sticker, toimg, togif,
  attp, ttp, brat,
  emojimix, stickerinfo, gerarlink,
};
