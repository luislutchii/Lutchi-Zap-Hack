// ============================================================
//  src/commands/handler.js — Roteador de Comandos
//  🤖 Lutchi Zap Hack | by Luís Lutchi (@luislutchii)
// ============================================================

import { isJidGroup } from "@whiskeysockets/baileys";
import * as groupCmds from "./group.js";
import * as adminCmds from "./admin.js";
import * as infoCmds  from "./info.js";
import * as funCmds   from "./fun.js";
import { reply, isAdmin, isBotAdmin, isOwner } from "../utils/helpers.js";

// ── Tabela de comandos ────────────────────────────────────────
// { fn, group: somente grupo?, admin: requer admin?, owner: requer dono? }
const COMMANDS = {
  // ── Menu / Informações ───────────────────────────────────
  lutchi:      { fn: infoCmds.menu,       group: false, admin: false, owner: false },
  menu:        { fn: infoCmds.menu,       group: false, admin: false, owner: false },
  ping:        { fn: infoCmds.ping,       group: false, admin: false, owner: false },
  info:        { fn: infoCmds.groupInfo,  group: true,  admin: false, owner: false },
  link:        { fn: infoCmds.groupLink,  group: true,  admin: true,  owner: false },
  regras:      { fn: infoCmds.rules,      group: true,  admin: false, owner: false },
  setregras:   { fn: infoCmds.setRules,   group: true,  admin: true,  owner: false },
  sticker:     { fn: infoCmds.sticker,    group: false, admin: false, owner: false },
  dono:        { fn: infoCmds.dono,       group: false, admin: false, owner: false },
  sobre:       { fn: infoCmds.sobre,      group: false, admin: false, owner: false },

  // ── Membros ──────────────────────────────────────────────
  ban:         { fn: groupCmds.ban,       group: true,  admin: true,  owner: false },
  kick:        { fn: groupCmds.kick,      group: true,  admin: true,  owner: false },
  add:         { fn: groupCmds.add,       group: true,  admin: true,  owner: false },
  promover:    { fn: groupCmds.promote,   group: true,  admin: true,  owner: false },
  rebaixar:    { fn: groupCmds.demote,    group: true,  admin: true,  owner: false },
  todos:       { fn: groupCmds.tagAll,    group: true,  admin: true,  owner: false },

  // ── Grupo ────────────────────────────────────────────────
  fechar:      { fn: groupCmds.closeGroup, group: true, admin: true,  owner: false },
  abrir:       { fn: groupCmds.openGroup,  group: true, admin: true,  owner: false },
  nome:        { fn: groupCmds.setName,    group: true, admin: true,  owner: false },
  desc:        { fn: groupCmds.setDesc,    group: true, admin: true,  owner: false },
  foto:        { fn: groupCmds.setPhoto,   group: true, admin: true,  owner: false },
  limpar:      { fn: groupCmds.clearChat,  group: true, admin: true,  owner: false },

  // ── Moderação ────────────────────────────────────────────
  warn:        { fn: adminCmds.warn,       group: true, admin: true,  owner: false },
  warnings:    { fn: adminCmds.warnings,   group: true, admin: true,  owner: false },
  resetwarn:   { fn: adminCmds.resetWarn,  group: true, admin: true,  owner: false },
  mute:        { fn: adminCmds.mute,       group: true, admin: true,  owner: false },
  unmute:      { fn: adminCmds.unmute,     group: true, admin: true,  owner: false },
  antilink:    { fn: adminCmds.antilink,   group: true, admin: true,  owner: false },
  antiflood:   { fn: adminCmds.antiflood,  group: true, admin: true,  owner: false },
  banword:     { fn: adminCmds.banWord,    group: true, admin: true,  owner: false },

  // ── Diversão ─────────────────────────────────────────────
  dado:        { fn: funCmds.dice,         group: false, admin: false, owner: false },
  flip:        { fn: funCmds.coinFlip,     group: false, admin: false, owner: false },
  sorteio:     { fn: funCmds.raffle,       group: true,  admin: false, owner: false },
  enquete:     { fn: funCmds.poll,         group: true,  admin: false, owner: false },
  citar:       { fn: funCmds.quote,        group: false, admin: false, owner: false },
  calcular:    { fn: funCmds.calculate,    group: false, admin: false, owner: false },
  clima:       { fn: funCmds.weather,      group: false, admin: false, owner: false },
};

export async function handleCommand({ sock, msg, jid, isGroup, command, args, config }) {
  const entry = COMMANDS[command];
  if (!entry) return; // comando desconhecido → ignora

  // ── Verificações de contexto ──────────────────────────────
  if (entry.group && !isGroup)
    return reply(sock, msg, "❌ Este comando só funciona em grupos.");

  const sender = msg.key.participant ?? msg.key.remoteJid;

  if (entry.owner && !isOwner(sender, config))
    return reply(sock, msg, "🔒 Apenas o *dono do bot* pode usar este comando.");

  let groupMeta = null;
  let botAdmin  = false;
  let userAdmin = false;

  if (isGroup) {
    groupMeta = await sock.groupMetadata(jid).catch(() => null);
    botAdmin  = await isBotAdmin(sock, jid, groupMeta);
    userAdmin = isAdmin(sender, groupMeta);
  }

  if (entry.admin && !userAdmin && !isOwner(sender, config))
    return reply(sock, msg, "🔒 Apenas *administradores* podem usar este comando.");

  // ── Executa ───────────────────────────────────────────────
  try {
    await entry.fn({
      sock, msg, jid, args, sender,
      groupMeta, botAdmin, userAdmin, config,
      isOwner: isOwner(sender, config),
    });
  } catch (err) {
    console.error(`[ERRO] .${command}:`, err.message);
    await reply(
      sock, msg,
      `⚠️ Erro ao executar *${config.prefix}${command}*\n\`${err.message}\`\n\n_🤖 Lutchi Zap Hack_`
    );
  }
}