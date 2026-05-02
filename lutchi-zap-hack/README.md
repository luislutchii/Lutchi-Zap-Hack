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

## 📋 Funcionalidades

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
| `.antilink on/off` | Ativar anti-link |
| `.antiflood on/off` | Ativar anti-flood |
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

## 🚀 Instalação

### 💻 PC / VPS

```bash
# 1. Clone o repositório
git clone https://github.com/luislutchii/lutchi-zap-hack.git
cd lutchi-zap-hack

# 2. Instale as dependências
npm install

# 3. Inicie o bot
npm start
```

### 📱 Termux (Android)

```bash
# 1. Atualizar pacotes
pkg update && pkg upgrade -y

# 2. Instalar dependências do sistema
pkg install nodejs git python make -y

# 3. Clonar o repositório
git clone https://github.com/luislutchii/lutchi-zap-hack.git
cd lutchi-zap-hack

# 4. Instalar dependências Node.js
npm install

# 5. Iniciar o bot
npm start
```

> 📱 **Escaneie o QR Code** que aparece no terminal com o WhatsApp!

---

## ⚙️ Configuração

Edite o arquivo `src/config/config.js`:

```js
module.exports = {
  botName: "Lutchi Zap Hack",
  prefix: ".",           // Prefixo dos comandos
  menuPrefix: ".lutchi", // Comando do menu
  owner: {
    name: "Luís Lutchi",
    number: "244924319522",  // Número do dono (com código do país)
    instagram: "luislutchii",
  },
  maxWarns: 3,  // Advertências antes do ban
  floodLimit: 5, // Limite anti-flood (msgs/5s)
};
```

---

## 📁 Estrutura do Projeto

```
lutchi-zap-hack/
├── src/
│   ├── index.js              # Arquivo principal
│   ├── config/
│   │   └── config.js         # Configurações
│   ├── commands/
│   │   ├── info.js           # Menu, ping, info...
│   │   ├── admin.js          # Ban, kick, add...
│   │   ├── mod.js            # Warn, mute, antilink...
│   │   └── fun.js            # Dado, clima, enquete...
│   └── utils/
│       ├── messageHandler.js # Handler principal
│       └── database.js       # Banco de dados JSON
├── data/
│   ├── session/              # Sessão WhatsApp (auto-criado)
│   └── database.json         # Dados persistentes (auto-criado)
├── package.json
└── README.md
```

---

## 🔧 Requisitos

- **Node.js** 18 ou superior
- **npm** ou **yarn**
- **WhatsApp** ativo no celular
- Conexão com internet

---

## ❓ Problemas Comuns

**QR Code não aparece?**
```bash
# Delete a sessão e reinicie
rm -rf data/session && npm start
```

**Erro de módulo não encontrado?**
```bash
npm install --legacy-peer-deps
```

**Bot desconectando?**
> Verifique sua conexão com internet e reinicie com `npm start`

---

## 📞 Suporte

- 📸 Instagram: [@luislutchii](https://instagram.com/luislutchii)
- 📱 WhatsApp: +244 924 319 522

---

<div align="center">

**Lutchi Zap Hack © 2024** | Feito com ❤️ em Angola 🇦🇴

</div>
