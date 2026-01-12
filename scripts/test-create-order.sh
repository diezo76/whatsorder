#!/bin/bash

# Script pour créer une commande de test et vérifier le temps réel

BASE_URL="https://www.whataybo.com"
EMAIL="admin@whatsorder.com"
PASSWORD="Admin123!"

echo "🔐 Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Échec de l'authentification"
    exit 1
fi

echo "✅ Connecté"
echo ""

# Utiliser les IDs du restaurant dans les tables minuscules (7c702fcc-81b5-4487-b7e7-d6bda35b432a)
CUSTOMER_ID="d1c7e0cf-f862-4b98-ae74-51d459319872"
MENU_ITEM_ID="278072ab-fcab-4827-9961-f697661c02c1"  # Koshari

echo "📦 Création d'une commande de test..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"items\": [{
      \"menuItemId\": \"$MENU_ITEM_ID\",
      \"quantity\": 2
    }],
    \"deliveryType\": \"DELIVERY\",
    \"deliveryAddress\": \"123 Test Street, Cairo\",
    \"customerNotes\": \"Commande de test pour vérifier le temps réel\"
  }")

echo "$ORDER_RESPONSE" | jq '.' 2>/dev/null || echo "$ORDER_RESPONSE"

ORDER_NUMBER=$(echo "$ORDER_RESPONSE" | grep -o '"orderNumber":"[^"]*' | cut -d'"' -f4)

if [ -n "$ORDER_NUMBER" ]; then
    echo ""
    echo "✅ Commande créée : $ORDER_NUMBER"
    echo ""
    echo "🔍 Vérifiez maintenant dans le dashboard :"
    echo "   https://www.whataybo.com/dashboard/orders"
    echo ""
    echo "   La commande devrait apparaître immédiatement dans la colonne '⏳ En Attente'"
else
    echo ""
    echo "❌ Erreur lors de la création de la commande"
fi
