let botAtivo = true;
let modoBot = "todos"; // "todos" ou "admins"

async function ligarbot(ctx) {
  const { reply, isOwner } = ctx;
  if (!isOwner) return reply("❌ Apenas o dono pode usar este comando!");
  botAtivo = true;
  return reply("✅ Bot *ligado*! Respondendo a todos os comandos.");
}

async function desligarbot(ctx) {
  const { reply, isOwner } = ctx;
  if (!isOwner) return reply("❌ Apenas o dono pode usar este comando!");
  botAtivo = false;
  return reply("⛔ Bot *desligado*! Apenas o dono consegue usá-lo.");
}

async function modobot(ctx) {
  const { reply, isOwner, args } = ctx;
  if (!isOwner) return reply("❌ Apenas o dono pode usar este comando!");
  const modo = args[0]?.toLowerCase();
  if (!modo || !["todos", "admins"].includes(modo))
    return reply("❌ Use: .modobot todos  ou  .modobot admins");
  modoBot = modo;
  return reply(`✅ Modo do bot alterado para *${modoBot}*!`);
}

function isBotAtivo() { return botAtivo; }
function getModoBot() { return modoBot; }

module.exports = { ligarbot, desligarbot, modobot, isBotAtivo, getModoBot };
