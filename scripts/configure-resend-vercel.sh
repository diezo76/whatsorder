#!/bin/bash

# Script pour configurer les variables Resend dans Vercel
# Usage: ./scripts/configure-resend-vercel.sh

set -e

echo "🚀 Configuration des variables Resend dans Vercel"
echo ""

# Variables
RESEND_API_KEY="re_9dp3wJML_7ZszmsoRss6BG1EZ16HEgy6m"
EMAIL_FROM="noreply@whataybo.com"
FRONTEND_URL="https://www.whataybo.com"

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé."
    echo "📦 Installation..."
    npm i -g vercel
fi

# Vérifier que l'utilisateur est connecté
echo "🔐 Vérification de la connexion Vercel..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Vous n'êtes pas connecté à Vercel."
    echo "🔑 Connexion..."
    vercel login
fi

echo ""
echo "📋 Configuration des variables d'environnement..."
echo ""

# Fonction pour ajouter une variable
add_env_var() {
    local key=$1
    local value=$2
    local env=$3
    
    echo "➕ Ajout de $key pour $env..."
    echo "$value" | vercel env add "$key" "$env" --yes
}

# Ajouter les variables pour Production
echo "🏭 Configuration pour Production..."
add_env_var "RESEND_API_KEY" "$RESEND_API_KEY" "production"
add_env_var "EMAIL_FROM" "$EMAIL_FROM" "production"
add_env_var "FRONTEND_URL" "$FRONTEND_URL" "production"

echo ""
echo "🔍 Configuration pour Preview..."
add_env_var "RESEND_API_KEY" "$RESEND_API_KEY" "preview"
add_env_var "EMAIL_FROM" "$EMAIL_FROM" "preview"
add_env_var "FRONTEND_URL" "$FRONTEND_URL" "preview"

echo ""
echo "💻 Configuration pour Development..."
add_env_var "RESEND_API_KEY" "$RESEND_API_KEY" "development"
add_env_var "EMAIL_FROM" "$EMAIL_FROM" "development"
add_env_var "FRONTEND_URL" "$FRONTEND_URL" "development"

echo ""
echo "✅ Variables configurées avec succès!"
echo ""
echo "📋 Vérification des variables..."
vercel env ls

echo ""
echo "🎉 Configuration terminée!"
echo ""
echo "⚠️  Important: Redéployez votre application pour que les nouvelles variables soient prises en compte."
echo "   Vous pouvez le faire via:"
echo "   1. Vercel Dashboard → Deployments → Redeploy"
echo "   2. Ou faire un nouveau commit pour déclencher un déploiement automatique"
