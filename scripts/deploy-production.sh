#!/bin/bash

# Script de déploiement en production
# Usage: ./scripts/deploy-production.sh

set -e

echo "🚀 Déploiement en Production - Whataybo"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifications pré-déploiement
echo "📋 Vérifications pré-déploiement..."
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis la racine du projet${NC}"
    exit 1
fi

# Vérifier que pnpm est installé
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm n'est pas installé${NC}"
    exit 1
fi

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI n'est pas installé${NC}"
    echo "Installation de Vercel CLI..."
    npm i -g vercel
fi

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
cd apps/api
pnpm prisma generate
cd ../..

# Build de vérification
echo "🔨 Build de vérification..."
pnpm build

# Vérifier les variables d'environnement
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Vérifiez que les variables d'environnement sont configurées dans Vercel${NC}"
echo ""
echo "Variables requises:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - DATABASE_URL"
echo "  - JWT_SECRET"
echo ""
read -p "Les variables sont-elles configurées dans Vercel? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Veuillez configurer les variables d'environnement dans Vercel Dashboard${NC}"
    echo "Voir DEPLOY_PRODUCTION.md pour les instructions"
    exit 1
fi

# Déploiement
echo ""
echo "🚀 Déploiement en production..."
echo ""

# Vérifier si on est connecté à Vercel
if ! vercel whoami &> /dev/null; then
    echo "Connexion à Vercel..."
    vercel login
fi

# Déployer
echo "Déploiement en cours..."
vercel --prod

echo ""
echo -e "${GREEN}✅ Déploiement terminé!${NC}"
echo ""
echo "Vérifiez le déploiement sur: https://vercel.com/dashboard"
echo ""
