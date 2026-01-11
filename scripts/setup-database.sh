#!/bin/bash

# Script de setup de la base de données pour WhatsOrder Clone
# Ce script installe PostgreSQL et Redis via Homebrew

set -e

echo "🗄️  Setup Base de Données WhatsOrder"
echo "======================================"
echo ""

# Vérifier si Homebrew est installé
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew n'est pas installé."
    echo "   Installez-le depuis : https://brew.sh"
    exit 1
fi

echo "✅ Homebrew détecté"
echo ""

# Installer PostgreSQL
echo "📦 Installation de PostgreSQL 15..."
if brew list postgresql@15 &> /dev/null; then
    echo "   PostgreSQL 15 est déjà installé"
else
    brew install postgresql@15
    echo "   ✅ PostgreSQL 15 installé"
fi

# Installer Redis
echo "📦 Installation de Redis..."
if brew list redis &> /dev/null; then
    echo "   Redis est déjà installé"
else
    brew install redis
    echo "   ✅ Redis installé"
fi

echo ""

# Démarrer PostgreSQL
echo "🚀 Démarrage de PostgreSQL..."
brew services start postgresql@15 || brew services restart postgresql@15
sleep 2
echo "   ✅ PostgreSQL démarré"

# Démarrer Redis
echo "🚀 Démarrage de Redis..."
brew services start redis || brew services restart redis
sleep 1
echo "   ✅ Redis démarré"

echo ""

# Créer la base de données
echo "📝 Création de la base de données 'whatsorder'..."
if psql -lqt | cut -d \| -f 1 | grep -qw whatsorder; then
    echo "   La base de données existe déjà"
else
    createdb whatsorder
    echo "   ✅ Base de données créée"
fi

echo ""
echo "✅ Setup terminé !"
echo ""
echo "Prochaines étapes :"
echo "  1. cd apps/api"
echo "  2. pnpm prisma migrate dev --name init"
echo "  3. pnpm prisma generate"
echo "  4. pnpm prisma db seed"
echo ""
