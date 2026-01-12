#!/bin/bash

# Script pour configurer les variables Vercel via l'API
# Nécessite un token Vercel API

set -e

# URLs Supabase
DATABASE_URL="postgresql://postgres.rvndgopsysdyycelmfuu:Siinadiiezo29@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.rvndgopsysdyycelmfuu:Siinadiiezo29@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

PROJECT_ID="prj_M8PKY8zqG66h87wFvKaoNHsUkeus"
TEAM_ID="team_Su8Qxm6rp1fhfPEiktAIplZk"

echo "🔧 Configuration Vercel via API"
echo ""
echo "Pour utiliser ce script, vous devez:"
echo "1. Obtenir un token Vercel API: https://vercel.com/account/tokens"
echo "2. Exporter: export VERCEL_TOKEN='votre-token'"
echo ""
echo "Ensuite, exécutez les commandes suivantes:"
echo ""

cat << 'EOF'
# Configurer DATABASE_URL
curl -X POST "https://api.vercel.com/v10/projects/${PROJECT_ID}/env" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "DATABASE_URL",
    "value": "'"${DATABASE_URL}"'",
    "type": "encrypted",
    "target": ["production"]
  }'

# Configurer DIRECT_URL
curl -X POST "https://api.vercel.com/v10/projects/${PROJECT_ID}/env" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "DIRECT_URL",
    "value": "'"${DIRECT_URL}"'",
    "type": "encrypted",
    "target": ["production"]
  }'
EOF

echo ""
echo "⚠️  Ou utilisez le guide manuel: URLS_VERCEL_A_COPIER.md"
