# 🤖 Lutchi Zap Hack

<div align="center">

![Lutchi Zap Hack](https://img.shields.io/badge/Lutchi%20Zap%20Hack-v1.0.0-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Baileys](https://img.shields.io/badge/Baileys-Latest-blue?style=for-the-badge)
![Angola](https://img.shields.io/badge/Made%20in-Angola%20🇦🇴-CC0000?style=for-the-badge)

**Bot completo de gerenciamento de grupos WhatsApp**

| 👑 Dono | 📸 Instagram | 📞 Número |
|---------|-------------|-----------|
| Luís Lutchi | [@luislutchii](https://instagram.com/luislutchii) | +244 924 319 522 |

</div>

---

## 📋 Comandos

### 📋 Menu & Info
| Comando | Descrição |
|---------|-----------|
| `.lutchi` | Menu principal |
| `.menu` | Lista de comandos |
| `.ping` | Verificar latência |
| `.info` | Informações do bot |
| `.link` | Link do grupo |
| `.regras` | Ver regras do grupo |
| `.setregras` | Definir regras |
| `.sticker` | Criar sticker |
| `.dono` | Contato do dono |
| `.sobre` | Sobre o bot |

### 👥 Membros (Admin)
| Comando | Descrição |
|---------|-----------|
| `.ban @` | Banir membro |
| `.kick @` | Remover membro |
| `.add 244XXXXXXXXX` | Adicionar membro |
| `.promover @` | Promover a admin |
| `.rebaixar @` | Rebaixar admin |
| `.todos mensagem` | Mencionar todos |

### 🏠 Grupo (Admin)
| Comando | Descrição |
|---------|-----------|
| `.fechar` | Fechar grupo |
| `.abrir` | Abrir grupo |
| `.nome Novo Nome` | Mudar nome do grupo |
| `.desc Nova descrição` | Mudar descrição |
| `.foto` | Mudar foto do grupo |

### 🛡️ Moderação (Admin)
| Comando | Descrição |
|---------|-----------|
| `.warn @` | Advertir membro |
| `.warnings @` | Ver advertências |
| `.resetwarn @` | Resetar advertências |
| `.mute @ 10` | Mutar por minutos |
| `.unmute @` | Desmutar membro |
| `.antilink on/off` | Ativar/desativar anti-link |
| `.antiflood on/off` | Ativar/desativar anti-flood |
| `.banword palavra` | Adicionar palavra proibida |

### 🎮 Diversão
| Comando | Descrição |
|---------|-----------|
| `.dado 6` | Jogar dado |
| `.flip` | Cara ou coroa |
| `.sorteio` | Sortear membro |
| `.enquete Pergunta? \| Op1 \| Op2` | Criar enquete |
| `.citar` | Citar mensagem |
| `.calcular 2+2` | Calculadora |
| `.clima Luanda` | Previsão do tempo |

---

## 🔧 Requisitos

- **Node.js** 18 ou superior
- **npm**
- **WhatsApp** ativo no celular
- Conexão com internet

---

## 📱 Instalação no Termux (Android)

### 1. Preparar o Termux

```bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
```

### 2. Clonar o repositório

```bash
git clone https://github.com/luislutchii/Lutchi-Zap-Hack.git
cd Lutchi-Zap-Hack/lutchi-zap-hack
```

### 3. Instalar dependências

```bash
npm install
```

> ⚠️ Se aparecer vulnerabilidades do `protobufjs`, pode ignorar — é um problema conhecido da biblioteca Baileys e não afeta o funcionamento do bot.

### 4. Iniciar o bot

```bash
npm start
```

### 5. Conectar o WhatsApp

- O QR Code vai aparecer no terminal
- Abra o WhatsApp no celular
- Vá em **Dispositivos conectados → Conectar dispositivo**
- Escaneie o QR Code

✅ **Bot conectado!** Teste enviando `.lutchi` no WhatsApp em um grupo, pois o Bot não responde mensagens enviadas por ti no mesmo número.

---

## 💻 Instalação no PC / VPS

```bash
# 1. Clonar o repositório
git clone https://github.com/luislutchii/Lutchi-Zap-Hack.git
cd Lutchi-Zap-Hack/lutchi-zap-hack

# 2. Instalar dependências
npm install

# 3. Iniciar
npm start
```

---

## 📁 Estrutura do Projeto

```
lutchi-zap-hack/
├── src/
│   ├── index.js              # Arquivo principal
│   ├── qr.js                 # Gerador de QR Code
│   ├── config/
│   │   └── config.js         # Configurações
│   ├── commands/
│   │   ├── info.js           # Menu, ping, info...
│   │   ├── admin.js          # Ban, kick, add...
│   │   ├── mod.js            # Warn, mute, antilink...
│   │   └── fun.js            # Dado, clima, enquete...
│   └── utils/
│       ├── messageHandler.js # Handler de mensagens
│       └── database.js       # Banco de dados JSON
├── data/
│   ├── session/              # Sessão WhatsApp (auto-criado)
│   └── database.json         # Dados persistentes (auto-criado)
├── package.json
└── README.md
```

---

## ❓ Problemas Comuns

**QR Code não aparece?**
```bash
rm -rf data/session && npm start
```

**Erro de módulo não encontrado?**
```bash
npm install --legacy-peer-deps
```

**Bot desconectando?**
```bash
# Reinicie o bot
npm start
```

**Erro `makeInMemoryStore is not a function`?**
> Já foi corrigido nesta versão. Certifique-se de estar usando os arquivos mais recentes do repositório.

**Pasta duplicada ao clonar?**
```bash
# Entre na pasta correta
cd Lutchi-Zap-Hack/lutchi-zap-hack
npm start
```

---

## 🔄 Atualizar o bot

```bash
cd Lutchi-Zap-Hack
git pull
cd lutchi-zap-hack
npm install
npm start
```

---

## 📞 Suporte

- 📸 Instagram: [@luislutchii](https://instagram.com/luislutchii)
- 📱 WhatsApp: +244 924 319 522

---

<div align="center">

**Lutchi Zap Hack © 2026** | Feito com ❤️ Luís Lutchi 🇦🇴

</div>
