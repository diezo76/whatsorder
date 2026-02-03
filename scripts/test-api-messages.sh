#!/bin/bash

# Script pour tester l'API des messages directement
# Usage: ./scripts/test-api-messages.sh [CONVERSATION_ID] [TOKEN]

CONVERSATION_ID=${1:-""}
TOKEN=${2:-""}

if [ -z "$CONVERSATION_ID" ] || [ -z "$TOKEN" ]; then
  echo "Usage: $0 CONVERSATION_ID TOKEN"
  echo ""
  echo "Pour obtenir le TOKEN:"
  echo "1. Ouvrez la console du navigateur (F12)"
  echo "2. Tapez: localStorage.getItem('token')"
  echo ""
  echo "Pour obtenir le CONVERSATION_ID:"
  echo "1. Sélectionnez une conversation dans l'inbox"
  echo "2. Regardez l'URL ou les logs de la console"
  exit 1
fi

echo "🔍 Test de l'API des messages..."
echo "Conversation ID: $CONVERSATION_ID"
echo ""

curl -X GET \
  "http://localhost:3000/api/conversations/$CONVERSATION_ID/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "✅ Test terminé"
