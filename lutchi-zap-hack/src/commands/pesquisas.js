const axios = require("axios");
const p = ".";
const headers = { "User-Agent": "LutchiBot/1.0 (WhatsApp Bot)" };

async function wikipedia(ctx) {
  const { args, reply } = ctx;
  const query = args.join(" ");
  if (!query) return reply("❌ Use: .wikipedia Assunto");
  await reply("🔍 Pesquisando *" + query + "*...");
  try {
    const res = await axios.get("https://pt.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(query), { timeout: 15000, headers });
    if (!res.data?.extract) return reply("❌ Nenhum resultado encontrado!");
    const texto = res.data.extract.slice(0, 700);
    return reply("📖 *" + res.data.title + "*\n\n" + texto + "\n\n🔗 " + (res.data.content_urls?.mobile?.page || ""));
  } catch (e) { return reply("❌ Não encontrei nada sobre *" + query + "*!"); }
}

async function traduzir(ctx) {
  const { args, reply } = ctx;
  if (args.length < 2) return reply("❌ Use: .traduzir en Texto\n\nCódigos: pt, en, es, fr, de, it, ja, zh, ar");
  const lang = args[0].toLowerCase();
  const texto = args.slice(1).join(" ");
  await reply("⏳ Traduzindo...");
  try {
    const res = await axios.get("https://api.mymemory.translated.net/get?q=" + encodeURIComponent(texto) + "&langpair=pt|" + lang, { timeout: 15000 });
    const traducao = res.data?.responseData?.translatedText;
    if (!traducao || traducao.toLowerCase().includes("mymemory")) return reply("❌ Erro ao traduzir! Verifique o código do idioma.");
    return reply("🌍 *TRADUÇÃO*\n\n📝 Original: _" + texto + "_\n✅ Traduzido (" + lang + "): *" + traducao + "*");
  } catch (e) { return reply("❌ Erro ao traduzir: " + e.message); }
}

async function clima(ctx) {
  const { args, reply } = ctx;
  const cidade = args.join(" ") || "Luanda";
  try {
    const res = await axios.get("https://wttr.in/" + encodeURIComponent(cidade) + "?format=%l:+%c+%t,+Humidade:+%h,+Vento:+%w&lang=pt", { timeout: 10000, headers });
    if (!res.data || res.data.includes("Unknown")) return reply("❌ Cidade *" + cidade + "* não encontrada!");
    return reply("🌤️ *PREVISÃO DO TEMPO*\n\n📍 " + res.data + "\n\n🌐 Fonte: wttr.in");
  } catch (e) { return reply("❌ Erro ao obter clima de *" + cidade + "*!"); }
}

async function dicionario(ctx) {
  const { args, reply } = ctx;
  const palavra = args[0];
  if (!palavra) return reply("❌ Use: .dicionario palavra");
  await reply("🔍 Procurando *" + palavra + "*...");
  try {
    const res = await axios.get("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(palavra), { timeout: 10000, headers });
    const data = res.data[0];
    const meaning = data?.meanings?.[0]?.definitions?.[0]?.definition;
    if (!meaning) return reply("❌ Palavra não encontrada!");
    return reply("📖 *DICIONÁRIO*\n\n🔤 Palavra: *" + palavra + "*\n🔊 Pronúncia: _" + (data?.phonetic || "N/A") + "_\n\n📝 " + meaning);
  } catch (e) { return reply("❌ Palavra *" + args[0] + "* não encontrada!"); }
}

async function noticias(ctx) {
  const { args, reply } = ctx;
  const tema = args.join(" ") || "Angola";
  await reply("📰 Buscando notícias sobre *" + tema + "*...");
  try {
    const res = await axios.get("https://gnews.io/api/v4/search?q=" + encodeURIComponent(tema) + "&lang=pt&max=5&token=demo", { timeout: 15000, headers });
    const articles = res.data?.articles;
    if (!articles?.length) return reply("❌ Nenhuma notícia encontrada sobre *" + tema + "*!");
    const lista = articles.slice(0, 4).map((a, i) => (i+1) + ". *" + a.title + "*\n📅 " + (a.publishedAt||"").slice(0,10) + "\n🔗 " + a.url).join("\n\n");
    return reply("📰 *NOTÍCIAS: " + tema.toUpperCase() + "*\n\n" + lista);
  } catch (e) { return reply("❌ Erro ao buscar notícias!"); }
}

async function movie(ctx) {
  const { args, reply } = ctx;
  const nome = args.join(" ");
  if (!nome) return reply("❌ Use: .movie Nome do filme");
  await reply("🎬 Procurando *" + nome + "*...");
  try {
    const res = await axios.get("https://www.omdbapi.com/?t=" + encodeURIComponent(nome) + "&apikey=trilogy", { timeout: 15000 });
    const m = res.data;
    if (m.Response === "False") return reply("❌ Filme *" + nome + "* não encontrado!");
    return reply("🎬 *" + m.Title + "* (" + m.Year + ")\n\n⭐ Nota: *" + m.imdbRating + "/10*\n🎭 Gênero: " + m.Genre + "\n🎬 Diretor: " + m.Director + "\n⏱️ Duração: " + m.Runtime + "\n🌍 País: " + m.Country + "\n\n📝 *Sinopse:*\n" + m.Plot);
  } catch (e) { return reply("❌ Erro ao buscar filme!"); }
}

async function serie(ctx) {
  const { args, reply } = ctx;
  const nome = args.join(" ");
  if (!nome) return reply("❌ Use: .serie Nome da série");
  await reply("📺 Procurando *" + nome + "*...");
  try {
    const res = await axios.get("https://www.omdbapi.com/?t=" + encodeURIComponent(nome) + "&type=series&apikey=trilogy", { timeout: 15000 });
    const s = res.data;
    if (s.Response === "False") return reply("❌ Série *" + nome + "* não encontrada!");
    return reply("📺 *" + s.Title + "* (" + s.Year + ")\n\n⭐ Nota: *" + s.imdbRating + "/10*\n🎭 Gênero: " + s.Genre + "\n📅 Temporadas: " + (s.totalSeasons||"N/A") + "\n\n📝 *Sinopse:*\n" + s.Plot);
  } catch (e) { return reply("❌ Erro ao buscar série!"); }
}

async function receita(ctx) {
  const { args, reply } = ctx;
  const prato = args.join(" ");
  if (!prato) return reply("❌ Use: .receita Nome do prato");
  await reply("🍽️ Procurando receita de *" + prato + "*...");
  try {
    const res = await axios.get("https://www.themealdb.com/api/json/v1/1/search.php?s=" + encodeURIComponent(prato), { timeout: 15000, headers });
    const meal = res.data?.meals?.[0];
    if (!meal) return reply("❌ Receita de *" + prato + "* não encontrada!");
    const ingredients = [];
    for (let i = 1; i <= 8; i++) {
      if (meal["strIngredient" + i]) ingredients.push("• " + meal["strMeasure" + i] + " " + meal["strIngredient" + i]);
    }
    return reply("🍽️ *" + meal.strMeal + "*\n\n🌍 Origem: " + (meal.strArea||"N/A") + "\n🏷️ Categoria: " + (meal.strCategory||"N/A") + "\n\n🛒 *Ingredientes:*\n" + ingredients.join("\n") + "\n\n👨‍🍳 *Preparo:*\n" + (meal.strInstructions||"").slice(0, 400) + "...");
  } catch (e) { return reply("❌ Erro ao buscar receita!"); }
}

async function chatgpt(ctx) {
  const { args, reply } = ctx;
  const pergunta = args.join(" ");
  if (!pergunta) return reply("❌ Use: .chatgpt Sua pergunta");
  await reply("🤖 Pensando...");
  try {
    const res = await axios.post("https://api.agatz.xyz/api/mistral", { message: pergunta }, { timeout: 30000, headers });
    const resposta = res.data?.data || res.data?.message || res.data?.response;
    if (!resposta) return reply("❌ Sem resposta da IA!");
    return reply("🤖 *LUTCHI IA*\n\n" + resposta);
  } catch (e) { return reply("❌ Erro ao consultar IA!"); }
}

async function signo(ctx) {
  const { args, reply } = ctx;
  const nome = args.join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const signos = {
    aries: { emoji: "♈", periodo: "21/03 - 19/04", elemento: "Fogo", planeta: "Marte" },
    touro: { emoji: "♉", periodo: "20/04 - 20/05", elemento: "Terra", planeta: "Vênus" },
    gemeos: { emoji: "♊", periodo: "21/05 - 20/06", elemento: "Ar", planeta: "Mercúrio" },
    cancer: { emoji: "♋", periodo: "21/06 - 22/07", elemento: "Água", planeta: "Lua" },
    leao: { emoji: "♌", periodo: "23/07 - 22/08", elemento: "Fogo", planeta: "Sol" },
    virgem: { emoji: "♍", periodo: "23/08 - 22/09", elemento: "Terra", planeta: "Mercúrio" },
    libra: { emoji: "♎", periodo: "23/09 - 22/10", elemento: "Ar", planeta: "Vênus" },
    escorpiao: { emoji: "♏", periodo: "23/10 - 21/11", elemento: "Água", planeta: "Plutão" },
    sagitario: { emoji: "♐", periodo: "22/11 - 21/12", elemento: "Fogo", planeta: "Júpiter" },
    capricornio: { emoji: "♑", periodo: "22/12 - 19/01", elemento: "Terra", planeta: "Saturno" },
    aquario: { emoji: "♒", periodo: "20/01 - 18/02", elemento: "Ar", planeta: "Urano" },
    peixes: { emoji: "♓", periodo: "19/02 - 20/03", elemento: "Água", planeta: "Netuno" },
  };
  if (!nome) return reply("❌ Use: .signo nome\n\nSignos: " + Object.keys(signos).join(", "));
  const s = signos[nome];
  if (!s) return reply("❌ Signo não encontrado!\n\nUse: " + Object.keys(signos).join(", "));
  return reply(s.emoji + " *" + nome.toUpperCase() + "*\n\n📅 Período: " + s.periodo + "\n🌊 Elemento: " + s.elemento + "\n🪐 Planeta: " + s.planeta);
}

async function obesidade(ctx) {
  const { args, reply } = ctx;
  if (args.length < 2) return reply("❌ Use: .obesidade peso altura\nEx: .obesidade 70 1.75");
  const peso = parseFloat(args[0]);
  const altura = parseFloat(args[1]);
  if (isNaN(peso) || isNaN(altura)) return reply("❌ Valores inválidos!");
  const imc = peso / (altura * altura);
  const classificacao = imc < 18.5 ? "Abaixo do peso 🟡" : imc < 25 ? "Peso normal ✅" : imc < 30 ? "Sobrepeso 🟠" : imc < 35 ? "Obesidade grau I 🔴" : imc < 40 ? "Obesidade grau II 🔴" : "Obesidade grau III 🚨";
  return reply("⚖️ *IMC*\n\n🏋️ Peso: " + peso + "kg\n📏 Altura: " + altura + "m\n📊 IMC: *" + imc.toFixed(2) + "*\n🏥 *" + classificacao + "*");
}

async function flagpedia(ctx) {
  const { args, reply, sock, from, msg } = ctx;
  const pais = args.join(" ");
  if (!pais) return reply("❌ Use: .flagpedia País");
  await reply("🔍 Procurando *" + pais + "*...");
  try {
    const res = await axios.get("https://restcountries.com/v3.1/name/" + encodeURIComponent(pais), { timeout: 10000, headers });
    const country = res.data[0];
    const flagUrl = country?.flags?.png;
    const nome = country?.translations?.por?.common || country?.name?.common;
    if (!flagUrl) return reply("❌ País não encontrado!");
    const buffer = Buffer.from((await axios.get(flagUrl, { responseType: "arraybuffer", headers })).data);
    await sock.sendMessage(from, { image: buffer, caption: "🏳️ *" + nome.toUpperCase() + "*\n\n🏙️ Capital: " + (country?.capital?.[0]||"N/A") + "\n👥 População: " + (country?.population?.toLocaleString("pt-BR")||"N/A") + "\n💰 Moeda: " + (Object.values(country?.currencies||{})[0]?.name||"N/A") }, { quoted: msg });
  } catch (e) { return reply("❌ País não encontrado!"); }
}

async function tinyurl(ctx) {
  const { args, reply } = ctx;
  const url = args[0];
  if (!url) return reply("❌ Use: .tinyurl <link>");
  try {
    const res = await axios.get("https://tinyurl.com/api-create.php?url=" + encodeURIComponent(url), { timeout: 10000, headers });
    return reply("🔗 *Link encurtado:*\n" + res.data);
  } catch (e) { return reply("❌ Erro ao encurtar link!"); }
}

async function googlesrc(ctx) {
  const { args, reply } = ctx;
  const query = args.join(" ");
  if (!query) return reply("❌ Use: .googlesrc Assunto");
  return reply("🔍 *PESQUISA GOOGLE*\n\nhttps://www.google.com/search?q=" + encodeURIComponent(query));
}

async function gimage(ctx) {
  const { args, reply } = ctx;
  const query = args.join(" ");
  if (!query) return reply("❌ Use: .gimage Assunto");
  return reply("🖼️ *IMAGENS GOOGLE*\n\nhttps://www.google.com/images?q=" + encodeURIComponent(query));
}

module.exports = { wikipedia, traduzir, clima, dicionario, noticias, movie, serie, receita, chatgpt, signo, obesidade, flagpedia, tinyurl, googlesrc, gimage };
