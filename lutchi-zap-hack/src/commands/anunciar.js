const config = require("../config/config");

// Importar o Map de status do arquivo anuncio.js
// Como não podemos importar diretamente, vamos criar uma função para ler do mesmo arquivo
const ANUNCIO_STATUS_FILE = "/data/data/com.termux/files/home/Lutchi-Zap-Hack/lutchi-zap-hack/data/status.json";

function getAnuncioStatus() {
  try {
    const fs = require("fs");
    if (fs.existsSync(ANUNCIO_STATUS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ANUNCIO_STATUS_FILE, "utf8"));
      return data;
    }
  } catch (e) {}
  return {};
}

function saveAnuncioStatus(status) {
  try {
    const fs = require("fs");
    const dir = require("path").dirname(ANUNCIO_STATUS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ANUNCIO_STATUS_FILE, JSON.stringify(status, null, 2));
  } catch (e) {}
}

// ── ANÚNCIO GLOBAL DO DONO (só envia para grupos com .anuncio ativo) ─────
async function anunciarGlobal(ctx) {
  const { sock, from, args, reply, isOwner } = ctx;
  
  // Verificar se é o dono
  if (!isOwner) {
    return reply("🔒 *Acesso negado!*\n\nApenas o *dono do bot* pode usar este comando.\n\n📞 Contato do dono: " + config.owner.number);
  }
  
  const texto = args.join(" ");
  if (!texto) {
    return reply(
      `📢 *COMANDO ANÚNCIO GLOBAL*\n\n` +
      `Use: *${config.prefix}anunciar* <mensagem>\n\n` +
      `Exemplo:\n` +
      `${config.prefix}anunciar 📢 Hoje tem atualização no bot!\n\n` +
      `⚠️ *Atenção:* O anúncio só será enviado para grupos onde o *ANÚNCIO ESTÁ ATIVO* (.anuncio on).`
    );
  }
  
  await reply(`📢 *Iniciando anúncio global...*\n\nMensagem: "${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}"\n\n⏳ Verificando grupos com anúncio ativo...`);
  
  try {
    // Buscar TODOS os grupos que o bot participa
    const groups = await sock.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);
    
    if (groupIds.length === 0) {
      return reply("❌ O bot não está em nenhum grupo no momento.");
    }
    
    // Carregar status dos anúncios
    const statusAnuncios = getAnuncioStatus();
    
    let enviados = 0;
    let inativos = 0;
    let falhas = 0;
    let gruposAtivos = [];
    let gruposInativos = [];
    let gruposComErro = [];
    
    // Mensagem de anúncio formatada
    const mensagemAnuncio = `📢 *ANÚNCIO DO DONO*\n\n━━━━━━━━━━━━━━━━━━━━\n\n${texto}\n\n━━━━━━━━━━━━━━━━━━━━\n\n👑 *Dono:* ${config.ownerName}\n📸 *Instagram:* @${config.instagram}\n🤖 *Bot:* ${config.botName}`;
    
    // Enviar apenas para grupos onde o anúncio está ativo
    for (const groupId of groupIds) {
      const groupName = groups[groupId]?.subject || groupId;
      const anuncioAtivo = statusAnuncios[groupId] !== false; // true ou undefined = ativo, false = desativado
      
      if (!anuncioAtivo) {
        inativos++;
        gruposInativos.push(groupName);
        continue;
      }
      
      // Verificar se o bot é admin no grupo
      const botId = (sock.user?.id ?? "").split(":")[0] + "@s.whatsapp.net";
      const groupMeta = await sock.groupMetadata(groupId).catch(() => null);
      const isBotAdmin = groupMeta?.participants?.some(p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin')) || false;
      
      if (!isBotAdmin) {
        inativos++;
        gruposInativos.push(`${groupName} (bot não é admin)`);
        continue;
      }
      
      gruposAtivos.push(groupName);
      
      try {
        await sock.sendMessage(groupId, { text: mensagemAnuncio });
        enviados++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        falhas++;
        gruposComErro.push(groupName);
        console.log(`❌ Falha ao enviar para ${groupName}: ${err.message}`);
      }
    }
    
    // Relatório final
    let relatorio = `✅ *ANÚNCIO ENVIADO!*\n\n📊 *RELATÓRIO:*\n━━━━━━━━━━━━━━━━━━━━\n`;
    relatorio += `📌 Total de grupos: ${groupIds.length}\n`;
    relatorio += `✅ Enviados (anúncio ativo): ${enviados}\n`;
    relatorio += `⏭️ Ignorados (anúncio inativo): ${inativos}\n`;
    relatorio += `❌ Falhas: ${falhas}\n\n`;
    
    if (gruposAtivos.length > 0 && gruposAtivos.length <= 20) {
      relatorio += `✅ *Grupos que receberam:*\n${gruposAtivos.map(g => `• ${g}`).join('\n')}\n\n`;
    } else if (enviados > 0) {
      relatorio += `✅ ${enviados} grupo(s) ativos receberam o anúncio.\n\n`;
    }
    
    if (gruposInativos.length > 0 && gruposInativos.length <= 20) {
      relatorio += `⏭️ *Grupos com anúncio inativo:*\n${gruposInativos.map(g => `• ${g}`).join('\n')}\n\n`;
    } else if (inativos > 0) {
      relatorio += `⏭️ ${inativos} grupo(s) com anúncio desativado.\n\n`;
    }
    
    if (gruposComErro.length > 0) {
      relatorio += `⚠️ *Falhas:*\n${gruposComErro.map(g => `• ${g}`).join('\n')}`;
    }
    
    relatorio += `\n━━━━━━━━━━━━━━━━━━━━\n💡 *Dica:* Use .anuncio on/off para controlar os anúncios em cada grupo.`;
    
    await reply(relatorio);
    
  } catch (err) {
    console.error("Erro no anúncio global:", err);
    await reply(`❌ *Erro ao enviar anúncio:*\n${err.message}`);
  }
}

module.exports = { anunciarGlobal };
