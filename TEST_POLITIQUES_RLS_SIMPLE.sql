-- Test simplifié des politiques RLS pour vérifier qu'elles fonctionnent
-- À exécuter dans Supabase SQL Editor
-- Version corrigée sans erreurs

-- ==========================================
-- TEST 1 : Vérifier toutes les politiques sur Restaurant
-- ==========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'Restaurant'
ORDER BY policyname;

-- ==========================================
-- TEST 2 : Vérifier si les politiques fonctionnent (lecture)
-- ==========================================

-- Test de lecture (devrait fonctionner pour les restaurants actifs)
SELECT 
  id,
  name,
  "isActive",
  slug
FROM "Restaurant"
WHERE "isActive" = true
LIMIT 5;

-- ==========================================
-- TEST 3 : Vérifier le statut RLS
-- ==========================================

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'Restaurant';

-- ==========================================
-- TEST 4 : Compter les restaurants actifs/inactifs
-- ==========================================

SELECT 
  "isActive",
  COUNT(*) as count
FROM "Restaurant"
GROUP BY "isActive";
