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

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return "?";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    return `${hours}:${(mins % 60).toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

async function sendWithRetry(sock, from, content, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try {
      await sock.sendMessage(from, content);
      return true;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return false;
}

// ── PLAY ─────────────────────────────────────────────────────
async function play(ctx) {
  const { args, reply, sock, from } = ctx;
  if (!args.length) return reply("❌ Use: .play Nome da música ou link");
  const query = args.join(" ");
  await reply("🔍 *Buscando música...*");
  try {
    let url = "";
    let videoTitle = "";
    let videoDuration = 0;

    if (query.includes("youtube.com/watch?v=") || query.includes("youtu.be/")) {
      let videoId = query.includes("youtu.be/")
        ? query.split("youtu.be/")[1].split("?")[0]
        : query.split("v=")[1]?.split("&")[0];
      url = "https://youtube.com/watch?v=" + videoId;
      const info = JSON.parse(await runCmd(`yt-dlp --dump-json --skip-download "${url}"`));
      videoTitle = info.title;
      videoDuration = info.duration;
    } else {
      const safeQuery = query.replace(/"/g, "'");
    const out = await runCmd(`yt-dlp --dump-json --flat-playlist --playlist-end 1 "ytsearch1:${safeQuery}"`);
      const result = JSON.parse(out.split("\n")[0]);
      if (!result?.id) return reply("❌ Música não encontrada!");
      videoTitle = result.title;
      videoDuration = result.duration || 0;
      url = "https://youtube.com/watch?v=" + result.id;
    }

    if (videoDuration > 600) return reply(`❌ Música muito longa (${Math.floor(videoDuration/60)}min)\n_Máximo: 10 minutos_`);

    await reply(`🎵 *${videoTitle.substring(0, 50)}*\n⏱️ ${formatDuration(videoDuration)}\n⬇️ Baixando...`);

    const outBase = path.join(TEMP_DIR, "audio_" + Date.now());
    await runCmd(`yt-dlp -f "bestaudio" --extract-audio --audio-format mp3 --audio-quality 320K -o "${outBase}.%(ext)s" "${url}"`, 120000);

    const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith("audio_"));
    const file = files.map(f => path.join(TEMP_DIR, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
    if (!file) return reply("❌ Erro ao baixar!");

    const buffer = fs.readFileSync(file);
    fs.unlinkSync(file);
    if (buffer.length > 16 * 1024 * 1024) return reply("❌ Áudio muito grande (máx 16MB)");

    await sendWithRetry(sock, from, {
      audio: buffer,
      mimetype: "audio/mpeg",
      fileName: videoTitle.substring(0, 50).replace(/[^\w\s]/gi, "") + ".mp3",
      ptt: false
    });
    cleanTemp();
  } catch (e) {
    cleanTemp();
    return reply("❌ Erro: " + e.message.slice(0, 100));
  }
}

// ── PLAYVID ───────────────────────────────────────────────────
async function playvid(ctx) {
  const { args, reply, sock, from } = ctx;
  if (!args.length) return reply("❌ Use: .playvid Nome do vídeo ou link");
  const query = args.join(" ");
  await reply("🔍 *Buscando vídeo...*");
  try {
    let url = "";
    let videoTitle = "";
    let videoDuration = 0;

    if (query.includes("youtube.com/watch?v=") || query.includes("youtu.be/")) {
      let videoId = query.includes("youtu.be/")
        ? query.split("youtu.be/")[1].split("?")[0]
        : query.split("v=")[1]?.split("&")[0];
      url = "https://youtube.com/watch?v=" + videoId;
      const info = JSON.parse(await runCmd(`yt-dlp --dump-json --skip-download "${url}"`));
      videoTitle = info.title;
      videoDuration = info.duration;
    } else {
      const safeQuery = query.replace(/"/g, "'");
    const out = await runCmd(`yt-dlp --dump-json --flat-playlist --playlist-end 1 "ytsearch1:${safeQuery} video"`);
      const result = JSON.parse(out.split("\n")[0]);
      if (!result?.id) return reply("❌ Vídeo não encontrado!");
      videoTitle = result.title;
      videoDuration = result.duration || 0;
      url = "https://youtube.com/watch?v=" + result.id;
    }

    if (videoDuration > 300) return reply(`❌ Vídeo muito longo (${Math.floor(videoDuration/60)}min)\n_Máximo: 5 minutos_`);

    await reply(`🎬 *${videoTitle.substring(0, 50)}*\n⬇️ Baixando...`);

    const outFile = path.join(TEMP_DIR, "video_" + Date.now() + ".mp4");
    await runCmd(`yt-dlp -f "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]" --merge-output-format mp4 -o "${outFile}" "${url}"`, 120000);

    if (!fs.existsSync(outFile)) return reply("❌ Erro ao baixar!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    if (buffer.length > 25 * 1024 * 1024) return reply("❌ Vídeo muito grande (máx 25MB)");

    await sendWithRetry(sock, from, {
      video: buffer,
      mimetype: "video/mp4",
      caption: "🎬 *" + videoTitle.substring(0, 40) + "*"
    });
    cleanTemp();
  } catch (e) {
    cleanTemp();
    return reply("❌ Erro: " + e.message.slice(0, 100));
  }
}

// ── YOUTUBE (busca) ───────────────────────────────────────────
async function youtube(ctx) {
  const { args, reply } = ctx;
  const query = args.join(" ");
  if (!query) return reply("❌ Use: .youtube <busca>");
  await reply("🔍 *Buscando...*");
  try {
    const safeQuery = query.replace(/"/g, "'");
    const out = await runCmd(`yt-dlp --dump-json --flat-playlist --playlist-end 8 "ytsearch8:${safeQuery}"`);
    const results = [];
    for (const line of out.split("\n")) {
      try {
        const d = JSON.parse(line);
        results.push({ title: d.title, duration: formatDuration(d.duration), url: "https://youtube.com/watch?v=" + d.id });
      } catch (_) {}
    }
    if (!results.length) return reply("❌ Nenhum resultado!");
    let text = "🎬 *RESULTADOS: " + query + "*\n\n";
    results.forEach((r, i) => {
      text += `${i+1}. *${r.title.substring(0, 50)}*\n⏱️ ${r.duration}\n🔗 ${r.url}\n\n`;
    });
    return reply(text);
  } catch (e) {
    return reply("❌ Erro: " + e.message.slice(0, 100));
  }
}

// ── TIKTOK ────────────────────────────────────────────────────
async function tiktok(ctx) {
  const { args, reply, sock, from } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .tiktok <link>");
  await reply("⏳ Baixando TikTok...");
  try {
    const outFile = path.join(TEMP_DIR, "tiktok_" + Date.now() + ".mp4");
    await runCmd(`yt-dlp -f "best[height<=720]" -o "${outFile}" "${url}"`, 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Erro!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    if (buffer.length > 25 * 1024 * 1024) return reply("❌ Vídeo muito grande!");
    await sendWithRetry(sock, from, { video: buffer, mimetype: "video/mp4", caption: "🎵 *TikTok*" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

// ── INSTAGRAM ─────────────────────────────────────────────────
async function instagram(ctx) {
  const { args, reply, sock, from } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .instagram <link>");
  await reply("⏳ Baixando...");
  try {
    const outFile = path.join(TEMP_DIR, "insta_" + Date.now() + ".mp4");
    await runCmd(`yt-dlp -o "${outFile}" "${url}"`, 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Erro!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    await sendWithRetry(sock, from, { video: buffer, mimetype: "video/mp4", caption: "📸 *Instagram*" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

// ── FACEBOOK ──────────────────────────────────────────────────
async function facebook(ctx) {
  const { args, reply, sock, from } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .facebook <link>");
  await reply("⏳ Baixando...");
  try {
    const outFile = path.join(TEMP_DIR, "fb_" + Date.now() + ".mp4");
    await runCmd(`yt-dlp -o "${outFile}" "${url}"`, 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Erro!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    await sendWithRetry(sock, from, { video: buffer, mimetype: "video/mp4", caption: "📘 *Facebook*" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

// ── KWAI ──────────────────────────────────────────────────────
async function kwai(ctx) {
  const { args, reply, sock, from } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .kwai <link>");
  await reply("⏳ Baixando...");
  try {
    const outFile = path.join(TEMP_DIR, "kwai_" + Date.now() + ".mp4");
    await runCmd(`yt-dlp -o "${outFile}" "${url}"`, 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Erro!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    await sendWithRetry(sock, from, { video: buffer, mimetype: "video/mp4", caption: "🎬 *Kwai*" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

// ── SPOTIFY ───────────────────────────────────────────────────
async function spotify(ctx) {
  const { args, reply } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .spotify <link>");
  await reply("⏳ Processando Spotify...");
  try {
    const r = await axios.get("https://api.song.link/v1-alpha.1/links?url=" + encodeURIComponent(url), { timeout: 15000 });
    const entity = r.data?.entitiesByUniqueId?.[r.data?.entityUniqueId];
    const title  = entity?.title || "";
    const artist = entity?.artistName || "";
    if (!title) return reply("❌ Não consegui identificar!");
    await reply("🎵 *" + title + "* — " + artist + "\n⬇️ Buscando no YouTube...");
    await play({ ...ctx, args: [artist + " " + title] });
  } catch (e) { return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

// ── SOUNDCLOUD ────────────────────────────────────────────────
async function soundcloud(ctx) {
  const { args, reply, sock, from } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .soundcloud <link>");
  await reply("⏳ Baixando...");
  try {
    const outBase = path.join(TEMP_DIR, "sc_" + Date.now());
    await runCmd(`yt-dlp -f bestaudio --extract-audio --audio-format mp3 --audio-quality 320K -o "${outBase}.%(ext)s" "${url}"`, 90000);
    const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith("sc_"));
    const file = files.map(f => path.join(TEMP_DIR, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
    if (!file) return reply("❌ Erro!");
    const buffer = fs.readFileSync(file);
    fs.unlinkSync(file);
    await sendWithRetry(sock, from, { audio: buffer, mimetype: "audio/mpeg" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

// ── MEDIAFIRE ─────────────────────────────────────────────────
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

// ── TOMP3 ─────────────────────────────────────────────────────
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

// ── REVELARFT ─────────────────────────────────────────────────
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

// ── CLONAR ────────────────────────────────────────────────────
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
    await reply("📋 Grupo: *" + info.subject + "*\n👥 " + info.size + " membros");
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
      try {
        await sock.groupParticipantsUpdate(from, [jid], "add");
        adicionados++;
        await new Promise(r => setTimeout(r, 1500));
      } catch (_) { falhos++; }
    }
    return reply("✅ *Clonagem concluída!*\n\n✅ Adicionados: " + adicionados + "\n❌ Falhos: " + falhos);
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── WALLPAPER ─────────────────────────────────────────────────
async function wallpaper(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const query = args.join(" ");
  if (!query) return reply("❌ Use: .wallpaper <tema>");
  await reply("🖼️ Buscando wallpaper de *" + query + "*...");
  try {
    const r = await axios.get(
      "https://api.unsplash.com/photos/random?query=" + encodeURIComponent(query) + "&client_id=your_unsplash_key",
      { timeout: 10000 }
    );
    const url = r.data?.urls?.regular;
    if (!url) return reply("❌ Sem resultado!");
    const buffer = await dlBuffer(url);
    await sock.sendMessage(from, { image: buffer, caption: "🖼️ *" + query + "*" }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

// ── SHAZAM ────────────────────────────────────────────────────
async function shazam(ctx) {
  const { msg, reply } = ctx;
  return reply("🎵 *Shazam* em desenvolvimento!\n_Em breve disponível._");
}

// ── TTS ───────────────────────────────────────────────────────
async function tts(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply("❌ Use: .tts <texto>");
  try {
    const url = "https://translate.google.com/translate_tts?ie=UTF-8&q=" + encodeURIComponent(texto) + "&tl=pt&client=tw-ob";
    const buffer = await dlBuffer(url);
    await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mpeg", ptt: true }, { quoted: msg });
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

// ── TIKTOKMP3 ─────────────────────────────────────────────────
async function tiktokmp3(ctx) {
  const { args, reply, sock, from } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .tiktokmp3 <link>");
  await reply("⏳ Extraindo áudio do TikTok...");
  try {
    const outBase = path.join(TEMP_DIR, "tiktokmp3_" + Date.now());
    await runCmd(`yt-dlp -f bestaudio --extract-audio --audio-format mp3 -o "${outBase}.%(ext)s" "${url}"`, 60000);
    const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith("tiktokmp3_"));
    const file = files.map(f => path.join(TEMP_DIR, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
    if (!file) return reply("❌ Erro!");
    const buffer = fs.readFileSync(file);
    fs.unlinkSync(file);
    await sendWithRetry(sock, from, { audio: buffer, mimetype: "audio/mpeg" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

// ── TWITTER ───────────────────────────────────────────────────
async function twitter(ctx) {
  const { args, reply, sock, from } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .twitter <link>");
  await reply("⏳ Baixando...");
  try {
    const outFile = path.join(TEMP_DIR, "tw_" + Date.now() + ".mp4");
    await runCmd(`yt-dlp -o "${outFile}" "${url}"`, 60000);
    if (!fs.existsSync(outFile)) return reply("❌ Erro!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    await sendWithRetry(sock, from, { video: buffer, mimetype: "video/mp4", caption: "🐦 *Twitter/X*" });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

// ── PINTEREST ─────────────────────────────────────────────────
async function pinterest(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .pinterest <link>");
  await reply("⏳ Baixando...");
  try {
    const outFile = path.join(TEMP_DIR, "pin_" + Date.now() + ".jpg");
    await runCmd(`yt-dlp -o "${outFile}" "${url}"`, 30000);
    if (!fs.existsSync(outFile)) return reply("❌ Erro!");
    const buffer = fs.readFileSync(outFile);
    fs.unlinkSync(outFile);
    await sock.sendMessage(from, { image: buffer, caption: "📌 *Pinterest*" }, { quoted: msg });
  } catch (e) { cleanTemp(); return reply("❌ Erro: " + e.message.slice(0, 100)); }
}

// ── SPOTIFYSEARCH ─────────────────────────────────────────────
async function spotifysearch(ctx) {
  const { args, reply } = ctx;
  const query = args.join(" ");
  if (!query) return reply("❌ Use: .spotifysearch <nome>");
  try {
    const r = await axios.get("https://api.agatz.xyz/api/spotify?text=" + encodeURIComponent(query), { timeout: 15000 });
    const data = r.data?.data;
    if (!data) return reply("❌ Sem resultado!");
    return reply("🎵 *Resultados Spotify:*\n\n" + JSON.stringify(data).slice(0, 500));
  } catch (e) { return reply("❌ Erro: " + e.message); }
}

module.exports = {
  play, playvid, youtube,
  tiktok, tiktokmp3,
  instagram, facebook, twitter, kwai,
  spotify, spotifysearch, soundcloud,
  mediafire, pinterest,
  tomp3, tts, revelarft,
  clonar, shazam, wallpaper,
};
