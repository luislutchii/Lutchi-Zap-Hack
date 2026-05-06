const config = require("../config/config");
const {
  addWarning, getWarnings, resetWarnings,
  muteMember, unmuteMember,
  setAntiLink, getAntiLink,
  setAntiFlood, getAntiFlood,
  addBanword, removeBanword, getBanwords, clearBanwords,
  setBotStatus, getBotStatus,
  setModoBot, getModoBot,
  setBoasVindas, getBoasVindas,
  setAntiMention, getAntiMention,
} = require("../utils/database");

const p = config.prefix;

function getMentioned(msg, args) {
  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentions.length > 0) return mentions;
  if (args[0] && /\d+/.test(args[0])) {
    const num = args[0].replace(/[^0-9]/g, "");
    return [`${num}@s.whatsapp.net`];
  }
  return [];
}

async function warn(ctx) {
  const { sock, from, msg, args, reply } = ctx;
  const mentioned = getMentioned(msg, args);
  if (!mentioned.length) return reply(`❌ Use: ${p}warn @membro`);
  for (const jid of mentioned) {
    const num   = jid.split("@")[0];
    const count = addWarning(from, jid);
    const max   = config.maxWarns;
    if (count >= max) {
      await sock.groupParticipantsUpdate(from, [jid], "remove");
      await reply(`🔨 @${num} atingiu ${max} avisos e foi removido!`, { mentions: [jid] });
    } else {
      await reply(
        `⚠️ *Aviso ${count}/${max}* para @${num}\n` +
        `${"🟥".repeat(count)}${"⬜".repeat(max - count)}\n` +
        `_${max - count} aviso(s) restante(s) para o ban!_`,
        { mentions: [jid] }
      );
    }
  }
}

async function warnings(ctx) {
  const { from, msg, args, reply } = ctx;
  const mentioned = getMentioned(msg, args);
  if (!mentioned.length) return reply(`❌ Use: ${p}warnings @membro`);
  for (const jid of mentioned) {
    const count = getWarnings(from, jid);
    const max   = config.maxWarns;
    await reply(
      `📊 *Avisos de @${jid.split("@")[0]}*\n\n` +
      `${"🟥".repeat(count)}${"⬜".repeat(Math.max(0, max - count))} *${count}/${max}*`,
      { mentions: [jid] }
    );
  }
}

async function resetwarn(ctx) {
  const { from, msg, args, reply } = ctx;
  const mentioned = getMentioned(msg, args);
  if (!mentioned.length) return reply(`❌ Use: ${p}resetwarn @membro`);
  for (const jid of mentioned) {
    resetWarnings(from, jid);
    await reply(`✅ Avisos de *@${jid.split("@")[0]}* zerados!`, { mentions: [jid] });
  }
}

async function mute(ctx) {
  const { from, msg, args, reply } = ctx;
  const mentioned = getMentioned(msg, args);
  if (!mentioned.length) return reply(`❌ Use: ${p}mute @membro 10`);
  let minutes = 10;
  for (const arg of args) {
    if (!isNaN(parseInt(arg))) { minutes = parseInt(arg); break; }
  }
  for (const jid of mentioned) {
    muteMember(from, jid, minutes);
    await reply(
      `🔇 *@${jid.split("@")[0]}* mutado por *${minutes} minuto(s)*!`,
      { mentions: [jid] }
    );
  }
}

async function unmute(ctx) {
  const { from, msg, args, reply } = ctx;
  const mentioned = getMentioned(msg, args);
  if (!mentioned.length) return reply(`❌ Use: ${p}unmute @membro`);
  for (const jid of mentioned) {
    unmuteMember(from, jid);
    await reply(`🔊 *@${jid.split("@")[0]}* desmutado!`, { mentions: [jid] });
  }
}

// 🔗 COMANDO ANTILINK ATUALIZADO COM MENSAGEM DE BAN
async function antilink(ctx) {
  const { from, args, reply, isAdmin } = ctx;
  const option = args[0]?.toLowerCase();
  
  if (!["on", "off"].includes(option)) {
    const status = getAntiLink(from);
    return reply(
      `🔗 *Anti-Link:* ${status ? "✅ Ativado" : "❌ Desativado"}\n\n` +
      `📌 *Regras:*\n` +
      `• ${status ? "⚠️" : "✅"} *Membros comuns* → ${status ? "⚠️ BANIDOS ao enviar links" : "liberados"}\n` +
      `• 👑 *Administradores* → sempre liberados (mesmo com anti-link ativo)\n\n` +
      `Use: *${p}antilink on/off*`
    );
  }
  
  setAntiLink(from, option === "on");
  return reply(
    option === "on"
      ? `🔗 *Anti-Link ativado!* ✅\n\n⚠️ *MEMBROS COMUNS* que enviarem links serão:\n1️⃣ Mensagem deletada\n2️⃣ BANIDOS do grupo\n\n👑 *Administradores* podem enviar links livremente.`
      : `🔗 *Anti-Link desativado!* ❌\n_Todos os membros (incluindo comuns) podem enviar links._`
  );
}

async function antiflood(ctx) {
  const { from, args, reply } = ctx;
  const option = args[0]?.toLowerCase();
  if (!["on", "off"].includes(option)) {
    const status = getAntiFlood(from);
    return reply(
      `🌊 *Anti-Flood:* ${status ? "✅ Ativado" : "❌ Desativado"}\n\n` +
      `Use: *${p}antiflood on/off*`
    );
  }
  setAntiFlood(from, option === "on");
  return reply(
    option === "on"
      ? `🌊 *Anti-Flood ativado!* ✅\n_Limite: ${config.floodLimit} msgs/5s_`
      : `🌊 *Anti-Flood desativado!* ❌`
  );
}

async function antimention(ctx) {
  const { from, args, reply, isGroup } = ctx;
  if (!isGroup) return reply("❌ Apenas em grupos!");
  const option = args[0]?.toLowerCase();
  if (!["on", "off"].includes(option)) {
    const status = getAntiMention(from);
    return reply(
      `🔔 *Anti-Menção Admin:* ${status ? "✅ Ativado" : "❌ Desativado"}\n\n` +
      `_Quando ativado, membros que mencionarem\nadmins ou o dono serão banidos._\n\n` +
      `Use: *${p}antimention on/off*`
    );
  }
  setAntiMention(from, option === "on");
  return reply(
    option === "on"
      ? `🔔 *Anti-Menção Admin ativado!* ✅\n_Membros que mencionarem admins/dono serão banidos automaticamente._`
      : `🔔 *Anti-Menção Admin desativado!* ❌`
  );
}

async function banword(ctx) {
  const { from, args, reply } = ctx;
  if (!args.length) {
    const words = getBanwords(from);
    if (!words.length) return reply(
      `📝 Nenhuma palavra proibida.\n\nUse *${p}banword <palavra>* para adicionar.`
    );
    return reply(
      `🚫 *PALAVRAS PROIBIDAS*\n\n` +
      words.map((w, i) => `${i + 1}. \`${w}\``).join("\n") +
      `\n\n_Use *${p}delbanword <palavra>* para remover._`
    );
  }
  const word  = args[0].toLowerCase();
  const added = addBanword(from, word);
  return added
    ? reply(`✅ Palavra *"${word}"* adicionada!\n_Mensagens com esta palavra serão apagadas._`)
    : reply(`⚠️ A palavra *"${word}"* já está na lista!`);
}

async function delbanword(ctx) {
  const { from, args, reply } = ctx;
  if (!args.length) return reply(`❌ Use: ${p}delbanword <palavra>`);
  const word    = args[0].toLowerCase();
  const removed = removeBanword(from, word);
  return removed
    ? reply(`✅ Palavra *"${word}"* removida da lista!`)
    : reply(`❌ A palavra *"${word}"* não está na lista!\n\nUse *${p}banword* para ver a lista.`);
}

async function limparbanword(ctx) {
  const { from, reply } = ctx;
  clearBanwords(from);
  return reply("✅ *Lista de palavras proibidas limpa!*");
}

async function ligarbot(ctx) {
  const { from, reply, isOwner } = ctx;
  if (!isOwner) return reply("🔒 Apenas o *dono do bot* pode usar este comando!");
  setBotStatus(from, true);
  return reply(`✅ *Bot ligado!*\n\n🤖 O bot voltará a responder normalmente.\n\n_🤖 Lutchi Zap Hack_`);
}

async function desligarbot(ctx) {
  const { from, reply, isOwner } = ctx;
  if (!isOwner) return reply("🔒 Apenas o *dono do bot* pode usar este comando!");
  setBotStatus(from, false);
  return reply(`❌ *Bot desligado!*\n\n🤖 O bot não responderá até ser religado.\nUse *${p}ligarbot* para religar.\n\n_🤖 Lutchi Zap Hack_`);
}

async function modobot(ctx) {
  const { from, args, reply, isOwner, isAdmin } = ctx;
  if (!isOwner && !isAdmin) return reply("🔒 Apenas *admins* ou o *dono* podem usar este comando!");
  const modo = args[0]?.toLowerCase();
  if (!["todos", "admins"].includes(modo)) {
    const atual = getModoBot(from);
    return reply(
      `⚙️ *Modo do Bot*\n\n` +
      `📌 Modo actual: *${atual === "todos" ? "Todos os membros" : "Apenas admins"}*\n\n` +
      `Para alterar:\n` +
      `• *${p}modobot todos* — membros usam comandos públicos\n` +
      `• *${p}modobot admins* — apenas admins usam o bot`
    );
  }
  setModoBot(from, modo);
  return reply(
    modo === "todos"
      ? `✅ *Modo: Todos os membros*\n_Membros podem usar comandos públicos._`
      : `✅ *Modo: Apenas admins*\n_Apenas administradores podem usar o bot._`
  );
}

async function boasvindas(ctx) {
  const { from, args, reply, isGroup } = ctx;
  if (!isGroup) return reply("❌ Apenas em grupos!");
  const option = args[0]?.toLowerCase();
  if (!["on", "off"].includes(option)) {
    const status = getBoasVindas(from);
    return reply(
      `👋 *Boas-Vindas:* ${status ? "✅ Ativado" : "❌ Desativado"}\n\n` +
      `Use: *${p}boasvindas on/off*\n\n` +
      `_Quando ativado, novos membros recebem\nmensagem de boas-vindas com a foto de perfil._`
    );
  }
  setBoasVindas(from, option === "on");
  return reply(
    option === "on"
      ? `👋 *Boas-Vindas ativado!* ✅\n_Novos membros serão saudados automaticamente._`
      : `👋 *Boas-Vindas desativado!* ❌\n_Nenhuma mensagem de entrada será enviada._`
  );
}


async function antistatus(ctx) {
  const { from, args, reply, isGroup } = ctx;
  if (!isGroup) return reply("❌ Apenas em grupos!");
  const { setAntiStatus, getAntiStatus } = require("../utils/database");
  const option = args[0]?.toLowerCase();
  if (!["on", "off"].includes(option)) {
    const status = getAntiStatus(from);
    return reply(
      "🚫 *Anti-Status:* " + (status ? "✅ Ativado" : "❌ Desativado") + "\n\n" +
      "_Quando ativado, membros que marcarem\no grupo no status serão banidos._\n\n" +
      "Use: *.antistatus on/off*"
    );
  }
  setAntiStatus(from, option === "on");
  return reply(option === "on"
    ? "🚫 *Anti-Status ativado!* ✅\n_Membros que marcarem o grupo no status serão banidos._"
    : "🚫 *Anti-Status desativado!* ❌"
  );
}



async function anticall(ctx) {
  const { from, args, reply, isGroup } = ctx;
  if (!isGroup) return reply("❌ Apenas em grupos!");
  const { setAntiCall, getAntiCall } = require("../utils/database");
  const option = args[0]?.toLowerCase();
  if (!["on", "off"].includes(option)) {
    const status = getAntiCall(from);
    return reply(
      "📵 *Anti-Call:* " + (status ? "✅ Ativado" : "❌ Desativado") + "\n\n" +
      "_Quando ativado, membros que fizerem\nchamadas no grupo serão banidos._\n\n" +
      "Use: *.anticall on/off*"
    );
  }
  setAntiCall(from, option === "on");
  return reply(option === "on"
    ? "📵 *Anti-Call ativado!* ✅\n_Membros que fizerem chamadas serão banidos._"
    : "📵 *Anti-Call desativado!* ❌"
  );
}

module.exports = {
  warn, warnings, resetwarn,
  mute, unmute,
  antilink, antiflood, antimention,
  banword, delbanword, limparbanword,
  ligarbot, desligarbot, modobot, boasvindas, antistatus, anticall,
};

// ── ANTISTATUS ────────────────────────────────────────────────
async function antistatus(ctx) {
  const { args, reply, from, isGroup } = ctx;
  if (!isGroup) return reply("❌ Apenas em grupos!");
  const option = args[0]?.toLowerCase();
  const { setAntiStatus, getAntiStatus } = require("../utils/database");
  if (!option || !["on", "off"].includes(option)) {
    const status = getAntiStatus ? getAntiStatus(from) : false;
    return reply("📵 *Anti-Status:* " + (status ? "✅ Ativado" : "❌ Desativado") + "\n\nUse: .antistatus on/off");
  }
  if (setAntiStatus) setAntiStatus(from, option === "on");
  return reply("📵 *Anti-Status " + (option === "on" ? "Ativado ✅" : "Desativado ❌") + "*\n" +
    (option === "on" ? "_Membros que mencionarem o grupo no status serão removidos!_\n\n⚠️ Nota: O WhatsApp não permite detectar menções de status diretamente. Este comando remove quem enviar mensagens sobre status no grupo._" : ""));
}

module.exports = Object.assign(module.exports, { antistatus });

// ── ANTICALL ──────────────────────────────────────────────────
