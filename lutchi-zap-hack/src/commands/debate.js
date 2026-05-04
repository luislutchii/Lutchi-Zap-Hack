// ╔══════════════════════════════════════════════════╗
// ║      LUTCHI ZAP HACK - Sistema de Debate         ║
// ╚══════════════════════════════════════════════════╝

const p = ".";

const TEMAS_DEBATE = [
  // Tecnologia
  "📱 Redes sociais fazem mais mal do que bem?",
  "🤖 A Inteligência Artificial vai substituir os humanos no trabalho?",
  "💻 Todo jovem deveria aprender a programar?",
  "📵 Os smartphones arruinaram as relações humanas?",
  "🎮 Jogos de vídeo são prejudiciais para os jovens?",
  "🌐 A internet deve ser totalmente livre e sem censura?",
  "📷 As câmeras de vigilância nas ruas violam a privacidade?",

  // Sociedade
  "👨‍👩‍👧 A família tradicional ainda é relevante nos dias de hoje?",
  "🏫 O sistema de educação actual prepara os jovens para a vida?",
  "💰 O dinheiro traz felicidade?",
  "🌍 A globalização beneficia ou prejudica os países africanos?",
  "👔 O sucesso depende mais do esforço ou das oportunidades?",
  "🎓 A universidade ainda é necessária para ter sucesso?",
  "🏥 A saúde pública deve ser totalmente gratuita?",
  "⚖️ As leis em Angola são justas para todos?",

  // Angola e África
  "🇦🇴 Angola está no caminho certo para o desenvolvimento?",
  "🌍 A África tem potencial para ser a próxima potência mundial?",
  "🛢️ O petróleo foi mais uma bênção ou maldição para Angola?",
  "👨‍💼 Os jovens angolanos têm oportunidades suficientes?",
  "🏙️ É melhor viver em Luanda ou nas províncias?",
  "✈️ Emigrar é a melhor solução para os jovens africanos?",
  "💼 O empreendedorismo é o futuro de Angola?",

  // Estilo de vida
  "🍔 Fast food deveria ser proibido?",
  "🚬 O tabaco deveria ser totalmente proibido?",
  "🏃 Praticar desporto é obrigação ou escolha?",
  "🎵 A música moderna perdeu qualidade?",
  "💑 O casamento ainda faz sentido no século XXI?",
  "👶 Ter filhos hoje em dia é uma boa decisão?",
  "🌱 O vegetarianismo deveria ser adoptado por todos?",

  // Entretenimento
  "⚽ O futebol é mais do que um desporto — é uma religião?",
  "🎬 Os filmes africanos conseguem competir com Hollywood?",
  "📺 A televisão influencia negativamente a sociedade?",
  "🎤 O kizomba representa melhor Angola do que o rap angolano?",
  "🏆 O desporto angolano tem potencial para crescer mundialmente?",

  // Relações
  "💌 O amor à distância funciona?",
  "📲 As redes sociais ajudam ou prejudicam os relacionamentos?",
  "👫 Homens e mulheres são realmente iguais?",
  "💍 É melhor casar novo ou esperar?",
  "🤝 A amizade verdadeira ainda existe nos dias de hoje?",
];

const debateAtivo = new Map();

function getTemaAleatorio() {
  return TEMAS_DEBATE[Math.floor(Math.random() * TEMAS_DEBATE.length)];
}

// ── .debate — Inicia com tema automático ou manual ────────────
async function debate(ctx) {
  const { sock, from, args, reply, groupMeta } = ctx;
  if (!groupMeta) return reply("❌ Apenas em grupos!");
  if (debateAtivo.has(from)) return reply(
    `⚠️ Já existe um debate em curso!\n\n` +
    `📌 *Tema:* ${debateAtivo.get(from).tema}\n\n` +
    `Use *${p}fimdebate* para encerrar.`
  );

  // Se não passar tema, gera automaticamente
  const tema = args.join(" ").trim() || getTemaAleatorio();

  debateAtivo.set(from, {
    tema,
    votos:  {},
    inicio: Date.now(),
    auto:   !args.length,
  });

  const participants = groupMeta.participants.map((p) => p.id);

  await sock.sendMessage(from, {
    text:
      `🎙️ *DEBATE INICIADO!*\n\n` +
      `${args.length ? "📌" : "🎲"} *Tema${!args.length ? " (gerado automaticamente)" : ""}:*\n` +
      `_${tema}_\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `╭── *Como participar:*\n` +
      `│ ✅ *${p}favor* — Apoio o tema\n` +
      `│ ❌ *${p}contra* — Sou contra\n` +
      `│ 📊 *${p}votos* — Ver resultado\n` +
      `╰── 🛑 *${p}fimdebate* — Encerrar\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `_🤖 Lutchi Zap Hack — Debate iniciado!_`,
    mentions: participants,
  });
}

// ── .novotema — Troca o tema automaticamente ──────────────────
async function novotema(ctx) {
  const { from, reply } = ctx;
  const debate = debateAtivo.get(from);
  if (!debate) return reply(`❌ Nenhum debate em curso!\nUse *${p}debate* para iniciar.`);

  const novoTema = getTemaAleatorio();
  debate.tema   = novoTema;
  debate.votos  = {}; // Zera votos ao mudar tema
  debate.auto   = true;

  return reply(
    `🎲 *NOVO TEMA GERADO!*\n\n` +
    `📌 _${novoTema}_\n\n` +
    `🔄 Votos anteriores foram zerados.\n\n` +
    `✅ *${p}favor* | ❌ *${p}contra* | 📊 *${p}votos*\n\n` +
    `_🤖 Lutchi Zap Hack_`
  );
}

// ── .favor — Voto a favor ─────────────────────────────────────
async function votoFavor(ctx) {
  const { from, sender, reply } = ctx;
  const debate = debateAtivo.get(from);
  if (!debate) return reply(`❌ Nenhum debate em curso!\nUse *${p}debate* para iniciar.`);

  const jaVotou = debate.votos[sender];
  debate.votos[sender] = "favor";

  return reply(
    jaVotou
      ? `✅ Voto *alterado para A FAVOR*!`
      : `✅ Voto registado *A FAVOR*!\n\n📌 _${debate.tema}_`
  );
}

// ── .contra — Voto contra ─────────────────────────────────────
async function votoContra(ctx) {
  const { from, sender, reply } = ctx;
  const debate = debateAtivo.get(from);
  if (!debate) return reply(`❌ Nenhum debate em curso!\nUse *${p}debate* para iniciar.`);

  const jaVotou = debate.votos[sender];
  debate.votos[sender] = "contra";

  return reply(
    jaVotou
      ? `❌ Voto *alterado para CONTRA*!`
      : `❌ Voto registado *CONTRA*!\n\n📌 _${debate.tema}_`
  );
}

// ── .votos — Ver resultado parcial ───────────────────────────
async function verVotos(ctx) {
  const { from, reply } = ctx;
  const debate = debateAtivo.get(from);
  if (!debate) return reply(`❌ Nenhum debate em curso!\nUse *${p}debate* para iniciar.`);

  const favor  = Object.values(debate.votos).filter((v) => v === "favor").length;
  const contra = Object.values(debate.votos).filter((v) => v === "contra").length;
  const total  = favor + contra;

  const barraFavor  = total > 0 ? Math.round((favor  / total) * 10) : 0;
  const barraContra = total > 0 ? Math.round((contra / total) * 10) : 0;

  const liderando = favor > contra
    ? "✅ *A FAVOR* está a liderar!"
    : contra > favor
    ? "❌ *CONTRA* está a liderar!"
    : "🤝 Empate por agora!";

  const duracao = Math.floor((Date.now() - debate.inicio) / 60000);

  return reply(
    `📊 *RESULTADO PARCIAL*\n\n` +
    `📌 *Tema:*\n_${debate.tema}_\n\n` +
    `✅ A favor:  ${"🟩".repeat(barraFavor)}${"⬜".repeat(10 - barraFavor)} *${favor}*\n` +
    `❌ Contra:   ${"🟥".repeat(barraContra)}${"⬜".repeat(10 - barraContra)} *${contra}*\n\n` +
    `👥 *Total de votos:* ${total}\n` +
    `⏱️ *Duração:* ${duracao} minuto(s)\n\n` +
    `🏅 ${liderando}\n\n` +
    `_🤖 Lutchi Zap Hack_`
  );
}

// ── .fimdebate — Encerra e mostra resultado final ─────────────
async function fimDebate(ctx) {
  const { from, reply } = ctx;
  const debate = debateAtivo.get(from);
  if (!debate) return reply(`❌ Nenhum debate em curso!\nUse *${p}debate* para iniciar.`);

  const favor  = Object.values(debate.votos).filter((v) => v === "favor").length;
  const contra = Object.values(debate.votos).filter((v) => v === "contra").length;
  const total  = favor + contra;
  const duracao = Math.floor((Date.now() - debate.inicio) / 60000);

  const barraFavor  = total > 0 ? Math.round((favor  / total) * 10) : 0;
  const barraContra = total > 0 ? Math.round((contra / total) * 10) : 0;

  const vencedor = favor > contra
    ? "✅ *A FAVOR venceu!* 🏆"
    : contra > favor
    ? "❌ *CONTRA venceu!* 🏆"
    : "🤝 *EMPATE!* Ninguém venceu!";

  debateAtivo.delete(from);

  return reply(
    `🏁 *DEBATE ENCERRADO!*\n\n` +
    `📌 *Tema:*\n_${debate.tema}_\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `✅ A favor:  ${"🟩".repeat(barraFavor)}${"⬜".repeat(10 - barraFavor)} *${favor}*\n` +
    `❌ Contra:   ${"🟥".repeat(barraContra)}${"⬜".repeat(10 - barraContra)} *${contra}*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👥 *Total de votos:* ${total}\n` +
    `⏱️ *Duração:* ${duracao} minuto(s)\n\n` +
    `🏆 *Resultado: ${vencedor}*\n\n` +
    `_🤖 Lutchi Zap Hack — Obrigado a todos por participarem!_`
  );
}

// ── .temadebate — Sugere um tema sem iniciar ─────────────────
async function temadebate(ctx) {
  const { reply } = ctx;
  const tema = getTemaAleatorio();
  return reply(
    `🎲 *SUGESTÃO DE TEMA*\n\n` +
    `💡 _${tema}_\n\n` +
    `Use *${p}debate* para iniciar com este tema\n` +
    `ou *${p}temadebate* para outra sugestão!\n\n` +
    `_🤖 Lutchi Zap Hack_`
  );
}

module.exports = {
  debate, novotema, votoFavor, votoContra,
  verVotos, fimDebate, temadebate,
};
