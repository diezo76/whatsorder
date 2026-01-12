#!/bin/bash

# Script de vérification du realtime en production
# Usage: ./scripts/verify-production-realtime.sh [URL_PRODUCTION]

set -e

# Couleurs pour l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL de production (par défaut)
PROD_URL="${1:-https://ton-projet.vercel.app}"

echo "🔍 Vérification du Realtime en Production"
echo "=========================================="
echo ""
echo "URL de production: $PROD_URL"
echo ""

# Vérifier que l'URL est accessible
echo "📡 Vérification de l'accessibilité..."
if curl -s -o /dev/null -w "%{http_code}" "$PROD_URL" | grep -q "200"; then
    echo -e "${GREEN}✅ Application accessible${NC}"
else
    echo -e "${RED}❌ Application non accessible${NC}"
    exit 1
fi

echo ""
echo "📋 Checklist de Vérification:"
echo ""

# Vérifier les endpoints
echo "1. Vérification des endpoints..."

# Endpoint inbox
INBOX_URL="$PROD_URL/dashboard/inbox"
if curl -s -o /dev/null -w "%{http_code}" "$INBOX_URL" | grep -q "200\|302\|401"; then
    echo -e "   ${GREEN}✅ /dashboard/inbox accessible${NC}"
else
    echo -e "   ${RED}❌ /dashboard/inbox non accessible${NC}"
fi

# Endpoint orders
ORDERS_URL="$PROD_URL/dashboard/orders"
if curl -s -o /dev/null -w "%{http_code}" "$ORDERS_URL" | grep -q "200\|302\|401"; then
    echo -e "   ${GREEN}✅ /dashboard/orders accessible${NC}"
else
    echo -e "   ${RED}❌ /dashboard/orders non accessible${NC}"
fi

echo ""
echo "2. Instructions de test manuel:"
echo ""
echo -e "${YELLOW}📝 Étapes à suivre:${NC}"
echo ""
echo "   a) Ouvrir 2 onglets du navigateur:"
echo "      - Onglet 1: $INBOX_URL"
echo "      - Onglet 2: $INBOX_URL"
echo ""
echo "   b) Se connecter avec le même compte dans les 2 onglets"
echo ""
echo "   c) Vérifier l'indicateur de connexion:"
echo "      - Doit afficher 'Temps réel actif' avec un point vert 🟢"
echo ""
echo "   d) Sélectionner la même conversation dans les 2 onglets"
echo ""
echo "   e) Envoyer un message dans l'onglet 1"
echo "      - ✅ Le message doit apparaître instantanément dans l'onglet 2"
echo ""
echo "   f) Tester le Kanban:"
echo "      - Ouvrir 2 onglets: $ORDERS_URL"
echo "      - Drag & drop une commande dans l'onglet 1"
echo "      - ✅ La commande doit changer de colonne dans l'onglet 2"
echo ""

echo "3. Vérification des variables d'environnement:"
echo ""
echo -e "${YELLOW}⚠️  Vérifier dans Vercel Dashboard > Settings > Environment Variables:${NC}"
echo ""
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""

echo "4. Vérification Supabase:"
echo ""
echo -e "${YELLOW}⚠️  Vérifier dans Supabase Dashboard:${NC}"
echo ""
echo "   - Database > Replication > Tables activées:"
echo "     ✅ messages"
echo "     ✅ orders"
echo "     ✅ conversations"
echo ""
echo "   - Authentication > Policies > RLS activé sur les tables"
echo ""

echo "5. Logs de débogage:"
echo ""
echo "   Ouvrir la console du navigateur (F12) et vérifier:"
echo "   - 📡 Realtime status: SUBSCRIBED"
echo "   - 🆕 New message: (lors de l'envoi d'un message)"
echo "   - ✏️ Order updated: (lors du drag & drop)"
echo ""

echo -e "${GREEN}✅ Vérification terminée${NC}"
echo ""
echo "Pour plus de détails, consultez: GUIDE_DEPLOIEMENT_PRODUCTION.md"
