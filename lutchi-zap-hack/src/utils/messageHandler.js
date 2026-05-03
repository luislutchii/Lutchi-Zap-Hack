const config = require("../config/config");
const { getAntiLink, getAntiFlood, getBanwords, isMuted } = require("./database");

const infoCommands    = require("../commands/info");
const adminCommands   = require("../commands/admin");
const modCommands     = require("../commands/mod");
const downloadCommands = require("../commands/downloads");
const stickerCommands = require("../commands/stickers");
const pesquisaCommands = require("../commands/pesquisas");
const brincadeiraCommands = require("../commands/brincadeiras");
const extrasCommands  = require("../commands/extras");

const floodTracker = {};

function normalizeId(jid = "") {
  return jid.replace(/:.*@/, "@").replace(/@.*/, "");
}

function matchParticipant(participantId, phoneNum, lidNum) {
  const pNum = normalizeId(participantId);
  return pNum === phoneNum || (lidNum && pNum === lidNum);
}

function checkIsOwner(sender, groupMeta) {
  const ownerPhone = config.owner.number;
  if (sender.includes(ownerPhone)) return true;
  if (groupMeta) {
    const senderNum = normalizeId(sender);
    for (const p of groupMeta.participants) {
      if (normalizeId(p.id) === senderNum) {
        if (p.id.includes(ownerPhone)) return true;
        if (p.lidJid && p.lidJid.includes(ownerPhone)) return true;
      }
    }
  }
  return false;
}

async function messageHandler(sock, msg, store) {
  try {
    const messageContent = msg.message;
    if (!messageContent) return;

    const isGroup = msg.key.remoteJid.endsWith("@g.us");
    const from    = msg.key.remoteJid;
    const sender  = isGroup ? msg.key.participant || msg.key.remoteJid : msg.key.remoteJid;

    let body =
      messageContent?.conversation ||
      messageContent?.extendedTextMessage?.text ||
      messageContent?.imageMessage?.caption ||
      messageContent?.videoMessage?.caption || "";

    if (!body.startsWith(config.prefix)) {
      if (isGroup) await passiveModeration(sock, msg, from, sender, body, messageContent);
      return;
    }

    const args    = body.slice(config.prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    let groupMeta = null, isAdmin = false, isBotAdmin = false;
    if (isGroup) {
      groupMeta = await sock.groupMetadata(from).catch(() => null);
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

    if (!isAdmin && !isOwner) {
      return sock.sendMessage(from, {
        text: `❌ Apenas *administradores* ou o *dono do bot* podem usar comandos!`,
      }, { quoted: msg });
    }

    const ctx = {
      sock, msg, from, sender, args, body,
      isGroup, isAdmin, isBotAdmin, isOwner, groupMeta, store, config,
      reply: async (text, opts = {}) =>
        sock.sendMessage(from, { text, ...opts }, { quoted: msg }),
    };

    await routeCommand(command, ctx);
  } catch (err) { console.error("❌ Erro no handler:", err); }
}

async function routeCommand(command, ctx) {
  const routes = {
    // ── Info ────────────────────────────────────────────────
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
    // ── Admin ───────────────────────────────────────────────
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
    // ── Moderação ───────────────────────────────────────────
    warn:            () => modCommands.warn(ctx),
    warnings:        () => modCommands.warnings(ctx),
    resetwarn:       () => modCommands.resetwarn(ctx),
    mute:            () => modCommands.mute(ctx),
    unmute:          () => modCommands.unmute(ctx),
    antilink:        () => modCommands.antilink(ctx),
    antiflood:       () => modCommands.antiflood(ctx),
    banword:         () => modCommands.banword(ctx),
    // ── Extras / Novos ──────────────────────────────────────
    agendarmsg:      () => extrasCommands.agendarmsg(ctx),
    marcar:          () => extrasCommands.marcar(ctx),
    marcaradmin:     () => extrasCommands.marcaradmin(ctx),
    hidetag:         () => extrasCommands.hidetag(ctx),
    excluirinativo:  () => extrasCommands.excluirinativo(ctx),
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
    wallpaper:       () => extrasCommands.wallpaper(ctx),
    wame:            () => extrasCommands.wame(ctx),
    sistema:         () => extrasCommands.sistema(ctx),
    reportar:        () => extrasCommands.reportar(ctx),
    // ── Downloads ───────────────────────────────────────────
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
    // ── Stickers ────────────────────────────────────────────
    toimg:           () => stickerCommands.toimg(ctx),
    togif:           () => stickerCommands.togif(ctx),
    attp:            () => stickerCommands.attp(ctx),
    ttp:             () => stickerCommands.ttp(ctx),
    brat:            () => stickerCommands.brat(ctx),
    emojimix:        () => stickerCommands.emojimix(ctx),
    stickerinfo:     () => stickerCommands.stickerinfo(ctx),
    gerarlink:       () => stickerCommands.gerarlink(ctx),
    // ── Pesquisas ───────────────────────────────────────────
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
    // ── Diversão ────────────────────────────────────────────
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

  const handler = routes[command];
  if (handler) return handler();
  await ctx.reply(`❌ Comando *${config.prefix}${command}* não encontrado!\n\nDigite *${config.prefix}lutchi* para ver o menu.`);
}

async function passiveModeration(sock, msg, from, sender, body, messageContent) {
  const senderNum = normalizeId(sender);

  // ── Mute ─────────────────────────────────────────────────────
  if (isMuted(from, sender)) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    return;
  }

  // ── Blacklist — bane automaticamente ─────────────────────────
  if (extrasCommands.isBlacklisted(from, sender)) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.groupParticipantsUpdate(from, [sender], "remove").catch(() => {});
    return;
  }

  // ── Anti-sticker ─────────────────────────────────────────────
  if (extrasCommands.isAntiSticker(from) && messageContent?.stickerMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `🎭 @${senderNum} stickers não são permitidos!`, mentions: [sender] });
    return;
  }

  // ── Anti-áudio ────────────────────────────────────────────────
  if (extrasCommands.isAntiAudio(from) && messageContent?.audioMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `🎵 @${senderNum} áudios não são permitidos!`, mentions: [sender] });
    return;
  }

  // ── Anti-imagem ───────────────────────────────────────────────
  if (extrasCommands.isAntiImage(from) && messageContent?.imageMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `🖼️ @${senderNum} imagens não são permitidas!`, mentions: [sender] });
    return;
  }

  // ── Anti-vídeo ────────────────────────────────────────────────
  if (extrasCommands.isAntiVideo(from) && messageContent?.videoMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `🎬 @${senderNum} vídeos não são permitidos!`, mentions: [sender] });
    return;
  }

  // ── Anti-documento ────────────────────────────────────────────
  if (extrasCommands.isAntiDoc(from) && messageContent?.documentMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `📄 @${senderNum} documentos não são permitidos!`, mentions: [sender] });
    return;
  }

  // ── Anti-link — apaga + bane (excepto whitelist) ──────────────
  if (getAntiLink(from) && /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi.test(body)) {
    if (extrasCommands.isWhitelisted(from, sender)) return;

    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});

    let isAdmin = false;
    let groupMeta = null;
    try {
      groupMeta = await sock.groupMetadata(from);
      isAdmin = groupMeta.participants
        .filter((p) => p.admin)
        .some((p) => normalizeId(p.id) === senderNum);
    } catch (_) {}

    if (isAdmin) {
      await sock.sendMessage(from, {
        text: `⚠️ @${senderNum} anti-link ativo! Links não são permitidos.`,
        mentions: [sender],
      });
      return;
    }

    let banJid = sender;
    if (groupMeta) {
      for (const p of groupMeta.participants) {
        if (normalizeId(p.id) === senderNum && p.id.endsWith("@s.whatsapp.net")) {
          banJid = p.id;
          break;
        }
      }
    }

    await sock.sendMessage(from, {
      text: `🚫 *ANTI-LINK*\n\n@${senderNum} foi *banido* por enviar um link!`,
      mentions: [sender],
    });
    await sock.groupParticipantsUpdate(from, [banJid], "remove").catch(() => {});
    return;
  }

  // ── Anti-flood ────────────────────────────────────────────────
  if (getAntiFlood(from)) {
    const key = `${from}:${sender}`, now = Date.now();
    if (!floodTracker[key]) floodTracker[key] = [];
    floodTracker[key] = floodTracker[key].filter((t) => now - t < 5000);
    floodTracker[key].push(now);
    if (floodTracker[key].length > config.floodLimit) {
      await sock.sendMessage(from, {
        text: `⚠️ @${senderNum} pare de fazer flood!`,
        mentions: [sender],
      });
      floodTracker[key] = [];
    }
  }

  // ── Palavras banidas ──────────────────────────────────────────
  const banwords = getBanwords(from);
  if (banwords.length > 0 && banwords.some((w) => body.toLowerCase().includes(w))) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, {
      text: `⚠️ @${senderNum} palavra proibida!`,
      mentions: [sender],
    });
  }
}

module.exports = messageHandler;
