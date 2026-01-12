#!/bin/bash

# ==========================================
# Script de Finalisation du Déploiement
# Vercel + Supabase (Configuration Existante)
# ==========================================

set -e

echo "🚀 Finalisation du Déploiement Vercel + Supabase"
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

echo "📋 Situation Actuelle"
echo "======================================"
echo "✅ Supabase déjà configuré"
echo "✅ Base de données migrée"
echo "✅ Code commité sur main"
echo ""
echo "⚠️  À faire : Finaliser Vercel"
echo ""

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI n'est pas installé${NC}"
    echo ""
    echo "Installation de Vercel CLI..."
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installé${NC}"
fi

# Étape 1 : Connexion Vercel
echo ""
echo "=========================================="
echo "📋 Étape 1/5 : Connexion Vercel"
echo "=========================================="
echo ""

if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vous n'êtes pas connecté à Vercel${NC}"
    echo ""
    echo "Connexion à Vercel..."
    vercel login
else
    echo -e "${GREEN}✅ Déjà connecté à Vercel${NC}"
    vercel whoami
fi

# Étape 2 : Lier le projet
echo ""
echo "=========================================="
echo "📋 Étape 2/5 : Liaison du Projet"
echo "=========================================="
echo ""

if [ ! -d ".vercel" ]; then
    echo "Liaison du projet Vercel..."
    echo ""
    echo "Répondez aux questions suivantes :"
    echo "  - Set up and deploy? Y"
    echo "  - Which scope? Sélectionnez votre compte"
    echo "  - Link to existing project? Y (si existe) ou N (nouveau)"
    echo "  - What's your project's name? whatsapp-order"
    echo "  - In which directory? ./"
    echo ""
    vercel link
else
    echo -e "${GREEN}✅ Projet déjà lié${NC}"
fi

# Étape 3 : Lire les variables depuis .env.local.supabase
echo ""
echo "=========================================="
echo "📋 Étape 3/5 : Configuration des Variables"
echo "=========================================="
echo ""

ENV_FILE="apps/web/.env.local.supabase"

if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✅ Fichier $ENV_FILE trouvé${NC}"
    echo ""
    
    # Extraire les variables (en ignorant les commentaires et lignes vides)
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL=" "$ENV_FILE" | cut -d '=' -f 2- | tr -d '"' | tr -d ' ')
    SUPABASE_ANON_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$ENV_FILE" | cut -d '=' -f 2- | tr -d '"' | tr -d ' ')
    SUPABASE_SERVICE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY=" "$ENV_FILE" | cut -d '=' -f 2- | tr -d '"' | tr -d ' ')
    DATABASE_URL=$(grep "DATABASE_URL=" "$ENV_FILE" | cut -d '=' -f 2- | tr -d '"' | tr -d ' ')
    
    # Lire JWT_SECRET depuis apps/api/.env ou apps/web/.env.local
    JWT_SECRET=""
    if [ -f "apps/api/.env" ]; then
        JWT_SECRET=$(grep "JWT_SECRET=" "apps/api/.env" | cut -d '=' -f 2- | tr -d '"' | tr -d ' ')
    fi
    if [ -z "$JWT_SECRET" ] && [ -f "apps/web/.env.local" ]; then
        JWT_SECRET=$(grep "JWT_SECRET=" "apps/web/.env.local" | cut -d '=' -f 2- | tr -d '"' | tr -d ' ')
    fi
    
    # Vérifier que les variables sont présentes
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
        echo -e "${RED}❌ Variables Supabase manquantes dans $ENV_FILE${NC}"
        echo ""
        echo "Veuillez vérifier que le fichier contient :"
        echo "  - NEXT_PUBLIC_SUPABASE_URL"
        echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "  - SUPABASE_SERVICE_ROLE_KEY"
        echo "  - DATABASE_URL"
        exit 1
    fi
    
    echo "Variables détectées :"
    echo "  ✅ NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}"
    echo "  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..."
    if [ -n "$SUPABASE_SERVICE_KEY" ]; then
        echo "  ✅ SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_KEY:0:20}..."
    fi
    if [ -n "$DATABASE_URL" ]; then
        echo "  ✅ DATABASE_URL: Configuré"
    fi
    if [ -n "$JWT_SECRET" ]; then
        echo "  ✅ JWT_SECRET: Configuré"
    fi
    echo ""
    
    echo "Souhaitez-vous ajouter ces variables sur Vercel ? (y/n)"
    read -r add_vars
    
    if [ "$add_vars" = "y" ] || [ "$add_vars" = "Y" ]; then
        echo ""
        echo "Ajout des variables sur Vercel (production)..."
        
        # Variables publiques (nécessaires au build)
        echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production --force
        echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --force
        
        # Variables privées (pour API Routes)
        if [ -n "$SUPABASE_SERVICE_KEY" ]; then
            echo "$SUPABASE_SERVICE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production --force
        fi
        
        if [ -n "$DATABASE_URL" ]; then
            echo "$DATABASE_URL" | vercel env add DATABASE_URL production --force
        fi
        
        if [ -n "$JWT_SECRET" ]; then
            echo "$JWT_SECRET" | vercel env add JWT_SECRET production --force
        fi
        
        # NODE_ENV
        echo "production" | vercel env add NODE_ENV production --force
        
        echo -e "${GREEN}✅ Variables ajoutées sur Vercel${NC}"
    else
        echo "Variables non ajoutées. Vous devrez les ajouter manuellement."
    fi
else
    echo -e "${YELLOW}⚠️  Fichier $ENV_FILE non trouvé${NC}"
    echo ""
    echo "Veuillez ajouter les variables manuellement :"
    echo "  1. Allez sur https://vercel.com/dashboard"
    echo "  2. Sélectionnez votre projet"
    echo "  3. Settings → Environment Variables"
    echo "  4. Ajoutez les variables depuis Supabase Dashboard"
    echo ""
    read -p "Appuyez sur Entrée quand c'est fait..."
fi

# Étape 4 : Déploiement
echo ""
echo "=========================================="
echo "📋 Étape 4/5 : Déploiement"
echo "=========================================="
echo ""

echo "Souhaitez-vous déployer maintenant ? (y/n)"
read -r deploy_now

if [ "$deploy_now" = "y" ] || [ "$deploy_now" = "Y" ]; then
    echo ""
    echo "Déploiement en cours..."
    vercel --prod
    
    echo ""
    echo -e "${GREEN}✅ Déploiement terminé !${NC}"
else
    echo "Déploiement annulé."
    echo "Vous pouvez déployer plus tard avec : vercel --prod"
fi

# Étape 5 : Activer Realtime
echo ""
echo "=========================================="
echo "📋 Étape 5/5 : Activer Realtime Supabase"
echo "=========================================="
echo ""

echo "Pour activer le temps réel, vous devez configurer Supabase :"
echo ""
echo "Option 1 (Recommandé) : Via Dashboard"
echo "  1. Allez sur https://supabase.com"
echo "  2. Sélectionnez votre projet"
echo "  3. Database → Replication"
echo "  4. Activez pour : Message, Order, Conversation"
echo ""
echo "Option 2 : Via SQL Editor"
echo "  Copiez et exécutez ce SQL :"
echo ""
echo "  -- Activer la réplication"
echo "  ALTER TABLE \"Message\" REPLICA IDENTITY FULL;"
echo "  ALTER TABLE \"Order\" REPLICA IDENTITY FULL;"
echo "  ALTER TABLE \"Conversation\" REPLICA IDENTITY FULL;"
echo ""
echo "  -- Publier les tables"
echo "  ALTER PUBLICATION supabase_realtime ADD TABLE \"Message\";"
echo "  ALTER PUBLICATION supabase_realtime ADD TABLE \"Order\";"
echo "  ALTER PUBLICATION supabase_realtime ADD TABLE \"Conversation\";"
echo ""
read -p "Appuyez sur Entrée quand c'est fait..."

# Résumé final
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Finalisation Terminée !${NC}"
echo "=========================================="
echo ""
echo "✅ Vercel configuré"
echo "✅ Variables d'environnement ajoutées"
echo "✅ Application déployée (ou prête)"
echo "✅ Realtime configuré (ou instructions données)"
echo ""
echo "🌐 Votre site est accessible via :"
echo "   https://vercel.com/dashboard"
echo ""
echo "📝 Prochaines étapes :"
echo "  1. Ouvrir l'URL Vercel"
echo "  2. Tester le login"
echo "  3. Tester le dashboard"
echo "  4. Tester Inbox/Orders"
echo "  5. (Optionnel) Tester Realtime"
echo ""
echo "🆘 En cas de problème :"
echo "  - Vérifier les logs : vercel logs"
echo "  - Vérifier les variables : vercel env ls"
echo "  - Consulter : CONTINUER_DEPLOIEMENT.md"
echo ""
echo -e "${GREEN}✅ Migration Vercel + Supabase terminée ! 🚀${NC}"
