const config = require("../config/config");
const {
  getAntiLink, getAntiFlood, getBanwords,
  isMuted, getAntiMention, getBotStatus, getModoBot,
} = require("./database");

const infoCommands        = require("../commands/info");
const adminCommands       = require("../commands/admin");
const modCommands         = require("../commands/mod");
const downloadCommands    = require("../commands/downloads");
const stickerCommands     = require("../commands/stickers");
const pesquisaCommands    = require("../commands/pesquisas");
const brincadeiraCommands = require("../commands/brincadeiras");
const extrasCommands      = require("../commands/extras");
const debateCommands      = require("../commands/debate");
const anuncioCommands     = require("../commands/anuncio");

let ownerCommands = {}, bacboCommands = {};
try { ownerCommands  = require("../commands/owner");  } catch (_) {}
try { bacboCommands  = require("../commands/bacbo");   } catch (_) {}

const floodTracker = {};

// ── Cache de groupMetadata (5 minutos) ────────────────────────
const groupMetaCache = new Map();
async function getGroupMeta(sock, groupId) {
  const cached = groupMetaCache.get(groupId);
  if (cached && Date.now() - cached.ts < 5 * 60 * 1000) return cached.data;
  const meta = await sock.groupMetadata(groupId).catch(() => null);
  if (meta) groupMetaCache.set(groupId, { data: meta, ts: Date.now() });
  return meta;
}

// ── Comandos públicos (qualquer membro) ───────────────────────
const PUBLIC_COMMANDS = new Set([
  "lutchi", "menu", "ping", "dono", "sobre", "sistema",
  "dado", "flip", "citar", "conselhos", "conselhobiblico",
  "cantadas", "spoiler", "fazernick", "calcular", "letramusica",
  "tabela", "signo", "obesidade", "clima", "traduzir",
  "wikipedia", "dicionario", "tinyurl", "googlesrc", "gimage",
  "wame", "temadebate", "favor", "contra", "votos",
  "sticker", "toimg", "togif", "attp", "ttp",
  "play", "playvid", "youtube", "tiktok", "tiktokmp3",
  "instagram", "facebook", "twitter", "kwai",
  "spotify", "spotifysearch", "soundcloud", "pinterest",
  "movie", "serie", "receita", "chatgpt", "tts",
  "flagpedia", "perfil", "sorteio", "enquete", "sticker",
]);

function normalizeId(jid = "") {
  return jid.replace(/:.*@/, "@").replace(/@.*/, "");
}

function matchParticipant(participantId, phoneNum, lidNum) {
  const pNum = normalizeId(participantId);
  return pNum === phoneNum || (lidNum && pNum === lidNum);
}

function checkIsOwner(sender, groupMeta) {
  const ownerPhone = config.owner.number;
  const ownerLid   = config.owner.lid || "";
  const senderNorm = normalizeId(sender);

  if (senderNorm === ownerPhone) return true;
  if (senderNorm === ownerLid)   return true;
  if (sender.includes(ownerPhone)) return true;

  if (groupMeta) {
    for (const p of groupMeta.participants) {
      const pNorm = normalizeId(p.id);
      if (pNorm === senderNorm) {
        if (p.id.includes(ownerPhone)) return true;
        if (p.lidJid && normalizeId(p.lidJid) === ownerLid) return true;
      }
    }
  }
  return false;
}

async function messageHandler(sock, msg, store) {
  try {
    const messageContent = msg.message;
    if (!messageContent) return;

    const isGroup = msg.key.remoteJid?.endsWith("@g.us");
    const from    = msg.key.remoteJid;
    const sender  = isGroup
      ? (msg.key.participant || msg.key.remoteJid)
      : msg.key.remoteJid;

    const body =
      messageContent?.conversation ||
      messageContent?.extendedTextMessage?.text ||
      messageContent?.imageMessage?.caption ||
      messageContent?.videoMessage?.caption || "";

    if (!body.startsWith(config.prefix)) {
      if (isGroup) await passiveModeration(sock, msg, from, sender, body, messageContent);
      return;
    }

    const parts   = body.slice(config.prefix.length).trim().split(/\s+/);
    const command = parts.shift().toLowerCase();
    const args    = parts;

    // ── Metadados do grupo ─────────────────────────────────────
    let groupMeta = null, isAdmin = false, isBotAdmin = false;
    if (isGroup) {
      groupMeta = await getGroupMeta(sock, from);
      if (groupMeta) {
        const senderPhone = normalizeId(sender);
        const botPhone    = normalizeId(sock.user?.id ?? "");
        const senderLid   = normalizeId(msg.key?.participant ?? "");
        const botLid      = normalizeId(sock.user?.lid ?? "");
        const admins      = groupMeta.participants.filter((p) => p.admin);

        isAdmin    = admins.some((p) => matchParticipant(p.id, senderPhone, senderLid));
        isBotAdmin = admins.some((p) => matchParticipant(p.id, botPhone, botLid));
      }
    }

    const isOwner = checkIsOwner(sender, groupMeta);

    // ── Verifica se bot está ligado ────────────────────────────
    if (isGroup && !getBotStatus(from) && !isOwner) return;

    // ── Verifica permissões ────────────────────────────────────
    if (!isAdmin && !isOwner) {
      const modo = isGroup ? getModoBot(from) : "todos";
      if (modo === "admins" && !PUBLIC_COMMANDS.has(command)) return;
      if (modo === "todos"  && !PUBLIC_COMMANDS.has(command)) return;
    }

    const ctx = {
      sock, msg, from, sender, args, body,
      isGroup, isAdmin, isBotAdmin, isOwner, groupMeta, store, config,
      reply: async (text, opts = {}) =>
        sock.sendMessage(from, { text, ...opts }, { quoted: msg }),
    };

    await routeCommand(command, ctx);

  } catch (err) {
    console.error("❌ Handler:", err.message);
  }
}

async function routeCommand(command, ctx) {
  const routes = {
    lutchi:          () => infoCommands.lutchi(ctx),
    menu:            () => infoCommands.menu(ctx),
    ping:            () => infoCommands.ping(ctx),
    info:            () => infoCommands.info(ctx),
    link:            () => infoCommands.link(ctx),
    regras:          () => infoCommands.regras(ctx),
    setregras:       () => infoCommands.setregras(ctx),
    sticker:         () => infoCommands.sticker(ctx),
    dono:            () => infoCommands.dono(ctx),
    sobre:           () => infoCommands.sobre(ctx),
    ban:             () => adminCommands.ban(ctx),
    kick:            () => adminCommands.kick(ctx),
    add:             () => adminCommands.add(ctx),
    promover:        () => adminCommands.promover(ctx),
    rebaixar:        () => adminCommands.rebaixar(ctx),
    todos:           () => adminCommands.todos(ctx),
    fechar:          () => adminCommands.fechar(ctx),
    abrir:           () => adminCommands.abrir(ctx),
    nome:            () => adminCommands.nome(ctx),
    desc:            () => adminCommands.desc(ctx),
    foto:            () => adminCommands.foto(ctx),
    warn:            () => modCommands.warn(ctx),
    warnings:        () => modCommands.warnings(ctx),
    resetwarn:       () => modCommands.resetwarn(ctx),
    mute:            () => modCommands.mute(ctx),
    unmute:          () => modCommands.unmute(ctx),
    antilink:        () => modCommands.antilink(ctx),
    antiflood:       () => modCommands.antiflood(ctx),
    banword:         () => modCommands.banword(ctx),
    delbanword:      () => modCommands.delbanword(ctx),
    limparbanword:   () => modCommands.limparbanword(ctx),
    ligarbot:        () => modCommands.ligarbot(ctx),
    desligarbot:     () => modCommands.desligarbot(ctx),
    modobot:         () => modCommands.modobot(ctx),
    boasvindas:      () => modCommands.boasvindas(ctx),
    antimention:     () => modCommands.antimention(ctx),
    antistatus:      () => modCommands.antistatus(ctx),
    anticall:        () => modCommands.anticall(ctx),
    anuncio:         () => anuncioCommands.anuncio(ctx),
    debate:          () => debateCommands.debate(ctx),
    novotema:        () => debateCommands.novotema(ctx),
    temadebate:      () => debateCommands.temadebate(ctx),
    favor:           () => debateCommands.votoFavor(ctx),
    contra:          () => debateCommands.votoContra(ctx),
    votos:           () => debateCommands.verVotos(ctx),
    fimdebate:       () => debateCommands.fimDebate(ctx),
    agendarmsg:      () => extrasCommands.agendarmsg(ctx),
    marcar:          () => extrasCommands.marcar(ctx),
    marcaradmin:     () => extrasCommands.marcaradmin(ctx),
    hidetag:         () => extrasCommands.hidetag(ctx),
    redefinirlink:   () => extrasCommands.redefinirlink(ctx),
    antisticker:     () => extrasCommands.antisticker(ctx),
    antiaudio:       () => extrasCommands.antiaudio(ctx),
    antimage:        () => extrasCommands.antimage(ctx),
    antivideo:       () => extrasCommands.antivideo(ctx),
    antidocumento:   () => extrasCommands.antidocumento(ctx),
    whitelist:       () => extrasCommands.whitelist(ctx),
    verwhitelist:    () => extrasCommands.verwhitelist(ctx),
    delwhitelist:    () => extrasCommands.delwhitelist(ctx),
    blacklist:       () => extrasCommands.blacklist(ctx),
    verblacklist:    () => extrasCommands.verblacklist(ctx),
    delblacklist:    () => extrasCommands.delblacklist(ctx),
    wame:            () => extrasCommands.wame(ctx),
    sistema:         () => extrasCommands.sistema(ctx),
    reportar:        () => extrasCommands.reportar(ctx),
    wallpaper:       () => downloadCommands.wallpaper(ctx),
    play:            () => downloadCommands.play(ctx),
    playvid:         () => downloadCommands.playvid(ctx),
    youtube:         () => downloadCommands.youtube(ctx),
    tiktok:          () => downloadCommands.tiktok(ctx),
    tiktokmp3:       () => downloadCommands.tiktokmp3(ctx),
    instagram:       () => downloadCommands.instagram(ctx),
    facebook:        () => downloadCommands.facebook(ctx),
    twitter:         () => downloadCommands.twitter(ctx),
    kwai:            () => downloadCommands.kwai(ctx),
    spotify:         () => downloadCommands.spotify(ctx),
    spotifysearch:   () => downloadCommands.spotifysearch(ctx),
    soundcloud:      () => downloadCommands.soundcloud(ctx),
    mediafire:       () => downloadCommands.mediafire(ctx),
    pinterest:       () => downloadCommands.pinterest(ctx),
    tomp3:           () => downloadCommands.tomp3(ctx),
    tts:             () => downloadCommands.tts(ctx),
    revelarft:       () => downloadCommands.revelarft(ctx),
    clonar:          () => downloadCommands.clonar(ctx),
    shazam:          () => downloadCommands.shazam(ctx),
    toimg:           () => stickerCommands.toimg(ctx),
    togif:           () => stickerCommands.togif(ctx),
    attp:            () => stickerCommands.attp(ctx),
    ttp:             () => stickerCommands.ttp(ctx),
    brat:            () => stickerCommands.brat(ctx),
    emojimix:        () => stickerCommands.emojimix(ctx),
    stickerinfo:     () => stickerCommands.stickerinfo(ctx),
    gerarlink:       () => stickerCommands.gerarlink(ctx),
    wikipedia:       () => pesquisaCommands.wikipedia(ctx),
    traduzir:        () => pesquisaCommands.traduzir(ctx),
    clima:           () => pesquisaCommands.clima(ctx),
    dicionario:      () => pesquisaCommands.dicionario(ctx),
    noticias:        () => pesquisaCommands.noticias(ctx),
    movie:           () => pesquisaCommands.movie(ctx),
    serie:           () => pesquisaCommands.serie(ctx),
    receita:         () => pesquisaCommands.receita(ctx),
    chatgpt:         () => pesquisaCommands.chatgpt(ctx),
    signo:           () => pesquisaCommands.signo(ctx),
    obesidade:       () => pesquisaCommands.obesidade(ctx),
    flagpedia:       () => pesquisaCommands.flagpedia(ctx),
    tinyurl:         () => pesquisaCommands.tinyurl(ctx),
    googlesrc:       () => pesquisaCommands.googlesrc(ctx),
    gimage:          () => pesquisaCommands.gimage(ctx),
    dado:            () => brincadeiraCommands.dado(ctx),
    flip:            () => brincadeiraCommands.flip(ctx),
    sorteio:         () => brincadeiraCommands.sorteio(ctx),
    enquete:         () => brincadeiraCommands.enquete(ctx),
    citar:           () => brincadeiraCommands.citar(ctx),
    cantadas:        () => brincadeiraCommands.cantadas(ctx),
    conselhos:       () => brincadeiraCommands.conselhos(ctx),
    conselhobiblico: () => brincadeiraCommands.conselhobiblico(ctx),
    spoiler:         () => brincadeiraCommands.spoiler(ctx),
    fazernick:       () => brincadeiraCommands.fazernick(ctx),
    calcular:        () => brincadeiraCommands.calcular(ctx),
    letramusica:     () => brincadeiraCommands.letramusica(ctx),
    perfil:          () => brincadeiraCommands.perfil(ctx),
    tabela:          () => brincadeiraCommands.tabela(ctx),
    ddd:             () => brincadeiraCommands.ddd(ctx),
  };

  // Adiciona comandos opcionais se existirem
  if (ownerCommands.handleOwner) routes["owner"] = () => ownerCommands.handleOwner(ctx);
  if (bacboCommands.bacbo)       routes["bacbo"]  = () => bacboCommands.bacbo(ctx);

  const handler = routes[command];
  if (handler) return handler();

  if (ctx.isAdmin || ctx.isOwner) {
    await ctx.reply(`❌ Comando *${config.prefix}${command}* não encontrado!\n\n📋 *${config.prefix}lutchi* para ver o menu.`);
  }
}

async function passiveModeration(sock, msg, from, sender, body, messageContent) {
  const senderNum = normalizeId(sender);

  if (isMuted(from, sender)) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    return;
  }

  if (extrasCommands.isBlacklisted?.(from, sender)) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    global.bannedByBot?.add(sender);
    await sock.groupParticipantsUpdate(from, [sender], "remove").catch(() => {});
    return;
  }

  if (extrasCommands.isAntiSticker?.(from) && messageContent?.stickerMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `🎭 @${senderNum} stickers não são permitidos!`, mentions: [sender] });
    return;
  }

  if (extrasCommands.isAntiAudio?.(from) && messageContent?.audioMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `🎵 @${senderNum} áudios não são permitidos!`, mentions: [sender] });
    return;
  }

  if (extrasCommands.isAntiImage?.(from) && messageContent?.imageMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `🖼️ @${senderNum} imagens não são permitidas!`, mentions: [sender] });
    return;
  }

  if (extrasCommands.isAntiVideo?.(from) && messageContent?.videoMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `🎬 @${senderNum} vídeos não são permitidos!`, mentions: [sender] });
    return;
  }

  if (extrasCommands.isAntiDoc?.(from) && messageContent?.documentMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `📄 @${senderNum} documentos não são permitidos!`, mentions: [sender] });
    return;
  }

  if (getAntiLink(from) && /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi.test(body)) {
    if (extrasCommands.isWhitelisted?.(from, sender)) return;

    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});

    let isAdmin = false, groupMeta = null;
    try {
      groupMeta = await getGroupMeta(sock, from);
      isAdmin   = groupMeta?.participants.filter((p) => p.admin).some((p) => normalizeId(p.id) === senderNum);
    } catch (_) {}

    if (isAdmin) {
      await sock.sendMessage(from, { text: `⚠️ @${senderNum} anti-link ativo!`, mentions: [sender] });
      return;
    }

    let banJid = sender;
    if (groupMeta) {
      for (const p of groupMeta.participants) {
        if (normalizeId(p.id) === senderNum && p.id.endsWith("@s.whatsapp.net")) {
          banJid = p.id; break;
        }
      }
    }

    global.bannedByBot?.add(banJid);
    global.bannedByBot?.add(sender);

    await sock.sendMessage(from, {
      text: `🚫 *ANTI-LINK*\n\n@${senderNum} foi *banido* por enviar um link!`,
      mentions: [sender],
    });
    await sock.groupParticipantsUpdate(from, [banJid], "remove").catch(() => {});
    return;
  }

  if (getAntiMention?.(from)) {
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentions.length > 0) {
      let gmeta = null;
      try { gmeta = await getGroupMeta(sock, from); } catch (_) {}
      if (gmeta) {
        const adminIds = gmeta.participants.filter((p) => p.admin).map((p) => normalizeId(p.id));
        const ownerNum = config.owner.number;
        const senderIsAdmin = adminIds.includes(senderNum);
        if (!senderIsAdmin) {
          const hitAdmin = mentions.some((m) => adminIds.includes(normalizeId(m)) || normalizeId(m) === ownerNum);
          if (hitAdmin) {
            await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
            let banJid = sender;
            for (const pt of gmeta.participants) {
              if (normalizeId(pt.id) === senderNum && pt.id.endsWith("@s.whatsapp.net")) { banJid = pt.id; break; }
            }
            global.bannedByBot?.add(banJid);
            global.bannedByBot?.add(sender);
            await sock.sendMessage(from, {
              text: `🚫 *ANTI-MENTION*\n\n@${senderNum} foi *banido* por mencionar um administrador!`,
              mentions: [sender],
            });
            await sock.groupParticipantsUpdate(from, [banJid], "remove").catch(() => {});
            return;
          }
        }
      }
    }
  }

  if (getAntiFlood(from)) {
    const key = `${from}:${sender}`, now = Date.now();
    if (!floodTracker[key]) floodTracker[key] = [];
    floodTracker[key] = floodTracker[key].filter((t) => now - t < 5000);
    floodTracker[key].push(now);
    if (floodTracker[key].length > config.floodLimit) {
      await sock.sendMessage(from, { text: `⚠️ @${senderNum} pare de fazer flood!`, mentions: [sender] });
      floodTracker[key] = [];
    }
  }

  const banwords = getBanwords(from);
  if (banwords.length && banwords.some((w) => body.toLowerCase().includes(w))) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `⚠️ @${senderNum} palavra proibida!`, mentions: [sender] });
  }
}

module.exports = messageHandler;
