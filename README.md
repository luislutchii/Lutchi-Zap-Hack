# 🤖 Lutchi Zap Hack

> Bot avançado de gerenciamento de grupos WhatsApp com moderação, automação e diversão.

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-ATIVO-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/NODE-%3E%3D18-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/LICENSE-MIT-purple?style=for-the-badge" />
</p>

---

## 🚀 Instalação Rápida

### 📱 Termux (Recomendado)

```bash
curl -o install.sh https://raw.githubusercontent.com/luislutchii/lutchi-zap-hack/main/termux-install.sh && bash install.sh
```

### 💻 Manual (Qualquer sistema)

```bash
pkg install nodejs git -y || sudo apt install nodejs git -y

git clone https://github.com/luislutchii/lutchi-zap-hack.git
cd lutchi-zap-hack

npm install
npm start
```

---

## ⚙️ Como criar o arquivo `.env`

Na raiz do projeto (onde está o `package.json`), crie um arquivo chamado:

```
.env
```

### 📌 Termux / Linux / Mac:
```bash
touch .env
```

### 📌 Windows:
- Clique com botão direito → Novo → Documento de texto
- Renomeie para `.env` (remova `.txt`)

### ✍️ Conteúdo do `.env`:

```env
OWNER_NUMBER=244920000000
PREFIX=.
```

⚠️ Sem +, espaços ou hífens

---

## 🎮 Comandos (Copiar fácil)

### 📌 Menu e Info
```
.lutchi
.menu
.ping
.info
.link
.regras
.setregras
.sticker
.dono
.sobre
```

### 👥 Membros (Admin)
```
.ban @
.kick @
.add 244XXXXXXXXX
.promover @
.rebaixar @
.todos mensagem
```

### ⚙️ Grupo (Admin)
```
.fechar
.abrir
.nome Novo Nome
.desc Nova descrição
.foto
```

### 🛡️ Moderação (Admin)
```
.warn @
.warnings @
.resetwarn @
.mute @ 10
.unmute @
.antilink on
.antiflood off
.banword palavra
```

### 🎲 Diversão
```
.dado 6
.flip
.sorteio
.enquete Pergunta? | Op1 | Op2
.citar
.calcular 2+2
.clima Luanda
```

---

## 🧠 Estrutura

```
📁 lutchi-zap-hack
 ┣ 📁 comandos
 ┣ 📁 eventos
 ┣ 📄 handler.js
 ┣ 📄 index.js
 ┣ 📄 .env
 ┗ 📁 auth_info
```

---

## ⚠️ Segurança

- ❌ Não suba `auth_info/`
- ❌ Não suba `.env`
- ⚠️ Evite spam

---

## 👨‍💻 Desenvolvedor

Luís Lutchi  
Instagram: @luislutchii  
GitHub: https://github.com/luislutchii

---

## ⭐ Apoia o projeto

Deixa uma estrela ⭐ no repositório!

---

## 📄 Licença

MIT License

---

<p align="center">Desenvolvido com 💜 por Luís Lutchi 🚀</p>
