#!/bin/bash

# ==========================================
# Script d'Installation Speed Insights
# ==========================================

set -e

echo "🚀 Installation de Vercel Speed Insights"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd "/Users/diezowee/whatsapp order/apps/web"

echo "Installation de @vercel/speed-insights..."
pnpm add @vercel/speed-insights

echo ""
echo -e "${GREEN}✅ Speed Insights installé !${NC}"
echo ""
echo "📝 Prochaines étapes :"
echo ""
echo "1. Déployer sur Vercel :"
echo "   cd ../.."
echo "   vercel --prod"
echo ""
echo "2. Activer Speed Insights sur Vercel Dashboard :"
echo "   - Aller sur https://vercel.com/dashboard"
echo "   - Projet whatsorder-web → Speed Insights"
echo "   - Activer 'Enable Speed Insights'"
echo ""
echo "3. Tester avec PageSpeed Insights :"
echo "   https://pagespeed.web.dev/"
echo ""
echo -e "${BLUE}✅ Prêt à déployer !${NC}"
