#!/bin/bash

# Script pour vérifier le statut du déploiement Vercel
# Usage: ./scripts/check-vercel-deployment.sh [PROJECT_NAME]

set -e

PROJECT_NAME="${1:-whatsorder}"

echo "🔍 Vérification du Déploiement Vercel"
echo "======================================"
echo ""
echo "Projet: $PROJECT_NAME"
echo ""

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI n'est pas installé."
    echo "   Installez-le avec: npm i -g vercel"
    echo ""
    echo "📋 Instructions manuelles:"
    echo "   1. Aller sur https://vercel.com/dashboard"
    echo "   2. Sélectionner le projet: $PROJECT_NAME"
    echo "   3. Vérifier le statut du dernier déploiement"
    echo "   4. Vérifier les logs de build"
    exit 0
fi

echo "✅ Vercel CLI détecté"
echo ""

# Vérifier le dernier déploiement
echo "📊 Dernier déploiement:"
vercel ls $PROJECT_NAME --limit 1

echo ""
echo "✅ Vérification terminée"
echo ""
echo "Pour plus de détails:"
echo "   - Dashboard: https://vercel.com/dashboard"
echo "   - Logs: vercel logs $PROJECT_NAME"
