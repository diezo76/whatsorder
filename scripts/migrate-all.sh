#!/bin/bash

# ==========================================
# Script de Migration Complète
# Railway → Vercel + Supabase
# ==========================================

set -e

echo "🚀 Migration Complète : Railway → Vercel + Supabase"
echo "=================================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: Exécutez ce script depuis la racine du projet${NC}"
    exit 1
fi

echo "Ce script va effectuer la migration complète en 3 étapes :"
echo ""
echo "📋 Étape 1 : Configuration Supabase"
echo "📋 Étape 2 : Test en local"
echo "📋 Étape 3 : Déploiement Vercel"
echo ""
echo "Durée estimée : 15-30 minutes"
echo ""
read -p "Voulez-vous continuer ? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration annulée"
    exit 0
fi

echo ""
echo "=========================================="
echo "📋 Étape 1/3 : Configuration Supabase"
echo "=========================================="
echo ""

# Exécuter le script de configuration Supabase
if [ -f "scripts/setup-supabase.sh" ]; then
    ./scripts/setup-supabase.sh
else
    echo -e "${RED}❌ Script setup-supabase.sh non trouvé${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "📋 Étape 2/3 : Test en local"
echo "=========================================="
echo ""

echo "Installation des dépendances..."
pnpm install

echo ""
echo "Voulez-vous tester l'application en local avant de déployer ? (y/n)"
read -r test_local

if [ "$test_local" = "y" ] || [ "$test_local" = "Y" ]; then
    echo ""
    echo "Démarrage de l'application..."
    echo ""
    echo "Backend API : http://localhost:4000"
    echo "Frontend Web : http://localhost:3000"
    echo ""
    echo "Testez l'application dans votre navigateur."
    echo "Appuyez sur Ctrl+C dans chaque terminal pour arrêter."
    echo ""
    echo "Ouvrez 2 nouveaux terminaux et exécutez :"
    echo "  Terminal 1: cd apps/api && pnpm dev"
    echo "  Terminal 2: cd apps/web && pnpm dev"
    echo ""
    read -p "Appuyez sur Entrée quand les tests sont terminés..."
fi

echo ""
echo "=========================================="
echo "📋 Étape 3/3 : Déploiement Vercel"
echo "=========================================="
echo ""

# Exécuter le script de déploiement Vercel
if [ -f "scripts/deploy-vercel.sh" ]; then
    ./scripts/deploy-vercel.sh
else
    echo -e "${RED}❌ Script deploy-vercel.sh non trouvé${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Migration Terminée !${NC}"
echo "=========================================="
echo ""
echo "✅ Supabase configuré"
echo "✅ Application déployée sur Vercel"
echo ""
echo "🧪 Tests de validation :"
echo ""
echo "1. Ouvrir l'URL Vercel"
echo "2. Tester la page d'accueil"
echo "3. Tester le login"
echo "4. Tester le dashboard"
echo ""
echo "📝 Prochaines étapes :"
echo ""
echo "1. Si tout fonctionne :"
echo "   - Arrêter les services Railway"
echo "   - Supprimer les projets Railway (après ~1 semaine)"
echo ""
echo "2. Configuration avancée (optionnel) :"
echo "   - Configurer un domaine personnalisé sur Vercel"
echo "   - Configurer RLS sur Supabase"
echo "   - Migrer vers Supabase Auth"
echo ""
echo "📚 Documentation :"
echo "  - README_MIGRATION.md"
echo "  - MIGRATION_VERCEL_SUPABASE.md"
echo ""
echo -e "${GREEN}✅ Félicitations ! Vous n'utilisez plus Railway ! 🚀${NC}"
