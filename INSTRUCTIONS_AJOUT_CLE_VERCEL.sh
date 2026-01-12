#!/bin/bash

# Script pour ajouter SUPABASE_SERVICE_ROLE_KEY sur Vercel
# Exécuter ce script après avoir copié la clé service_role depuis Supabase

echo "=================================="
echo "AJOUT DE SUPABASE_SERVICE_ROLE_KEY"
echo "=================================="
echo ""
echo "📋 Assurez-vous d'avoir copié la clé 'service_role' depuis Supabase Dashboard"
echo ""
echo "➡️  Étape 1/3 : Ajouter pour Production"
echo ""

cd "/Users/diezowee/whatsapp order"

# Ajouter pour production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo ""
echo "✅ Production configurée"
echo ""
echo "➡️  Étape 2/3 : Ajouter pour Preview"
echo ""

# Ajouter pour preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview

echo ""
echo "✅ Preview configurée"
echo ""
echo "➡️  Étape 3/3 : Redéploiement"
echo ""
echo "Lancement du redéploiement..."
echo ""

# Redéployer
vercel --prod

echo ""
echo "=================================="
echo "✅ CONFIGURATION TERMINÉE !"
echo "=================================="
echo ""
echo "🧪 Testez maintenant avec :"
echo "curl https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app/api/public/restaurants/nile-bites"
echo ""
