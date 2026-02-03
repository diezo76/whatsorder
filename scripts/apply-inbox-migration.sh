#!/bin/bash

# Script pour appliquer la migration SQL de l'inbox avancée
# Usage: ./scripts/apply-inbox-migration.sh

set -e

echo "🚀 Application de la migration SQL Inbox Avancée"
echo "================================================"
echo ""

# Vérifier si DATABASE_URL est définie
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: DATABASE_URL n'est pas définie"
    echo ""
    echo "Options:"
    echo "1. Charger depuis .env:"
    echo "   cd apps/web && source .env 2>/dev/null || true"
    echo "   export DATABASE_URL=\$DATABASE_URL"
    echo ""
    echo "2. Définir manuellement:"
    echo "   export DATABASE_URL='postgresql://user:password@host:port/database'"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL trouvée"
echo ""

# Chemin vers le fichier de migration
MIGRATION_FILE="apps/web/prisma/migrations/add_advanced_inbox_features/migration.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Erreur: Fichier de migration non trouvé: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Fichier de migration: $MIGRATION_FILE"
echo ""

# Demander confirmation
read -p "⚠️  Voulez-vous appliquer cette migration sur la base de données ? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 0
fi

echo ""
echo "🔄 Application de la migration..."
echo ""

# Vérifier si psql est disponible
if command -v psql &> /dev/null; then
    echo "✅ psql trouvé, application via psql..."
    psql "$DATABASE_URL" -f "$MIGRATION_FILE"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migration appliquée avec succès !"
        echo ""
        echo "Prochaines étapes:"
        echo "1. cd apps/web"
        echo "2. npx prisma generate"
        echo "3. Vérifier que tout fonctionne"
    else
        echo ""
        echo "❌ Erreur lors de l'application de la migration"
        exit 1
    fi
else
    echo "⚠️  psql n'est pas installé"
    echo ""
    echo "📋 Instructions pour appliquer manuellement:"
    echo ""
    echo "Option 1: Via Supabase Dashboard (Recommandé)"
    echo "1. Ouvrez https://supabase.com"
    echo "2. Sélectionnez votre projet"
    echo "3. Allez dans SQL Editor"
    echo "4. Copiez le contenu de: $MIGRATION_FILE"
    echo "5. Collez et exécutez le SQL"
    echo ""
    echo "Option 2: Installer psql"
    echo "macOS: brew install postgresql"
    echo "Linux: sudo apt-get install postgresql-client"
    echo ""
    echo "Option 3: Utiliser Prisma Studio"
    echo "cd apps/web"
    echo "npx prisma studio"
    echo "(Puis exécutez le SQL dans l'interface)"
    echo ""
    exit 1
fi
