async function listar(ctx) {
  const { sock, from, msg } = ctx;

  const comandos = {
    "📋 INFO": ["lutchi", "menu", "ping", "info", "link", "regras", "setregras", "sticker", "dono", "sobre"],
    "👥 MEMBROS (Admin)": ["ban", "kick", "add", "promover", "rebaixar", "todos", "clonar"],
    "🏠 GRUPO (Admin)": ["fechar", "abrir", "nome", "desc", "foto", "revogar", "apagar"],
    "🛡️ MODERAÇÃO (Admin)": ["warn", "warnings", "resetwarn", "mute", "unmute", "antilink", "antiflood", "banword"],
    "📥 DOWNLOADS": ["play", "playvid", "youtube", "tiktok", "instagram", "facebook", "kwai", "spotify", "soundcloud", "mediafire", "tomp3"],
    "🔓 REVELAR (Admin)": ["revelarft"],
    "🎨 STICKERS": ["sticker", "toimg", "togif", "attp", "ttp", "brat", "emojimix", "stickerinfo", "gerarlink"],
    "🔍 PESQUISAS": ["wikipedia", "traduzir", "clima", "dicionario", "noticias", "movie", "serie", "receita", "chatgpt", "signo", "obesidade", "flagpedia", "tinyurl", "googlesrc", "gimage"],
    "🎮 DIVERSÃO": ["dado", "flip", "sorteio", "enquete", "citar", "cantadas", "conselhos", "conselhobiblico", "spoiler", "fazernick", "calcular", "letramusica", "perfil", "tabela", "ddd", "debate"],
  };

  let total = 0;
  let texto = "📋 *COMANDOS REGISTADOS NO BOT*\n\n";

  for (const [categoria, cmds] of Object.entries(comandos)) {
    total += cmds.length;
    texto += "━━━━ " + categoria + " ━━━━\n";
    texto += cmds.map(c => "`."+c+"`").join(" • ") + "\n\n";
  }

  texto += "━━━━━━━━━━━━━━━━━━\n";
  texto += "📊 *Total: " + total + " comandos*\n";
  texto += "🔖 *Prefixo:* `.`";

  return sock.sendMessage(from, { text: texto }, { quoted: msg });
}

module.exports = { listar };
