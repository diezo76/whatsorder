-- ==========================================
-- Script SQL : Vérifier les Menu Items Disponibles
-- ==========================================
-- Ce script permet de diagnostiquer les problèmes de menu items
-- À exécuter dans Supabase SQL Editor

-- 1. Lister tous les restaurants actifs
SELECT '=== RESTAURANTS ACTIFS ===' as section;
SELECT 
  id,
  name,
  slug,
  "isActive"
FROM "Restaurant"
WHERE "isActive" = true
ORDER BY name;

-- 2. Lister les catégories par restaurant
SELECT '=== CATÉGORIES PAR RESTAURANT ===' as section;
SELECT 
  r.name as restaurant_name,
  r.slug as restaurant_slug,
  c.id as category_id,
  c.name as category_name,
  c."isActive" as category_active
FROM "Restaurant" r
JOIN "Category" c ON c."restaurantId" = r.id
WHERE r."isActive" = true
ORDER BY r.name, c."sortOrder";

-- 3. Lister tous les menu items actifs et disponibles
SELECT '=== MENU ITEMS ACTIFS ET DISPONIBLES ===' as section;
SELECT 
  r.name as restaurant_name,
  r.slug as restaurant_slug,
  c.name as category_name,
  m.id as menu_item_id,
  m.name as menu_item_name,
  m.price,
  m."isActive",
  m."isAvailable"
FROM "Restaurant" r
JOIN "Category" c ON c."restaurantId" = r.id
JOIN "MenuItem" m ON m."categoryId" = c.id
WHERE r."isActive" = true
  AND c."isActive" = true
  AND m."isActive" = true
  AND m."isAvailable" = true
ORDER BY r.name, c."sortOrder", m."sortOrder";

-- 4. Vérifier si l'ID spécifique existe (ID de l'erreur)
SELECT '=== VÉRIFICATION ID SPÉCIFIQUE ===' as section;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM "MenuItem" WHERE id = '278072ab-fcab-4827-9961-f697661c02c1')
    THEN 'L''item 278072ab-fcab-4827-9961-f697661c02c1 EXISTE dans la base'
    ELSE 'L''item 278072ab-fcab-4827-9961-f697661c02c1 N''EXISTE PAS dans la base'
  END as status;

-- 5. Si l'item existe, afficher ses détails
SELECT 
  m.*,
  c.name as category_name,
  r.name as restaurant_name
FROM "MenuItem" m
LEFT JOIN "Category" c ON c.id = m."categoryId"
LEFT JOIN "Restaurant" r ON r.id = m."restaurantId"
WHERE m.id = '278072ab-fcab-4827-9961-f697661c02c1';

-- 6. Statistiques globales
SELECT '=== STATISTIQUES ===' as section;
SELECT 
  (SELECT COUNT(*) FROM "Restaurant" WHERE "isActive" = true) as restaurants_actifs,
  (SELECT COUNT(*) FROM "Category" c JOIN "Restaurant" r ON r.id = c."restaurantId" WHERE r."isActive" = true AND c."isActive" = true) as categories_actives,
  (SELECT COUNT(*) FROM "MenuItem" m JOIN "Category" c ON c.id = m."categoryId" JOIN "Restaurant" r ON r.id = m."restaurantId" WHERE r."isActive" = true AND m."isActive" = true AND m."isAvailable" = true) as menu_items_disponibles;

-- 7. Obtenir le premier menu item disponible pour les tests
SELECT '=== MENU ITEM POUR LES TESTS ===' as section;
SELECT 
  m.id as menu_item_id,
  m.name as menu_item_name,
  m.price,
  r.slug as restaurant_slug
FROM "MenuItem" m
JOIN "Category" c ON c.id = m."categoryId"
JOIN "Restaurant" r ON r.id = m."restaurantId"
WHERE r."isActive" = true
  AND m."isActive" = true
  AND m."isAvailable" = true
ORDER BY r.name, m.name
LIMIT 1;
