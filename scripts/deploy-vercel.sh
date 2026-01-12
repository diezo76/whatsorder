#!/bin/bash

# Script de déploiement sur Vercel
# Usage: bash scripts/deploy-vercel.sh

set -e

echo "🚀 Déploiement sur Vercel"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "vercel.json" ]; then
    echo -e "${RED}❌ Erreur: vercel.json non trouvé. Êtes-vous dans le répertoire racine ?${NC}"
    exit 1
fi

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI non installé. Installez-le avec: npm i -g vercel${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Vérification des fichiers modifiés...${NC}"
git status --short | head -10
echo ""

# Demander confirmation
read -p "Voulez-vous continuer le déploiement ? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Déploiement annulé${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🔨 Build local pour vérification...${NC}"
cd apps/web
pnpm build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du build. Corrigez les erreurs avant de déployer.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Build réussi${NC}"
echo ""

# Retourner à la racine
cd ../..

# Déployer sur Vercel
echo -e "${YELLOW}🚀 Déploiement sur Vercel (production)...${NC}"
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Déploiement réussi !${NC}"
    echo ""
    echo "📝 Prochaines étapes :"
    echo "1. Vérifier le déploiement sur https://vercel.com/dashboard"
    echo "2. Tester les nouvelles fonctionnalités :"
    echo "   - Système d'onboarding : /onboarding"
    echo "   - Settings restaurant : /dashboard/settings"
    echo "3. Vérifier les logs si nécessaire : vercel logs --follow"
else
    echo ""
    echo -e "${RED}❌ Erreur lors du déploiement${NC}"
    echo "Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi
