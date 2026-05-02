#!/data/data/com.termux/files/usr/bin/bash
# ════════════════════════════════════════════════════════════
#   🤖 LUTCHI ZAP HACK — Script de Instalação para Termux
#   Dono: Luís Lutchi | Instagram: @luislutchii
# ════════════════════════════════════════════════════════════

PURPLE='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

clear
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════╗"
echo "║   🤖  LUTCHI ZAP HACK — Instalador          ║"
echo "║   👑 Dono: Luís Lutchi                       ║"
echo "║   📸 Instagram: @luislutchii                 ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${RESET}"

# ── Passo 1: Atualiza pacotes ─────────────────────────────────
echo -e "${CYAN}[1/7] Atualizando pacotes do Termux...${RESET}"
pkg update -y && pkg upgrade -y

# ── Passo 2: Instala dependências do sistema ──────────────────
echo -e "${CYAN}[2/7] Instalando dependências do sistema...${RESET}"
pkg install -y nodejs git python libwebp libjpeg-turbo

# ── Passo 3: Clona o repositório ─────────────────────────────
echo -e "${CYAN}[3/7] Clonando repositório...${RESET}"
if [ -d "lutchi-zap-hack" ]; then
  echo -e "${YELLOW}[AVISO] Pasta já existe. Atualizando...${RESET}"
  cd lutchi-zap-hack
  git pull
else
  git clone https://github.com/luislutchii/lutchi-zap-hack.git
  cd lutchi-zap-hack
fi

# ── Passo 4: Configura .env ───────────────────────────────────
echo -e "${CYAN}[4/7] Configurando variáveis de ambiente...${RESET}"
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${YELLOW}"
  echo "╔═══════════════════════════════════════════╗"
  echo "║  ⚙️  CONFIGURE SEU NÚMERO AGORA!          ║"
  echo "╚═══════════════════════════════════════════╝"
  echo -e "${RESET}"
  read -p "  Digite seu número (ex: 244920000000): " OWNER_NUM
  sed -i "s/OWNER_NUMBER=.*/OWNER_NUMBER=${OWNER_NUM}/" .env
  echo -e "${GREEN}  ✅ Número salvo: ${OWNER_NUM}${RESET}"
else
  echo -e "${GREEN}  ✅ .env já configurado.${RESET}"
fi

# ── Passo 5: Instala dependências Node ───────────────────────
echo -e "${CYAN}[5/7] Instalando dependências Node.js...${RESET}"
npm install

# ── Passo 6: Verifica instalação ─────────────────────────────
echo -e "${CYAN}[6/7] Verificando instalação...${RESET}"
node -e "import('@whiskeysockets/baileys').then(() => console.log('Baileys OK'))" 2>/dev/null \
  && echo -e "${GREEN}  ✅ Baileys instalado com sucesso!${RESET}" \
  || echo -e "${RED}  ⚠️  Execute 'npm install' novamente se houver erros.${RESET}"

# ── Passo 7: Conclusão ────────────────────────────────────────
echo -e "${CYAN}[7/7] Instalação concluída!${RESET}"
echo ""
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════╗"
echo "║   ✅  LUTCHI ZAP HACK instalado!            ║"
echo "╠══════════════════════════════════════════════╣"
echo "║                                              ║"
echo "║  Para iniciar o bot, execute:                ║"
echo "║                                              ║"
echo "║     npm start                                ║"
echo "║                                              ║"
echo "║  Escaneie o QR Code que aparecerá no         ║"
echo "║  terminal com o seu WhatsApp.                ║"
echo "║                                              ║"
echo "║  WhatsApp → Aparelhos conectados →           ║"
echo "║  Conectar aparelho                           ║"
echo "║                                              ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  👑 Dono: Luís Lutchi                        ║"
echo "║  📸 @luislutchii                             ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${RESET}"

read -p "Deseja iniciar o bot agora? [s/N] " START
if [[ "$START" =~ ^[Ss]$ ]]; then
  npm start
fi