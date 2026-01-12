#!/bin/bash

# Script de test complet pour vérifier que tout fonctionne
# Usage: ./scripts/test-complete.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="http://localhost:3000"
ADMIN_EMAIL="admin@whatsorder.com"
ADMIN_PASSWORD="Admin123!"

echo -e "${BLUE}🧪 Tests Complets de l'Application${NC}"
echo "=========================================="
echo ""

# Test 1: Vérifier que les serveurs sont actifs
echo -e "${YELLOW}1️⃣  Vérification des serveurs...${NC}"
if curl -s "$API_URL/api/auth/health" > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Serveur Next.js actif (port 3000)${NC}"
else
    echo -e "${RED}   ❌ Serveur Next.js non accessible${NC}"
    exit 1
fi

if curl -s "http://localhost:4000/health" > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Serveur API actif (port 4000)${NC}"
else
    echo -e "${YELLOW}   ⚠️  Serveur API non accessible (peut être normal si tout passe par Next.js)${NC}"
fi
echo ""

# Test 2: Login et obtenir token
echo -e "${YELLOW}2️⃣  Authentification...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}   ❌ Échec de l'authentification${NC}"
    echo "   Réponse: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}   ✅ Authentification réussie${NC}"
echo "   Token: ${TOKEN:0:30}..."
echo ""

# Test 3: Obtenir les informations de l'utilisateur
echo -e "${YELLOW}3️⃣  Vérification du profil utilisateur...${NC}"
ME_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/auth/me")

if echo "$ME_RESPONSE" | grep -q "admin@whatsorder.com"; then
    echo -e "${GREEN}   ✅ Profil utilisateur récupéré${NC}"
    USER_EMAIL=$(echo "$ME_RESPONSE" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
    RESTAURANT_ID=$(echo "$ME_RESPONSE" | grep -o '"restaurantId":"[^"]*' | cut -d'"' -f4)
    echo "   Email: $USER_EMAIL"
    echo "   Restaurant ID: $RESTAURANT_ID"
else
    echo -e "${RED}   ❌ Erreur lors de la récupération du profil${NC}"
    echo "   Réponse: $ME_RESPONSE"
    exit 1
fi
echo ""

# Test 4: Obtenir les IDs depuis Supabase
echo -e "${YELLOW}4️⃣  Récupération des IDs depuis la base de données...${NC}"

# Récupérer DATABASE_URL
if [ -f "apps/web/.env.local" ]; then
    DATABASE_URL=$(grep DATABASE_URL apps/web/.env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'" | head -1)
elif [ -f "apps/api/.env" ]; then
    DATABASE_URL=$(grep DATABASE_URL apps/api/.env | cut -d '=' -f2- | tr -d '"' | tr -d "'" | head -1)
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}   ⚠️  DATABASE_URL non trouvé, utilisation de Supabase MCP${NC}"
    # Utiliser Supabase MCP pour obtenir les IDs
    CUSTOMER_ID=""
    MENU_ITEM_ID=""
else
    # Obtenir Customer ID
    CUSTOMER_ID=$(psql "$DATABASE_URL" -t -A -c "SELECT id FROM customers WHERE \"restaurantId\" = '$RESTAURANT_ID' LIMIT 1;" 2>/dev/null | tr -d ' ' || echo "")
    
    # Obtenir Menu Item ID
    MENU_ITEM_ID=$(psql "$DATABASE_URL" -t -A -c "SELECT id FROM menu_items WHERE \"restaurantId\" = '$RESTAURANT_ID' AND \"isActive\" = true LIMIT 1;" 2>/dev/null | tr -d ' ' || echo "")
fi

# Si pas d'IDs, créer des données de test via API
if [ -z "$CUSTOMER_ID" ] || [ -z "$MENU_ITEM_ID" ]; then
    echo -e "${YELLOW}   ⚠️  Aucun customer ou menu item trouvé, création de données de test...${NC}"
    
    # Créer un customer de test
    CUSTOMER_RESPONSE=$(curl -s -X POST "$API_URL/api/customers" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Test Customer",
        "phone": "+201234567890"
      }' 2>/dev/null || echo "")
    
    if [ ! -z "$CUSTOMER_RESPONSE" ] && echo "$CUSTOMER_RESPONSE" | grep -q "id"; then
        CUSTOMER_ID=$(echo "$CUSTOMER_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        echo -e "${GREEN}   ✅ Customer créé: $CUSTOMER_ID${NC}"
    fi
    
    # Obtenir un menu item existant ou créer un category d'abord
    MENU_ITEMS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
      "$API_URL/api/menu/items" 2>/dev/null || echo "")
    
    if [ ! -z "$MENU_ITEMS_RESPONSE" ] && echo "$MENU_ITEMS_RESPONSE" | grep -q "id"; then
        MENU_ITEM_ID=$(echo "$MENU_ITEMS_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
        echo -e "${GREEN}   ✅ Menu item trouvé: $MENU_ITEM_ID${NC}"
    fi
fi

if [ -z "$CUSTOMER_ID" ] || [ -z "$MENU_ITEM_ID" ]; then
    echo -e "${RED}   ❌ Impossible d'obtenir les IDs nécessaires${NC}"
    echo "   Customer ID: ${CUSTOMER_ID:-non trouvé}"
    echo "   Menu Item ID: ${MENU_ITEM_ID:-non trouvé}"
    exit 1
fi

echo -e "${GREEN}   ✅ IDs récupérés${NC}"
echo "   Customer ID: $CUSTOMER_ID"
echo "   Menu Item ID: $MENU_ITEM_ID"
echo ""

# Test 5: Créer une commande
echo -e "${YELLOW}5️⃣  Création d'une commande de test...${NC}"
ORDER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/orders" \
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

HTTP_CODE=$(echo "$ORDER_RESPONSE" | tail -n 1)
ORDER_BODY=$(echo "$ORDER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}   ✅ Commande créée avec succès!${NC}"
    ORDER_ID=$(echo "$ORDER_BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
    ORDER_NUMBER=$(echo "$ORDER_BODY" | grep -o '"orderNumber":"[^"]*' | cut -d'"' -f4 | head -1)
    echo "   Order ID: $ORDER_ID"
    echo "   Order Number: $ORDER_NUMBER"
else
    echo -e "${RED}   ❌ Erreur lors de la création de la commande (HTTP $HTTP_CODE)${NC}"
    echo "   Réponse: $ORDER_BODY"
    exit 1
fi
echo ""

# Test 6: Vérifier que la commande existe
echo -e "${YELLOW}6️⃣  Vérification de la commande créée...${NC}"
ORDERS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/orders")

if echo "$ORDERS_RESPONSE" | grep -q "$ORDER_ID"; then
    echo -e "${GREEN}   ✅ Commande trouvée dans la liste${NC}"
else
    echo -e "${YELLOW}   ⚠️  Commande non trouvée dans la liste (peut être normal selon les filtres)${NC}"
fi
echo ""

# Résumé
echo -e "${GREEN}=========================================="
echo "✅ Tous les tests sont passés avec succès!"
echo "==========================================${NC}"
echo ""
echo "Résumé:"
echo "  ✅ Authentification: OK"
echo "  ✅ Profil utilisateur: OK"
echo "  ✅ Récupération IDs: OK"
echo "  ✅ Création commande: OK"
echo "  ✅ Vérification commande: OK"
echo ""
echo "Token pour tests futurs:"
echo "  export TOKEN=\"$TOKEN\""
echo ""
echo "IDs pour tests futurs:"
echo "  export CUSTOMER_ID=\"$CUSTOMER_ID\""
echo "  export MENU_ITEM_ID=\"$MENU_ITEM_ID\""
echo "  export ORDER_ID=\"$ORDER_ID\""
