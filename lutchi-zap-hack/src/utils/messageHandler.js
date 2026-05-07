
const groupMetaCache = new Map();
const GROUP_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function getGroupMeta(sock, groupId) {
  const cached = groupMetaCache.get(groupId);
  if (cached && Date.now() - cached.ts < GROUP_CACHE_TTL) return cached.data;
  const meta = await sock.groupMetadata(groupId).catch(() => null);
  if (meta) groupMetaCache.set(groupId, { data: meta, ts: Date.now() });
  return meta;
}
const config = require("../config/config");
const { getAntiLink, getAntiFlood, getBanwords, isMuted, getAntiMention, isUserAdmin } = require("./database");

const infoCommands     = require("../commands/info");
const adminCommands    = require("../commands/admin");
const modCommands      = require("../commands/mod");
const downloadCommands = require("../commands/downloads");
const stickerCommands  = require("../commands/stickers");
const pesquisaCommands = require("../commands/pesquisas");
const brincadeiraCommands = require("../commands/brincadeiras");
const ownerCommands    = require("../commands/owner");
const extrasCommands      = require("../commands/extras");
const debateCommands      = require("../commands/debate");
const anuncioCommands     = require("../commands/anuncio");

const floodTracker = {};

const PUBLIC_COMMANDS = new Set([
  "lutchi", "menu", "ping", "dono", "sobre",
  "dado", "flip", "citar", "conselhos", "conselhobiblico",
  "cantadas", "spoiler", "fazernick", "calcular",
  "letramusica", "tabela", "signo", "obesidade",
  "clima", "traduzir", "wikipedia", "dicionario",
  "tinyurl", "googlesrc", "gimage", "wame", "sistema",
  "temadebate", "favor", "contra", "votos", "fimdebate", "novotema",
  "anuncio",
]);

function normalizeId(jid) {
  if (!jid) return "";
  return jid.replace(/:.*@/, "@").replace(/@.*/, "").trim();
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
      const pPhone = normalizeId(p.id);
      const pLid   = p.lidJid ? normalizeId(p.lidJid) : null;
      const isSender = pPhone === senderNorm || (pLid && pLid === senderNorm);
      if (isSender) {
        if (pPhone === ownerPhone) return true;
        if (p.id.includes(ownerPhone)) return true;
      }
    }
  }
  return false;
}

function extractBody(msg) {
  const m = msg.message;
  if (!m) return "";
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
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
    const body    = extractBody(msg);

    if (!body.startsWith(config.prefix)) {
      if (isGroup) await passiveModeration(sock, msg, from, sender, body, messageContent);
      return;
    }

    const args    = body.slice(config.prefix.length).trim().split(/\s+/);
    const command = args[0].toLowerCase();
    args.shift();

    let groupMeta = null, isAdmin = false, isBotAdmin = false;
    if (isGroup) {
      groupMeta = await getGroupMeta(sock, from);
      if (groupMeta) {
        const senderPhone = normalizeId(sender);
        const botPhone    = normalizeId(sock.user?.id ?? "");
        const senderLid   = normalizeId(msg.key?.participant ?? "");
        const botLid      = normalizeId(sock.user?.lid ?? "");
        const admins      = groupMeta.participants.filter(p => p.admin);
        isAdmin    = admins.some(p => matchParticipant(p.id, senderPhone, senderLid));
        isBotAdmin = admins.some(p => matchParticipant(p.id, botPhone, botLid));
      }
    }

    const isOwner = checkIsOwner(sender, groupMeta);

    if (isGroup && !isAdmin && !isOwner) return;

    const ctx = {
      sock, msg, from, sender, args, body,
      isGroup, isAdmin, isBotAdmin, isOwner, groupMeta, store, config,
      reply: async (text, opts = {}) =>
        sock.sendMessage(from, { text, ...opts }, { quoted: msg }),
    };

    try {
      await sock.sendMessage(from, {
        react: { text: "✅", key: msg.key }
      });
    } catch (_) {}

    await routeCommand(command, ctx);
  } catch (err) {
    console.error("❌ Erro no handler:", err.message);
  }
}

async function routeCommand(command, ctx) {
  const routes = {
    anuncio:         () => anuncioCommands.anuncio(ctx),
    debate:          () => debateCommands.debate(ctx),
    favor:           () => debateCommands.votoFavor(ctx),
    contra:          () => debateCommands.votoContra(ctx),
    votos:           () => debateCommands.verVotos(ctx),
    fimdebate:       () => debateCommands.fimDebate(ctx),
    novotema:        () => debateCommands.novotema(ctx),
    temadebate:      () => debateCommands.temadebate(ctx),
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
    apagar:          () => adminCommands.apagar(ctx),
    revogar:         () => adminCommands.revogar(ctx),
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
    antimention:     () => modCommands.antimention(ctx),
    antistatus:      () => modCommands.antistatus(ctx),
    anticall:        () => modCommands.anticall(ctx),
    banword:         () => modCommands.banword(ctx),
    delbanword:      () => modCommands.delbanword ? modCommands.delbanword(ctx) : ctx.reply("🔧 Em breve!"),
    limparbanword:   () => modCommands.limparbanword ? modCommands.limparbanword(ctx) : ctx.reply("🔧 Em breve!"),
    boasvindas:      () => modCommands.boasvindas(ctx),
    ligarbot:        () => ownerCommands.ligarbot(ctx),
    desligarbot:     () => ownerCommands.desligarbot(ctx),
    modobot:         () => ownerCommands.modobot(ctx),
    play:            () => downloadCommands.play(ctx),
    playvid:         () => downloadCommands.playvid(ctx),
    youtube:         () => downloadCommands.youtube(ctx),
    tiktok:          () => downloadCommands.tiktok(ctx),
    instagram:       () => downloadCommands.instagram(ctx),
    facebook:        () => downloadCommands.facebook(ctx),
    kwai:            () => downloadCommands.kwai(ctx),
    spotify:         () => downloadCommands.spotify(ctx),
    soundcloud:      () => downloadCommands.soundcloud(ctx),
    mediafire:       () => downloadCommands.mediafire(ctx),
    tomp3:           () => downloadCommands.tomp3(ctx),
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
    debate:          () => brincadeiraCommands.debate(ctx),
  };

  const handler = routes[command];
  if (handler) return handler();
  await ctx.reply("❌ Comando *" + command + "* não encontrado!\n\nDigite *" + config.menuPrefix + "* para ver o menu.");
}

async function passiveModeration(sock, msg, from, sender, body, messageContent) {
  try {
    // Anti-mentção a admins
    if (getAntiMention(from)) {
      const groupMeta = await getGroupMeta(sock, from);
      if (groupMeta) {
        const mentioned = messageContent?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
        const mentionedAdmin = mentioned.some(m =>
          admins.some(a => normalizeId(a) === normalizeId(m)) ||
          m.includes(config.owner.number)
        );
        const senderIsAdmin = admins.some(a => normalizeId(a) === normalizeId(sender));
        const senderIsOwner = checkIsOwner(sender, groupMeta);
        if (mentionedAdmin && senderIsAdmin === false && senderIsOwner === false) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
          await sock.groupParticipantsUpdate(from, [sender], "remove").catch(() => {});
          await sock.sendMessage(from, {
            text: "🔨 @" + normalizeId(sender) + " foi banido por mencionar um administrador!",
            mentions: [sender],
          }).catch(() => {});
          return;
        }
      }
    }
  } catch (_) {}

  // Anti-mute
  if (isMuted(from, sender)) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    return;
  }

  // ==============================================================
  // 🔗 ANTI-LINK COM BAN (remove link + expulsa o membro)
  // ==============================================================
  if (getAntiLink(from) && /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi.test(body)) {
    // Obter metadata do grupo para verificar quem é admin
    const groupMeta = await getGroupMeta(sock, from);
    let isAdminUser = false;
    
    if (groupMeta) {
      const senderPhone = normalizeId(sender);
      const senderLid = normalizeId(msg.key?.participant ?? "");
      const admins = groupMeta.participants.filter(p => p.admin);
      isAdminUser = admins.some(p => matchParticipant(p.id, senderPhone, senderLid));
    }
    
    // Se NÃO for administrador, aplica a punição com BAN
    if (!isAdminUser) {
      // 1. Deletar a mensagem com link
      await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
      
      // 2. Banir/Expulsar o membro do grupo
      await sock.groupParticipantsUpdate(from, [sender], "remove").catch(() => {});
      
      // 3. Avisar o grupo sobre o banimento
      await sock.sendMessage(from, {
        text: "🔨 @" + normalizeId(sender) + " foi *BANIDO* por enviar link!\n\n📌 *Regra:* Links não são permitidos para membros comuns.\n👑 *Administradores* estão liberados.",
        mentions: [sender],
      }).catch(() => {});
      
      return;
    }
    // Se for administrador, simplesmente deixa a mensagem passar (não faz nada)
  }

  // Anti-flood
  if (getAntiFlood(from)) {
    const key = from + ":" + sender;
    const now = Date.now();
    if (!floodTracker[key]) floodTracker[key] = [];
    floodTracker[key] = floodTracker[key].filter(t => now - t < 5000);
    floodTracker[key].push(now);
    if (floodTracker[key].length > config.floodLimit) {
      await sock.sendMessage(from, {
        text: "⚠️ @" + normalizeId(sender) + " pare de fazer flood!",
        mentions: [sender],
      });
      floodTracker[key] = [];
    }
  }

  // Banwords
  const banwords = getBanwords(from);
  if (banwords.length > 0 && banwords.some(w => body.toLowerCase().includes(w))) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, {
      text: "⚠️ @" + normalizeId(sender) + " palavra proibida!",
      mentions: [sender],
    });
  }
}

module.exports = messageHandler;
