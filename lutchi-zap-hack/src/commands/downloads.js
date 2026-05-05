const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const axios = require("axios");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const util = require("util");
const execPromise = util.promisify(exec);

const TEMP_DIR = path.join(__dirname, "../../data/temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

function cleanTemp() {
  try {
    fs.readdirSync(TEMP_DIR).forEach(f => {
      try { fs.unlinkSync(path.join(TEMP_DIR, f)); } catch (_) {}
    });
  } catch (_) {}
}

function runCmd(cmd, timeout = 90000) {
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
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
  });
  return Buffer.from(res.data);
}

// ── BUSCA INTELIGENTE COM YT-DLP ─────────────────────────────
async function searchYouTube(query, limit = 1) {
  try {
    // Usar yt-dlp para buscar vídeos (mais confiável)
    const searchCmd = `yt-dlp --remote-components ejs:github --dump-json --flat-playlist --limit ${limit} "ytsearch${limit}:${query}" 2>/dev/null`;
    const stdout = await execPromise(searchCmd);
    
    const results = [];
    const lines = stdout.stdout.trim().split('\n');
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        results.push({
          id: data.id,
          title: data.title,
          url: `https://youtube.com/watch?v=${data.id}`,
          duration: data.duration || 0,
          durationFormatted: data.duration ? formatDuration(data.duration) : "?",
          channel: data.uploader || "Unknown"
        });
      } catch (e) {}
    }
    
    return results;
  } catch (err) {
    console.log("Erro na busca:", err.message);
    return [];
  }
}

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return "?";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
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

// ── PLAY (YouTube MP3 com busca inteligente) ─────────────────
async function play(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  if (!args.length) return reply("❌ Use: .play Nome da música ou link do YouTube");
  
  const query = args.join(" ");
  await reply("🔍 *Buscando música inteligente...*\n_Usando algoritmo avançado de busca_");
  
  try {
    let url = query;
    let videoTitle = "";
    let videoDuration = 0;
    
    // Verificar se é link do YouTube
    if (query.includes("youtube.com/watch?v=") || query.includes("youtu.be/")) {
      // Extrair ID do vídeo
      let videoId = "";
      if (query.includes("youtu.be/")) {
        videoId = query.split("youtu.be/")[1].split("?")[0];
      } else {
        videoId = query.split("v=")[1]?.split("&")[0];
      }
      url = `https://youtube.com/watch?v=${videoId}`;
      
      // Obter informações diretamente
      const infoCmd = `yt-dlp --remote-components ejs:github --dump-json --skip-download "${url}" 2>/dev/null`;
      const infoOut = await execPromise(infoCmd);
      const info = JSON.parse(infoOut.stdout);
      videoTitle = info.title;
      videoDuration = info.duration;
    } else {
      // Buscar usando yt-dlp (mais inteligente)
      const searchCmd = `yt-dlp --remote-components ejs:github --dump-json --flat-playlist --limit 1 "ytsearch1:${query}" 2>/dev/null`;
      const searchOut = await execPromise(searchCmd);
      const searchResult = JSON.parse(searchOut.stdout);
      
      if (!searchResult || !searchResult.id) {
        // Tentativa 2: Buscar com palavras-chave diferentes
        const fallbackCmd = `yt-dlp --remote-components ejs:github --dump-json --flat-playlist --limit 1 "ytsearch1:${query} song audio" 2>/dev/null`;
        const fallbackOut = await execPromise(fallbackCmd);
        const fallbackResult = JSON.parse(fallbackOut.stdout);
        if (!fallbackResult || !fallbackResult.id) {
          return reply("❌ *Não encontrei essa música!*\n\n_Tente:\n• Nome mais específico\n• Link direto do YouTube\n• Artista + nome da música_");
        }
        videoTitle = fallbackResult.title;
        videoDuration = fallbackResult.duration || 0;
        url = `https://youtube.com/watch?v=${fallbackResult.id}`;
      } else {
        videoTitle = searchResult.title;
        videoDuration = searchResult.duration || 0;
        url = `https://youtube.com/watch?v=${searchResult.id}`;
      }
    }
    
    // Verificar duração (ignorar se não detectada)
    if (videoDuration && videoDuration > 0 && videoDuration < 86400) {
      if (videoDuration > 600) {
        return reply(`❌ Música muito longa (${Math.floor(videoDuration/60)}min)\n_Máximo: 10 minutos_\n\n🎵 *${videoTitle.substring(0, 50)}*`);
      }
    }
    
    await reply(`🎵 *${videoTitle.substring(0, 45)}*\n⏱️ Duração: ${formatDuration(videoDuration)}\n⬇️ *Baixando áudio...*`);
    
    // Baixar com qualidade otimizada
    const outFile = path.join(TEMP_DIR, `audio_${Date.now()}.mp3`);
    const downloadCmd = `yt-dlp --remote-components ejs:github -f "bestaudio[ext=webm]/bestaudio" --extract-audio --audio-format mp3 --audio-quality 64K -o "${outFile.replace(".mp3", ".%(ext)s")}" "${url}"`;
    
    await runCmd(downloadCmd, 120000);
    
    // Encontrar o arquivo baixado
    const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith("audio_") && (f.endsWith(".mp3") || f.endsWith(".m4a") || f.endsWith(".webm")));
    const file = files.map(f => path.join(TEMP_DIR, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
    
    if (!file || !fs.existsSync(file)) return reply("❌ *Erro ao baixar o áudio!*\n_Tente outro nome ou link direto._");
    
    const buffer = fs.readFileSync(file);
    fs.unlinkSync(file);
    
    if (buffer.length < 1000) return reply("❌ Arquivo inválido ou corrompido!");
    if (buffer.length > 16 * 1024 * 1024) return reply("❌ Áudio muito grande (máx 16MB)");
    
    await sendWithRetry(sock, from, {
      audio: buffer,
      mimetype: "audio/mpeg",
      fileName: videoTitle.substring(0, 50).replace(/[^\w\s]/gi, "") + ".mp3",
      ptt: false
    });
    
    await reply(`✅ *Enviado!*\n🎵 ${videoTitle.substring(0, 40)}`);
    cleanTemp();
    
  } catch (e) { 
    console.error("Erro no play:", e.message);
    cleanTemp();
    
    // Mensagem de erro amigável
    if (e.message.includes("browseId")) {
      return reply("❌ *Erro de busca!*\n\n_Tente:\n• Link direto do YouTube\n• Nome mais popular da música\n• Artista + nome da música_\n\nEx: .play Marília Mendonça Supera");
    }
    return reply("❌ *Erro ao baixar:* " + e.message.slice(0, 150) + "\n\n_Tente usar um link direto do YouTube._");
  }
}

// ── PLAYVID (YouTube MP4) ─────────────────────────────────────
async function playvid(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  if (!args.length) return reply("❌ Use: .playvid Nome do vídeo ou link");
  
  const query = args.join(" ");
  await reply("🔍 *Buscando vídeo...*");
  
  try {
    let url = query;
    let videoTitle = "";
    let videoDuration = 0;
    
    if (query.includes("youtube.com/watch?v=") || query.includes("youtu.be/")) {
      let videoId = "";
      if (query.includes("youtu.be/")) {
        videoId = query.split("youtu.be/")[1].split("?")[0];
      } else {
        videoId = query.split("v=")[1]?.split("&")[0];
      }
      url = `https://youtube.com/watch?v=${videoId}`;
      
      const infoCmd = `yt-dlp --remote-components ejs:github --dump-json --skip-download "${url}" 2>/dev/null`;
      const infoOut = await execPromise(infoCmd);
      const info = JSON.parse(infoOut.stdout);
      videoTitle = info.title;
      videoDuration = info.duration;
    } else {
      const searchCmd = `yt-dlp --remote-components ejs:github --dump-json --flat-playlist --limit 1 "ytsearch1:${query} video" 2>/dev/null`;
      const searchOut = await execPromise(searchCmd);
      const searchResult = JSON.parse(searchOut.stdout);
      if (!searchResult || !searchResult.id) return reply("❌ Vídeo não encontrado!");
      videoTitle = searchResult.title;
      videoDuration = searchResult.duration || 0;
      url = `https://youtube.com/watch?v=${searchResult.id}`;
    }
    
    if (videoDuration > 0 && videoDuration > 300) {
      return reply(`❌ Vídeo muito longo (${Math.floor(videoDuration/60)}min)\n_Máximo: 5 minutos_`);
    }
    
    await reply(`🎬 *${videoTitle.substring(0, 45)}*\n⬇️ Baixando vídeo...`);
    
    const outFile = path.join(TEMP_DIR, `video_${Date.now()}.mp4`);
    const downloadCmd = `yt-dlp --remote-components ejs:github -f "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]" --merge-output-format mp4 -o "${outFile}" "${url}"`;
    
    await runCmd(downloadCmd, 120000);
    
    if (!fs.existsSync(outFile)) return reply("❌ Erro ao baixar o vídeo!");
    
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    
    if (buffer.length < 1000) return reply("❌ Arquivo inválido!");
    if (buffer.length > 25 * 1024 * 1024) return reply("❌ Vídeo muito grande (máx 25MB)");
    
    await sendWithRetry(sock, from, {
      video: buffer,
      mimetype: "video/mp4",
      fileName: videoTitle.substring(0, 40).replace(/[^\w\s]/gi, "") + ".mp4",
      caption: `🎬 *${videoTitle.substring(0, 40)}*`
    });
    
    await reply("✅ Vídeo enviado!");
    cleanTemp();
    
  } catch (e) {
    console.error("Erro no playvid:", e.message);
    cleanTemp();
    return reply("❌ Erro: " + e.message.slice(0, 100));
  }
}

// ── YOUTUBE (busca múltipla) ──────────────────────────────────
async function youtube(ctx) {
  const { args, reply } = ctx;
  const query = args.join(" ");
  if (!query) return reply("❌ Use: .youtube <busca>");
  
  await reply("🔍 *Buscando...*");
  
  try {
    const searchCmd = `yt-dlp --remote-components ejs:github --dump-json --flat-playlist --limit 8 "ytsearch8:${query}" 2>/dev/null`;
    const { stdout } = await execPromise(searchCmd);
    
    const results = [];
    const lines = stdout.trim().split('\n');
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        results.push({
          title: data.title,
          duration: data.duration ? formatDuration(data.duration) : "?",
          url: `https://youtube.com/watch?v=${data.id}`
        });
      } catch (e) {}
    }
    
    if (results.length === 0) return reply("❌ Nenhum resultado encontrado!");
    
    let replyText = `🎬 *RESULTADOS PARA: ${query}*\n\n`;
    results.forEach((r, i) => {
      replyText += `${i+1}. *${r.title.substring(0, 50)}*\n⏱️ ${r.duration}\n🔗 ${r.url}\n\n`;
    });
    replyText += `💡 Use *.play* + número ou *.play* + link`;
    
    await reply(replyText);
  } catch (e) {
    return reply("❌ Erro na busca: " + e.message.slice(0, 100));
  }
}

// ── TIKTOK ────────────────────────────────────────────────────
async function tiktok(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .tiktok <link do TikTok>");
  await reply("⏳ Baixando TikTok...");
  try {
    const outFile = path.join(TEMP_DIR, "tiktok_" + Date.now() + ".mp4");
    await runCmd(`yt-dlp --remote-components ejs:github -f "best[height<=720]" -o "${outFile}" "${url}"`, 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Não foi possível baixar!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    if (buffer.length > 25 * 1024 * 1024) return reply("❌ Vídeo muito grande!");
    await sendWithRetry(sock, from, { video: buffer, mimetype: "video/mp4", caption: "🎵 *TikTok*" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

// ── Demais funções ───────────────────────────────────────────
async function instagram(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .instagram <link>");
  await reply("⏳ Baixando...");
  try {
    const outFile = path.join(TEMP_DIR, "insta_" + Date.now() + ".mp4");
    await runCmd(`yt-dlp --remote-components ejs:github -o "${outFile}" "${url}"`, 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Erro!");
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
  if (!url) return reply("❌ Use: .facebook <link>");
  await reply("⏳ Baixando...");
  try {
    const outFile = path.join(TEMP_DIR, "fb_" + Date.now() + ".mp4");
    await runCmd(`yt-dlp --remote-components ejs:github -o "${outFile}" "${url}"`, 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Erro!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    await sendWithRetry(sock, from, { video: buffer, mimetype: "video/mp4", caption: "📘 *Facebook*" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

async function kwai(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .kwai <link>");
  await reply("⏳ Baixando...");
  try {
    const outFile = path.join(TEMP_DIR, "kwai_" + Date.now() + ".mp4");
    await runCmd(`yt-dlp --remote-components ejs:github -o "${outFile}" "${url}"`, 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Erro!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    await sendWithRetry(sock, from, { video: buffer, mimetype: "video/mp4", caption: "🎬 *Kwai*" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

async function spotify(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .spotify <link>");
  await reply("⏳ Processando Spotify...");
  try {
    const r = await axios.get("https://api.song.link/v1-alpha.1/links?url=" + encodeURIComponent(url), { timeout: 15000 });
    const title = r.data?.entitiesByUniqueId?.[r.data?.entityUniqueId]?.title || "";
    const artist = r.data?.entitiesByUniqueId?.[r.data?.entityUniqueId]?.artistName || "";
    if (!title) return reply("❌ Não consegui identificar!");
    await reply(`🎵 *${title}* - ${artist}\n⬇️ Buscando no YouTube...`);
    const playCtx = { ...ctx, args: [`${artist} ${title}`] };
    await play(playCtx);
  } catch (e) { return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

async function soundcloud(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .soundcloud <link>");
  await reply("⏳ Baixando...");
  try {
    const outFile = path.join(TEMP_DIR, "sc_" + Date.now() + ".mp3");
    await runCmd(`yt-dlp --remote-components ejs:github -f bestaudio[ext=webm]/bestaudio --extract-audio --audio-format mp3 --audio-quality 64K -o "${outFile.replace(".mp3", ".%(ext)s")}" "${url}"`, 90000);
    const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith("sc_"));
    const file = files.map(f => path.join(TEMP_DIR, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
    if (!file) return reply("❌ Erro!");
    const buffer = fs.readFileSync(file);
    fs.unlinkSync(file);
    await sendWithRetry(sock, from, { audio: buffer, mimetype: "audio/mpeg" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

async function mediafire(ctx) {
  const { args, reply } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .mediafire <link>");
  try {
    const r = await axios.get("https://api.agatz.xyz/api/mediafire?url=" + encodeURIComponent(url), { timeout: 15000 });
    const dlUrl = r.data?.data?.url || r.data?.data;
    if (!dlUrl) return reply("❌ Erro!");
    return reply("✅ *Link direto:*\n" + dlUrl);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function tomp3(ctx) {
  const { msg, reply, sock, from } = ctx;
  const m = msg.message;
  const q = m?.extendedTextMessage?.contextInfo?.quotedMessage;
  const videoMsg = m?.videoMessage || q?.videoMessage;
  if (!videoMsg) return reply("❌ Responda um vídeo!");
  await reply("⏳ Convertendo...");
  try {
    const buffer = await dlFromMsg(videoMsg, "video");
    await sendWithRetry(sock, from, { audio: buffer, mimetype: "audio/mpeg" });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function revelarft(ctx) {
  const { msg, reply, sock, from, isAdmin, isOwner } = ctx;
  if (!isAdmin && !isOwner) return reply("❌ Apenas administradores!");
  try {
    const q = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!q) return reply("❌ Responda uma visualização única!");
    const voMsg = q?.viewOnceMessage?.message || q?.viewOnceMessageV2?.message || q?.viewOnceMessageV2Extension?.message;
    const mediaMsg = voMsg?.imageMessage || voMsg?.videoMessage || voMsg?.audioMessage || q?.imageMessage || q?.videoMessage;
    if (!mediaMsg) return reply("❌ Mídia não encontrada!");
    await reply("🔓 Revelando...");
    const isVideo = !!(voMsg?.videoMessage) || !!(mediaMsg?.seconds);
    const isAudio = !!(voMsg?.audioMessage);
    const type = isVideo ? "video" : isAudio ? "audio" : "image";
    const buffer = await dlFromMsg(mediaMsg, type);
    await sendWithRetry(sock, from, {
      [type]: buffer,
      mimetype: isVideo ? "video/mp4" : isAudio ? "audio/ogg; codecs=opus" : "image/jpeg",
      caption: !isAudio ? "🔓 *Revelado*" : undefined,
    });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function clonar(ctx) {
  const { sock, from, args, reply, isAdmin, isOwner } = ctx;
  if (!isAdmin && !isOwner) return reply("❌ Apenas administradores!");
  const input = args[0];
  if (!input) return reply("❌ Use: .clonar <link do grupo>");
  await reply("⏳ Clonando...");
  try {
    let code = input.trim();
    if (code.includes("chat.whatsapp.com/")) {
      code = code.split("chat.whatsapp.com/")[1].split("?")[0].split("/")[0];
    }
    const info = await sock.groupGetInviteInfo(code).catch(() => null);
    if (!info) return reply("❌ Link inválido!");
    await reply(`📋 Grupo: *${info.subject}*\n👥 ${info.size} membros`);
    let meta = await sock.groupMetadata(info.id).catch(() => null);
    if (!meta) {
      await sock.groupAcceptInvite(code);
      await new Promise(r => setTimeout(r, 3000));
      meta = await sock.groupMetadata(info.id);
    }
    const botNum = (sock.user?.id || "").split(":")[0].split("@")[0];
    const members = meta.participants.map(p => p.id).filter(id => !id.includes(botNum));
    let adicionados = 0, falhos = 0;
    for (const jid of members) {
      try { await sock.groupParticipantsUpdate(from, [jid], "add"); adicionados++; } catch (_) { falhos++; }
      await new Promise(r => setTimeout(r, 3000));
    }
    return reply(`✅ *CLONADO!*\n✅ Adicionados: ${adicionados}\n❌ Falhos: ${falhos}`);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

async function shazam(ctx) {
  return ctx.reply("⚠️ Comando em desenvolvimento.");
}

module.exports = { play, playvid, youtube, tiktok, instagram, facebook, kwai, spotify, soundcloud, mediafire, tomp3, revelarft, clonar, shazam };
