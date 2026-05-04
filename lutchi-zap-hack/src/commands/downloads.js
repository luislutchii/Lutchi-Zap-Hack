const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const p = ".";

async function dlBuffer(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer", timeout: 40000,
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  return Buffer.from(res.data);
}

async function dlFromMsg(mediaMsg, type) {
  const stream = await downloadContentFromMessage(mediaMsg, type);
  let buf = Buffer.from([]);
  for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
  return buf;
}

async function tryApis(apis) {
  for (const api of apis) {
    try {
      const res = await axios.get(api.url, {
        timeout: api.timeout || 25000,
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      const url = api.extract(res.data);
      if (url && typeof url === "string" && url.startsWith("http")) return url;
    } catch (_) {}
  }
  return null;
}

// ── PLAY — YouTube MP3 ────────────────────────────────────────
async function play(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  if (!args.length) return reply(`❌ Use: ${p}play Nome da música`);
  const query = args.join(" ");
  await reply(`🔍 Procurando *${query}*...`);
  try {
    // Pesquisa
    const searchRes = await axios.get(
      `https://api.agatz.xyz/api/ytsearch?message=${encodeURIComponent(query)}`,
      { timeout: 15000 }
    );
    const video = searchRes.data?.data?.[0];
    if (!video) return reply("❌ Música não encontrada!");
    await reply(`🎵 *${video.title}*\n⏱️ ${video.duration || "N/A"}\n⬇️ Baixando...`);

    // Download — tenta múltiplas APIs
    const audioUrl = await tryApis([
      {
        url: `https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(video.url)}`,
        extract: (d) => d?.data?.url,
      },
      {
        url: `https://shrutibots.site/download?url=${encodeURIComponent(video.url)}&type=audio`,
        extract: (d) => d?.url || d?.link,
      },
      {
        url: `https://musicapi.x007.workers.dev/search?q=${encodeURIComponent(query)}&searchEngine=gaama`,
        extract: (d) => d?.data?.[0]?.url,
      },
    ]);

    if (!audioUrl) return reply("❌ Não foi possível baixar! Tente outro nome.");
    const buffer = await dlBuffer(audioUrl);
    await sock.sendMessage(from, {
      audio: buffer, mimetype: "audio/mpeg",
      fileName: `${video.title}.mp3`,
    }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── PLAYVID — YouTube MP4 ─────────────────────────────────────
async function playvid(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  if (!args.length) return reply(`❌ Use: ${p}playvid Nome do vídeo`);
  const query = args.join(" ");
  await reply(`🔍 Procurando *${query}*...`);
  try {
    const searchRes = await axios.get(
      `https://api.agatz.xyz/api/ytsearch?message=${encodeURIComponent(query)}`,
      { timeout: 15000 }
    );
    const video = searchRes.data?.data?.[0];
    if (!video) return reply("❌ Vídeo não encontrado!");
    await reply(`🎬 *${video.title}*\n⏱️ ${video.duration || "N/A"}\n⬇️ Baixando...`);

    const videoUrl = await tryApis([
      {
        url: `https://api.agatz.xyz/api/ytmp4?url=${encodeURIComponent(video.url)}`,
        extract: (d) => d?.data?.url,
      },
    ]);

    if (!videoUrl) return reply("❌ Não foi possível baixar!");
    const buffer = await dlBuffer(videoUrl);
    await sock.sendMessage(from, {
      video: buffer, mimetype: "video/mp4",
      fileName: `${video.title}.mp4`,
    }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── YOUTUBE — Pesquisa ────────────────────────────────────────
async function youtube(ctx) {
  const { args, reply } = ctx;
  const query = args.join(" ");
  if (!query) return reply(`❌ Use: ${p}youtube Busca`);
  await reply(`🔍 Buscando *${query}*...`);
  try {
    const res = await axios.get(
      `https://api.agatz.xyz/api/ytsearch?message=${encodeURIComponent(query)}`,
      { timeout: 15000 }
    );
    const results = res.data?.data?.slice(0, 5);
    if (!results?.length) return reply("❌ Nenhum resultado!");
    const lista = results.map((v, i) =>
      `${i + 1}. *${v.title}*\n⏱️ ${v.duration || "N/A"}\n🔗 ${v.url}`
    ).join("\n\n");
    return reply(`🎬 *YOUTUBE: ${query}*\n\n${lista}\n\n💡 Use *${p}play* ou *${p}playvid*!`);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── TIKTOK — Sem marca d'água ─────────────────────────────────
async function tiktok(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}tiktok <link>`);
  await reply("⏳ Baixando TikTok sem marca d'água...");
  try {
    const videoUrl = await tryApis([
      { url: `https://tikwm.com/api/?url=${encodeURIComponent(url)}`, extract: (d) => d?.data?.play },
      { url: `https://api.agatz.xyz/api/tiktok?url=${encodeURIComponent(url)}`, extract: (d) => d?.data?.video || d?.data?.play },
    ]);
    if (!videoUrl) return reply("❌ Não foi possível baixar!");
    const buffer = await dlBuffer(videoUrl);
    await sock.sendMessage(from, { video: buffer, mimetype: "video/mp4", caption: "🎵 *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── TIKTOK MP3 ────────────────────────────────────────────────
async function tiktokmp3(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}tiktokmp3 <link>`);
  await reply("⏳ Baixando áudio do TikTok...");
  try {
    const res = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`, { timeout: 20000 });
    const audioUrl = res.data?.data?.music;
    if (!audioUrl) return reply("❌ Não foi possível baixar o áudio!");
    const buffer = await dlBuffer(audioUrl);
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── INSTAGRAM ─────────────────────────────────────────────────
async function instagram(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}instagram <link>`);
  await reply("⏳ Baixando do Instagram...");
  try {
    const mediaUrl = await tryApis([
      { url: `https://api.agatz.xyz/api/instagram?url=${encodeURIComponent(url)}`, extract: (d) => d?.data?.[0]?.url || d?.data?.url },
    ]);
    if (!mediaUrl) return reply("❌ Não foi possível baixar! O link é público?");
    const buffer  = await dlBuffer(mediaUrl);
    const isVideo = mediaUrl.includes(".mp4");
    await sock.sendMessage(from, { [isVideo ? "video" : "image"]: buffer, caption: "📸 *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── FACEBOOK ──────────────────────────────────────────────────
async function facebook(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}facebook <link>`);
  await reply("⏳ Baixando do Facebook...");
  try {
    const videoUrl = await tryApis([
      { url: `https://api.agatz.xyz/api/facebook?url=${encodeURIComponent(url)}`, extract: (d) => d?.data?.hd || d?.data?.sd || d?.data?.url },
    ]);
    if (!videoUrl) return reply("❌ Não foi possível baixar!");
    const buffer = await dlBuffer(videoUrl);
    await sock.sendMessage(from, { video: buffer, mimetype: "video/mp4", caption: "📘 *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── TWITTER ───────────────────────────────────────────────────
async function twitter(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}twitter <link>`);
  await reply("⏳ Baixando do Twitter/X...");
  try {
    const videoUrl = await tryApis([
      { url: `https://api.agatz.xyz/api/twitter?url=${encodeURIComponent(url)}`, extract: (d) => d?.data?.url || d?.data?.video },
    ]);
    if (!videoUrl) return reply("❌ Não foi possível baixar!");
    const buffer = await dlBuffer(videoUrl);
    await sock.sendMessage(from, { video: buffer, mimetype: "video/mp4", caption: "🐦 *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── KWAI ──────────────────────────────────────────────────────
async function kwai(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}kwai <link>`);
  await reply("⏳ Baixando do Kwai...");
  try {
    const videoUrl = await tryApis([
      { url: `https://api.agatz.xyz/api/kwai?url=${encodeURIComponent(url)}`, extract: (d) => d?.data?.video },
    ]);
    if (!videoUrl) return reply("❌ Não foi possível baixar!");
    const buffer = await dlBuffer(videoUrl);
    await sock.sendMessage(from, { video: buffer, mimetype: "video/mp4", caption: "🎬 *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── SPOTIFY ───────────────────────────────────────────────────
async function spotify(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}spotify <link do Spotify>`);
  await reply("⏳ Baixando do Spotify...");
  try {
    const audioUrl = await tryApis([
      { url: `https://api.agatz.xyz/api/spotify?url=${encodeURIComponent(url)}`, extract: (d) => d?.data?.url },
    ]);
    if (!audioUrl) return reply("❌ Não foi possível baixar!");
    const buffer = await dlBuffer(audioUrl);
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── SPOTIFY PESQUISA ──────────────────────────────────────────
async function spotifysearch(ctx) {
  const { args, reply } = ctx;
  const query = args.join(" ");
  if (!query) return reply(`❌ Use: ${p}spotifysearch Nome da música`);
  await reply(`🔍 Pesquisando *${query}*...`);
  try {
    const res = await axios.get(
      `https://api.agatz.xyz/api/spotifysearch?message=${encodeURIComponent(query)}`,
      { timeout: 15000 }
    );
    const tracks = res.data?.data?.slice(0, 5);
    if (!tracks?.length) return reply("❌ Nenhum resultado!");
    const lista = tracks.map((t, i) =>
      `${i + 1}. *${t.title || t.name}*\n👤 ${t.artists || "N/A"}`
    ).join("\n\n");
    return reply(`🎵 *SPOTIFY: ${query}*\n\n${lista}`);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── SOUNDCLOUD ────────────────────────────────────────────────
async function soundcloud(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}soundcloud <link>`);
  await reply("⏳ Baixando do SoundCloud...");
  try {
    const audioUrl = await tryApis([
      { url: `https://api.agatz.xyz/api/soundcloud?url=${encodeURIComponent(url)}`, extract: (d) => d?.data?.url },
    ]);
    if (!audioUrl) return reply("❌ Não foi possível baixar!");
    const buffer = await dlBuffer(audioUrl);
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── MEDIAFIRE ─────────────────────────────────────────────────
async function mediafire(ctx) {
  const { args, reply } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}mediafire <link>`);
  await reply("⏳ Obtendo link...");
  try {
    const res = await axios.get(`https://api.agatz.xyz/api/mediafire?url=${encodeURIComponent(url)}`, { timeout: 15000 });
    const dlUrl = res.data?.data?.url || res.data?.data;
    if (!dlUrl) return reply("❌ Não foi possível obter o link!");
    return reply(`✅ *Link direto:*\n${dlUrl}`);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── PINTEREST ─────────────────────────────────────────────────
async function pinterest(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}pinterest <link>`);
  await reply("⏳ Baixando do Pinterest...");
  try {
    const mediaUrl = await tryApis([
      { url: `https://api.agatz.xyz/api/pinterest?url=${encodeURIComponent(url)}`, extract: (d) => d?.data?.url || d?.data },
    ]);
    if (!mediaUrl) return reply("❌ Não foi possível baixar!");
    const buffer  = await dlBuffer(mediaUrl);
    const isVideo = mediaUrl.includes(".mp4");
    await sock.sendMessage(from, { [isVideo ? "video" : "image"]: buffer, caption: "📌 *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── TOMP3 — Vídeo para MP3 ───────────────────────────────────
async function tomp3(ctx) {
  const { msg, reply, sock, from } = ctx;
  const quoted   = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const videoMsg = msg.message?.videoMessage || quoted?.videoMessage;
  if (!videoMsg) return reply(`❌ Responda um vídeo com *${p}tomp3*`);
  await reply("⏳ Convertendo para MP3...");
  try {
    const buffer = await dlFromMsg(videoMsg, "video");
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── TTS — Texto para voz ──────────────────────────────────────
async function tts(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply(`❌ Use: ${p}tts Seu texto`);
  await reply("🔊 Gerando áudio...");
  try {
    const res = await axios.get(
      `https://api.agatz.xyz/api/tts?message=${encodeURIComponent(texto)}&lang=pt`,
      { timeout: 20000 }
    );
    const audioUrl = res.data?.data?.url || res.data?.url;
    if (!audioUrl) return reply("❌ Não foi possível gerar o áudio!");
    const buffer = await dlBuffer(audioUrl);
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── REVELAR VISUALIZAÇÃO ÚNICA ────────────────────────────────
async function revelarft(ctx) {
  const { msg, reply, sock, from, isAdmin, isOwner } = ctx;
  if (!isAdmin && !isOwner) return reply("❌ Apenas administradores!");
  try {
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    if (!contextInfo?.quotedMessage) return reply(`❌ Responda uma mensagem de visualização única!`);
    const q = contextInfo.quotedMessage;
    const viewOnceContent =
      q?.viewOnceMessage?.message ||
      q?.viewOnceMessageV2?.message ||
      q?.viewOnceMessageV2Extension?.message ||
      (q?.imageMessage?.viewOnce ? q : null) ||
      (q?.videoMessage?.viewOnce ? q : null) || null;
    const media = viewOnceContent?.imageMessage || viewOnceContent?.videoMessage || q?.imageMessage || q?.videoMessage || null;
    if (!media) return reply(`❌ Não encontrei mídia de visualização única!`);
    await reply("🔓 Revelando...");
    const isVideo = !!(viewOnceContent?.videoMessage || q?.videoMessage);
    const type    = isVideo ? "video" : "image";
    const buffer  = await dlFromMsg(media, type);
    await sock.sendMessage(from, {
      [type]: buffer,
      mimetype: isVideo ? "video/mp4" : "image/jpeg",
      caption: "🔓 *Revelado pelo Lutchi Zap Hack*",
    }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── CLONAR GRUPO ─────────────────────────────────────────────
async function clonar(ctx) {
  const { sock, from, args, reply, isAdmin, isOwner } = ctx;
  if (!isAdmin && !isOwner) return reply("❌ Apenas administradores!");
  const linkOuId = args[0];
  if (!linkOuId) return reply(`❌ Use: ${p}clonar <link do grupo>`);
  await reply("⏳ Iniciando clonagem...");
  try {
    let groupId = linkOuId;
    if (linkOuId.includes("chat.whatsapp.com/")) {
      const code = linkOuId.split("chat.whatsapp.com/")[1].trim();
      const info = await sock.groupGetInviteInfo(code).catch(() => null);
      if (!info) return reply("❌ Link inválido ou expirado!");
      groupId = info.id;
    }
    const meta = await sock.groupMetadata(groupId).catch(() => null);
    if (!meta) return reply("❌ Não consegui acessar esse grupo!");
    const botNum  = (sock.user?.id ?? "").replace(/:.*@/, "@").replace(/@.*/, "");
    const members = meta.participants.map((p) => p.id).filter((id) => !id.includes(botNum));
    await reply(`📋 *${members.length} membros encontrados!*\n⏳ Adicionando...`);
    let adicionados = 0, falhos = 0;
    for (const jid of members) {
      try { await sock.groupParticipantsUpdate(from, [jid], "add"); adicionados++; }
      catch (_) { falhos++; }
      await new Promise((r) => setTimeout(r, 3000));
    }
    return reply(`✅ *CLONAGEM CONCLUÍDA!*\n\n👥 Total: *${members.length}*\n✅ Adicionados: *${adicionados}*\n❌ Falhos: *${falhos}*`);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function wallpaper(ctx) {
  const { args, reply } = ctx;
  const query = args.join(" ");
  if (!query) return reply(`❌ Use: ${p}wallpaper Natureza`);
  return reply(`🖼️ *Wallpaper: ${query}*\n\n🔗 https://unsplash.com/search/photos/${encodeURIComponent(query)}\n🔗 https://wallhaven.cc/search?q=${encodeURIComponent(query)}`);
}

async function shazam(ctx) {
  return ctx.reply(`⚠️ *Shazam* requer API Key gratuita do RapidAPI.\n\n🔗 https://rapidapi.com`);
}

module.exports = {
  play, playvid, youtube,
  tiktok, tiktokmp3,
  instagram, facebook, twitter, kwai,
  spotify, spotifysearch, soundcloud,
  mediafire, pinterest,
  tomp3, tts, revelarft, clonar, wallpaper, shazam,
};
