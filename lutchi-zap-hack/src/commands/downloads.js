const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const p = ".";

const RAPID_KEY  = "03aab68c4amsh0ea821855a4a32ep1eb58fjsn513b28b951a3";
const LOLHUMAN   = "1e132cf6200349754408d9f0";
const LOLHUMAN_URL = "https://api.lolhuman.xyz/api";

async function dlBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
  return Buffer.from(res.data);
}

async function dlFromMsg(mediaMsg, type) {
  const stream = await downloadContentFromMessage(mediaMsg, type);
  let buf = Buffer.from([]);
  for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
  return buf;
}

// ── PLAY — YouTube MP3 ────────────────────────────────────────
async function play(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  if (!args.length) return reply(`❌ Use: ${p}play Nome da música`);
  const query = args.join(" ");
  await reply(`🔍 Procurando *${query}*...`);
  try {
    const res = await axios.get(`${LOLHUMAN_URL}/ytsearch?apikey=${LOLHUMAN}&query=${encodeURIComponent(query)}`, { timeout: 15000 });
    const video = res.data?.result?.[0];
    if (!video) return reply("❌ Música não encontrada!");
    await reply(`🎵 *${video.title}*\n⏱️ ${video.duration}\n⬇️ Baixando...`);
    const dl = await axios.get(`${LOLHUMAN_URL}/ytmp3?apikey=${LOLHUMAN}&url=${encodeURIComponent(video.url)}`, { timeout: 40000 });
    const audioUrl = dl.data?.result?.url;
    if (!audioUrl) return reply("❌ Erro ao baixar!");
    const buffer = await dlBuffer(audioUrl);
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg", fileName: `${video.title}.mp3` }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── PLAYVID — YouTube MP4 ─────────────────────────────────────
async function playvid(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  if (!args.length) return reply(`❌ Use: ${p}playvid Nome do vídeo`);
  const query = args.join(" ");
  await reply(`🔍 Procurando *${query}*...`);
  try {
    const res = await axios.get(`${LOLHUMAN_URL}/ytsearch?apikey=${LOLHUMAN}&query=${encodeURIComponent(query)}`, { timeout: 15000 });
    const video = res.data?.result?.[0];
    if (!video) return reply("❌ Vídeo não encontrado!");
    await reply(`🎬 *${video.title}*\n⏱️ ${video.duration}\n⬇️ Baixando...`);
    const dl = await axios.get(`${LOLHUMAN_URL}/ytmp4?apikey=${LOLHUMAN}&url=${encodeURIComponent(video.url)}`, { timeout: 40000 });
    const videoUrl = dl.data?.result?.url;
    if (!videoUrl) return reply("❌ Erro ao baixar!");
    const buffer = await dlBuffer(videoUrl);
    await sock.sendMessage(from, { video: buffer, mimetype: "video/mp4", fileName: `${video.title}.mp4` }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── YOUTUBE — Pesquisa ────────────────────────────────────────
async function youtube(ctx) {
  const { args, reply } = ctx;
  const query = args.join(" ");
  if (!query) return reply(`❌ Use: ${p}youtube Busca`);
  await reply(`🔍 Buscando *${query}*...`);
  try {
    const res = await axios.get(`${LOLHUMAN_URL}/ytsearch?apikey=${LOLHUMAN}&query=${encodeURIComponent(query)}`, { timeout: 15000 });
    const results = res.data?.result?.slice(0, 5);
    if (!results?.length) return reply("❌ Nenhum resultado!");
    const lista = results.map((v, i) =>
      `${i + 1}. *${v.title}*\n⏱️ ${v.duration}\n🔗 ${v.url}`
    ).join("\n\n");
    return reply(`🎬 *YOUTUBE: ${query}*\n\n${lista}\n\n💡 Use *${p}play* ou *${p}playvid* para baixar!`);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── TIKTOK — Sem marca d'água ─────────────────────────────────
async function tiktok(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}tiktok <link>`);
  await reply("⏳ Baixando TikTok sem marca d'água...");
  try {
    const res = await axios.get(`${LOLHUMAN_URL}/tiktokwm?apikey=${LOLHUMAN}&url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const videoUrl = res.data?.result?.video_nowm || res.data?.result?.video;
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
    const res = await axios.get(`${LOLHUMAN_URL}/tiktokmp3?apikey=${LOLHUMAN}&url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const audioUrl = res.data?.result?.music;
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
    const res = await axios.get(`${LOLHUMAN_URL}/instagram?apikey=${LOLHUMAN}&url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const media = res.data?.result;
    if (!media) return reply("❌ Não foi possível baixar!");
    const mediaUrl = Array.isArray(media) ? media[0] : media;
    const buffer = await dlBuffer(mediaUrl);
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
    const res = await axios.get(`${LOLHUMAN_URL}/facebook?apikey=${LOLHUMAN}&url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const videoUrl = res.data?.result?.hd || res.data?.result?.sd;
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
    const res = await axios.get(`${LOLHUMAN_URL}/twitter?apikey=${LOLHUMAN}&url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const videoUrl = res.data?.result?.url || res.data?.result;
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
    const res = await axios.get(`https://api.agatz.xyz/api/kwai?url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const videoUrl = res.data?.data?.video;
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
    const res = await axios.get(`${LOLHUMAN_URL}/spotify?apikey=${LOLHUMAN}&url=${encodeURIComponent(url)}`, { timeout: 30000 });
    const audioUrl = res.data?.result?.url;
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
  await reply(`🔍 Pesquisando *${query}* no Spotify...`);
  try {
    const res = await axios.get(`${LOLHUMAN_URL}/spotifysearch?apikey=${LOLHUMAN}&query=${encodeURIComponent(query)}`, { timeout: 15000 });
    const tracks = res.data?.result?.slice(0, 5);
    if (!tracks?.length) return reply("❌ Nenhum resultado!");
    const lista = tracks.map((t, i) =>
      `${i + 1}. *${t.name}*\n👤 ${t.artists}\n🔗 ${t.url}`
    ).join("\n\n");
    return reply(`🎵 *SPOTIFY: ${query}*\n\n${lista}\n\n💡 Use *${p}spotify <link>* para baixar!`);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── SOUNDCLOUD ────────────────────────────────────────────────
async function soundcloud(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}soundcloud <link>`);
  await reply("⏳ Baixando do SoundCloud...");
  try {
    const res = await axios.get(`${LOLHUMAN_URL}/soundcloud?apikey=${LOLHUMAN}&url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const audioUrl = res.data?.result?.url;
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
    const res = await axios.get(`${LOLHUMAN_URL}/mediafire?apikey=${LOLHUMAN}&url=${encodeURIComponent(url)}`, { timeout: 15000 });
    const dlUrl = res.data?.result;
    if (!dlUrl) return reply("❌ Não foi possível obter o link!");
    return reply(`✅ *Link direto Mediafire:*\n${dlUrl}`);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── PINTEREST ─────────────────────────────────────────────────
async function pinterest(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply(`❌ Use: ${p}pinterest <link>`);
  await reply("⏳ Baixando do Pinterest...");
  try {
    const res = await axios.get(`${LOLHUMAN_URL}/pinterest?apikey=${LOLHUMAN}&url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const mediaUrl = res.data?.result;
    if (!mediaUrl) return reply("❌ Não foi possível baixar!");
    const buffer = await dlBuffer(mediaUrl);
    const isVideo = mediaUrl.includes(".mp4");
    await sock.sendMessage(from, { [isVideo ? "video" : "image"]: buffer, caption: "📌 *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── TOMP3 — Vídeo para MP3 ───────────────────────────────────
async function tomp3(ctx) {
  const { msg, reply, sock, from } = ctx;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const videoMsg = msg.message?.videoMessage || quoted?.videoMessage;
  if (!videoMsg) return reply(`❌ Responda um vídeo com *${p}tomp3*`);
  await reply("⏳ Convertendo para MP3...");
  try {
    const buffer = await dlFromMsg(videoMsg, "video");
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── TEXT TO SPEECH ────────────────────────────────────────────
async function tts(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply(`❌ Use: ${p}tts Seu texto aqui`);
  await reply("🔊 Gerando áudio...");
  try {
    const res = await axios.post(
      "https://text-to-speech-neural-google.p.rapidapi.com/",
      new URLSearchParams({ msg: texto, lang: "Vitoria", source: "ttsmp3" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-rapidapi-host": "text-to-speech-neural-google.p.rapidapi.com",
          "x-rapidapi-key": RAPID_KEY,
        },
        timeout: 20000,
      }
    );
    const audioUrl = res.data?.URL;
    if (!audioUrl) return reply("❌ Não foi possível gerar o áudio!");
    const buffer = await dlBuffer(audioUrl);
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro no TTS: " + e.message); }
}

// ── REVELAR FOTO/VÍDEO ÚNICA VISUALIZAÇÃO ────────────────────
async function revelarft(ctx) {
  const { msg, reply, sock, from, isAdmin, isOwner } = ctx;
  if (!isAdmin && !isOwner) return reply("❌ Apenas administradores!");
  try {
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    if (!contextInfo?.quotedMessage) return reply(`❌ Responda uma mensagem de visualização única com *${p}revelarft*`);
    const q = contextInfo.quotedMessage;
    const viewOnceContent =
      q?.viewOnceMessage?.message ||
      q?.viewOnceMessageV2?.message ||
      q?.viewOnceMessageV2Extension?.message ||
      (q?.imageMessage?.viewOnce ? q : null) ||
      (q?.videoMessage?.viewOnce ? q : null) ||
      null;
    const media =
      viewOnceContent?.imageMessage || viewOnceContent?.videoMessage ||
      q?.imageMessage || q?.videoMessage || null;
    if (!media) return reply(`❌ Não encontrei mídia de visualização única!\n\nResponda directamente à foto/vídeo com *${p}revelarft*`);
    await reply("🔓 Revelando...");
    const isVideo = !!(viewOnceContent?.videoMessage || q?.videoMessage);
    const type    = isVideo ? "video" : "image";
    const buffer  = await dlFromMsg(media, type);
    await sock.sendMessage(from, {
      [type]: buffer,
      mimetype: isVideo ? "video/mp4" : "image/jpeg",
      caption: "🔓 *Revelado pelo Lutchi Zap Hack*",
    }, { quoted: msg });
  } catch (e) { return reply("❌ Erro ao revelar: " + e.message); }
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

async function shazam(ctx) {
  return ctx.reply(`⚠️ *Shazam* requer API Key do RapidAPI.\n\nCadastre-se em: https://rapidapi.com\nPlano gratuito disponível!`);
}

module.exports = {
  play, playvid, youtube, tiktok, tiktokmp3,
  instagram, facebook, twitter, kwai,
  spotify, spotifysearch, soundcloud, mediafire, pinterest,
  tomp3, tts, revelarft, clonar, shazam,
};
