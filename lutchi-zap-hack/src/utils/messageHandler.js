const config = require("../config/config");
const { getAntiLink, getAntiFlood, getBanwords, isMuted } = require("./database");

const infoCommands = require("../commands/info");
const adminCommands = require("../commands/admin");
const modCommands = require("../commands/mod");
const downloadCommands = require("../commands/downloads");
const stickerCommands = require("../commands/stickers");
const pesquisaCommands = require("../commands/pesquisas");
const brincadeiraCommands = require("../commands/brincadeiras");

const floodTracker = {};

function normalizeId(jid) {
  if (!jid) return "";
  return jid.replace(/:.*@/, "@").replace(/@.*/, "").trim();
}

async function messageHandler(sock, msg, store) {
  try {
    const messageContent = msg.message;
    if (!messageContent) return;

    const isGroup = msg.key.remoteJid.endsWith("@g.us");
    const from = msg.key.remoteJid;
    const sender = isGroup
      ? msg.key.participant || msg.key.remoteJid
      : msg.key.remoteJid;

    let body =
      messageContent?.conversation ||
      messageContent?.extendedTextMessage?.text ||
      messageContent?.imageMessage?.caption ||
      messageContent?.videoMessage?.caption || "";

    if (!body.startsWith(config.prefix)) {
      if (isGroup) await passiveModeration(sock, msg, from, sender, body);
      return;
    }

    const args = body.slice(config.prefix.length).trim().split(/\s+/);
    const command = args[0].toLowerCase();
    args.shift();

    let groupMeta = null;
    let isAdmin = false;
    let isBotAdmin = false;

    if (isGroup) {
      groupMeta = await sock.groupMetadata(from).catch(() => null);
      if (groupMeta) {
        const senderPhone = normalizeId(sender);
        const senderLid = normalizeId(msg.key?.participant || "");
        const botPhone = normalizeId(sock.user?.id || "");
        const botLid = normalizeId(sock.user?.lid || "");

        isAdmin = groupMeta.participants
          .filter((p) => p.admin)
          .some((p) => {
            const pNum = normalizeId(p.id);
            return pNum === senderPhone || pNum === senderLid ||
              (p.lid && normalizeId(p.lid) === senderPhone) ||
              (p.lid && normalizeId(p.lid) === senderLid);
          });

        isBotAdmin = groupMeta.participants
          .filter((p) => p.admin)
          .some((p) => {
            const pNum = normalizeId(p.id);
            return pNum === botPhone || pNum === botLid ||
              (p.lid && normalizeId(p.lid) === botPhone) ||
              (p.lid && normalizeId(p.lid) === botLid);
          });
      }
    }

    const isOwner =
      normalizeId(sender) === normalizeId(config.owner.number + "@s.whatsapp.net") ||
      sender.includes(config.owner.number);

    if (!isAdmin && !isOwner) {
      return sock.sendMessage(from, {
        text: "❌ Apenas *administradores* ou o *dono do bot* podem usar comandos!",
      }, { quoted: msg });
    }

    const ctx = {
      sock, msg, from, sender, args, body,
      isGroup, isAdmin, isBotAdmin, isOwner, groupMeta, store, config,
      reply: async (text) => sock.sendMessage(from, { text }, { quoted: msg }),
    };

    await routeCommand(command, ctx);
  } catch (err) {
    console.error("❌ Erro no handler:", err);
  }
}

async function routeCommand(command, ctx) {
  const routes = {
    // ── Info ──
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

    // ── Admin membros ──
    ban:             () => adminCommands.ban(ctx),
    kick:            () => adminCommands.kick(ctx),
    add:             () => adminCommands.add(ctx),
    promover:        () => adminCommands.promover(ctx),
    rebaixar:        () => adminCommands.rebaixar(ctx),
    todos:           () => adminCommands.todos(ctx),
    apagar:          () => adminCommands.apagar(ctx),
    revogar:         () => adminCommands.revogar(ctx),

    // ── Grupo ──
    fechar:          () => adminCommands.fechar(ctx),
    abrir:           () => adminCommands.abrir(ctx),
    nome:            () => adminCommands.nome(ctx),
    desc:            () => adminCommands.desc(ctx),
    foto:            () => adminCommands.foto(ctx),

    // ── Moderação ──
    warn:            () => modCommands.warn(ctx),
    warnings:        () => modCommands.warnings(ctx),
    resetwarn:       () => modCommands.resetwarn(ctx),
    mute:            () => modCommands.mute(ctx),
    unmute:          () => modCommands.unmute(ctx),
    antilink:        () => modCommands.antilink(ctx),
    antiflood:       () => modCommands.antiflood(ctx),
    banword:         () => modCommands.banword(ctx),

    // ── Downloads ──
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

    // ── Stickers ──
    toimg:           () => stickerCommands.toimg(ctx),
    togif:           () => stickerCommands.togif(ctx),
    attp:            () => stickerCommands.attp(ctx),
    ttp:             () => stickerCommands.ttp(ctx),
    brat:            () => stickerCommands.brat(ctx),
    emojimix:        () => stickerCommands.emojimix(ctx),
    stickerinfo:     () => stickerCommands.stickerinfo(ctx),
    gerarlink:       () => stickerCommands.gerarlink(ctx),

    // ── Pesquisas ──
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

    // ── Diversão ──
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

async function passiveModeration(sock, msg, from, sender, body) {
  if (isMuted(from, sender)) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    return;
  }
  if (getAntiLink(from) && /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi.test(body)) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, {
      text: "⚠️ @" + sender.split("@")[0] + " links não são permitidos!",
      mentions: [sender],
    });
    return;
  }
  if (getAntiFlood(from)) {
    const key = from + ":" + sender;
    const now = Date.now();
    if (!floodTracker[key]) floodTracker[key] = [];
    floodTracker[key] = floodTracker[key].filter((t) => now - t < 5000);
    floodTracker[key].push(now);
    if (floodTracker[key].length > config.floodLimit) {
      await sock.sendMessage(from, {
        text: "⚠️ @" + sender.split("@")[0] + " pare de fazer flood!",
        mentions: [sender],
      });
      floodTracker[key] = [];
    }
  }
  const banwords = getBanwords(from);
  if (banwords.length > 0 && banwords.some((w) => body.toLowerCase().includes(w))) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, {
      text: "⚠️ @" + sender.split("@")[0] + " palavra proibida!",
      mentions: [sender],
    });
  }
}

module.exports = messageHandler;
