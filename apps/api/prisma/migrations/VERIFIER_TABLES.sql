-- Script de vérification des tables et politiques RLS
-- À exécuter dans Supabase SQL Editor pour diagnostiquer les problèmes

-- ==========================================
-- 1. VÉRIFIER L'EXISTENCE DE TOUTES LES TABLES
-- ==========================================

SELECT 
  table_name,
  table_type,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ==========================================
-- 2. VÉRIFIER LA TABLE RESTAURANT SPÉCIFIQUEMENT
-- ==========================================

SELECT 
  table_name,
  table_schema,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'Restaurant'
    ) THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%estaurant%';

-- ==========================================
-- 3. VÉRIFIER LES COLONNES DE LA TABLE RESTAURANT
-- ==========================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'Restaurant'
ORDER BY ordinal_position;

-- ==========================================
-- 4. VÉRIFIER LES POLITIQUES RLS SUR RESTAURANT
-- ==========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'Restaurant';

-- ==========================================
-- 5. VÉRIFIER LE STATUT RLS DE TOUTES LES TABLES
-- ==========================================

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ==========================================
-- 6. COMPTER LES LIGNES DANS CHAQUE TABLE
-- ==========================================

SELECT 
  'Restaurant' as table_name,
  COUNT(*) as row_count
FROM "Restaurant"
UNION ALL
SELECT 'User', COUNT(*) FROM "User"
UNION ALL
SELECT 'Category', COUNT(*) FROM "Category"
UNION ALL
SELECT 'MenuItem', COUNT(*) FROM "MenuItem"
UNION ALL
SELECT 'Customer', COUNT(*) FROM "Customer"
UNION ALL
SELECT 'Order', COUNT(*) FROM "Order"
UNION ALL
SELECT 'OrderItem', COUNT(*) FROM "OrderItem"
UNION ALL
SELECT 'Conversation', COUNT(*) FROM "Conversation"
UNION ALL
SELECT 'Message', COUNT(*) FROM "Message"
UNION ALL
SELECT 'InternalNote', COUNT(*) FROM "InternalNote"
UNION ALL
SELECT 'Workflow', COUNT(*) FROM "Workflow"
UNION ALL
SELECT 'WorkflowExecution', COUNT(*) FROM "WorkflowExecution"
UNION ALL
SELECT 'Campaign', COUNT(*) FROM "Campaign"
UNION ALL
SELECT 'DailyAnalytics', COUNT(*) FROM "DailyAnalytics"
ORDER BY table_name;

-- ==========================================
-- 7. VÉRIFIER LES CONTRAINTES ET INDEX
-- ==========================================

SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name = 'Restaurant'
ORDER BY tc.table_name, tc.constraint_type;

-- ==========================================
-- 8. VÉRIFIER LES TYPES ENUM
-- ==========================================

SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('UserRole', 'DeliveryType', 'OrderStatus', 'PaymentMethod', 'PaymentStatus', 'OrderSource')
ORDER BY t.typname, e.enumsortorder;
