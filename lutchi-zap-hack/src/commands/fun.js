// ╔══════════════════════════════════════════════════╗
// ║        LUTCHI ZAP HACK - Comandos Diversão       ║
// ╚══════════════════════════════════════════════════╝

const config = require("../config/config");
const axios = require("axios");
const p = config.prefix;

// ── DADO ──────────────────────────────────────────────────────
async function dado(ctx) {
  const { args, reply } = ctx;

  let lados = parseInt(args[0]) || 6;
  if (lados < 2) lados = 6;
  if (lados > 100) lados = 100;

  const resultado = Math.floor(Math.random() * lados) + 1;
  const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  const emoji = lados === 6 ? faces[resultado - 1] : "🎲";

  return reply(
    `${emoji} *DADO DE ${lados} LADOS*\n\n` +
    `🎯 Resultado: *${resultado}*`
  );
}

// ── FLIP ──────────────────────────────────────────────────────
async function flip(ctx) {
  const { reply } = ctx;

  const resultado = Math.random() < 0.5 ? "CARA 🪙" : "COROA 🏅";
  return reply(`🪙 *CARA OU COROA*\n\n🎯 Resultado: *${resultado}*`);
}

// ── SORTEIO ───────────────────────────────────────────────────
async function sorteio(ctx) {
  const { sock, from, reply, groupMeta, isGroup } = ctx;

  if (!isGroup) return reply("❌ Apenas em grupos!");
  if (!groupMeta) return reply("❌ Erro ao obter membros!");

  const members = groupMeta.participants;
  if (members.length < 2) return reply("❌ O grupo precisa de pelo menos 2 membros!");

  const winner = members[Math.floor(Math.random() * members.length)];
  const num = winner.id.split("@")[0];

  return sock.sendMessage(from, {
    text:
      `🎉 *SORTEIO DO GRUPO!*\n\n` +
      `🏆 Vencedor(a): *@${num}*\n\n` +
      `🎊 Parabéns!!!`,
    mentions: [winner.id],
  });
}

// ── ENQUETE ───────────────────────────────────────────────────
async function enquete(ctx) {
  const { sock, from, msg, args, reply } = ctx;

  const fullText = args.join(" ");
  const parts = fullText.split("|").map((p) => p.trim());

  if (parts.length < 3) {
    return reply(`❌ Use: ${p}enquete Pergunta? | Opção 1 | Opção 2 | ...`);
  }

  const question = parts[0];
  const options = parts.slice(1);

  if (options.length > 12) return reply("❌ Máximo de 12 opções!");

  try {
    await sock.sendMessage(from, {
      poll: {
        name: question,
        values: options,
        selectableCount: 1,
      },
    }, { quoted: msg });
  } catch (e) {
    // Fallback para mensagem de texto
    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "🔣"];
    const optText = options.map((o, i) => `${emojis[i]} ${o}`).join("\n");
    return reply(`📊 *ENQUETE*\n\n❓ ${question}\n\n${optText}\n\n_Vote reagindo com o número correspondente!_`);
  }
}

// ── CITAR ─────────────────────────────────────────────────────
async function citar(ctx) {
  const { sock, from, msg, reply } = ctx;

  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  if (!quoted) return reply(`❌ Responda uma mensagem com *${p}citar*`);

  const quotedText = quoted.quotedMessage?.conversation ||
    quoted.quotedMessage?.extendedTextMessage?.text ||
    "[Mídia]";

  const participant = quoted.participant || quoted.remoteJid;
  const num = participant?.split("@")[0] || "?";

  return reply(
    `💬 *CITAÇÃO*\n\n` +
    `_"${quotedText}"_\n\n` +
    `— @${num}`,
    { mentions: [participant] }
  );
}

// ── CALCULAR ──────────────────────────────────────────────────
async function calcular(ctx) {
  const { args, reply } = ctx;

  const expr = args.join("").replace(/[^0-9+\-*/.()%^]/g, "");
  if (!expr) return reply(`❌ Use: ${p}calcular 2+2`);

  try {
    // Avaliação segura de expressões matemáticas básicas
    const result = Function(`"use strict"; return (${expr})`)();
    if (!isFinite(result)) return reply("❌ Resultado inválido!");
    return reply(
      `🧮 *CALCULADORA*\n\n` +
      `📝 Expressão: \`${expr}\`\n` +
      `✅ Resultado: *${result}*`
    );
  } catch (e) {
    return reply("❌ Expressão inválida! Verifique os operadores.");
  }
}

// ── CLIMA ─────────────────────────────────────────────────────
async function clima(ctx) {
  const { args, reply } = ctx;

  const cidade = args.join(" ") || "Luanda";
  const url = `https://wttr.in/${encodeURIComponent(cidade)}?format=3&lang=pt`;

  try {
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data;

    // Formato detalhado
    const urlDetalhado = `https://wttr.in/${encodeURIComponent(cidade)}?format=%l:+%c+%t+%h+%w&lang=pt`;
    const resp2 = await axios.get(urlDetalhado, { timeout: 10000 });

    return reply(
      `🌤️ *PREVISÃO DO TEMPO*\n\n` +
      `📍 Local: *${cidade}*\n` +
      `${resp2.data}\n\n` +
      `🌐 Fonte: wttr.in`
    );
  } catch (e) {
    // Fallback
    return reply(
      `🌤️ *PREVISÃO DO TEMPO*\n\n` +
      `📍 Local: *${cidade}*\n\n` +
      `❌ Erro ao obter dados. Verifique o nome da cidade.\n` +
      `💡 Exemplo: ${p}clima Luanda`
    );
  }
}

module.exports = {
  dado,
  flip,
  sorteio,
  enquete,
  citar,
  calcular,
  clima,
};
