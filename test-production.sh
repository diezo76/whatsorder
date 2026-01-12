#!/bin/bash

# Script de test pour la production Vercel
# Usage: ./test-production.sh [URL_VERCEL] [BYPASS_TOKEN]

set -e

# Couleurs pour l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URL Vercel par défaut (remplace par la tienne)
PROD_URL="${1:-https://whatsorder-web-diiezos-projects.vercel.app}"
BYPASS_TOKEN="${2:-}"

echo -e "${YELLOW}🚀 Test de production Vercel${NC}"
echo -e "URL: ${PROD_URL}"

if [ -n "$BYPASS_TOKEN" ]; then
    echo -e "${BLUE}🔑 Token de bypass fourni${NC}"
else
    echo -e "${YELLOW}⚠️  Aucun token de bypass. Si vous obtenez 401, désactivez la protection Vercel.${NC}"
fi
echo ""

# Compteurs
PASSED=0
FAILED=0

# Fonction pour construire l'URL avec bypass token si nécessaire
build_url() {
    local endpoint=$1
    if [ -n "$BYPASS_TOKEN" ]; then
        echo "$PROD_URL$endpoint?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=$BYPASS_TOKEN"
    else
        echo "$PROD_URL$endpoint"
    fi
}

# Fonction pour tester une route
test_route() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local headers=$5
    
    echo -e "\n${YELLOW}📋 Test: $name${NC}"
    echo "  → $method $endpoint"
    
    local url=$(build_url "$endpoint")
    
    if [ "$method" = "GET" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -H "$headers" -b "x-vercel-protection-bypass=$BYPASS_TOKEN" "$url")
        else
            response=$(curl -s -w "\n%{http_code}" -b "x-vercel-protection-bypass=$BYPASS_TOKEN" "$url")
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -H "$headers" -b "x-vercel-protection-bypass=$BYPASS_TOKEN" -d "$data" "$url")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -b "x-vercel-protection-bypass=$BYPASS_TOKEN" -d "$data" "$url")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "  ${GREEN}✅ OK ($http_code)${NC}"
        echo "  Réponse: $(echo "$body" | head -c 200)..."
        ((PASSED++))
        return 0
    else
        echo -e "  ${RED}❌ ÉCHEC ($http_code)${NC}"
        echo "  Réponse: $body"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Health Check
test_route "Health Check" "GET" "/api/auth/health"

# Test 2: Login
echo -e "\n${YELLOW}📋 Test: Login (récupération du token)${NC}"
login_url=$(build_url "/api/auth/login")
login_response=$(curl -s -X POST "$login_url" \
  -H "Content-Type: application/json" \
  -b "x-vercel-protection-bypass=$BYPASS_TOKEN" \
  -d '{
    "email": "admin@whatsorder.com",
    "password": "Admin123!"
  }')

token=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$token" ]; then
    echo -e "  ${GREEN}✅ Login réussi${NC}"
    echo "  Token: ${token:0:50}..."
    export PROD_TOKEN="$token"
    ((PASSED++))
else
    echo -e "  ${RED}❌ Login échoué${NC}"
    echo "  Réponse: $login_response"
    export PROD_TOKEN=""
    ((FAILED++))
fi

# Si on a un token, continuer les tests
if [ -n "$PROD_TOKEN" ]; then
    # Test 3: Get Profile
    test_route "Get Profile" "GET" "/api/auth/me" "" "Authorization: Bearer $PROD_TOKEN"
    
    # Test 4: Menu Items
    test_route "Menu Items" "GET" "/api/menu/items" "" "Authorization: Bearer $PROD_TOKEN"
    
    # Test 5: Orders List
    test_route "Orders List" "GET" "/api/orders" "" "Authorization: Bearer $PROD_TOKEN"
    
    # Test 6: Analytics Dashboard Stats
    test_route "Analytics Dashboard" "GET" "/api/analytics/dashboard-stats?period=today" "" "Authorization: Bearer $PROD_TOKEN"
    
    # Test 7: Restaurant Info
    test_route "Restaurant Info" "GET" "/api/restaurant" "" "Authorization: Bearer $PROD_TOKEN"
fi

# Résumé
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Tests réussis: $PASSED${NC}"
echo -e "${RED}❌ Tests échoués: $FAILED${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Tous les tests sont passés !${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Certains tests ont échoué${NC}"
    exit 1
fi
