#!/bin/bash

# Script pour obtenir Customer ID et Menu Item ID depuis la base de données
# Usage: ./scripts/get-ids.sh

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Obtenir les IDs nécessaires${NC}"
echo ""

# Vérifier si psql est disponible
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  psql n'est pas installé. Utilisez Prisma Studio à la place:${NC}"
    echo "  cd apps/web && pnpm db:studio"
    echo ""
    echo "Ou connectez-vous directement à Supabase:"
    echo "  https://supabase.com/dashboard/project/rvndgopsysdyycelmfuu/editor"
    exit 0
fi

# Récupérer DATABASE_URL depuis .env
if [ -f "apps/web/.env.local" ]; then
    DATABASE_URL=$(grep DATABASE_URL apps/web/.env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
elif [ -f "apps/api/.env" ]; then
    DATABASE_URL=$(grep DATABASE_URL apps/api/.env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
else
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé${NC}"
    echo "Veuillez définir DATABASE_URL manuellement:"
    echo "  export DATABASE_URL=\"postgresql://...\""
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL non trouvé dans .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Connexion à la base de données...${NC}"
echo ""

# Obtenir un Customer ID
echo -e "${BLUE}👤 Customers disponibles:${NC}"
psql "$DATABASE_URL" -c "SELECT id, name, phone FROM customers LIMIT 5;" -t -A -F' | ' 2>/dev/null || echo "Erreur de connexion"

echo ""
echo -e "${BLUE}🍽️  Menu Items disponibles:${NC}"
psql "$DATABASE_URL" -c "SELECT id, name, price FROM menu_items WHERE \"isActive\" = true LIMIT 5;" -t -A -F' | ' 2>/dev/null || echo "Erreur de connexion"

echo ""
echo -e "${YELLOW}💡 Pour obtenir un ID spécifique:${NC}"
echo "  export CUSTOMER_ID=\$(psql \"\$DATABASE_URL\" -t -c \"SELECT id FROM customers LIMIT 1;\")"
echo "  export MENU_ITEM_ID=\$(psql \"\$DATABASE_URL\" -t -c \"SELECT id FROM menu_items WHERE \\\"isActive\\\" = true LIMIT 1;\")"
