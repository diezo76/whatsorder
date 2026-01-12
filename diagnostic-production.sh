#!/bin/bash

# Script de diagnostic pour la production Vercel
# Usage: ./diagnostic-production.sh [URL_VERCEL]

set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROD_URL="${1:-https://whatsorder-web-diiezos-projects.vercel.app}"

echo -e "${BLUE}🔍 Diagnostic Production Vercel${NC}"
echo -e "URL: ${PROD_URL}\n"

# Test 1: Health Check
echo -e "${YELLOW}1. Test Health Check${NC}"
health=$(curl -s "$PROD_URL/api/auth/health")
if echo "$health" | grep -q "ok"; then
    echo -e "  ${GREEN}✅ Health Check OK${NC}"
else
    echo -e "  ${RED}❌ Health Check FAILED${NC}"
    echo "  Réponse: $health"
fi
echo ""

# Test 2: Login avec détails d'erreur
echo -e "${YELLOW}2. Test Login (avec détails)${NC}"
login_response=$(curl -s -X POST "$PROD_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@whatsorder.com",
    "password": "Admin123!"
  }' \
  -w "\n%{http_code}")

http_code=$(echo "$login_response" | tail -n1)
body=$(echo "$login_response" | sed '$d')

echo "  Code HTTP: $http_code"
echo "  Réponse: $body"

if [ "$http_code" = "200" ]; then
    echo -e "  ${GREEN}✅ Login réussi${NC}"
    token=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    if [ -n "$token" ]; then
        echo "  Token: ${token:0:50}..."
    fi
else
    echo -e "  ${RED}❌ Login échoué${NC}"
    
    # Analyser l'erreur
    if echo "$body" | grep -q "Invalid credentials"; then
        echo -e "  ${YELLOW}⚠️  Cause probable: Utilisateur non trouvé ou mot de passe incorrect${NC}"
        echo -e "  ${YELLOW}   → La base de données n'est probablement pas seedée${NC}"
        echo -e "  ${YELLOW}   → Solution: Exécuter 'npx prisma db seed' sur Supabase${NC}"
    elif echo "$body" | grep -q "Internal server error"; then
        echo -e "  ${YELLOW}⚠️  Cause probable: Erreur serveur (DB, Prisma, ou variables env)${NC}"
        echo -e "  ${YELLOW}   → Vérifier les logs Vercel:${NC}"
        echo -e "  ${YELLOW}      Vercel Dashboard → Projet → Deployments → Latest → Runtime Logs${NC}"
        echo -e "  ${YELLOW}   → Vérifier les variables d'environnement:${NC}"
        echo -e "  ${YELLOW}      DATABASE_URL, JWT_SECRET, etc.${NC}"
    fi
fi
echo ""

# Test 3: Vérifier les variables d'environnement (via erreur explicite)
echo -e "${YELLOW}3. Suggestions de vérification${NC}"
echo -e "  ${BLUE}Variables à vérifier dans Vercel Dashboard:${NC}"
echo "    - DATABASE_URL (connexion PostgreSQL)"
echo "    - DIRECT_URL (connexion directe PostgreSQL)"
echo "    - JWT_SECRET (secret pour les tokens)"
echo "    - NODE_ENV=production"
echo ""

echo -e "${YELLOW}4. Prochaines étapes${NC}"
echo -e "  ${BLUE}Si erreur 'Invalid credentials':${NC}"
echo "    1. Connectez-vous à Supabase Dashboard"
echo "    2. Allez dans SQL Editor"
echo "    3. Vérifiez si l'utilisateur existe:"
echo "       SELECT * FROM users WHERE email = 'admin@whatsorder.com';"
echo "    4. Si vide, exécutez le seed:"
echo "       cd apps/web && npx prisma db seed"
echo ""
echo -e "  ${BLUE}Si erreur 'Internal server error':${NC}"
echo "    1. Vercel Dashboard → Projet → Deployments → Latest"
echo "    2. Cliquez sur 'Runtime Logs'"
echo "    3. Cherchez l'erreur exacte (Prisma, Database, etc.)"
echo "    4. Partagez les logs pour diagnostic"
echo ""
