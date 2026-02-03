#!/bin/bash

# Script pour corriger tous les fichiers de tests

echo "🔧 Correction des fichiers de tests..."

# Remplacer ownerId dans tous les fichiers de tests
find src/__tests__ -name "*.test.ts" -type f | while read file; do
  echo "  Correction de $file..."
  
  # Supprimer les lignes avec ownerId
  sed -i '' '/ownerId: testUser\.id,/d' "$file"
  sed -i '' '/ownerId: ownerUser\.id,/d' "$file"
  
  # Ajouter vérification testRestaurant dans afterAll si nécessaire
  if grep -q "testRestaurant\.id" "$file" && ! grep -q "if (testRestaurant)" "$file"; then
    # Trouver la ligne avec testRestaurant.id dans afterAll
    sed -i '' 's/where: { restaurantId: testRestaurant\.id }/where: { restaurantId: testRestaurant?.id }/g' "$file"
    sed -i '' 's/where: { id: testRestaurant\.id }/where: { id: testRestaurant?.id }/g' "$file"
  fi
done

echo "✅ Corrections appliquées !"
echo ""
echo "⚠️  Vérifiez manuellement les fichiers modifiés avant d'exécuter les tests."
