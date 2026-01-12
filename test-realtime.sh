#!/bin/bash

# Script de test pour vérifier que Realtime fonctionne
# Usage: ./test-realtime.sh

set -e

BASE_URL="http://localhost:3000/api"
EMAIL="admin@whatsorder.com"
PASSWORD="Admin123!"

echo "🧪 Test Realtime - Création d'une commande"
echo "=========================================="
echo ""

# Étape 1: Login
echo "1️⃣ Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // .user.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Erreur de connexion"
  echo "Réponse: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Connecté avec succès"
echo ""

# Étape 2: Récupérer le restaurant pour obtenir les données
echo "2️⃣ Récupération du restaurant..."
RESTAURANT_RESPONSE=$(curl -s "${BASE_URL}/restaurant" \
  -H "Authorization: Bearer ${TOKEN}")

RESTAURANT_ID=$(echo $RESTAURANT_RESPONSE | jq -r '.id // empty')

if [ -z "$RESTAURANT_ID" ] || [ "$RESTAURANT_ID" = "null" ]; then
  echo "❌ Impossible de récupérer le restaurant"
  echo "Réponse: $RESTAURANT_RESPONSE"
  exit 1
fi

echo "✅ Restaurant ID: $RESTAURANT_ID"
echo ""

# Étape 3: Récupérer un menu item
echo "3️⃣ Récupération d'un item du menu..."
MENU_ITEMS_RESPONSE=$(curl -s "${BASE_URL}/menu/items" \
  -H "Authorization: Bearer ${TOKEN}")

MENU_ITEM_ID=$(echo $MENU_ITEMS_RESPONSE | jq -r '.items[0].id // .items[0].id // empty')

if [ -z "$MENU_ITEM_ID" ] || [ "$MENU_ITEM_ID" = "null" ]; then
  echo "❌ Aucun item de menu trouvé"
  echo "Réponse: $MENU_ITEMS_RESPONSE"
  exit 1
fi

MENU_ITEM_NAME=$(echo $MENU_ITEMS_RESPONSE | jq -r '.items[0].name // .items[0].name // "Item"')
echo "✅ Item sélectionné: $MENU_ITEM_NAME (ID: $MENU_ITEM_ID)"
echo ""

# Étape 4: Récupérer ou créer un client depuis les conversations
echo "4️⃣ Récupération d'un client..."
CONVERSATIONS_RESPONSE=$(curl -s "${BASE_URL}/conversations" \
  -H "Authorization: Bearer ${TOKEN}")

CUSTOMER_ID=$(echo $CONVERSATIONS_RESPONSE | jq -r '.conversations[0].customerId // .conversations[0].customer.id // empty')

# Si pas de conversation, créer un client et une conversation
if [ -z "$CUSTOMER_ID" ] || [ "$CUSTOMER_ID" = "null" ]; then
  echo "⚠️  Aucune conversation trouvée, création d'un client..."
  TIMESTAMP=$(date +%s)
  CUSTOMER_PHONE="+201234567890"
  CUSTOMER_NAME="Test Client ${TIMESTAMP}"
  
  CONVERSATION_RESPONSE=$(curl -s -X POST "${BASE_URL}/conversations" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"phone\":\"${CUSTOMER_PHONE}\",\"customerName\":\"${CUSTOMER_NAME}\"}")
  
  CUSTOMER_ID=$(echo $CONVERSATION_RESPONSE | jq -r '.conversation.customerId // .conversation.customer.id // empty')
  
  if [ -z "$CUSTOMER_ID" ] || [ "$CUSTOMER_ID" = "null" ]; then
    echo "❌ Impossible de créer un client"
    echo "Réponse: $CONVERSATION_RESPONSE"
    exit 1
  fi
  
  echo "✅ Client créé (ID: $CUSTOMER_ID)"
else
  echo "✅ Client trouvé (ID: $CUSTOMER_ID)"
fi
echo ""

# Étape 5: Créer une commande
echo "5️⃣ Création d'une commande..."
TIMESTAMP=$(date +%s)
ORDER_DATA=$(cat <<EOF
{
  "customerId": "${CUSTOMER_ID}",
  "items": [{
    "menuItemId": "${MENU_ITEM_ID}",
    "quantity": 1
  }],
  "deliveryType": "DELIVERY",
  "deliveryAddress": "Test Address - Realtime Test ${TIMESTAMP}",
  "customerNotes": "Test Realtime - ${TIMESTAMP}"
}
EOF
)

ORDER_RESPONSE=$(curl -s -X POST "${BASE_URL}/orders" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$ORDER_DATA")

ORDER_NUMBER=$(echo $ORDER_RESPONSE | jq -r '.order.orderNumber // .orderNumber // empty')

if [ -z "$ORDER_NUMBER" ] || [ "$ORDER_NUMBER" = "null" ]; then
  echo "❌ Erreur lors de la création de la commande"
  echo "Réponse: $ORDER_RESPONSE"
  exit 1
fi

echo "✅ Commande créée avec succès!"
echo "   Numéro de commande: $ORDER_NUMBER"
echo ""
echo "🎉 Test terminé!"
echo ""
echo "📋 Vérifications à faire dans le navigateur:"
echo "   1. Ouvrir http://localhost:3000/dashboard/orders dans 2 onglets"
echo "   2. La nouvelle commande '$ORDER_NUMBER' doit apparaître automatiquement"
echo "   3. Un toast 'Nouvelle commande : $ORDER_NUMBER' doit s'afficher"
echo ""
