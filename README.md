<div align="center">

<img src="https://i.ibb.co/NnNcQnj0/Picsart-26-05-03-21-22-37-529.png" alt="Lutchi Zap Hack" width="300" style="border-radius: 20px"/>

# 🤖 Lutchi Zap Hack

![Version](https://img.shields.io/badge/versão-v1.0.0-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Baileys](https://img.shields.io/badge/Baileys-Latest-blue?style=for-the-badge)
![Termux](https://img.shields.io/badge/Termux-Android-black?style=for-the-badge&logo=android&logoColor=green)
![Angola](https://img.shields.io/badge/Feito%20em-Angola%20🇦🇴-CC0000?style=for-the-badge)

**Bot completo de gerenciamento de grupos WhatsApp**
*Moderação · Downloads · Stickers · Pesquisas · Diversão · Debates*

| 👑 Dono | 📸 Instagram | 📞 Contato |
|:-------:|:-----------:|:---------:|
| Luís Lutchi | [@luislutchii](https://instagram.com/luislutchii) | +244 924 319 522 |

</div>

---

## 📌 Índice

- [Sobre o Bot](#-sobre-o-bot)
- [Funcionalidades](#-funcionalidades)
- [Requisitos](#-requisitos)
- [Instalação no Termux](#-instalação-no-termux-android)
- [Instalação no PC / VPS](#-instalação-no-pc--vps)
- [Configuração](#-configuração)
- [Comandos](#-comandos)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Problemas Comuns](#-problemas-comuns)
- [Atualizar o Bot](#-atualizar-o-bot)
- [Suporte](#-suporte)

---

## 💡 Sobre o Bot

O **Lutchi Zap Hack** é um bot completo para gerenciamento de grupos WhatsApp, desenvolvido em **Node.js** com a biblioteca **Baileys**. Criado em Angola 🇦🇴 por **Luís Lutchi**, o bot oferece mais de 60 comandos para administração, moderação, downloads, stickers, pesquisas e diversão.

> ⚠️ **Aviso:** Este bot é para fins educacionais. Use com responsabilidade e em conformidade com os termos de uso do WhatsApp.

---

## ✨ Funcionalidades

| Categoria | Descrição |
|-----------|-----------|
| 🛡️ **Moderação** | Anti-link, anti-flood, warn, mute, palavras banidas |
| 👥 **Membros** | Ban, kick, add, promover, rebaixar, mencionar todos |
| ⚙️ **Grupo** | Fechar, abrir, mudar nome/descrição/foto, boas-vindas |
| 📥 **Downloads** | YouTube, TikTok, Instagram, Facebook, Spotify, Kwai e mais |
| 🎨 **Stickers** | Criar, converter, texto animado, emoji mix |
| 🔍 **Pesquisas** | Wikipedia, clima, tradutor, ChatGPT, notícias, filmes |
| 🎮 **Diversão** | Dado, sorteio, enquete, cantadas, conselhos, calculadora |
| 🎙️ **Debates** | Sistema completo de debates com votação |
| 🤖 **Controle** | Ligar/desligar bot, modo admins/todos |
| 👋 **Boas-vindas** | Mensagem automática com foto de perfil ao entrar |

---

## 🔧 Requisitos

- **Node.js** 18 ou superior
- **npm** (incluído com Node.js)
- **ffmpeg** (para stickers)
- **git**
- **WhatsApp** ativo no celular
- Conexão com internet estável

---

## 📱 Instalação no Termux (Android)

### Passo 1 — Instalar o Termux

Baixe o **Termux** pelo [F-Droid](https://f-droid.org/packages/com.termux/) (recomendado) ou pela Play Store.

> ⚠️ Recomenda-se a versão do F-Droid pois a versão da Play Store pode ter limitações.

### Passo 2 — Preparar o ambiente

Abra o Termux e execute:

```bash
pkg update && pkg upgrade -y
pkg install nodejs git ffmpeg -y
```

Passo 3 — Clonar o repositório

```bash
git clone https://github.com/luislutchii/Lutchi-Zap-Hack.git
cd Lutchi-Zap-Hack/lutchi-zap-hack
```

Passo 4 — Instalar dependências

```bash
npm install
```

⚠️ Se aparecer vulnerabilidades do protobufjs, pode ignorar — é um problema conhecido da biblioteca Baileys e não afeta o funcionamento do bot.

Passo 5 — Iniciar o bot

```bash
npm start
```

Passo 6 — Conectar o WhatsApp

· O QR Code vai aparecer no terminal
· Abra o WhatsApp no celular
· Vá em Dispositivos conectados → Conectar dispositivo
· Escaneie o QR Code

✅ Bot conectado! Teste enviando .lutchi no WhatsApp.

---

💻 Instalação no PC / VPS

```bash
# 1. Instalar Node.js 18+ (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git ffmpeg

# 2. Clonar o repositório
git clone https://github.com/luislutchii/Lutchi-Zap-Hack.git
cd Lutchi-Zap-Hack/lutchi-zap-hack

# 3. Instalar dependências
npm install

# 4. Iniciar o bot
npm start
```

---

⚙️ Configuração

Edite o arquivo src/config/config.js para personalizar o bot:

```js
module.exports = {
  botName: "Lutchi Zap Hack",
  prefix: ".",            // Prefixo dos comandos
  menuPrefix: ".lutchi",  // Comando do menu
  owner: {
    name: "Luís Lutchi",
    number: "244924319522", // Número com código do país (sem +)
    instagram: "luislutchii",
  },
  maxWarns: 3,   // Advertências antes do ban
  floodLimit: 5, // Limite anti-flood (msgs/5s)
  antiLink: true,  // Anti-link ativado por padrão
  welcome: true,   // Mensagem de boas-vindas ativada
};
```

---

📋 Comandos

📋 Menu & Info

Comando Descrição
.lutchi Menu principal
.menu Lista de comandos
.ping Verificar latência
.info Informações do bot
.link Link do grupo
.regras Ver regras do grupo
.setregras <texto> Definir regras
.sticker Criar sticker (responder imagem/vídeo)
.dono Contato do dono
.sobre Sobre o bot

👥 Membros (Admin)

Comando Descrição
.ban @ Banir membro permanentemente
.kick @ Remover membro do grupo
.add 244XXXXXXXXX Adicionar membro pelo número
.promover @ Promover a administrador
.rebaixar @ Rebaixar administrador
.todos <mensagem> Mencionar todos os membros

🏠 Grupo (Admin)

Comando Descrição
.fechar Fechar grupo (só admins enviam)
.abrir Abrir grupo (todos enviam)
.nome <Novo Nome> Mudar nome do grupo
.desc <Nova descrição> Mudar descrição do grupo
.foto (respondendo imagem) Mudar foto do grupo

🛡️ Moderação (Admin)

Comando Descrição
.warn @ Advertir membro
.warnings @ Ver advertências do membro
.resetwarn @ Resetar advertências
.mute @ <minutos> Mutar membro por X minutos
.unmute @ Desmutar membro
.antilink on/off Ativar/desativar anti-link
.antiflood on/off Ativar/desativar anti-flood
.banword <palavra> Adicionar palavra proibida
.delbanword <palavra> Remover palavra proibida
.listbanword Listar palavras proibidas

🎮 Diversão

Comando Descrição
.dado <faces> Jogar dado (padrão 6 faces)
.flip Cara ou coroa
.sorteio Sortear um membro aleatório
.enquete <Pergunta? \| Op1 \| Op2> Criar enquete no grupo
.citar Citar mensagem respondida
.calcular <2+2> Calculadora básica
.clima <cidade> Previsão do tempo
.traduzir <texto> <código> Tradutor (ex: .traduzir Hello pt)

---

❓ Problemas Comuns

QR Code não aparece?

```bash
rm -rf data/session && npm start
```

Erro de módulo não encontrado?

```bash
npm install --legacy-peer-deps
```

Bot desconectando sozinho?

```bash
# Reinicie o bot normalmente
npm start
```

Erro makeInMemoryStore is not a function?

Já foi corrigido nesta versão. Certifique-se de estar usando os arquivos mais recentes do repositório.

Pasta duplicada "Lutchi-Zap-Hack/Lutchi-Zap-Hack" ao clonar?

```bash
# Entre na pasta correta
cd Lutchi-Zap-Hack/lutchi-zap-hack
npm start
```

ffmpeg não encontrado no Termux?

```bash
pkg install ffmpeg -y
# Depois reinicie o bot
```

O bot não responde?

· Verifique se o prefixo está correto (padrão: .)
· Teste o comando .ping para ver se o bot está online
· Confirme se o número do dono está correto no config.js

---

🔄 Atualizar o Bot

```bash
cd ~/Lutchi-Zap-Hack/lutchi-zap-hack
git pull
npm install
npm start
```

⚠️ Importante: A atualização não apaga seus dados (warns, configurações, etc.)

---

📞 Suporte

· 📸 Instagram: @luislutchii
· 📱 WhatsApp: +244 924 319 522

Contribuições

Sugestões ou melhorias? Entre em contato com o desenvolvedor!

---

📜 Licença

Este projeto é open-source e está sob a licença MIT. Sinta-se livre para usar, modificar e distribuir — desde que mantido os créditos ao autor original.

---

<div align="center">

Lutchi Zap Hack © 2026 | Feito com ❤️ Luís Lutchi 🇦🇴

“Tecnologia para conectar, não para destruir.”

</div>
