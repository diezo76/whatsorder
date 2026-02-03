#!/bin/bash

# ==========================================
# Script pour créer une commande de test
# ==========================================
# Ce script récupère dynamiquement les IDs depuis l'API
# pour éviter les erreurs "Menu item non trouvé"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-https://www.whataybo.com}"
RESTAURANT_SLUG="${RESTAURANT_SLUG:-nile-bites}"

echo "================================================"
echo "🧪 TEST DE CRÉATION DE COMMANDE"
echo "================================================"
echo ""
echo "Configuration:"
echo "  - URL de base: $BASE_URL"
echo "  - Restaurant: $RESTAURANT_SLUG"
echo ""

# 1. Récupérer les informations du restaurant et le menu
echo "📋 Récupération du menu du restaurant..."
MENU_RESPONSE=$(curl -s "$BASE_URL/api/public/restaurants/$RESTAURANT_SLUG/menu")

if [ -z "$MENU_RESPONSE" ] || echo "$MENU_RESPONSE" | grep -q '"error"'; then
    echo -e "${RED}❌ Erreur: Impossible de récupérer le menu${NC}"
    echo "$MENU_RESPONSE"
    exit 1
fi

# Extraire le premier menu item disponible
MENU_ITEM_ID=$(echo "$MENU_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
MENU_ITEM_NAME=$(echo "$MENU_RESPONSE" | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)
MENU_ITEM_PRICE=$(echo "$MENU_RESPONSE" | grep -o '"price":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$MENU_ITEM_ID" ]; then
    echo -e "${RED}❌ Erreur: Aucun menu item trouvé dans le menu${NC}"
    echo "Réponse du menu:"
    echo "$MENU_RESPONSE" | head -50
    exit 1
fi

echo -e "${GREEN}✅ Menu item trouvé:${NC}"
echo "   - ID: $MENU_ITEM_ID"
echo "   - Nom: $MENU_ITEM_NAME"
echo "   - Prix: ${MENU_ITEM_PRICE:-N/A} EGP"
echo ""

# 2. Créer la commande via l'API publique
echo "📦 Création d'une commande de test..."

ORDER_DATA=$(cat <<EOF
{
  "items": [{
    "menuItemId": "$MENU_ITEM_ID",
    "quantity": 1,
    "unitPrice": ${MENU_ITEM_PRICE:-50}
  }],
  "customerName": "Test Client",
  "customerPhone": "+201234567890",
  "customerEmail": "test@example.com",
  "deliveryType": "DELIVERY",
  "deliveryAddress": "123 Test Street, Cairo, Egypt",
  "notes": "Commande de test automatique - $(date)",
  "paymentMethod": "CASH"
}
EOF
)

ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/public/restaurants/$RESTAURANT_SLUG/orders" \
  -H "Content-Type: application/json" \
  -d "$ORDER_DATA")

echo ""
echo "📥 Réponse de l'API:"
echo "$ORDER_RESPONSE" | jq '.' 2>/dev/null || echo "$ORDER_RESPONSE"
echo ""

# Vérifier si la commande a été créée
if echo "$ORDER_RESPONSE" | grep -q '"orderNumber"'; then
    ORDER_NUMBER=$(echo "$ORDER_RESPONSE" | grep -o '"orderNumber":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}✅ COMMANDE CRÉÉE AVEC SUCCÈS${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo "   📋 Numéro de commande: $ORDER_NUMBER"
    echo "   🍽️  Article: $MENU_ITEM_NAME"
    echo ""
    echo "🔍 Vérifiez maintenant dans le dashboard:"
    echo "   $BASE_URL/dashboard/orders"
    echo ""
    echo "   La commande devrait apparaître dans la colonne '⏳ En Attente'"
else
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}❌ ERREUR LORS DE LA CRÉATION${NC}"
    echo -e "${RED}================================================${NC}"
    echo ""
    
    if echo "$ORDER_RESPONSE" | grep -q "non trouvé"; then
        echo -e "${YELLOW}💡 Suggestion: Le menu item n'existe plus dans la base.${NC}"
        echo "   Exécutez le script check-menu-items.sql dans Supabase pour vérifier."
    fi
fi
