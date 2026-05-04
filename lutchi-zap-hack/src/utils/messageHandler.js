const config = require("../config/config");
const { getAntiLink, getAntiFlood, getBanwords, isMuted } = require("./database");

const infoCommands        = require("../commands/info");
const adminCommands       = require("../commands/admin");
const modCommands         = require("../commands/mod");
const downloadCommands    = require("../commands/downloads");
const stickerCommands     = require("../commands/stickers");
const pesquisaCommands    = require("../commands/pesquisas");
const brincadeiraCommands = require("../commands/brincadeiras");
const extrasCommands      = require("../commands/extras");
const debateCommands    = require("../commands/debate");
const ownerCommands       = require("../commands/owner");

const floodTracker = {};

const PUBLIC_COMMANDS = new Set([
  "lutchi", "menu", "ping", "dono", "sobre",
  "dado", "flip", "citar", "conselhos", "conselhobiblico",
  "cantadas", "spoiler", "fazernick", "calcular",
  "letramusica", "tabela", "signo", "obesidade",
  "clima", "traduzir", "wikipedia", "dicionario",
  "tinyurl", "googlesrc", "gimage", "wame", "sistema", "temadebate", "favor", "contra", "votos",
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
  const senderNorm = normalizeId(sender);

  // Comparação direta com número de telefone
  if (senderNorm === ownerPhone) return true;
  if (sender.includes(ownerPhone)) return true;

  // Verificar via participantes do grupo (resolver LID -> número)
  if (groupMeta) {
    for (const p of groupMeta.participants) {
      const pPhone = normalizeId(p.id);
      const pLid   = p.lidJid ? normalizeId(p.lidJid) : null;

      // O remetente é este participante? (por número ou por LID)
      const isSender =
        pPhone === senderNorm ||
        (pLid && pLid === senderNorm) ||
        p.id.includes(senderNorm) ||
        (p.lidJid && p.lidJid.includes(senderNorm));

      if (isSender) {
        // Este participante é o dono?
        if (pPhone === ownerPhone) return true;
        if (p.id.includes(ownerPhone)) return true;
      }
    }
  }

  // Verificar LID do dono salvo no config
  const ownerLid = config.owner.lid;
  if (ownerLid && senderNorm === normalizeId(ownerLid)) return true;

  // Verificar se o sender LID corresponde ao dono via sock.user
  // O LID do dono é salvo no primeiro login
  const ownerLidKey = 'ownerLid';
  try {
    const db = require('./database');
    const savedLid = db.getOwnerLid ? db.getOwnerLid() : null;
    if (savedLid && senderNorm === normalizeId(savedLid)) return true;
  } catch (_) {}

  return false;
}

// Extrai o texto da mensagem em qualquer formato do Baileys
function extractBody(msg) {
  const m = msg.message;
  if (!m) return "";
  return (
    m?.conversation ||
    m?.extendedTextMessage?.text ||
    m?.imageMessage?.caption ||
    m?.videoMessage?.caption ||
    m?.documentMessage?.caption ||
    m?.buttonsResponseMessage?.selectedButtonId ||
    m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    m?.templateButtonReplyMessage?.selectedId ||
    m?.ephemeralMessage?.message?.conversation ||
    m?.ephemeralMessage?.message?.extendedTextMessage?.text ||
    m?.viewOnceMessage?.message?.conversation ||
    m?.viewOnceMessage?.message?.extendedTextMessage?.text ||
    m?.documentWithCaptionMessage?.message?.documentMessage?.caption ||
    m?.editedMessage?.message?.protocolMessage?.editedMessage?.conversation ||
    m?.editedMessage?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text ||
    ""
  );
}

async function messageHandler(sock, msg, store) {
  try {
    const messageContent = msg.message;
    if (!messageContent) return;

    const isGroup = msg.key.remoteJid.endsWith("@g.us");
    const from    = msg.key.remoteJid;
    const sender  = isGroup ? msg.key.participant || msg.key.remoteJid : msg.key.remoteJid;

    const body = extractBody(msg);

    console.log("📨 MSG:", JSON.stringify({ from, fromMe: msg.key.fromMe, body }));

    if (!body.startsWith(config.prefix)) {
      if (isGroup) await passiveModeration(sock, msg, from, sender, body, messageContent);
      return;
    }

    const args    = body.slice(config.prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    console.log("⚡ Comando:", command, "| Args:", args);

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

    console.log("👤 isAdmin:", isAdmin, "| isOwner:", isOwner, "| isGroup:", isGroup);
    console.log("🔍 sender:", sender, "| normalizado:", normalizeId(sender));

    if (isGroup && !isAdmin && !isOwner) {
      if (!PUBLIC_COMMANDS.has(command)) {
        console.log("🚫 Bloqueado para membro normal:", command);
        return;
      }
    }

    const ctx = {
      sock, msg, from, sender, args, body,
      isGroup, isAdmin, isBotAdmin, isOwner, groupMeta, store, config,
      reply: async (text, opts = {}) =>
        sock.sendMessage(from, { text, ...opts }, { quoted: msg }),
    };

    await routeCommand(command, ctx);
  } catch (err) {
    console.error("❌ Erro no handler:", err.message, err.stack);
  }
}

const debateAtivo = new Map();

async function routeCommand(command, ctx) {
  const routes = {
    ligarbot:        () => ownerCommands.ligarbot(ctx),
    desligarbot:     () => ownerCommands.desligarbot(ctx),
    modobot:         () => ownerCommands.modobot(ctx),
    lutchi:          () => infoCommands.lutchi(ctx),
    menu:            () => infoCommands.menu(ctx),
    ping:            () => infoCommands.ping(ctx),
    info:            () => infoCommands.info(ctx),
    link:            () => infoCommands.link(ctx),
    regras:          () => infoCommands.regras(ctx),
    setregras:       () => infoCommands.setregras(ctx),
    sticker:         () => stickerCommands.sticker(ctx),
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
    revogar:         () => adminCommands.revogar(ctx),
    apagar:          () => adminCommands.apagar(ctx),
    boasvindas:      () => adminCommands.boasvindas(ctx),
    clonar:          () => adminCommands.clonar(ctx),
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
    debate:          () => debateCommands.debate(ctx),
    favor:           () => debateCommands.votoFavor(ctx),
    novotema:        () => debateCommands.novotema(ctx),
    temadebate:      () => debateCommands.temadebate(ctx),
    contra:          () => debateCommands.votoContra(ctx),
    votos:           () => debateCommands.verVotos(ctx),
    fimdebate:       () => debateCommands.fimDebate(ctx),
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

  const handler = routes[command];
  if (handler) return handler();
  if (ctx.isAdmin || ctx.isOwner) {
    await ctx.reply(`❌ Comando *${config.prefix}${command}* não encontrado!\n\nDigite *${config.prefix}lutchi* para ver o menu.`);
  }
}

async function passiveModeration(sock, msg, from, sender, body, messageContent) {
  const senderNum = normalizeId(sender);

  if (isMuted(from, sender)) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    return;
  }

  if (extrasCommands.isBlacklisted(from, sender)) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    global.bannedByBot?.add(sender);
    await sock.groupParticipantsUpdate(from, [sender], "remove").catch(() => {});
    return;
  }

  if (extrasCommands.isAntiSticker(from) && messageContent?.stickerMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `🎭 @${senderNum} stickers não são permitidos!`, mentions: [sender] });
    return;
  }

  if (extrasCommands.isAntiAudio(from) && messageContent?.audioMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `🎵 @${senderNum} áudios não são permitidos!`, mentions: [sender] });
    return;
  }

  if (extrasCommands.isAntiImage(from) && messageContent?.imageMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `🖼️ @${senderNum} imagens não são permitidas!`, mentions: [sender] });
    return;
  }

  if (extrasCommands.isAntiVideo(from) && messageContent?.videoMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `🎬 @${senderNum} vídeos não são permitidos!`, mentions: [sender] });
    return;
  }

  if (extrasCommands.isAntiDoc(from) && messageContent?.documentMessage) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `📄 @${senderNum} documentos não são permitidos!`, mentions: [sender] });
    return;
  }

  if (getAntiLink(from) && /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi.test(body)) {
    if (extrasCommands.isWhitelisted(from, sender)) return;
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});

    let isAdmin = false, groupMeta = null;
    try {
      groupMeta = await sock.groupMetadata(from);
      isAdmin = groupMeta.participants.filter((p) => p.admin).some((p) => normalizeId(p.id) === senderNum);
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
    await sock.sendMessage(from, { text: `🚫 *ANTI-LINK*\n\n@${senderNum} foi *banido* por enviar link!`, mentions: [sender] });
    await sock.groupParticipantsUpdate(from, [banJid], "remove").catch(() => {});
    return;
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
  if (banwords.length > 0 && banwords.some((w) => body.toLowerCase().includes(w))) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `⚠️ @${senderNum} palavra proibida!`, mentions: [sender] });
  }
}

module.exports = messageHandler;
