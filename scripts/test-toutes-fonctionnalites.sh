#!/bin/bash

# Script de test complet de toutes les fonctionnalités

BASE_URL="https://www.whataybo.com"
EMAIL="admin@whatsorder.com"
PASSWORD="Admin123!"

echo "=========================================="
echo "🧪 TEST COMPLET DE TOUTES LES FONCTIONNALITÉS"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Connexion
echo "🔐 Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    print_error "Échec de l'authentification"
    exit 1
fi
print_success "Authentifié"
echo ""

# Test 1: API Auth
echo "📋 Test 1: API Auth"
echo "-------------------"
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" -H "Authorization: Bearer $TOKEN")
if echo "$ME_RESPONSE" | grep -q "admin@whatsorder.com"; then
    print_success "GET /api/auth/me"
else
    print_error "GET /api/auth/me"
fi
echo ""

# Test 2: API Orders
echo "📋 Test 2: API Orders"
echo "---------------------"
ORDERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/orders" -H "Authorization: Bearer $TOKEN")
if echo "$ORDERS_RESPONSE" | grep -q "success"; then
    print_success "GET /api/orders"
    ORDER_COUNT=$(echo "$ORDERS_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "   Nombre de commandes: $ORDER_COUNT"
else
    print_error "GET /api/orders"
fi

# Test création commande
CREATE_ORDER=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "d1c7e0cf-f862-4b98-ae74-51d459319872",
    "items": [{"menuItemId": "278072ab-fcab-4827-9961-f697661c02c1", "quantity": 1}],
    "deliveryType": "DELIVERY",
    "deliveryAddress": "Test Address"
  }')
if echo "$CREATE_ORDER" | grep -q "success.*true"; then
    print_success "POST /api/orders"
    ORDER_ID=$(echo "$CREATE_ORDER" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
else
    print_error "POST /api/orders"
    ORDER_ID=""
fi
echo ""

# Test 3: API Menu
echo "📋 Test 3: API Menu"
echo "-------------------"
CATEGORIES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/menu/categories" -H "Authorization: Bearer $TOKEN")
if echo "$CATEGORIES_RESPONSE" | grep -q "success\|categories"; then
    print_success "GET /api/menu/categories"
else
    print_error "GET /api/menu/categories"
fi
echo ""

# Test 4: API Analytics
echo "📋 Test 4: API Analytics"
echo "------------------------"
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/analytics/dashboard-stats" -H "Authorization: Bearer $TOKEN")
if echo "$STATS_RESPONSE" | grep -q "success\|totalOrders"; then
    print_success "GET /api/analytics/dashboard-stats"
else
    print_warning "GET /api/analytics/dashboard-stats (peut être vide)"
fi

REVENUE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/analytics/revenue-chart" -H "Authorization: Bearer $TOKEN")
if echo "$REVENUE_RESPONSE" | grep -q "success\|data"; then
    print_success "GET /api/analytics/revenue-chart"
else
    print_warning "GET /api/analytics/revenue-chart"
fi
echo ""

# Test 5: API Publique
echo "📋 Test 5: API Publique"
echo "-----------------------"
PUBLIC_RESTAURANT=$(curl -s -X GET "$BASE_URL/api/public/restaurants/nile-bites")
if echo "$PUBLIC_RESTAURANT" | grep -q "Nile Bites"; then
    print_success "GET /api/public/restaurants/nile-bites"
else
    print_error "GET /api/public/restaurants/nile-bites"
fi

PUBLIC_MENU=$(curl -s -X GET "$BASE_URL/api/public/restaurants/nile-bites/menu")
if echo "$PUBLIC_MENU" | grep -q "categories\|items"; then
    print_success "GET /api/public/restaurants/nile-bites/menu"
else
    print_warning "GET /api/public/restaurants/nile-bites/menu"
fi
echo ""

# Test 6: API Conversations
echo "📋 Test 6: API Conversations"
echo "----------------------------"
CONVERSATIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/conversations" -H "Authorization: Bearer $TOKEN")
if echo "$CONVERSATIONS_RESPONSE" | grep -q "success\|conversations"; then
    print_success "GET /api/conversations"
else
    print_warning "GET /api/conversations (peut être vide)"
fi
echo ""

# Test 7: Mise à jour commande
if [ -n "$ORDER_ID" ]; then
    echo "📋 Test 7: Mise à jour commande"
    echo "------------------------------"
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/orders/$ORDER_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"status":"CONFIRMED"}')
    if echo "$UPDATE_RESPONSE" | grep -q "CONFIRMED"; then
        print_success "PUT /api/orders/:id (mise à jour statut)"
    else
        print_error "PUT /api/orders/:id"
    fi
    echo ""
fi

# Résumé
echo "=========================================="
echo "📊 RÉSUMÉ"
echo "=========================================="
echo ""
echo "✅ Tests terminés"
echo ""
echo "🔍 Vérifications à faire manuellement :"
echo "   1. Ouvrir https://www.whataybo.com/dashboard/orders"
echo "   2. Vérifier que l'indicateur 'Temps réel actif' est vert"
echo "   3. Vérifier que les nouvelles commandes apparaissent en temps réel"
echo "   4. Vérifier que les mises à jour de statut fonctionnent en temps réel"
echo ""
