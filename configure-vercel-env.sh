#!/bin/bash

# Script pour configurer les variables d'environnement Vercel
# Usage: ./configure-vercel-env.sh

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# URLs Supabase avec le mot de passe
DB_PASSWORD="Siinadiiezo29"
DATABASE_URL="postgresql://postgres.rvndgopsysdyycelmfuu:${DB_PASSWORD}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.rvndgopsysdyycelmfuu:${DB_PASSWORD}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

PROJECT_ID="prj_M8PKY8zqG66h87wFvKaoNHsUkeus"
TEAM_ID="team_Su8Qxm6rp1fhfPEiktAIplZk"

echo -e "${BLUE}🔧 Configuration des Variables d'Environnement Vercel${NC}\n"

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI non installé. Installation...${NC}"
    npm install -g vercel
fi

# Vérifier si l'utilisateur est connecté
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vous n'êtes pas connecté à Vercel. Connexion...${NC}"
    vercel login
fi

echo -e "${BLUE}📝 Configuration des variables:${NC}"
echo "  - DATABASE_URL: ${DATABASE_URL:0:80}..."
echo "  - DIRECT_URL: ${DIRECT_URL:0:80}..."
echo ""

# Créer un fichier temporaire pour les variables
ENV_FILE=$(mktemp)
cat > "$ENV_FILE" << EOF
DATABASE_URL=${DATABASE_URL}
DIRECT_URL=${DIRECT_URL}
EOF

echo -e "${YELLOW}⚠️  Note: Ce script nécessite l'API Vercel pour configurer les variables.${NC}"
echo -e "${YELLOW}   Utilisez plutôt l'interface Vercel Dashboard ou l'API directement.${NC}"
echo ""

# Instructions pour configuration manuelle
echo -e "${BLUE}📋 Instructions pour Configuration Manuelle:${NC}"
echo ""
echo "1. Allez sur: https://vercel.com/dashboard"
echo "2. Projet: whatsorder-web"
echo "3. Settings → Environment Variables"
echo ""
echo "Ajoutez ces variables pour Production:"
echo ""
echo "DATABASE_URL:"
echo "${DATABASE_URL}"
echo ""
echo "DIRECT_URL:"
echo "${DIRECT_URL}"
echo ""
echo "4. Cliquez sur 'Save'"
echo "5. Redéployez: Deployments → '...' → Redeploy"
echo ""

rm "$ENV_FILE"

echo -e "${GREEN}✅ URLs préparées !${NC}"
echo -e "${YELLOW}⚠️  Configurez-les manuellement dans Vercel Dashboard (voir instructions ci-dessus)${NC}"
