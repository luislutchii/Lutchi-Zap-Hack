const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const axios = require("axios");
const { exec } = require("child_process");
const YouTube = require("youtube-sr").default;
const fs = require("fs");
const path = require("path");
const p = ".";

const TEMP_DIR = path.join(__dirname, "../../data/temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

function cleanTemp() {
  try {
    fs.readdirSync(TEMP_DIR).forEach(f => {
      try { fs.unlinkSync(path.join(TEMP_DIR, f)); } catch (_) {}
    });
  } catch (_) {}
}

function runCmd(cmd, timeout = 60000) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout, maxBuffer: 100 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve(stdout.trim());
    });
  });
}

async function dlFromMsg(mediaMsg, type) {
  const stream = await downloadContentFromMessage(mediaMsg, type);
  let buf = Buffer.from([]);
  for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
  return buf;
}

async function dlBuffer(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 40000,
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  return Buffer.from(res.data);
}

// Função para enviar com retry automático
async function sendWithRetry(sock, from, content, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try {
      await sock.sendMessage(from, content);
      return true;
    } catch (err) {
      console.log(`⚠️ Tentativa ${i} falhou: ${err.message}`);
      if (i === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

// ── PLAY (YouTube MP3 via yt-dlp com qualidade reduzida) ─────
async function play(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  if (!args.length) return reply("❌ Use: .play Nome da música");
  const query = args.join(" ");
  await reply("🔍 Procurando *" + query + "*...");
  
  try {
    const results = await YouTube.search(query, { limit: 1, type: "video" });
    const video = results[0];
    if (!video) return reply("❌ Música não encontrada!");
    
    // Verificar duração (máximo 10 minutos)
    const durationSeconds = video.duration || 0;
    if (durationSeconds > 600) {
      return reply(`❌ Música muito longa (${Math.floor(durationSeconds/60)}min)\n_Máximo: 10 minutos_`);
    }
    
    await reply("🎵 *" + video.title + "*\n⏱️ " + (video.durationFormatted || "?") + "\n⬇️ Baixando...");
    
    // Usar qualidade mais baixa (OPUS 64k) para evitar erro de upload
    const outFile = path.join(TEMP_DIR, "audio_" + Date.now() + ".mp3");
    await runCmd('yt-dlp --remote-components ejs:github -f bestaudio[ext=webm]/bestaudio --extract-audio --audio-format mp3 --audio-quality 64K -o "' + outFile.replace(".mp3", ".%(ext)s") + '" "' + video.url + '"', 90000);
    
    const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith("audio_") && (f.endsWith(".mp3") || f.endsWith(".m4a") || f.endsWith(".webm")));
    const file = files.map(f => path.join(TEMP_DIR, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
    
    if (!file || !fs.existsSync(file)) return reply("❌ Erro ao baixar o áudio!");
    
    const buffer = fs.readFileSync(file);
    fs.unlinkSync(file);
    
    if (buffer.length < 1000) return reply("❌ Arquivo inválido!");
    if (buffer.length > 15 * 1024 * 1024) return reply("❌ Áudio muito grande (máx 15MB)");
    
    // Enviar com retry
    await sendWithRetry(sock, from, {
      audio: buffer,
      mimetype: "audio/mpeg",
      fileName: video.title.substring(0, 50) + ".mp3",
      ptt: false
    });
    
    await reply(`✅ *${video.title.substring(0, 45)}*\n⏱️ Duração: ${video.durationFormatted || "?"}\n🎵 Enviado!`);
    
  } catch (e) { 
    cleanTemp(); 
    return reply("❌ Erro ao baixar: " + e.message.slice(0, 100)); 
  }
}

// ── PLAYVID (YouTube MP4 com qualidade reduzida) ─────────────
async function playvid(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  if (!args.length) return reply("❌ Use: .playvid Nome do vídeo");
  const query = args.join(" ");
  await reply("🔍 Procurando *" + query + "*...");
  
  try {
    const results = await YouTube.search(query, { limit: 1, type: "video" });
    const video = results[0];
    if (!video) return reply("❌ Vídeo não encontrado!");
    
    const durationSeconds = video.duration || 0;
    if (durationSeconds > 300) {
      return reply(`❌ Vídeo muito longo (${Math.floor(durationSeconds/60)}min)\n_Máximo: 5 minutos_`);
    }
    
    await reply("🎬 *" + video.title + "*\n⏱️ " + (video.durationFormatted || "?") + "\n⬇️ Baixando...");
    
    // Qualidade reduzida para 360p
    const outFile = path.join(TEMP_DIR, "video_" + Date.now() + ".mp4");
    await runCmd('yt-dlp --remote-components ejs:github -f "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360]" --merge-output-format mp4 -o "' + outFile + '" "' + video.url + '"', 120000);
    
    if (!fs.existsSync(outFile)) return reply("❌ Erro ao baixar o vídeo!");
    
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    
    if (buffer.length < 1000) return reply("❌ Arquivo inválido!");
    if (buffer.length > 20 * 1024 * 1024) return reply("❌ Vídeo muito grande (máx 20MB)");
    
    await sendWithRetry(sock, from, {
      video: buffer,
      mimetype: "video/mp4",
      fileName: video.title.substring(0, 40) + ".mp4",
      caption: `🎬 *${video.title.substring(0, 40)}*`
    });
    
    await reply("✅ Vídeo enviado com sucesso!");
    
  } catch (e) { 
    cleanTemp(); 
    return reply("❌ Erro ao baixar: " + e.message.slice(0, 100)); 
  }
}

// ── YOUTUBE (busca) ───────────────────────────────────────────
async function youtube(ctx) {
  const { args, reply } = ctx;
  const query = args.join(" ");
  if (!query) return reply("❌ Use: .youtube Busca");
  await reply("🔍 Buscando *" + query + "*...");
  try {
    const results = await YouTube.search(query, { limit: 5, type: "video" });
    if (!results?.length) return reply("❌ Nenhum resultado!");
    const lista = results.map((v, i) => (i+1) + ". *" + v.title + "*\n⏱️ " + (v.durationFormatted||"?") + "\n🔗 " + v.url).join("\n\n");
    return reply("🎬 *YOUTUBE: " + query + "*\n\n" + lista + "\n\n💡 Use *.play* para MP3 ou *.playvid* para MP4!");
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── TIKTOK (mantido original) ─────────────────────────────────
async function tiktok(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .tiktok <link do TikTok>");
  await reply("⏳ Baixando TikTok sem marca d'água...");
  try {
    try {
      const r = await axios.post("https://www.tikwm.com/api/", "url=" + encodeURIComponent(url), {
        timeout: 20000,
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0" }
      });
      const videoUrl = r.data?.data?.play || r.data?.data?.hdplay;
      if (videoUrl) {
        const buffer = await dlBuffer(videoUrl);
        if (buffer.length > 1000 && buffer.length < 25 * 1024 * 1024) {
          await sendWithRetry(sock, from, { video: buffer, mimetype: "video/mp4", caption: "🎵 *Lutchi Zap Hack*" });
          return;
        }
      }
    } catch (_) {}
    const outFile = path.join(TEMP_DIR, "tiktok_" + Date.now() + ".mp4");
    await runCmd('yt-dlp --remote-components ejs:github -f "best[height<=720]" -o "' + outFile + '" "' + url + '"', 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Não foi possível baixar!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    if (buffer.length > 25 * 1024 * 1024) return reply("❌ Vídeo muito grande!");
    await sendWithRetry(sock, from, { video: buffer, mimetype: "video/mp4", caption: "🎵 *Lutchi Zap Hack*" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

// ── Demais funções mantidas iguais ───────────────────────────
async function instagram(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .instagram <link do Instagram>");
  await reply("⏳ Baixando do Instagram...");
  try {
    const outFile = path.join(TEMP_DIR, "insta_" + Date.now() + ".mp4");
    await runCmd('yt-dlp --remote-components ejs:github -o "' + outFile + '" "' + url + '"', 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Não foi possível baixar! O perfil é público?");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    const isVideo = buffer.length > 500000;
    await sendWithRetry(sock, from, {
      [isVideo ? "video" : "image"]: buffer,
      mimetype: isVideo ? "video/mp4" : "image/jpeg",
      caption: "📸 *Lutchi Zap Hack*"
    });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

async function facebook(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .facebook <link do Facebook>");
  await reply("⏳ Baixando do Facebook...");
  try {
    const outFile = path.join(TEMP_DIR, "fb_" + Date.now() + ".mp4");
    await runCmd('yt-dlp --remote-components ejs:github -o "' + outFile + '" "' + url + '"', 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Não foi possível baixar!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    await sendWithRetry(sock, from, { video: buffer, mimetype: "video/mp4", caption: "📘 *Lutchi Zap Hack*" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

async function kwai(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .kwai <link do Kwai>");
  await reply("⏳ Baixando do Kwai...");
  try {
    const outFile = path.join(TEMP_DIR, "kwai_" + Date.now() + ".mp4");
    await runCmd('yt-dlp --remote-components ejs:github -o "' + outFile + '" "' + url + '"', 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Não foi possível baixar!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    await sendWithRetry(sock, from, { video: buffer, mimetype: "video/mp4", caption: "🎬 *Lutchi Zap Hack*" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

async function spotify(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .spotify <link do Spotify>");
  await reply("⏳ Procurando música no Spotify...\n_Buscando no YouTube..._");
  try {
    const r = await axios.get("https://api.song.link/v1-alpha.1/links?url=" + encodeURIComponent(url), { timeout: 15000 });
    const title = r.data?.entitiesByUniqueId?.[r.data?.entityUniqueId]?.title || "";
    const artist = r.data?.entitiesByUniqueId?.[r.data?.entityUniqueId]?.artistName || "";
    const query = (artist + " " + title).trim() || "música";
    await reply("🎵 Encontrado: *" + title + "* - " + artist + "\n⬇️ Baixando...");
    const results = await YouTube.search(query, { limit: 1, type: "video" });
    if (!results[0]) return reply("❌ Não encontrei essa música!");
    const outFile = path.join(TEMP_DIR, "spotify_" + Date.now() + ".mp3");
    await runCmd('yt-dlp --remote-components ejs:github -f bestaudio[ext=webm]/bestaudio --extract-audio --audio-format mp3 --audio-quality 64K -o "' + outFile.replace(".mp3", ".%(ext)s") + '" "' + results[0].url + '"', 90000);
    const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith("spotify_"));
    const file = files.map(f => path.join(TEMP_DIR, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
    if (!file) return reply("❌ Erro ao baixar!");
    const buffer = fs.readFileSync(file);
    fs.unlinkSync(file);
    if (buffer.length > 15 * 1024 * 1024) return reply("❌ Áudio muito grande!");
    await sendWithRetry(sock, from, { audio: buffer, mimetype: "audio/mpeg", fileName: title.substring(0, 50) + ".mp3" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

async function soundcloud(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .soundcloud <link do SoundCloud>");
  await reply("⏳ Baixando do SoundCloud...");
  try {
    const outFile = path.join(TEMP_DIR, "sc_" + Date.now() + ".mp3");
    await runCmd('yt-dlp --remote-components ejs:github -f bestaudio[ext=webm]/bestaudio --extract-audio --audio-format mp3 --audio-quality 64K -o "' + outFile.replace(".mp3", ".%(ext)s") + '" "' + url + '"', 90000);
    const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith("sc_"));
    const file = files.map(f => path.join(TEMP_DIR, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
    if (!file) return reply("❌ Não foi possível baixar!");
    const buffer = fs.readFileSync(file);
    fs.unlinkSync(file);
    if (buffer.length > 15 * 1024 * 1024) return reply("❌ Áudio muito grande!");
    await sendWithRetry(sock, from, { audio: buffer, mimetype: "audio/mpeg" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
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
    if (buffer.length > 15 * 1024 * 1024) return reply("❌ Vídeo muito grande para converter!");
    await sendWithRetry(sock, from, { audio: buffer, mimetype: "audio/mpeg" });
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
    await sendWithRetry(sock, from, {
      [type]: buffer,
      mimetype: isVideo ? "video/mp4" : isAudio ? "audio/ogg; codecs=opus" : "image/jpeg",
      caption: !isAudio ? "🔓 *Revelado pelo Lutchi Zap Hack*" : undefined,
    });
  } catch (e) { return reply("❌ Erro ao revelar: " + e.message); }
}

async function clonar(ctx) {
  const { sock, from, args, reply, isAdmin, isOwner } = ctx;
  if (!isAdmin && !isOwner) return reply("❌ Apenas administradores!");
  const input = args[0];
  if (!input) return reply("❌ Use: .clonar <link do grupo>\n\nEx: .clonar https://chat.whatsapp.com/XXXXX");
  await reply("⏳ Obtendo informações do grupo...");
  try {
    let code = input.trim();
    if (code.includes("chat.whatsapp.com/")) {
      code = code.split("chat.whatsapp.com/")[1];
      code = code.split("?")[0].split("/")[0].trim();
    }
    console.log("Código extraído:", code);
    const info = await sock.groupGetInviteInfo(code).catch((e) => {
      console.log("groupGetInviteInfo erro:", e.message);
      return null;
    });
    if (!info) return reply("❌ Link inválido ou expirado!\n\n💡 Certifique-se que:\n• O link está correto\n• O link não expirou\n• O bot está no grupo de origem");
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
  return reply("⚠️ Configure sua API Key do Shazam (RapidAPI) para usar este comando.");
}

module.exports = { play, playvid, youtube, tiktok, instagram, facebook, kwai, spotify, soundcloud, mediafire, tomp3, revelarft, clonar, shazam };
