const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const axios = require("axios");
const p = ".";

async function dlBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 40000, headers: { "User-Agent": "Mozilla/5.0" } });
  return Buffer.from(res.data);
}

async function dlFromMsg(mediaMsg, type) {
  const stream = await downloadContentFromMessage(mediaMsg, type);
  let buf = Buffer.from([]);
  for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
  return buf;
}

async function tryApis(fns) {
  for (const fn of fns) {
    try { const r = await fn(); if (r) return r; } catch (_) {}
  }
  return null;
}

async function play(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  if (!args.length) return reply("❌ Use: .play Nome da música");
  const query = args.join(" ");
  await reply("🔍 Procurando *" + query + "*...");
  try {
    const searchRes = await axios.get("https://api.agatz.xyz/api/ytsearch?message=" + encodeURIComponent(query), { timeout: 15000 });
    const video = searchRes.data?.data?.[0];
    if (!video?.url) return reply("❌ Música não encontrada!");
    await reply("🎵 *" + video.title + "*\n⏱️ " + (video.duration || "?") + "\n⬇️ Baixando...");
    const dlRes = await axios.get("https://api.agatz.xyz/api/ytmp3?url=" + encodeURIComponent(video.url), { timeout: 30000 });
    const audioUrl = dlRes.data?.data?.url;
    if (!audioUrl) return reply("❌ Não consegui baixar. Tente novamente!");
    const buffer = await dlBuffer(audioUrl);
    if (buffer.length < 1000) return reply("❌ Arquivo inválido!");
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg", fileName: video.title + ".mp3" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function playvid(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  if (!args.length) return reply("❌ Use: .playvid Nome do vídeo");
  const query = args.join(" ");
  await reply("🔍 Procurando *" + query + "*...");
  try {
    const searchRes = await axios.get("https://api.agatz.xyz/api/ytsearch?message=" + encodeURIComponent(query), { timeout: 15000 });
    const video = searchRes.data?.data?.[0];
    if (!video?.url) return reply("❌ Vídeo não encontrado!");
    await reply("🎬 *" + video.title + "*\n⬇️ Baixando...");
    const dlRes = await axios.get("https://api.agatz.xyz/api/ytmp4?url=" + encodeURIComponent(video.url), { timeout: 30000 });
    const videoUrl = dlRes.data?.data?.url;
    if (!videoUrl) return reply("❌ Não consegui baixar!");
    const buffer = await dlBuffer(videoUrl);
    if (buffer.length < 1000) return reply("❌ Arquivo inválido!");
    await sock.sendMessage(from, { video: buffer, mimetype: "video/mp4" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function youtube(ctx) {
  const { args, reply } = ctx;
  const query = args.join(" ");
  if (!query) return reply("❌ Use: .youtube Busca");
  await reply("🔍 Buscando *" + query + "* no YouTube...");
  try {
    const res = await axios.get("https://api.agatz.xyz/api/ytsearch?message=" + encodeURIComponent(query), { timeout: 15000 });
    const results = res.data?.data?.slice(0, 5);
    if (!results?.length) return reply("❌ Nenhum resultado!");
    const lista = results.map((v, i) => (i+1) + ". *" + v.title + "*\n⏱️ " + (v.duration||"?") + "\n🔗 " + v.url).join("\n\n");
    return reply("🎬 *YOUTUBE: " + query + "*\n\n" + lista + "\n\n💡 Use *.play* para MP3 ou *.playvid* para MP4!");
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function tiktok(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .tiktok <link do TikTok>");
  await reply("⏳ Baixando TikTok sem marca d'água...");
  try {
    const videoUrl = await tryApis([
      async () => { const r = await axios.post("https://www.tikwm.com/api/", "url=" + encodeURIComponent(url), { timeout: 20000, headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0" } }); return r.data?.data?.play || r.data?.data?.hdplay || null; },
      async () => { const r = await axios.get("https://tikwm.com/api/?url=" + encodeURIComponent(url), { timeout: 20000, headers: { "User-Agent": "Mozilla/5.0" } }); return r.data?.data?.play || null; },
    ]);
    if (!videoUrl) return reply("❌ Não foi possível baixar! O link é válido?");
    const buffer = await dlBuffer(videoUrl);
    if (buffer.length < 1000) return reply("❌ Arquivo inválido!");
    await sock.sendMessage(from, { video: buffer, mimetype: "video/mp4", caption: "🎵 *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function instagram(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .instagram <link do Instagram>");
  await reply("⏳ Baixando do Instagram...");
  try {
    const res = await axios.get("https://api.agatz.xyz/api/instagram?url=" + encodeURIComponent(url), { timeout: 20000, headers: { "User-Agent": "Mozilla/5.0" } });
    const mediaUrl = res.data?.data?.[0]?.url || res.data?.data?.url;
    if (!mediaUrl) return reply("❌ Não foi possível baixar! O perfil é público?");
    const buffer = await dlBuffer(mediaUrl);
    if (buffer.length < 500) return reply("❌ Arquivo inválido!");
    const isVideo = mediaUrl.includes(".mp4") || mediaUrl.includes("video");
    await sock.sendMessage(from, { [isVideo ? "video" : "image"]: buffer, caption: "📸 *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function facebook(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .facebook <link do Facebook>");
  await reply("⏳ Baixando do Facebook...");
  try {
    const res = await axios.get("https://api.agatz.xyz/api/facebook?url=" + encodeURIComponent(url), { timeout: 20000 });
    const videoUrl = res.data?.data?.hd || res.data?.data?.sd || res.data?.data?.url;
    if (!videoUrl) return reply("❌ Não foi possível baixar! O vídeo é público?");
    const buffer = await dlBuffer(videoUrl);
    await sock.sendMessage(from, { video: buffer, mimetype: "video/mp4", caption: "📘 *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function kwai(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .kwai <link do Kwai>");
  await reply("⏳ Baixando do Kwai...");
  try {
    const res = await axios.get("https://api.agatz.xyz/api/kwai?url=" + encodeURIComponent(url), { timeout: 20000 });
    const videoUrl = res.data?.data?.video;
    if (!videoUrl) return reply("❌ Não foi possível baixar!");
    const buffer = await dlBuffer(videoUrl);
    await sock.sendMessage(from, { video: buffer, mimetype: "video/mp4", caption: "🎬 *Lutchi Zap Hack*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function spotify(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .spotify <link do Spotify>");
  await reply("⏳ Baixando do Spotify...");
  try {
    const res = await axios.get("https://api.agatz.xyz/api/spotify?url=" + encodeURIComponent(url), { timeout: 20000 });
    const audioUrl = res.data?.data?.url;
    if (!audioUrl) return reply("❌ Não foi possível baixar!");
    const buffer = await dlBuffer(audioUrl);
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function soundcloud(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .soundcloud <link do SoundCloud>");
  await reply("⏳ Baixando do SoundCloud...");
  try {
    const res = await axios.get("https://api.agatz.xyz/api/soundcloud?url=" + encodeURIComponent(url), { timeout: 20000 });
    const audioUrl = res.data?.data?.url;
    if (!audioUrl) return reply("❌ Não foi possível baixar!");
    const buffer = await dlBuffer(audioUrl);
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function mediafire(ctx) {
  const { args, reply } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .mediafire <link do Mediafire>");
  await reply("⏳ Obtendo link direto...");
  try {
    const r = await axios.get("https://api.agatz.xyz/api/mediafire?url=" + encodeURIComponent(url), { timeout: 15000 });
    const dlUrl = r.data?.data?.url || r.data?.data;
    if (!dlUrl) return reply("❌ Não foi possível obter o link!");
    return reply("✅ *Link direto:*\n" + dlUrl);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function tomp3(ctx) {
  const { msg, reply, sock, from } = ctx;
  const m = msg.message;
  const q = m?.extendedTextMessage?.contextInfo?.quotedMessage;
  const videoMsg = m?.videoMessage || q?.videoMessage;
  if (!videoMsg) return reply("❌ Responda um vídeo com *.tomp3*");
  await reply("⏳ Convertendo para áudio...");
  try {
    const buffer = await dlFromMsg(videoMsg, "video");
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function revelarft(ctx) {
  const { msg, reply, sock, from, isAdmin, isOwner } = ctx;
  if (!isAdmin && !isOwner) return reply("❌ Apenas administradores!");
  try {
    const q = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!q) return reply("❌ Responda uma mensagem de visualização única com *.revelarft*");
    const voMsg =
      q?.viewOnceMessage?.message ||
      q?.viewOnceMessageV2?.message ||
      q?.viewOnceMessageV2Extension?.message;
    const mediaMsg = voMsg?.imageMessage || voMsg?.videoMessage || voMsg?.audioMessage || q?.imageMessage || q?.videoMessage;
    if (!mediaMsg) return reply("❌ Não encontrei mídia de visualização única!");
    await reply("🔓 Revelando...");
    const isVideo = !!(voMsg?.videoMessage) || !!(mediaMsg?.seconds);
    const isAudio = !!(voMsg?.audioMessage);
    const type = isVideo ? "video" : isAudio ? "audio" : "image";
    const buffer = await dlFromMsg(mediaMsg, type);
    await sock.sendMessage(from, {
      [type]: buffer,
      mimetype: isVideo ? "video/mp4" : isAudio ? "audio/ogg; codecs=opus" : "image/jpeg",
      caption: !isAudio ? "🔓 *Revelado pelo Lutchi Zap Hack*" : undefined,
    }, { quoted: msg });
  } catch (e) { return reply("❌ Erro ao revelar: " + e.message); }
}

async function clonar(ctx) {
  const { sock, from, args, reply, isAdmin, isOwner } = ctx;
  if (!isAdmin && !isOwner) return reply("❌ Apenas administradores!");
  const input = args[0];
  if (!input) return reply("❌ Use: .clonar <link do grupo>\n\nEx: .clonar https://chat.whatsapp.com/XXXXX");
  await reply("⏳ Obtendo informações do grupo...");
  try {
    let code = input;
    if (input.includes("chat.whatsapp.com/")) {
      code = input.split("chat.whatsapp.com/").pop().split("/")[0].split("?")[0].trim();
    }
    const info = await sock.groupGetInviteInfo(code).catch(() => null);
    if (!info) return reply("❌ Link inválido ou expirado!");
    await reply("📋 Grupo: *" + info.subject + "*\n👥 Membros: " + info.size + "\n⏳ Adicionando a cada 3s...");
    let meta = await sock.groupMetadata(info.id).catch(() => null);
    if (!meta) {
      await sock.groupAcceptInvite(code).catch(() => {});
      await new Promise(r => setTimeout(r, 3000));
      meta = await sock.groupMetadata(info.id).catch(() => null);
    }
    if (!meta) return reply("❌ Não consegui acessar os membros.\n💡 O bot precisa estar no grupo de origem!");
    const botNum = (sock.user?.id || "").split(":")[0].split("@")[0];
    const members = meta.participants.map(p => p.id).filter(id => !id.includes(botNum));
    let adicionados = 0, falhos = 0;
    for (const jid of members) {
      try { await sock.groupParticipantsUpdate(from, [jid], "add"); adicionados++; } catch (_) { falhos++; }
      await new Promise(r => setTimeout(r, 3000));
    }
    return reply("✅ *CLONAGEM CONCLUÍDA!*\n\n👥 Total: *" + members.length + "*\n✅ Adicionados: *" + adicionados + "*\n❌ Falhos: *" + falhos + "*");
  } catch (e) { return reply("❌ Erro ao clonar: " + e.message); }
}

async function shazam(ctx) {
  const { msg, reply } = ctx;
  const m = msg.message;
  const q = m?.extendedTextMessage?.contextInfo?.quotedMessage;
  const audioMsg = m?.audioMessage || q?.audioMessage;
  if (!audioMsg) return reply("❌ Responda um áudio com *.shazam*");
  return reply("⚠️ Configure sua API Key do Shazam (RapidAPI) no arquivo config.js para usar este comando.");
}

module.exports = { play, playvid, youtube, tiktok, instagram, facebook, kwai, spotify, soundcloud, mediafire, tomp3, revelarft, clonar, shazam };
