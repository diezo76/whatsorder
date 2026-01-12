-- Correction FINALE des politiques RLS pour la table Restaurant
-- À exécuter dans Supabase SQL Editor
-- Ce script corrige l'incohérence de syntaxe dans la politique UPDATE

-- ==========================================
-- ÉTAPE 1 : Supprimer les politiques existantes
-- ==========================================

DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON "Restaurant";
DROP POLICY IF EXISTS "Restaurants can be updated by restaurant users" ON "Restaurant";

-- ==========================================
-- ÉTAPE 2 : Recréer la politique SELECT (déjà correcte)
-- ==========================================

CREATE POLICY "Restaurants are viewable by everyone"
ON "Restaurant"
FOR SELECT
TO public
USING ("isActive" = true);

-- ==========================================
-- ÉTAPE 3 : Recréer la politique UPDATE avec syntaxe CORRIGÉE
-- ==========================================
-- CORRECTION : Utiliser "Restaurant"."id" et "User"."id" avec guillemets doubles
-- au lieu de "Restaurant".id et "User".id

CREATE POLICY "Restaurants can be updated by restaurant users"
ON "Restaurant"
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM "User"
    WHERE "User"."restaurantId" = "Restaurant"."id"
    AND "User"."id" = (auth.uid())::text
  )
);

-- ==========================================
-- ÉTAPE 4 : Vérification des politiques créées
-- ==========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'Restaurant'
ORDER BY policyname;

-- ==========================================
-- VÉRIFICATION MANUELLE
-- ==========================================
-- Après exécution, vérifiez que dans la colonne "qual" de la politique UPDATE,
-- vous voyez bien :
-- "Restaurant"."id" (avec guillemets doubles autour de "id")
-- "User"."id" (avec guillemets doubles autour de "id")
-- 
-- Et NON :
-- "Restaurant".id (sans guillemets autour de id)
-- "User".id (sans guillemets autour de id)
