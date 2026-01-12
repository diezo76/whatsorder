-- Correction des politiques RLS pour la table Restaurant
-- À exécuter dans Supabase SQL Editor

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON "Restaurant";
DROP POLICY IF EXISTS "Restaurants can be updated by restaurant users" ON "Restaurant";

-- Recréer la politique SELECT avec la bonne syntaxe
CREATE POLICY "Restaurants are viewable by everyone"
ON "Restaurant"
FOR SELECT
USING ("isActive" = true);

-- Recréer la politique UPDATE avec la syntaxe corrigée (guillemets doubles pour toutes les colonnes)
CREATE POLICY "Restaurants can be updated by restaurant users"
ON "Restaurant"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "User"."restaurantId" = "Restaurant"."id"
    AND "User"."id" = (auth.uid())::text
  )
);

-- Vérification : Afficher les politiques créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'Restaurant';
