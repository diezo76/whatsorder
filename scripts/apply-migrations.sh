#!/bin/bash

# Script pour appliquer les migrations Prisma à Supabase
# Usage: ./scripts/apply-migrations.sh

set -e

echo "🔍 Vérification de la configuration..."

# Aller dans le dossier API
cd "$(dirname "$0")/../apps/api"

# Vérifier que .env existe
if [ ! -f .env ]; then
    echo "❌ Erreur: Le fichier .env n'existe pas dans apps/api/"
    echo "   Créez-le avec votre DATABASE_URL de Supabase"
    exit 1
fi

echo "✅ Fichier .env trouvé"

# Charger les variables d'environnement
export $(cat .env | grep -v '^#' | xargs)

# Vérifier que DATABASE_URL est définie
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: DATABASE_URL n'est pas définie dans .env"
    exit 1
fi

echo "✅ DATABASE_URL trouvée"
echo "📊 Base de données: $(echo $DATABASE_URL | sed 's/:[^:]*@/:***@/g')"

echo ""
echo "🚀 Application des migrations..."

# Option 1: migrate deploy (pour production)
echo "Tentative avec 'prisma migrate deploy'..."
if pnpm prisma migrate deploy; then
    echo "✅ Migrations appliquées avec succès!"
    exit 0
fi

echo ""
echo "⚠️  migrate deploy a échoué, tentative avec 'prisma migrate dev'..."
if pnpm prisma migrate dev --name apply_migrations; then
    echo "✅ Migrations appliquées avec succès!"
    exit 0
fi

echo ""
echo "❌ Les deux méthodes ont échoué."
echo ""
echo "🔧 Solutions alternatives:"
echo ""
echo "1. Vérifiez votre connexion internet"
echo "2. Vérifiez que Supabase est accessible"
echo "3. Essayez manuellement dans Supabase Dashboard > SQL Editor"
echo ""
echo "Pour appliquer manuellement, copiez le contenu de:"
echo "  apps/api/prisma/migrations/20260111152101_init_complete/migration.sql"
echo ""
echo "Et exécutez-le dans Supabase SQL Editor"

exit 1
