#!/bin/bash
# ╔══════════════════════════════════════════════════════════════╗
# ║         LUTCHI ZAP HACK - Script de Instalação              ║
# ║   Dono: Luís Lutchi | Instagram: @luislutchii               ║
# ╚══════════════════════════════════════════════════════════════╝

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       LUTCHI ZAP HACK - Instalação      ║"
echo "║   Dono: Luís Lutchi | @luislutchii      ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js não encontrado!"
  echo "📦 Instalando Node.js..."
  if command -v pkg &> /dev/null; then
    pkg install nodejs -y
  elif command -v apt &> /dev/null; then
    apt install nodejs npm -y
  else
    echo "❌ Instale o Node.js manualmente: https://nodejs.org"
    exit 1
  fi
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ é necessário! Versão atual: $(node -v)"
  echo "📦 Atualize o Node.js."
  exit 1
fi

echo "✅ Node.js $(node -v) detectado!"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
  echo "❌ Erro ao instalar dependências!"
  exit 1
fi

# Criar pasta de dados
mkdir -p data/session

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "🚀 Para iniciar o bot, execute:"
echo "   npm start"
echo ""
echo "📱 Escaneie o QR Code com o WhatsApp!"
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Instagram: @luislutchii               ║"
echo "║   WhatsApp: +244 924 319 522            ║"
echo "╚══════════════════════════════════════════╝"
