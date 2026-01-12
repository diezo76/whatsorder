#!/bin/bash

# Script pour tester la sauvegarde des paramètres du restaurant

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

# Récupérer les données actuelles
echo "📋 Récupération des données actuelles..."
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/restaurant" \
  -H "Authorization: Bearer $TOKEN")

echo "Données actuelles:"
echo "$GET_RESPONSE" | head -20
echo ""

# Modifier le nom du restaurant
echo "✏️ Modification du nom du restaurant..."
NEW_NAME="Nile Bites Test $(date +%H%M%S)"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/restaurant" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NEW_NAME\"}")

if echo "$UPDATE_RESPONSE" | grep -q "$NEW_NAME"; then
    echo "✅ Nom modifié avec succès: $NEW_NAME"
else
    echo "❌ Erreur lors de la modification"
    echo "Réponse: $UPDATE_RESPONSE"
fi

echo ""

# Vérifier que la modification persiste
echo "🔍 Vérification de la persistance..."
sleep 2
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/restaurant" \
  -H "Authorization: Bearer $TOKEN")

if echo "$VERIFY_RESPONSE" | grep -q "$NEW_NAME"; then
    echo "✅ La modification persiste correctement"
else
    echo "❌ La modification n'a pas persisté"
    echo "Réponse: $VERIFY_RESPONSE"
fi
