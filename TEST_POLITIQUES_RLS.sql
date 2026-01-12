-- Test des politiques RLS pour vérifier qu'elles fonctionnent correctement
-- À exécuter dans Supabase SQL Editor

-- ==========================================
-- TEST 1 : Vérifier la syntaxe exacte stockée
-- ==========================================

-- Afficher la définition complète de la politique UPDATE
-- pg_policies.qual contient déjà l'expression USING
SELECT 
  policyname,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'Restaurant'
AND policyname = 'Restaurants can be updated by restaurant users';

-- ==========================================
-- TEST 2 : Vérifier si les politiques fonctionnent
-- ==========================================

-- Test de lecture (devrait fonctionner pour les restaurants actifs)
SELECT 
  id,
  name,
  "isActive"
FROM "Restaurant"
WHERE "isActive" = true
LIMIT 1;

-- ==========================================
-- TEST 3 : Vérifier la définition complète de la politique
-- ==========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'Restaurant';

-- ==========================================
-- TEST 4 : Vérifier la définition depuis pg_policy directement (table système)
-- ==========================================
-- Note: Cette requête nécessite les permissions appropriées
-- Si elle échoue, utilisez seulement les tests 1-3

SELECT 
  polname as policy_name,
  CASE polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    ELSE polcmd::text
  END as command,
  pg_get_expr(polqual, polrelid) as using_expression,
  pg_get_expr(polwithcheck, polrelid) as with_check_expression
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE c.relname = 'Restaurant';
