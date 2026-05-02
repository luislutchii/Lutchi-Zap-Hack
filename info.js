// ============================================================
//  src/commands/info.js — Informações & Menu Lutchi Zap Hack
// ============================================================

import { reply } from "../utils/helpers.js";

const rulesStore = new Map();

// ── .lutchi / .menu — Menu principal completo ─────────────────
export async function menu({ sock, msg, jid, config }) {
  const text = `
╔══════════════════════════════════════╗
║   🤖  *LUTCHI ZAP HACK*  🤖         ║
║   Bot de Gerenciamento de Grupos     ║
╚══════════════════════════════════════╝

*👑 Dono:* Luís Lutchi
*📸 Instagram:* @luislutchii
*🔖 Versão:* v1.0.0
*⚡ Prefixo:* \`${config.prefix}\`

━━━━ 📋 *INFORMAÇÕES* ━━━━
› \`${config.prefix}lutchi\`   — Menu principal
› \`${config.prefix}ping\`     — Latência do bot
› \`${config.prefix}info\`     — Info do grupo
› \`${config.prefix}link\`     — Link de convite
› \`${config.prefix}regras\`   — Ver regras
› \`${config.prefix}setregras\` — Definir regras
› \`${config.prefix}sticker\`  — Imagem → Sticker
› \`${config.prefix}dono\`     — Contato do dono
› \`${config.prefix}sobre\`    — Sobre o bot

━━━━ 👥 *MEMBROS* (admin) ━━━━
› \`${config.prefix}ban @\`      — Remover membro
› \`${config.prefix}add número\` — Adicionar membro
› \`${config.prefix}kick @\`     — Expulsar membro
› \`${config.prefix}promover @\` — Tornar admin
› \`${config.prefix}rebaixar @\` — Remover admin
› \`${config.prefix}todos msg\`  — Marcar todos

━━━━ ⚙️ *GRUPO* (admin) ━━━━
› \`${config.prefix}fechar\`    — Bloquear grupo
› \`${config.prefix}abrir\`     — Liberar grupo
› \`${config.prefix}nome\`      — Renomear grupo
› \`${config.prefix}desc\`      — Alterar descrição
› \`${config.prefix}foto\`      — Trocar foto do grupo

━━━━ 🛡️ *MODERAÇÃO* (admin) ━━━━
› \`${config.prefix}warn @\`       — Aplicar aviso
› \`${config.prefix}warnings @\`   — Ver avisos
› \`${config.prefix}resetwarn @\`  — Zerar avisos
› \`${config.prefix}mute @ min\`   — Silenciar
› \`${config.prefix}unmute @\`     — Desmutar
› \`${config.prefix}antilink on\`  — Anti-link
› \`${config.prefix}antiflood on\` — Anti-flood
› \`${config.prefix}banword pal\`  — Banir palavra

━━━━ 🎲 *DIVERSÃO* ━━━━
› \`${config.prefix}dado\`     — Rolar dado
› \`${config.prefix}flip\`     — Cara ou coroa
› \`${config.prefix}sorteio\`  — Sortear membro
› \`${config.prefix}enquete\`  — Criar enquete
› \`${config.prefix}citar\`    — Frase aleatória
› \`${config.prefix}calcular\` — Calculadora
› \`${config.prefix}clima\`    — Previsão do tempo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 *GitHub:* github.com/luislutchii/lutchi-zap-hack
📸 *Instagram:* instagram.com/luislutchii

_Desenvolvido com 💜 por Luís Lutchi_
`.trim();

  await sock.sendMessage(jid, { text }, { quoted: msg });
}

// ── .dono — Contato do dono ───────────────────────────────────
export async function dono({ sock, msg, jid, config }) {
  await reply(
    sock,
    msg,
    `👑 *Dono do Bot*\n\n` +
    `🧑 *Nome:* ${config.ownerName}\n` +
    `📸 *Instagram:* ${config.instagram}\n` +
    `🌐 *GitHub:* github.com/luislutchii/lutchi-zap-hack\n\n` +
    `_Para reportar bugs ou sugestões, entre em contato!_`
  );
}

// ── .sobre — Sobre o bot ──────────────────────────────────────
export async function sobre({ sock, msg, jid, config }) {
  const text =
    `🤖 *${config.botName}*\n` +
    `${"─".repeat(30)}\n\n` +
    `📌 *Versão:* ${config.version}\n` +
    `⚡ *Prefixo:* \`${config.prefix}\`\n` +
    `🛠️ *Tecnologia:* Node.js + Baileys\n` +
    `👑 *Desenvolvedor:* ${config.ownerName}\n` +
    `📸 *Instagram:* ${config.instagram}\n` +
    `🌐 *GitHub:* github.com/luislutchii/lutchi-zap-hack\n\n` +
    `_Bot completo de gerenciamento de grupos\n` +
    `com comandos poderosos de moderação,\n` +
    `diversão e muito mais!_ 💜`;

  await reply(sock, msg, text);
}

// ── .ping — Latência ─────────────────────────────────────────
export async function ping({ sock, msg, jid }) {
  const start = Date.now();
  const sent  = await sock.sendMessage(jid, { text: "🏓 Calculando..." });
  const ms    = Date.now() - start;

  await sock.sendMessage(jid, {
    text: `🏓 *Pong!*\n⚡ Latência: *${ms}ms*\n🤖 *Lutchi Zap Hack* online!`,
    edit: sent.key,
  });
}

// ── .info — Informações do grupo ─────────────────────────────
export async function groupInfo({ sock, msg, jid, groupMeta }) {
  const admins  = groupMeta.participants.filter((p) => p.admin).length;
  const members = groupMeta.participants.length;
  const created = new Date(groupMeta.creation * 1000).toLocaleDateString("pt-BR");

  const text =
    `📋 *Informações do Grupo*\n` +
    `${"─".repeat(28)}\n\n` +
    `👥 *Nome:* ${groupMeta.subject}\n` +
    `📆 *Criado em:* ${created}\n` +
    `👤 *Membros:* ${members}\n` +
    `👑 *Admins:* ${admins}\n` +
    `📝 *Descrição:*\n${groupMeta.desc ?? "Sem descrição."}\n\n` +
    `_🤖 Lutchi Zap Hack_`;

  await sock.sendMessage(jid, { text });
}

// ── .link — Link de convite ───────────────────────────────────
export async function groupLink({ sock, msg, jid, botAdmin }) {
  if (!botAdmin) return reply(sock, msg, "⚠️ O bot precisa ser admin para obter o link.");

  const code = await sock.groupInviteCode(jid);
  await sock.sendMessage(jid, {
    text: `🔗 *Link do Grupo*\n\nhttps://chat.whatsapp.com/${code}\n\n_🤖 Lutchi Zap Hack_`,
  });
}

// ── .regras — Exibe regras ────────────────────────────────────
export async function rules({ sock, msg, jid }) {
  const text = rulesStore.get(jid) ?? "📜 Nenhuma regra definida.\nUse *.setregras* para definir.";
  await sock.sendMessage(jid, { text: `📜 *Regras do Grupo*\n\n${text}\n\n_🤖 Lutchi Zap Hack_` });
}

// ── .setregras — Define regras ────────────────────────────────
export async function setRules({ sock, msg, jid, args }) {
  const text = args.join(" ");
  if (!text) return reply(sock, msg, "❓ Ex: *.setregras 1. Respeito 2. Sem spam*");
  rulesStore.set(jid, text);
  await reply(sock, msg, "✅ Regras atualizadas! Use *.regras* para ver.");
}

// ── .sticker — Imagem → sticker ──────────────────────────────
export async function sticker({ sock, msg, jid }) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imgMsg = quoted?.imageMessage ?? msg.message?.imageMessage;
  if (!imgMsg) return reply(sock, msg, "🖼️ Responda a uma imagem para criar o sticker.");

  const buffer = await sock.downloadMediaMessage({ message: { imageMessage: imgMsg } });
  await sock.sendMessage(jid, { sticker: buffer });
}