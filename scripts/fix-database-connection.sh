#!/bin/bash

# Script pour corriger la connexion à la base de données
# Remplace la connexion Supabase par une connexion locale

set -e

echo "🔧 Correction de la Connexion Base de Données"
echo "=============================================="
echo ""

ENV_FILE="apps/api/.env"

# Vérifier que le fichier .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Le fichier $ENV_FILE n'existe pas"
    echo "   Créez-le d'abord en copiant apps/api/.env.example"
    exit 1
fi

echo "📝 Fichier .env trouvé : $ENV_FILE"
echo ""

# Vérifier si PostgreSQL tourne
if lsof -i :5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL est démarré sur le port 5432"
else
    echo "⚠️  PostgreSQL ne semble pas tourner sur le port 5432"
    echo "   Démarrez-le avec : brew services start postgresql@15"
    echo ""
    read -p "Continuer quand même ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# Obtenir le nom d'utilisateur actuel
CURRENT_USER=$(whoami)
echo "👤 Utilisateur détecté : $CURRENT_USER"
echo ""

# Créer la nouvelle DATABASE_URL
NEW_DATABASE_URL="postgresql://${CURRENT_USER}@localhost:5432/whatsorder?schema=public"

echo "🔄 Mise à jour de DATABASE_URL..."
echo "   Ancienne valeur : (Supabase)"
echo "   Nouvelle valeur : $NEW_DATABASE_URL"
echo ""

# Sauvegarder le fichier .env dans un dossier temporaire (ignoré par git)
BACKUP_DIR="tmp"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="${BACKUP_DIR}/.env.backup.$(date +%Y%m%d_%H%M%S)"
cp "$ENV_FILE" "$BACKUP_FILE"
echo "💾 Sauvegarde créée : $BACKUP_FILE"

# Mettre à jour DATABASE_URL
if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    # Remplacer la ligne existante
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_DATABASE_URL}\"|" "$ENV_FILE"
    else
        # Linux
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_DATABASE_URL}\"|" "$ENV_FILE"
    fi
    echo "✅ DATABASE_URL mise à jour"
else
    # Ajouter la ligne si elle n'existe pas
    echo "DATABASE_URL=\"${NEW_DATABASE_URL}\"" >> "$ENV_FILE"
    echo "✅ DATABASE_URL ajoutée"
fi

echo ""
echo "✅ Configuration mise à jour !"
echo ""
echo "Prochaines étapes :"
echo "  1. Créer la base de données (si elle n'existe pas) :"
echo "     createdb whatsorder"
echo ""
echo "  2. Appliquer les migrations Prisma :"
echo "     cd apps/api"
echo "     pnpm prisma migrate dev"
echo "     pnpm prisma generate"
echo ""
echo "  3. (Optionnel) Ajouter des données de test :"
echo "     pnpm prisma db seed"
echo ""
echo "  4. Redémarrer le backend :"
echo "     pnpm --filter api dev"
echo ""
