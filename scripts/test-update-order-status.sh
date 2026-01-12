#!/bin/bash

# Script pour tester la mise à jour de statut de commande

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

# Récupérer la dernière commande
echo "📦 Récupération de la dernière commande..."
ORDERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/orders?limit=1" \
  -H "Authorization: Bearer $TOKEN")

ORDER_ID=$(echo "$ORDERS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
ORDER_NUMBER=$(echo "$ORDERS_RESPONSE" | grep -o '"orderNumber":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$ORDER_ID" ]; then
    echo "❌ Aucune commande trouvée"
    exit 1
fi

echo "✅ Commande trouvée : $ORDER_NUMBER"
echo ""

# Mettre à jour le statut
echo "🔄 Mise à jour du statut vers CONFIRMED..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED"}')

if echo "$UPDATE_RESPONSE" | grep -q "CONFIRMED"; then
    echo "✅ Statut mis à jour avec succès"
    echo ""
    echo "🔍 Vérifiez dans le dashboard que la commande s'est déplacée vers '✅ Confirmée'"
else
    echo "❌ Erreur lors de la mise à jour"
    echo "Réponse: $UPDATE_RESPONSE"
fi
