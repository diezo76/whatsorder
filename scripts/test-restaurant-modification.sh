#!/bin/bash

# Script pour tester la modification du restaurant

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
    echo "Réponse: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Connecté"
echo ""

# Récupérer les données actuelles
echo "📋 Récupération des données actuelles..."
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/restaurant" \
  -H "Authorization: Bearer $TOKEN")

echo "Réponse GET:"
echo "$GET_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$GET_RESPONSE"
echo ""

# Vérifier si les champs timezone et language sont présents
if echo "$GET_RESPONSE" | grep -q "timezone"; then
    echo "✅ Le champ 'timezone' est présent dans la réponse"
else
    echo "⚠️  Le champ 'timezone' n'est PAS présent dans la réponse"
fi

if echo "$GET_RESPONSE" | grep -q "language"; then
    echo "✅ Le champ 'language' est présent dans la réponse"
else
    echo "⚠️  Le champ 'language' n'est PAS présent dans la réponse"
fi

echo ""

# Modifier le nom du restaurant
echo "✏️ Modification du nom du restaurant..."
NEW_NAME="Nile Bites $(date +%H%M%S)"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/restaurant" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NEW_NAME\"}")

echo "Réponse PUT:"
echo "$UPDATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPDATE_RESPONSE"
echo ""

if echo "$UPDATE_RESPONSE" | grep -q "$NEW_NAME"; then
    echo "✅ Nom modifié avec succès: $NEW_NAME"
else
    echo "❌ Erreur lors de la modification"
    if echo "$UPDATE_RESPONSE" | grep -q "error"; then
        ERROR_MSG=$(echo "$UPDATE_RESPONSE" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
        echo "Erreur: $ERROR_MSG"
    fi
fi
