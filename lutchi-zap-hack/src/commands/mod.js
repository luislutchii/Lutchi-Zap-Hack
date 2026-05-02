// ╔══════════════════════════════════════════════════╗
// ║      LUTCHI ZAP HACK - Comandos Moderação        ║
// ╚══════════════════════════════════════════════════╝

const config = require("../config/config");
const {
  addWarning,
  getWarnings,
  resetWarnings,
  muteMember,
  unmuteMember,
  setAntiLink,
  getAntiLink,
  setAntiFlood,
  getAntiFlood,
  addBanword,
  getBanwords,
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

// ── WARN ──────────────────────────────────────────────────────
async function warn(ctx) {
  const { sock, from, msg, args, reply } = ctx;

  const mentioned = getMentioned(msg, args);
  if (mentioned.length === 0) return reply(`❌ Use: ${p}warn @membro`);

  for (const jid of mentioned) {
    const num = jid.split("@")[0];
    const count = addWarning(from, jid);
    const max = config.maxWarns;

    if (count >= max) {
      await sock.groupParticipantsUpdate(from, [jid], "remove");
      await reply(
        `🔨 *@${num}* atingiu ${max} advertências e foi removido do grupo!`,
        { mentions: [jid] }
      );
    } else {
      await reply(
        `⚠️ *@${num}* recebeu uma advertência!\n\n` +
        `📊 Advertências: *${count}/${max}*\n` +
        `⚡ ${max - count} restante(s) para o ban!`,
        { mentions: [jid] }
      );
    }
  }
}

// ── WARNINGS ──────────────────────────────────────────────────
async function warnings(ctx) {
  const { from, msg, args, reply } = ctx;

  const mentioned = getMentioned(msg, args);
  if (mentioned.length === 0) return reply(`❌ Use: ${p}warnings @membro`);

  for (const jid of mentioned) {
    const num = jid.split("@")[0];
    const count = getWarnings(from, jid);
    await reply(
      `📊 *Advertências de @${num}:*\n\n` +
      `⚠️ Total: *${count}/${config.maxWarns}*`,
      { mentions: [jid] }
    );
  }
}

// ── RESETWARN ─────────────────────────────────────────────────
async function resetwarn(ctx) {
  const { from, msg, args, reply } = ctx;

  const mentioned = getMentioned(msg, args);
  if (mentioned.length === 0) return reply(`❌ Use: ${p}resetwarn @membro`);

  for (const jid of mentioned) {
    const num = jid.split("@")[0];
    resetWarnings(from, jid);
    await reply(`✅ Advertências de *@${num}* foram resetadas!`, {
      mentions: [jid],
    });
  }
}

// ── MUTE ──────────────────────────────────────────────────────
async function mute(ctx) {
  const { from, msg, args, reply } = ctx;

  const mentioned = getMentioned(msg, args);
  if (mentioned.length === 0) return reply(`❌ Use: ${p}mute @membro 10`);

  // Pega o tempo (último argumento numérico)
  let minutes = 10;
  for (const arg of args) {
    if (!isNaN(parseInt(arg))) {
      minutes = parseInt(arg);
      break;
    }
  }

  for (const jid of mentioned) {
    const num = jid.split("@")[0];
    muteMember(from, jid, minutes);
    await reply(
      `🔇 *@${num}* foi mutado por *${minutes} minuto(s)*!\n` +
      `_As mensagens serão apagadas automaticamente._`,
      { mentions: [jid] }
    );
  }
}

// ── UNMUTE ────────────────────────────────────────────────────
async function unmute(ctx) {
  const { from, msg, args, reply } = ctx;

  const mentioned = getMentioned(msg, args);
  if (mentioned.length === 0) return reply(`❌ Use: ${p}unmute @membro`);

  for (const jid of mentioned) {
    const num = jid.split("@")[0];
    unmuteMember(from, jid);
    await reply(`🔊 *@${num}* foi desmutado!`, { mentions: [jid] });
  }
}

// ── ANTILINK ──────────────────────────────────────────────────
async function antilink(ctx) {
  const { from, args, reply } = ctx;

  const option = args[0]?.toLowerCase();
  if (!option || !["on", "off"].includes(option)) {
    const status = getAntiLink(from);
    return reply(
      `🔗 *Anti-Link:* ${status ? "✅ Ativado" : "❌ Desativado"}\n\n` +
      `Use: ${p}antilink on/off`
    );
  }

  const status = option === "on";
  setAntiLink(from, status);
  return reply(
    `🔗 *Anti-Link ${status ? "Ativado ✅" : "Desativado ❌"}*\n` +
    `_Links enviados por membros serão ${status ? "removidos" : "permitidos"}._`
  );
}

// ── ANTIFLOOD ─────────────────────────────────────────────────
async function antiflood(ctx) {
  const { from, args, reply } = ctx;

  const option = args[0]?.toLowerCase();
  if (!option || !["on", "off"].includes(option)) {
    const status = getAntiFlood(from);
    return reply(
      `🌊 *Anti-Flood:* ${status ? "✅ Ativado" : "❌ Desativado"}\n\n` +
      `Use: ${p}antiflood on/off`
    );
  }

  const status = option === "on";
  setAntiFlood(from, status);
  return reply(
    `🌊 *Anti-Flood ${status ? "Ativado ✅" : "Desativado ❌"}*\n` +
    `_Limite: ${config.floodLimit} msgs/5s_`
  );
}

// ── BANWORD ───────────────────────────────────────────────────
async function banword(ctx) {
  const { from, args, reply } = ctx;

  if (!args.length) {
    const words = getBanwords(from);
    if (words.length === 0) return reply("📝 Nenhuma palavra proibida cadastrada.");
    return reply(`🚫 *Palavras Proibidas:*\n\n${words.map((w, i) => `${i + 1}. \`${w}\``).join("\n")}`);
  }

  const word = args[0].toLowerCase();
  const added = addBanword(from, word);

  if (added) {
    return reply(`✅ Palavra *"${word}"* adicionada à lista proibida!\n_Mensagens com essa palavra serão apagadas._`);
  } else {
    return reply(`⚠️ A palavra *"${word}"* já está na lista!`);
  }
}

module.exports = {
  warn,
  warnings,
  resetwarn,
  mute,
  unmute,
  antilink,
  antiflood,
  banword,
};
