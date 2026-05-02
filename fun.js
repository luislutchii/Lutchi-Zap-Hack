// ============================================================
//  src/commands/fun.js — Diversão
//  🤖 Lutchi Zap Hack | by Luís Lutchi (@luislutchii)
// ============================================================

import { reply } from "../utils/helpers.js";
import axios from "axios";

const FRASES = [
  "\"A vida é o que acontece enquanto você está ocupado fazendo outros planos.\" — John Lennon",
  "\"Seja a mudança que você quer ver no mundo.\" — Gandhi",
  "\"A jornada de mil milhas começa com um único passo.\" — Lao-Tsé",
  "\"Sucesso é a soma de pequenos esforços repetidos dia após dia.\" — Robert Collier",
  "\"O único modo de fazer um ótimo trabalho é amar o que você faz.\" — Steve Jobs",
  "\"Você nunca sabe o quão forte você é até ser forte a única opção.\" — Bob Marley",
  "\"Não importa o quão devagar você vá, desde que não pare.\" — Confúcio",
  "\"Acredite em si mesmo e chegará um dia em que os outros não terão outra escolha senão acreditar em você.\" — Cynthia Kersey",
  "\"O segredo do sucesso é começar.\" — Mark Twain",
  "\"Grandes realizações geralmente requerem grandes sacrifícios.\" — Napoleon Hill",
];

// ── .dado [faces] — Rola dado ────────────────────────────────
export async function dice({ sock, msg, jid, args }) {
  const faces = parseInt(args[0]) || 6;
  if (faces < 2 || faces > 100)
    return reply(sock, msg, "❓ Informe um número entre 2 e 100.\nEx: *.dado 20*");

  const result = Math.floor(Math.random() * faces) + 1;
  await reply(
    sock, msg,
    `🎲 *Resultado do Dado*\n\nDado de ${faces} faces: *${result}*\n\n_🤖 Lutchi Zap Hack_`
  );
}

// ── .flip — Cara ou coroa ────────────────────────────────────
export async function coinFlip({ sock, msg, jid }) {
  const resultado = Math.random() < 0.5;
  await reply(
    sock, msg,
    `🪙 *Cara ou Coroa?*\n\n${resultado ? "🟡 *COROA!*" : "🔵 *CARA!*"}\n\n_🤖 Lutchi Zap Hack_`
  );
}

// ── .sorteio — Sorteia membro aleatório ──────────────────────
export async function raffle({ sock, msg, jid, groupMeta }) {
  const participants = groupMeta.participants.map((p) => p.id);
  const winner = participants[Math.floor(Math.random() * participants.length)];

  await sock.sendMessage(jid, {
    text:
      `🎉 *Sorteio - Lutchi Zap Hack*\n\n` +
      `🏆 O sortudo(a) é: @${winner.split("@")[0]}\n\n` +
      `Parabéns! 🥳\n\n_🤖 Lutchi Zap Hack_`,
    mentions: [winner],
  }, { quoted: msg });
}

// ── .enquete Pergunta? | Op1 | Op2 ───────────────────────────
export async function poll({ sock, msg, jid, args }) {
  const full = args.join(" ");
  const [question, ...optionsRaw] = full.split("|");

  if (!question || optionsRaw.length < 2)
    return reply(
      sock, msg,
      "❓ *Formato:*\n*.enquete Pergunta? | Opção 1 | Opção 2 | Opção 3*"
    );

  const options = optionsRaw.map((o) => o.trim()).filter(Boolean);
  await sock.sendMessage(jid, {
    poll: { name: question.trim(), values: options, selectableCount: 1 },
  }, { quoted: msg });
}

// ── .citar — Frase aleatória ─────────────────────────────────
export async function quote({ sock, msg, jid }) {
  const frase = FRASES[Math.floor(Math.random() * FRASES.length)];
  await reply(sock, msg, `💬 *Frase do Dia*\n\n${frase}\n\n_🤖 Lutchi Zap Hack_`);
}

// ── .calcular expressão — Calculadora ────────────────────────
export async function calculate({ sock, msg, jid, args }) {
  const expr = args.join(" ");
  if (!expr) return reply(sock, msg, "❓ Ex: *.calcular 10 * 5 + 3*");

  // Valida: apenas números, operadores e parênteses
  if (!/^[\d\s+\-*/().%^]+$/.test(expr))
    return reply(sock, msg, "❌ Expressão inválida. Use apenas números e operadores (+, -, *, /).");

  try {
    // eslint-disable-next-line no-eval
    const result = Function(`"use strict"; return (${expr})`)();
    await reply(
      sock, msg,
      `🧮 *Calculadora*\n\n📝 Expressão: \`${expr}\`\n✅ Resultado: *${result}*\n\n_🤖 Lutchi Zap Hack_`
    );
  } catch {
    await reply(sock, msg, "❌ Não foi possível calcular essa expressão.");
  }
}

// ── .clima cidade — Previsão do tempo ────────────────────────
export async function weather({ sock, msg, jid, args }) {
  const city = args.join(" ");
  if (!city) return reply(sock, msg, "❓ Ex: *.clima São Paulo*");

  try {
    // Usando wttr.in (gratuito, sem API key)
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=pt`;
    const { data } = await axios.get(url, { timeout: 8000 });

    const current  = data.current_condition[0];
    const area     = data.nearest_area[0];
    const name     = area.areaName[0].value;
    const country  = area.country[0].value;
    const temp     = current.temp_C;
    const feels    = current.FeelsLikeC;
    const humidity = current.humidity;
    const wind     = current.windspeedKmph;
    const desc     = current.lang_pt?.[0]?.value ?? current.weatherDesc[0].value;

    // Emoji baseado na descrição
    const emoji =
      desc.toLowerCase().includes("chuva") ? "🌧️" :
      desc.toLowerCase().includes("nublado") ? "☁️" :
      desc.toLowerCase().includes("sol") ? "☀️" :
      desc.toLowerCase().includes("neve") ? "❄️" :
      desc.toLowerCase().includes("trovoada") ? "⛈️" : "🌤️";

    await reply(
      sock, msg,
      `${emoji} *Clima em ${name}, ${country}*\n\n` +
      `🌡️ Temperatura: *${temp}°C*\n` +
      `🤔 Sensação: *${feels}°C*\n` +
      `💧 Umidade: *${humidity}%*\n` +
      `💨 Vento: *${wind} km/h*\n` +
      `📋 Condição: *${desc}*\n\n` +
      `_🤖 Lutchi Zap Hack_`
    );
  } catch {
    await reply(sock, msg, `❌ Cidade *${city}* não encontrada ou serviço indisponível.`);
  }
}