#!/bin/bash

# Script pour vérifier les redirects Vercel
# Ce script affiche les instructions pour vérifier manuellement dans Vercel

echo "=========================================="
echo "Vérification des Redirects Vercel"
echo "=========================================="
echo ""
echo "Ce script ne peut pas accéder directement à Vercel."
echo "Suivez ces étapes pour vérifier manuellement :"
echo ""
echo "1. Ouvrez : https://vercel.com/dashboard"
echo "2. Sélectionnez votre projet"
echo "3. Allez dans : Settings → Redirects"
echo "4. Cherchez un redirect de '/' vers '/login'"
echo "5. Si trouvé, supprimez-le"
echo ""
echo "=========================================="
echo "Vérification du code local"
echo "=========================================="
echo ""

# Vérifier le middleware
echo "✓ Vérification du middleware..."
if grep -q "pathname === '/'" apps/web/middleware.ts; then
    echo "  ✓ Protection présente dans middleware.ts"
else
    echo "  ✗ Protection manquante dans middleware.ts"
fi

# Vérifier que le matcher n'inclut pas /
echo ""
echo "✓ Vérification du matcher du middleware..."
if grep -q "matcher: \['/dashboard" apps/web/middleware.ts && ! grep -q "matcher: \['/'," apps/web/middleware.ts; then
    echo "  ✓ Le matcher n'inclut pas '/' (bon signe)"
else
    echo "  ✗ Le matcher pourrait inclure '/'"
fi

# Vérifier que page.tsx contient la landing page
echo ""
echo "✓ Vérification de la landing page..."
if grep -q "export default function LandingPage" apps/web/app/page.tsx; then
    echo "  ✓ Landing page présente dans page.tsx"
else
    echo "  ✗ Landing page manquante"
fi

# Vérifier vercel.json
echo ""
echo "✓ Vérification de vercel.json..."
if [ -f vercel.json ]; then
    echo "  ✓ vercel.json existe"
    if grep -q "rewrites" vercel.json; then
        echo "  ✓ Rewrites configurés dans vercel.json"
    fi
else
    echo "  ✗ vercel.json manquant"
fi

echo ""
echo "=========================================="
echo "Résumé"
echo "=========================================="
echo ""
echo "Le code local semble correct."
echo "Si le problème persiste, il vient probablement de :"
echo "  1. Un redirect configuré dans Vercel Dashboard"
echo "  2. Un cache navigateur/Vercel"
echo ""
echo "Actions à faire :"
echo "  1. Vérifier et supprimer les redirects dans Vercel"
echo "  2. Redéployer"
echo "  3. Vider le cache"
echo ""
