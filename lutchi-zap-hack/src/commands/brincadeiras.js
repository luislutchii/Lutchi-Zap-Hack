const axios = require("axios");
const p = ".";

const cantadasList = ["Se você fosse WiFi, eu já teria conectado! 📶","Deve ser ilegal ser tão lindo(a) assim! 😍","Você caiu do céu? Porque parece um milagre! 😇","Se a beleza fosse tempo, você seria a eternidade! ⏳","Você é igual ao sol: ilumina tudo e dói olhar direto! ☀️","Posso te seguir? Minha mãe disse para seguir meus sonhos! 💭","Você tem um mapa? Me perdi nos seus olhos! 🗺️","Você é médico? Meu coração acelerou quando te vi! 💓","Se você fosse uma estrela, seria a mais brilhante! ⭐","Você é CuTe — feito de Cobre e Telúrio! ⚗️"];
const conselhosList = ["Acredite em si mesmo mesmo quando ninguém mais acreditar! 💪","O sucesso é a soma de pequenos esforços repetidos dia após dia! 🏆","Não espere o momento perfeito, torne o momento perfeito! ✨","A persistência é o caminho do êxito! 🚀","Não desista! O começo é sempre o mais difícil! 💎","Cada dia é uma nova oportunidade para mudar sua vida! 🌅","O fracasso é a oportunidade de começar de novo com mais inteligência! 🔄"];
const frasesbiblicas = ["\"Tudo posso naquele que me fortalece.\" — Filipenses 4:13 📖","\"O Senhor é o meu pastor e nada me faltará.\" — Salmos 23:1 📖","\"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.\" — João 3:16 📖","\"Sede fortes e corajosos. Não tenhais medo.\" — Josué 1:9 📖","\"Em tudo dai graças, porque esta é a vontade de Deus.\" — 1 Tessalonicenses 5:18 📖","\"Confia no Senhor de todo o teu coração.\" — Provérbios 3:5 📖"];

async function cantadas(ctx) {
  const { sock, from, msg } = ctx;
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const cantada = cantadasList[Math.floor(Math.random() * cantadasList.length)];
  if (mentioned.length > 0) return sock.sendMessage(from, { text: "💘 *CANTADA PARA @" + mentioned[0].split("@")[0] + "*\n\n_" + cantada + "_", mentions: mentioned }, { quoted: msg });
  return sock.sendMessage(from, { text: "💘 *CANTADA*\n\n_" + cantada + "_" }, { quoted: msg });
}

async function conselhos(ctx) {
  return ctx.reply("💡 *CONSELHO DO DIA*\n\n_" + conselhosList[Math.floor(Math.random() * conselhosList.length)] + "_");
}

async function conselhobiblico(ctx) {
  return ctx.reply("✝️ *CONSELHO BÍBLICO*\n\n" + frasesbiblicas[Math.floor(Math.random() * frasesbiblicas.length)]);
}

async function spoiler(ctx) {
  const { args, reply } = ctx;
  const texto = args.join(" ");
  if (!texto) return reply("❌ Use: .spoiler Seu texto");
  return reply("🙈 *SPOILER*\n\n||" + texto + "||");
}

async function fazernick(ctx) {
  const { args, reply } = ctx;
  const nome = args.join(" ");
  if (!nome) return reply("❌ Use: .fazernick Seu Nome");
  const estilos = [nome.split("").join("·"), "彡" + nome + "彡", "꧁" + nome + "꧂", "『" + nome + "』", "【" + nome + "】", "★" + nome + "★", "•°•" + nome + "•°•"];
  return reply("✨ *NICKS PARA: " + nome + "*\n\n" + estilos.map((s, i) => (i+1) + ". " + s).join("\n"));
}

async function ddd(ctx) {
  const { args, reply } = ctx;
  const codigo = args[0];
  if (!codigo) return reply("❌ Use: .ddd 11");
  const ddds = {"11":"São Paulo - SP","21":"Rio de Janeiro - RJ","31":"Belo Horizonte - MG","41":"Curitiba - PR","51":"Porto Alegre - RS","61":"Brasília - DF","71":"Salvador - BA","81":"Recife - PE","85":"Fortaleza - CE","91":"Belém - PA","92":"Manaus - AM"};
  const cidade = ddds[codigo];
  if (!cidade) return reply("❌ DDD *" + codigo + "* não encontrado!");
  return reply("📞 *DDD " + codigo + "*\n\n📍 Região: *" + cidade + "*");
}

async function calcular(ctx) {
  const { args, reply } = ctx;
  const expr = args.join("").replace(/[^0-9+\-*/.()%]/g, "");
  if (!expr) return reply("❌ Use: .calcular 2+2");
  try {
    const result = Function('"use strict"; return (' + expr + ')')();
    if (!isFinite(result)) return reply("❌ Resultado inválido!");
    return reply("🧮 *CALCULADORA*\n\n📝 " + expr + "\n✅ = *" + result + "*");
  } catch (e) { return reply("❌ Expressão inválida!"); }
}

async function dado(ctx) {
  const { args, reply } = ctx;
  let lados = parseInt(args[0]) || 6;
  if (lados < 2) lados = 6;
  if (lados > 100) lados = 100;
  const resultado = Math.floor(Math.random() * lados) + 1;
  const faces = ["⚀","⚁","⚂","⚃","⚄","⚅"];
  return reply((lados === 6 ? faces[resultado-1] : "🎲") + " *DADO DE " + lados + " LADOS*\n\n🎯 Resultado: *" + resultado + "*");
}

async function flip(ctx) {
  return ctx.reply("🪙 *CARA OU COROA*\n\n🎯 Resultado: *" + (Math.random() < 0.5 ? "CARA 🪙" : "COROA 🏅") + "*");
}

async function sorteio(ctx) {
  const { sock, from, reply, groupMeta, isGroup } = ctx;
  if (!isGroup) return reply("❌ Apenas em grupos!");
  if (!groupMeta) return reply("❌ Erro ao obter membros!");
  const members = groupMeta.participants;
  if (members.length < 2) return reply("❌ Precisa de pelo menos 2 membros!");
  const winner = members[Math.floor(Math.random() * members.length)];
  return sock.sendMessage(from, { text: "🎉 *SORTEIO!*\n\n🏆 Vencedor: *@" + winner.id.split("@")[0] + "*\n\n🎊 Parabéns!!!", mentions: [winner.id] });
}

async function enquete(ctx) {
  const { sock, from, msg, args, reply } = ctx;
  const parts = args.join(" ").split("|").map(s => s.trim());
  if (parts.length < 3) return reply("❌ Use: .enquete Pergunta? | Opção 1 | Opção 2");
  const options = parts.slice(1);
  if (options.length > 12) return reply("❌ Máximo de 12 opções!");
  try {
    await sock.sendMessage(from, { poll: { name: parts[0], values: options, selectableCount: 1 } }, { quoted: msg });
  } catch (e) {
    const emojis = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","🔢","🔣"];
    return reply("📊 *ENQUETE*\n\n❓ " + parts[0] + "\n\n" + options.map((o,i) => emojis[i] + " " + o).join("\n"));
  }
}

async function citar(ctx) {
  const { sock, from, msg, reply } = ctx;
  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  if (!quoted) return reply("❌ Responda uma mensagem com *.citar*");
  const texto = quoted.quotedMessage?.conversation || quoted.quotedMessage?.extendedTextMessage?.text || "[Mídia]";
  const participant = quoted.participant || quoted.remoteJid;
  return sock.sendMessage(from, { text: "💬 *CITAÇÃO*\n\n_\"" + texto + "\"_\n\n— @" + participant?.split("@")[0], mentions: [participant] }, { quoted: msg });
}

async function letramusica(ctx) {
  const { args, reply } = ctx;
  const musica = args.join(" ");
  if (!musica) return reply("❌ Use: .letramusica Nome da música");
  return reply("🎵 *LETRA DE MÚSICA*\n\nPesquise *" + musica + "* em:\n🔗 https://www.letras.mus.br/busca/?q=" + encodeURIComponent(musica) + "\n🔗 https://genius.com/search?q=" + encodeURIComponent(musica));
}

async function perfil(ctx) {
  const { sock, from, msg, sender, reply } = ctx;
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const target = mentioned[0] || sender;
  const num = target.split("@")[0];
  const frases = ["Alguém disse que é gato(a) 😏","Pessoa de alto nível 👑","Perigoso(a) de se apaixonar 💘","100% original, sem cópia 🔥","Modo silencioso, poder máximo 😎","Chegou sem avisar e dominou! 🌪️","O grupo nunca mais foi o mesmo! 💥","Bonito(a) por fora, incrível por dentro 😈"];
  const frase = frases[Math.floor(Math.random() * frases.length)];
  const forca = Math.floor(Math.random() * 100) + 1;
  const beleza = Math.floor(Math.random() * 100) + 1;
  const sorte = Math.floor(Math.random() * 100) + 1;
  const inteligencia = Math.floor(Math.random() * 100) + 1;
  const barras = (val) => "█".repeat(Math.floor(val / 10)) + "░".repeat(10 - Math.floor(val / 10));
  try {
    const pp = await sock.profilePictureUrl(target, "image").catch(() => null);
    const statusInfo = await sock.fetchStatus(target).catch(() => null);
    const caption = "👤 *PERFIL DE @" + num + "*\n\n📱 Número: +" + num + "\n💬 Status: " + (statusInfo?.status || "Sem status") + "\n\n━━━━ 📊 *STATS* ━━━━\n💪 Força:        " + barras(forca) + " " + forca + "%\n😍 Beleza:       " + barras(beleza) + " " + beleza + "%\n🍀 Sorte:        " + barras(sorte) + " " + sorte + "%\n🧠 Inteligência: " + barras(inteligencia) + " " + inteligencia + "%\n━━━━━━━━━━━━━━\n✨ _" + frase + "_";
    if (pp) {
      const res = await axios.get(pp, { responseType: "arraybuffer" });
      await sock.sendMessage(from, { image: Buffer.from(res.data), caption }, { quoted: msg });
    } else {
      await sock.sendMessage(from, { text: caption + "\n\n🖼️ _Sem foto de perfil_" }, { quoted: msg });
    }
  } catch (e) { return reply("❌ Erro ao obter perfil!"); }
}

async function tabela(ctx) {
  const { args, reply } = ctx;
  const nick = args.join(" ");
  if (!nick) return reply("❌ Use: .tabela SeuNick");
  return reply("🏷️ *TABELA PARA: " + nick + "*\n\n┌─────────────────┐\n│ " + nick.padEnd(17) + " │\n└─────────────────┘\n\n╔═════════════════╗\n║ " + nick.padEnd(17) + " ║\n╚═════════════════╝\n\n彡 " + nick + " 彡");
}

async function debate(ctx) {
  const { args, sock, from, msg } = ctx;
  const temas = ["Android é melhor que iPhone? 📱","Dinheiro traz felicidade? 💰","Redes sociais fazem mal à saúde mental? 📵","Futebol é melhor que basquete? ⚽🏀","Trabalhar em casa é melhor que no escritório? 🏠","A escola prepara para a vida real? 🎓","Relacionamento à distância funciona? ❤️","Angola tem futuro brilhante? 🇦🇴","Riqueza ou saúde, qual escolhes? 💪💸","Amizade verdadeira existe hoje em dia? 🤝","Tecnologia está destruindo as relações humanas? 🤖","Vale a pena casar jovem? 💍","Quem traiu uma vez, trai sempre? 💔"];
  let tema = args.join(" ");
  if (!tema) tema = temas[Math.floor(Math.random() * temas.length)];
  return sock.sendMessage(from, { text: "🎙️ *DEBATE DO GRUPO!*\n\n━━━━━━━━━━━━━━━━━━\n❓ *" + tema + "*\n━━━━━━━━━━━━━━━━━━\n\n👍 *A FAVOR* — Dê os seus argumentos!\n👎 *CONTRA* — Mostre o teu ponto de vista!\n\n_Respeite as opiniões de todos!_ 🤝" }, { quoted: msg });
}

module.exports = { cantadas, conselhos, conselhobiblico, spoiler, fazernick, ddd, calcular, dado, flip, sorteio, enquete, citar, letramusica, perfil, tabela, debate };
