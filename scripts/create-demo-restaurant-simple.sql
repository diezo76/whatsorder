-- ==========================================
-- Script SQL : Créer le Restaurant de Démo (Version Simple)
-- ==========================================
-- Version simplifiée qui évite les erreurs de type
-- À exécuter dans Supabase SQL Editor

-- 1. Créer ou mettre à jour le restaurant "Nile Bites"
INSERT INTO "Restaurant" (
  id,
  name,
  slug,
  phone,
  email,
  address,
  description,
  currency,
  timezone,
  language,
  "whatsappNumber",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  'Nile Bites',
  'nile-bites',
  '+201234567890',
  'contact@nilebites.com',
  'Cairo, Egypt',
  'Restaurant égyptien authentique proposant des plats traditionnels et modernes.',
  'EGP',
  'Africa/Cairo',
  'ar',
  '+201234567890',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Restaurant" WHERE slug = 'nile-bites')

ON CONFLICT (slug) DO UPDATE SET
  "isActive" = true,
  "updatedAt" = NOW();

-- 2. Créer les catégories (si elles n'existent pas)

-- Catégorie 1 : Plats Principaux
INSERT INTO "Category" (
  id,
  name,
  slug,
  "restaurantId",
  description,
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  'Plats Principaux',
  'plats-principaux',
  r.id,
  'Nos meilleurs plats traditionnels',
  true,
  1,
  NOW(),
  NOW()
FROM "Restaurant" r
WHERE r.slug = 'nile-bites'
  AND NOT EXISTS (
    SELECT 1 FROM "Category" c 
    WHERE c.slug = 'plats-principaux' AND c."restaurantId" = r.id
  )
ON CONFLICT ("restaurantId", slug) DO UPDATE SET
  "isActive" = true,
  "updatedAt" = NOW();

-- Catégorie 2 : Entrées
INSERT INTO "Category" (
  id,
  name,
  slug,
  "restaurantId",
  description,
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  'Entrées',
  'entrees',
  r.id,
  'Pour commencer votre repas',
  true,
  2,
  NOW(),
  NOW()
FROM "Restaurant" r
WHERE r.slug = 'nile-bites'
  AND NOT EXISTS (
    SELECT 1 FROM "Category" c 
    WHERE c.slug = 'entrees' AND c."restaurantId" = r.id
  )
ON CONFLICT ("restaurantId", slug) DO UPDATE SET
  "isActive" = true,
  "updatedAt" = NOW();

-- Catégorie 3 : Desserts
INSERT INTO "Category" (
  id,
  name,
  slug,
  "restaurantId",
  description,
  "isActive",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  'Desserts',
  'desserts',
  r.id,
  'Pour terminer en douceur',
  true,
  3,
  NOW(),
  NOW()
FROM "Restaurant" r
WHERE r.slug = 'nile-bites'
  AND NOT EXISTS (
    SELECT 1 FROM "Category" c 
    WHERE c.slug = 'desserts' AND c."restaurantId" = r.id
  )
ON CONFLICT ("restaurantId", slug) DO UPDATE SET
  "isActive" = true,
  "updatedAt" = NOW();

-- 3. Créer les items de menu (si ils n'existent pas)

-- Item 1 : Koshari
INSERT INTO "MenuItem" (
  id,
  name,
  slug,
  description,
  price,
  "categoryId",
  "restaurantId",
  "isAvailable",
  "isActive",
  "isFeatured",
  "sortOrder",
  tags,
  allergens,
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  'Koshari',
  'koshari',
  'Plat traditionnel égyptien avec riz, lentilles, pâtes et sauce tomate',
  45.00,
  c.id,
  r.id,
  true,
  true,
  true,
  1,
  ARRAY['traditionnel', 'végétarien'],
  ARRAY[]::text[],
  NOW(),
  NOW()
FROM "Restaurant" r
JOIN "Category" c ON c."restaurantId" = r.id AND c.slug = 'plats-principaux'
WHERE r.slug = 'nile-bites'
  AND NOT EXISTS (
    SELECT 1 FROM "MenuItem" m 
    WHERE m."categoryId" = c.id AND m.slug = 'koshari'
  )
LIMIT 1
ON CONFLICT ("categoryId", slug) DO UPDATE SET
  "isAvailable" = true,
  "isActive" = true,
  "isFeatured" = true,
  "updatedAt" = NOW();

-- Item 2 : Shawarma
INSERT INTO "MenuItem" (
  id,
  name,
  slug,
  description,
  price,
  "categoryId",
  "restaurantId",
  "isAvailable",
  "isActive",
  "isFeatured",
  "sortOrder",
  tags,
  allergens,
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  'Shawarma',
  'shawarma',
  'Viande marinée et grillée servie avec pain pita',
  55.00,
  c.id,
  r.id,
  true,
  true,
  true,
  2,
  ARRAY['populaire'],
  ARRAY[]::text[],
  NOW(),
  NOW()
FROM "Restaurant" r
JOIN "Category" c ON c."restaurantId" = r.id AND c.slug = 'plats-principaux'
WHERE r.slug = 'nile-bites'
  AND NOT EXISTS (
    SELECT 1 FROM "MenuItem" m 
    WHERE m."categoryId" = c.id AND m.slug = 'shawarma'
  )
LIMIT 1
ON CONFLICT ("categoryId", slug) DO UPDATE SET
  "isAvailable" = true,
  "isActive" = true,
  "isFeatured" = true,
  "updatedAt" = NOW();

-- Item 3 : Hummus
INSERT INTO "MenuItem" (
  id,
  name,
  slug,
  description,
  price,
  "categoryId",
  "restaurantId",
  "isAvailable",
  "isActive",
  "isFeatured",
  "sortOrder",
  tags,
  allergens,
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  'Hummus',
  'hummus',
  'Purée de pois chiches à l''huile d''olive',
  25.00,
  c.id,
  r.id,
  true,
  true,
  false,
  1,
  ARRAY['végétarien', 'vegan'],
  ARRAY[]::text[],
  NOW(),
  NOW()
FROM "Restaurant" r
JOIN "Category" c ON c."restaurantId" = r.id AND c.slug = 'entrees'
WHERE r.slug = 'nile-bites'
  AND NOT EXISTS (
    SELECT 1 FROM "MenuItem" m 
    WHERE m."categoryId" = c.id AND m.slug = 'hummus'
  )
LIMIT 1
ON CONFLICT ("categoryId", slug) DO UPDATE SET
  "isAvailable" = true,
  "isActive" = true,
  "updatedAt" = NOW();

-- 4. Vérifier que tout est créé
SELECT 
  r.name as restaurant,
  r.slug,
  r."isActive" as restaurant_active,
  COUNT(DISTINCT c.id) as categories_count,
  COUNT(DISTINCT m.id) as items_count
FROM "Restaurant" r
LEFT JOIN "Category" c ON c."restaurantId" = r.id AND c."isActive" = true
LEFT JOIN "MenuItem" m ON m."categoryId" = c.id AND m."isActive" = true AND m."isAvailable" = true
WHERE r.slug = 'nile-bites'
GROUP BY r.id, r.name, r.slug, r."isActive";
