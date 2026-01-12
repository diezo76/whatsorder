#!/bin/bash

# Script de test complet de l'application
# Teste toutes les fonctionnalités et corrige les problèmes

set -e

BASE_URL="https://www.whataybo.com"
EMAIL="admin@whatsorder.com"
PASSWORD="Admin123!"

echo "=========================================="
echo "🧪 TEST COMPLET DE L'APPLICATION"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Test 1: Authentification
echo "📋 Test 1: Authentification"
echo "---------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "success.*true"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    print_success "Authentification réussie"
    echo "Token: ${TOKEN:0:50}..."
else
    print_error "Échec de l'authentification"
    echo "Réponse: $LOGIN_RESPONSE"
    exit 1
fi

# Test 2: Vérifier le profil utilisateur
echo ""
echo "📋 Test 2: Profil utilisateur (/api/auth/me)"
echo "--------------------------------------------"
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q "admin@whatsorder.com"; then
    print_success "Profil utilisateur récupéré"
    RESTAURANT_ID=$(echo "$ME_RESPONSE" | grep -o '"restaurantId":"[^"]*' | cut -d'"' -f4)
    echo "Restaurant ID: $RESTAURANT_ID"
else
    print_error "Échec de récupération du profil"
    echo "Réponse: $ME_RESPONSE"
fi

# Test 3: Récupérer les commandes
echo ""
echo "📋 Test 3: Liste des commandes (/api/orders)"
echo "--------------------------------------------"
ORDERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/orders" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ORDERS_RESPONSE" | grep -q "success"; then
    ORDER_COUNT=$(echo "$ORDERS_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    print_success "Liste des commandes récupérée"
    echo "Nombre de commandes: $ORDER_COUNT"
else
    print_error "Échec de récupération des commandes"
    echo "Réponse: $ORDERS_RESPONSE"
fi

# Test 4: Récupérer le menu
echo ""
echo "📋 Test 4: Menu du restaurant (/api/menu/categories)"
echo "-----------------------------------------------------"
MENU_RESPONSE=$(curl -s -X GET "$BASE_URL/api/menu/categories" \
  -H "Authorization: Bearer $TOKEN")

if echo "$MENU_RESPONSE" | grep -q "success\|categories"; then
    print_success "Menu récupéré"
else
    print_warning "Menu non récupéré ou vide"
    echo "Réponse: $MENU_RESPONSE"
fi

# Test 5: API publique restaurant
echo ""
echo "📋 Test 5: API publique restaurant (/api/public/restaurants/nile-bites)"
echo "------------------------------------------------------------------------"
PUBLIC_RESPONSE=$(curl -s -X GET "$BASE_URL/api/public/restaurants/nile-bites")

if echo "$PUBLIC_RESPONSE" | grep -q "Nile Bites"; then
    print_success "API publique fonctionnelle"
else
    print_error "Échec API publique"
    echo "Réponse: $PUBLIC_RESPONSE"
fi

# Test 6: API publique menu
echo ""
echo "📋 Test 6: API publique menu (/api/public/restaurants/nile-bites/menu)"
echo "-----------------------------------------------------------------------"
MENU_PUBLIC_RESPONSE=$(curl -s -X GET "$BASE_URL/api/public/restaurants/nile-bites/menu")

if echo "$MENU_PUBLIC_RESPONSE" | grep -q "categories\|items"; then
    print_success "Menu public récupéré"
else
    print_warning "Menu public vide ou erreur"
    echo "Réponse: $MENU_PUBLIC_RESPONSE"
fi

# Résumé
echo ""
echo "=========================================="
echo "📊 RÉSUMÉ DES TESTS"
echo "=========================================="
echo ""
echo "✅ Tests terminés"
echo ""
echo "Pour tester en temps réel:"
echo "1. Ouvrez https://www.whataybo.com/dashboard/orders"
echo "2. Vérifiez que l'indicateur 'Temps réel actif' est vert"
echo "3. Créez une commande via l'API ou le frontend"
echo "4. Vérifiez qu'elle apparaît immédiatement"
echo ""
