#!/bin/bash

# Script pour créer une nouvelle commande
# Usage: ./scripts/create-order.sh

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3000}"
TOKEN="${TOKEN:-}"

echo -e "${GREEN}🚀 Création d'une nouvelle commande${NC}"
echo ""

# Vérifier que le token est fourni
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Erreur: TOKEN non défini${NC}"
    echo ""
    echo "Usage:"
    echo "  export TOKEN=\"votre_token_jwt\""
    echo "  export CUSTOMER_ID=\"uuid-customer\""
    echo "  export MENU_ITEM_ID=\"uuid-item\""
    echo "  ./scripts/create-order.sh"
    echo ""
    echo "Ou directement:"
    echo "  TOKEN=\"votre_token\" CUSTOMER_ID=\"uuid\" MENU_ITEM_ID=\"uuid\" ./scripts/create-order.sh"
    exit 1
fi

# Vérifier que CUSTOMER_ID est fourni
if [ -z "$CUSTOMER_ID" ]; then
    echo -e "${RED}❌ Erreur: CUSTOMER_ID non défini${NC}"
    echo ""
    echo "Pour obtenir un CUSTOMER_ID, utilisez:"
    echo "  curl -H \"Authorization: Bearer \$TOKEN\" $API_URL/api/customers"
    exit 1
fi

# Vérifier que MENU_ITEM_ID est fourni
if [ -z "$MENU_ITEM_ID" ]; then
    echo -e "${RED}❌ Erreur: MENU_ITEM_ID non défini${NC}"
    echo ""
    echo "Pour obtenir un MENU_ITEM_ID, utilisez:"
    echo "  curl -H \"Authorization: Bearer \$TOKEN\" $API_URL/api/menu/items"
    exit 1
fi

# Afficher les informations
echo -e "${YELLOW}📋 Informations:${NC}"
echo "  API URL: $API_URL"
echo "  Customer ID: $CUSTOMER_ID"
echo "  Menu Item ID: $MENU_ITEM_ID"
echo ""

# Créer la commande
echo -e "${YELLOW}📤 Envoi de la requête...${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"items\": [{
      \"menuItemId\": \"$MENU_ITEM_ID\",
      \"quantity\": 1
    }],
    \"deliveryType\": \"DELIVERY\"
  }")

# Séparer le body et le status code (compatible macOS/BSD)
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

# Afficher le résultat
echo ""
if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Commande créée avec succès!${NC}"
    echo ""
    echo -e "${GREEN}📦 Réponse:${NC}"
    echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
else
    echo -e "${RED}❌ Erreur (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo -e "${RED}📦 Réponse:${NC}"
    echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
    exit 1
fi
