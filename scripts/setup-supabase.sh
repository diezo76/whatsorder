#!/bin/bash

# ==========================================
# Script de Configuration Supabase
# ==========================================
# Ce script vous guide dans la configuration de Supabase

set -e

echo "🚀 Configuration de Supabase pour Whataybo"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour demander une entrée
ask() {
    local prompt="$1"
    local var_name="$2"
    echo -e "${BLUE}${prompt}${NC}"
    read -r value
    eval "$var_name='$value'"
}

# Vérifier si on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: Exécutez ce script depuis la racine du projet${NC}"
    exit 1
fi

echo "📋 Étape 1/5 : Création du projet Supabase"
echo "=========================================="
echo ""
echo "1. Allez sur https://supabase.com"
echo "2. Créez un compte (ou connectez-vous)"
echo "3. Cliquez sur 'New Project'"
echo "4. Remplissez les informations :"
echo "   - Name: whatsorder"
echo "   - Database Password: (générez un mot de passe fort)"
echo "   - Region: Europe West (Frankfurt)"
echo "   - Plan: Free"
echo ""
echo "⏳ Attendez 2-3 minutes que le projet soit créé..."
echo ""
read -p "Appuyez sur Entrée quand le projet est créé..."

echo ""
echo "📋 Étape 2/5 : Récupération des credentials"
echo "=========================================="
echo ""
echo "Dans Supabase Dashboard, allez dans Settings → API"
echo ""

# Demander les credentials
ask "🔑 Project URL (https://xxxxx.supabase.co) :" SUPABASE_URL
ask "🔑 anon/public key (commence par eyJhbGci...) :" SUPABASE_ANON_KEY
ask "🔑 service_role key (commence par eyJhbGci...) :" SUPABASE_SERVICE_KEY

echo ""
echo "Dans Settings → Database, section 'Connection string' → 'URI'"
echo ""
ask "🔑 Database Password (le mot de passe que vous avez créé) :" DB_PASSWORD

# Extraire le project ref de l'URL
PROJECT_REF=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|.supabase.co||')

# Construire les URLs de base de données
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo ""
echo "📋 Étape 3/5 : Configuration des fichiers .env"
echo "=========================================="
echo ""

# Demander le JWT secret (ou garder l'existant)
if [ -f "apps/api/.env" ]; then
    echo "Fichier .env existant trouvé pour l'API"
    JWT_SECRET=$(grep "JWT_SECRET=" apps/api/.env | cut -d '=' -f 2- | tr -d '"' || echo "")
    if [ -z "$JWT_SECRET" ]; then
        ask "🔑 JWT_SECRET (ou laissez vide pour en générer un nouveau) :" JWT_SECRET
        if [ -z "$JWT_SECRET" ]; then
            JWT_SECRET=$(openssl rand -hex 32)
            echo -e "${GREEN}✅ JWT_SECRET généré: ${JWT_SECRET}${NC}"
        fi
    else
        echo -e "${GREEN}✅ JWT_SECRET existant trouvé${NC}"
    fi
else
    JWT_SECRET=$(openssl rand -hex 32)
    echo -e "${GREEN}✅ JWT_SECRET généré: ${JWT_SECRET}${NC}"
fi

# Créer/Mettre à jour apps/api/.env
cat > apps/api/.env <<EOF
# ==========================================
# SUPABASE CONFIGURATION
# ==========================================
DATABASE_URL="${DATABASE_URL}"
DIRECT_URL="${DIRECT_URL}"

NEXT_PUBLIC_SUPABASE_URL="${SUPABASE_URL}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_KEY}"

# ==========================================
# JWT CONFIGURATION
# ==========================================
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="7d"

# ==========================================
# SERVER CONFIGURATION
# ==========================================
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# ==========================================
# OPENAI (optionnel)
# ==========================================
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4-turbo-preview"
EOF

echo -e "${GREEN}✅ Fichier apps/api/.env créé${NC}"

# Créer/Mettre à jour apps/web/.env.local
cat > apps/web/.env.local <<EOF
# ==========================================
# SUPABASE CONFIGURATION
# ==========================================
NEXT_PUBLIC_SUPABASE_URL="${SUPABASE_URL}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_KEY}"
DATABASE_URL="${DATABASE_URL}"

# ==========================================
# JWT CONFIGURATION
# ==========================================
JWT_SECRET="${JWT_SECRET}"

# ==========================================
# APP CONFIGURATION
# ==========================================
NODE_ENV="development"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# ==========================================
# API URL
# ==========================================
NEXT_PUBLIC_API_URL="http://localhost:4000"
EOF

echo -e "${GREEN}✅ Fichier apps/web/.env.local créé${NC}"

echo ""
echo "📋 Étape 4/5 : Migration du schéma vers Supabase"
echo "=========================================="
echo ""

cd apps/api

echo "Installation des dépendances Prisma..."
pnpm install --silent

echo ""
echo "Génération du client Prisma..."
pnpm prisma generate

echo ""
echo "Migration du schéma vers Supabase..."
pnpm prisma db push --skip-generate

echo ""
echo -e "${GREEN}✅ Schéma migré avec succès !${NC}"

echo ""
echo "Voulez-vous exécuter le seed pour créer des données de test ? (y/n)"
read -r do_seed

if [ "$do_seed" = "y" ] || [ "$do_seed" = "Y" ]; then
    echo "Exécution du seed..."
    pnpm prisma db seed
    echo -e "${GREEN}✅ Seed exécuté avec succès !${NC}"
fi

cd ../..

echo ""
echo "📋 Étape 5/5 : Configuration RLS (Row Level Security)"
echo "=========================================="
echo ""
echo "⚠️  Supabase active RLS par défaut."
echo ""
echo "Option 1 (Recommandé pour le développement) :"
echo "  Désactiver RLS temporairement pour toutes les tables"
echo ""
echo "Option 2 (Pour la production) :"
echo "  Configurer des politiques RLS manuellement"
echo ""
echo "Que souhaitez-vous faire ?"
echo "1) Désactiver RLS (dev)"
echo "2) Garder RLS activé (configurer manuellement)"
echo "3) Passer cette étape"
read -r rls_choice

if [ "$rls_choice" = "1" ]; then
    echo ""
    echo "Création du script SQL pour désactiver RLS..."
    
    cat > disable-rls.sql <<'EOF'
-- Désactiver RLS pour toutes les tables
ALTER TABLE "Restaurant" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuItem" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "InternalNote" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Workflow" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowExecution" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Campaign" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyAnalytics" DISABLE ROW LEVEL SECURITY;
EOF

    echo -e "${GREEN}✅ Script créé: disable-rls.sql${NC}"
    echo ""
    echo "Pour désactiver RLS, exécutez ce script dans Supabase SQL Editor :"
    echo "1. Allez dans Supabase Dashboard → SQL Editor"
    echo "2. Copiez le contenu de disable-rls.sql"
    echo "3. Exécutez-le"
    echo ""
    echo "Ou exécutez automatiquement :"
    echo "  psql \"${DIRECT_URL}\" < disable-rls.sql"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Configuration Supabase terminée !${NC}"
echo "=========================================="
echo ""
echo "📝 Résumé :"
echo "  ✅ Projet Supabase créé"
echo "  ✅ Credentials configurés"
echo "  ✅ Fichiers .env créés"
echo "  ✅ Schéma migré"
echo ""
echo "🚀 Prochaines étapes :"
echo ""
echo "1. Tester en local :"
echo "   cd apps/api && pnpm dev"
echo "   cd apps/web && pnpm dev"
echo ""
echo "2. Configurer Vercel :"
echo "   - Aller sur https://vercel.com"
echo "   - Import du repository GitHub"
echo "   - Ajouter les variables d'environnement"
echo ""
echo "3. Déployer :"
echo "   vercel --prod"
echo ""
echo "📚 Documentation :"
echo "  - QUICK_START_VERCEL_SUPABASE.md"
echo "  - MIGRATION_VERCEL_SUPABASE.md"
echo ""
echo -e "${GREEN}✅ Tout est prêt ! Bonne migration ! 🚀${NC}"
