#!/bin/bash

# ==========================================
# Script : Ajouter SUPABASE_SERVICE_ROLE_KEY sur Vercel
# ==========================================

set -e

echo "🔧 Ajout de SUPABASE_SERVICE_ROLE_KEY sur Vercel"
echo "=================================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI n'est pas installé${NC}"
    echo ""
    echo "Installation..."
    npm install -g vercel
fi

# Vérifier la connexion
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vous n'êtes pas connecté à Vercel${NC}"
    vercel login
fi

echo -e "${GREEN}✅ Connecté à Vercel${NC}"
echo ""

# Instructions
echo "📋 Instructions :"
echo ""
echo "1. Allez sur https://supabase.com/dashboard"
echo "2. Sélectionnez votre projet"
echo "3. Settings → API"
echo "4. Copiez la clé 'service_role' (pas l'anon key !)"
echo ""
echo "⚠️  IMPORTANT : Utilisez la clé 'service_role', pas 'anon'"
echo ""

read -p "Appuyez sur Entrée quand vous avez copié la clé..."

echo ""
echo "Coller la clé service_role ci-dessous (elle sera masquée) :"
read -s SERVICE_KEY

if [ -z "$SERVICE_KEY" ]; then
    echo -e "${RED}❌ Clé vide, annulation${NC}"
    exit 1
fi

echo ""
echo "Ajout de la variable sur Vercel..."
echo ""

# Ajouter pour production
echo "$SERVICE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production --force
echo -e "${GREEN}✅ Ajouté pour Production${NC}"

# Ajouter pour preview
echo "$SERVICE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview --force
echo -e "${GREEN}✅ Ajouté pour Preview${NC}"

# Ajouter pour development
echo "$SERVICE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY development --force
echo -e "${GREEN}✅ Ajouté pour Development${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Variable ajoutée avec succès !${NC}"
echo "=========================================="
echo ""
echo "📝 Prochaines étapes :"
echo ""
echo "1. Redéployer :"
echo "   vercel --prod"
echo ""
echo "2. Tester l'API :"
echo "   curl https://votre-site.vercel.app/api/public/restaurants/nile-bites"
echo ""
echo "3. Vérifier que le restaurant existe dans Supabase"
echo ""
echo -e "${BLUE}✅ Prêt à redéployer !${NC}"
