// ============================================================
//  src/config.js — Configurações do Lutchi Zap Hack
// ============================================================

import "dotenv/config";

export function loadConfig() {
  return {
    // ── Identidade do Bot ─────────────────────────────────
    botName:    "Lutchi Zap Hack",
    ownerName:  "Luís Lutchi",
    instagram:  "@luislutchii",
    version:    "1.0.0",

    // ── Prefixo dos comandos ──────────────────────────────
    prefix: process.env.PREFIX || ".",

    // ── Número do dono (formato: 244924319522) ───────────
    ownerNumber: process.env.OWNER_NUMBER
      ? `${process.env.OWNER_NUMBER}@s.whatsapp.net`
      : "244924319522@s.whatsapp.net",

    // ── Mensagens de boas-vindas ──────────────────────────
    welcomeEnabled: true,
    welcomeMessage:
      "👋 Bem-vindo(a) ao grupo *{group}*, {name}!\n\n" +
      "🤖 Powered by *Lutchi Zap Hack*\n" +
      "📸 Instagram: @luislutchii",
    goodbyeMessage:
      "👋 {name} saiu do grupo *{group}*.\n\nAté mais! 🤖 *Lutchi Zap Hack*",

    // ── Anti-link ─────────────────────────────────────────
    antiLinkEnabled: false,
    antiLinkWarnings: 3,

    // ── Anti-flood ────────────────────────────────────────
    antiFloodEnabled: false,
    antiFloodMessages: 5,
    antiFloodSeconds: 5,

    // ── Palavra proibida ──────────────────────────────────
    bannedWords: [],

    // ── Modo somente admins ───────────────────────────────
    onlyAdminsMode: false,
  };
}