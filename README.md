
Bot completo de gerenciamento de grupos WhatsApp
Comandos poderosos de moderação, diversão e automação.
Desenvolvido por Luís Lutchi • 📸 @luislutchii
�

✨ Recursos
Categoria
Funcionalidades
👥 Membros
Adicionar, remover, promover e rebaixar
⚙️ Grupo
Fechar, abrir, renomear, trocar foto e descrição
🛡️ Moderação
Sistema de avisos, mute, anti-link, anti-flood, palavras banidas
📋 Informações
Menu, ping, info do grupo, link de convite, regras
🎲 Diversão
Dado, cara/coroa, sorteio, enquete, clima, calculadora
👋 Automação
Boas-vindas e despedida automáticas
🚀 Instalação
📱 Via Termux (Android) — Recomendado
Bash
Ou passo a passo:
Bash
💻 Via PC (Windows/Linux/Mac)
Bash
⚙️ Configuração
Edite o arquivo .env:
Env
📌 Número sem +, espaços ou hífens.
Exemplo Angola:244920000000
📋 Comandos
Prefixo: .  |  Menu: .lutchi
📌 Informações
Comando
Descrição
.lutchi
Menu principal com créditos
.menu
Alias do menu
.ping
Latência do bot
.info
Informações do grupo
.link
Link de convite do grupo
.regras
Ver regras do grupo
.setregras
Definir regras (admin)
.sticker
Imagem → Sticker
.dono
Contato do desenvolvedor
.sobre
Informações sobre o bot
👥 Membros (admin)
Comando
Descrição
.ban @
Remove membro
.kick @
Alias de ban
.add número
Adiciona membro
.promover @
Torna administrador
.rebaixar @
Remove admin
.todos [msg]
Marca todos os membros
⚙️ Grupo (admin)
Comando
Descrição
.fechar
Somente admins enviam
.abrir
Todos podem enviar
.nome [texto]
Renomeia o grupo
.desc [texto]
Altera a descrição
.foto
Troca foto (responda imagem)
🛡️ Moderação (admin)
Comando
Descrição
.warn @
Aplica aviso (auto-remove no limite)
.warnings @
Consulta avisos
.resetwarn @
Zera avisos
.mute @ min
Silencia por X minutos
.unmute @
Remove silêncio
.antilink on|off
Anti-link automático
.antiflood on|off
Anti-flood automático
.banword palavra
Bane palavra do grupo
🎲 Diversão
Comando
Descrição
.dado [faces]
Rola dado (padrão: 6)
.flip
Cara ou coroa
.sorteio
Sorteia membro aleatório
.enquete P? | Op1 | Op2
Enquete nativa WhatsApp
.citar
Frase motivacional
.calcular expressão
Calculadora
.clima cidade
Previsão do tempo
🗂️ Estrutura do Projeto
Código
🔧 Adicionando Comandos
1. Crie a função em qualquer arquivo de comandos:
Js
2. Registre no handler.js:
Js
3. Use .meucomando no WhatsApp! ✅
⚠️ Avisos
🔒 NUNCA suba a pasta auth_info/ — contém sua sessão
🔒 NUNCA suba o arquivo .env — contém seu número
⚖️ Use com responsabilidade. Uso abusivo pode banir o número
🤖 Não é afiliado ao WhatsApp/Meta
👨‍💻 Desenvolvedor
�



👑 Nome
Luís Lutchi
📸 Instagram
@luislutchii
🌐 GitHub
github.com/luislutchii
�


Se gostou, deixa uma ⭐ no repositório!
Desenvolvido com 💜 por Luís Lutchi
�

📄 Licença
MIT — use, modifique e distribua livremente, mantendo os créditos.