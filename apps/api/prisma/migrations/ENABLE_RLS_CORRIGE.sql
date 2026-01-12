-- Activation de Row Level Security (RLS) pour toutes les tables - VERSION CORRIGÉE
-- À exécuter dans Supabase SQL Editor
-- Ce script active RLS et crée des politiques de base pour sécuriser l'accès

-- ==========================================
-- SUPPRESSION DES POLITIQUES EXISTANTES (si elles existent)
-- ==========================================

DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON "Restaurant";
DROP POLICY IF EXISTS "Restaurants can be updated by restaurant users" ON "Restaurant";
DROP POLICY IF EXISTS "Users can view users from their restaurant" ON "User";
DROP POLICY IF EXISTS "Users can update their own profile" ON "User";
DROP POLICY IF EXISTS "Active categories are viewable by everyone" ON "Category";
DROP POLICY IF EXISTS "Categories can be managed by restaurant users" ON "Category";
DROP POLICY IF EXISTS "Active menu items are viewable by everyone" ON "MenuItem";
DROP POLICY IF EXISTS "Menu items can be managed by restaurant users" ON "MenuItem";
DROP POLICY IF EXISTS "Users can view customers from their restaurant" ON "Customer";
DROP POLICY IF EXISTS "Customers can be created for orders" ON "Customer";
DROP POLICY IF EXISTS "Users can view orders from their restaurant" ON "Order";
DROP POLICY IF EXISTS "Orders can be created publicly" ON "Order";
DROP POLICY IF EXISTS "Orders can be updated by restaurant users" ON "Order";
DROP POLICY IF EXISTS "Order items are viewable via their order" ON "OrderItem";
DROP POLICY IF EXISTS "Order items can be created publicly" ON "OrderItem";
DROP POLICY IF EXISTS "Users can view conversations from their restaurant" ON "Conversation";
DROP POLICY IF EXISTS "Conversations can be created publicly" ON "Conversation";
DROP POLICY IF EXISTS "Messages are viewable via their conversation" ON "Message";
DROP POLICY IF EXISTS "Messages can be created publicly" ON "Message";
DROP POLICY IF EXISTS "Internal notes are viewable by restaurant users" ON "InternalNote";
DROP POLICY IF EXISTS "Internal notes can be created by authenticated users" ON "InternalNote";
DROP POLICY IF EXISTS "Users can view workflows from their restaurant" ON "Workflow";
DROP POLICY IF EXISTS "Workflows can be managed by restaurant users" ON "Workflow";
DROP POLICY IF EXISTS "Workflow executions are viewable via their workflow" ON "WorkflowExecution";
DROP POLICY IF EXISTS "Users can view campaigns from their restaurant" ON "Campaign";
DROP POLICY IF EXISTS "Campaigns can be managed by restaurant users" ON "Campaign";
DROP POLICY IF EXISTS "Users can view analytics from their restaurant" ON "DailyAnalytics";

-- ==========================================
-- ACTIVATION RLS POUR TOUTES LES TABLES
-- ==========================================

ALTER TABLE "Restaurant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InternalNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workflow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowExecution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Campaign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyAnalytics" ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLITIQUES RLS - RESTAURANT
-- ==========================================

-- Politique : Lecture publique des restaurants actifs
CREATE POLICY "Restaurants are viewable by everyone"
ON "Restaurant"
FOR SELECT
USING ("isActive" = true);

-- Politique : Modification uniquement par les utilisateurs authentifiés du restaurant
CREATE POLICY "Restaurants can be updated by restaurant users"
ON "Restaurant"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "User"."restaurantId" = "Restaurant"."id"
    AND "User"."id" = auth.uid()::text
  )
);

-- ==========================================
-- POLITIQUES RLS - USER
-- ==========================================

-- Politique : Les utilisateurs peuvent voir les utilisateurs de leur restaurant
CREATE POLICY "Users can view users from their restaurant"
ON "User"
FOR SELECT
USING (
  "restaurantId" IN (
    SELECT "restaurantId" FROM "User"
    WHERE "id" = auth.uid()::text
  )
);

-- Politique : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile"
ON "User"
FOR UPDATE
USING ("id" = auth.uid()::text);

-- ==========================================
-- POLITIQUES RLS - CATEGORY
-- ==========================================

-- Politique : Lecture publique des catégories actives
CREATE POLICY "Active categories are viewable by everyone"
ON "Category"
FOR SELECT
USING ("isActive" = true);

-- Politique : Modification uniquement par les utilisateurs du restaurant
CREATE POLICY "Categories can be managed by restaurant users"
ON "Category"
FOR ALL
USING (
  "restaurantId" IN (
    SELECT "restaurantId" FROM "User"
    WHERE "id" = auth.uid()::text
  )
);

-- ==========================================
-- POLITIQUES RLS - MENUITEM
-- ==========================================

-- Politique : Lecture publique des items actifs et disponibles
CREATE POLICY "Active menu items are viewable by everyone"
ON "MenuItem"
FOR SELECT
USING ("isActive" = true AND "isAvailable" = true);

-- Politique : Modification uniquement par les utilisateurs du restaurant
CREATE POLICY "Menu items can be managed by restaurant users"
ON "MenuItem"
FOR ALL
USING (
  "restaurantId" IN (
    SELECT "restaurantId" FROM "User"
    WHERE "id" = auth.uid()::text
  )
);

-- ==========================================
-- POLITIQUES RLS - CUSTOMER
-- ==========================================

-- Politique : Les utilisateurs peuvent voir les clients de leur restaurant
CREATE POLICY "Users can view customers from their restaurant"
ON "Customer"
FOR SELECT
USING (
  "restaurantId" IN (
    SELECT "restaurantId" FROM "User"
    WHERE "id" = auth.uid()::text
  )
);

-- Politique : Création de clients (pour les commandes publiques)
CREATE POLICY "Customers can be created for orders"
ON "Customer"
FOR INSERT
WITH CHECK (true);

-- ==========================================
-- POLITIQUES RLS - ORDER
-- ==========================================

-- Politique : Les utilisateurs peuvent voir les commandes de leur restaurant
CREATE POLICY "Users can view orders from their restaurant"
ON "Order"
FOR SELECT
USING (
  "restaurantId" IN (
    SELECT "restaurantId" FROM "User"
    WHERE "id" = auth.uid()::text
  )
);

-- Politique : Création de commandes (publique pour les commandes depuis le site)
CREATE POLICY "Orders can be created publicly"
ON "Order"
FOR INSERT
WITH CHECK (true);

-- Politique : Mise à jour uniquement par les utilisateurs du restaurant
CREATE POLICY "Orders can be updated by restaurant users"
ON "Order"
FOR UPDATE
USING (
  "restaurantId" IN (
    SELECT "restaurantId" FROM "User"
    WHERE "id" = auth.uid()::text
  )
);

-- ==========================================
-- POLITIQUES RLS - ORDERITEM
-- ==========================================

-- Politique : Lecture via la commande parente
CREATE POLICY "Order items are viewable via their order"
ON "OrderItem"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order"."id" = "OrderItem"."orderId"
    AND (
      "Order"."restaurantId" IN (
        SELECT "restaurantId" FROM "User"
        WHERE "id" = auth.uid()::text
      )
      OR auth.uid() IS NULL
    )
  )
);

-- Politique : Création publique (pour les nouvelles commandes)
CREATE POLICY "Order items can be created publicly"
ON "OrderItem"
FOR INSERT
WITH CHECK (true);

-- ==========================================
-- POLITIQUES RLS - CONVERSATION
-- ==========================================

-- Politique : Les utilisateurs peuvent voir les conversations de leur restaurant
CREATE POLICY "Users can view conversations from their restaurant"
ON "Conversation"
FOR SELECT
USING (
  "restaurantId" IN (
    SELECT "restaurantId" FROM "User"
    WHERE "id" = auth.uid()::text
  )
);

-- Politique : Création de conversations (publique pour les nouveaux clients)
CREATE POLICY "Conversations can be created publicly"
ON "Conversation"
FOR INSERT
WITH CHECK (true);

-- ==========================================
-- POLITIQUES RLS - MESSAGE
-- ==========================================

-- Politique : Lecture via la conversation parente
CREATE POLICY "Messages are viewable via their conversation"
ON "Message"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Conversation"
    WHERE "Conversation"."id" = "Message"."conversationId"
    AND (
      "Conversation"."restaurantId" IN (
        SELECT "restaurantId" FROM "User"
        WHERE "id" = auth.uid()::text
      )
      OR auth.uid() IS NULL
    )
  )
);

-- Politique : Création de messages (publique pour les webhooks WhatsApp)
CREATE POLICY "Messages can be created publicly"
ON "Message"
FOR INSERT
WITH CHECK (true);

-- ==========================================
-- POLITIQUES RLS - INTERNALNOTE
-- ==========================================

-- Politique : Lecture uniquement par les utilisateurs du restaurant
CREATE POLICY "Internal notes are viewable by restaurant users"
ON "InternalNote"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "User"."id" = "InternalNote"."userId"
    AND "User"."restaurantId" IN (
      SELECT "restaurantId" FROM "User"
      WHERE "id" = auth.uid()::text
    )
  )
);

-- Politique : Création uniquement par les utilisateurs authentifiés
CREATE POLICY "Internal notes can be created by authenticated users"
ON "InternalNote"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE "id" = auth.uid()::text
  )
);

-- ==========================================
-- POLITIQUES RLS - WORKFLOW
-- ==========================================

-- Politique : Les utilisateurs peuvent voir les workflows de leur restaurant
CREATE POLICY "Users can view workflows from their restaurant"
ON "Workflow"
FOR SELECT
USING (
  "restaurantId" IN (
    SELECT "restaurantId" FROM "User"
    WHERE "id" = auth.uid()::text
  )
);

-- Politique : Gestion uniquement par les utilisateurs du restaurant
CREATE POLICY "Workflows can be managed by restaurant users"
ON "Workflow"
FOR ALL
USING (
  "restaurantId" IN (
    SELECT "restaurantId" FROM "User"
    WHERE "id" = auth.uid()::text
  )
);

-- ==========================================
-- POLITIQUES RLS - WORKFLOWEXECUTION
-- ==========================================

-- Politique : Lecture via le workflow parent
CREATE POLICY "Workflow executions are viewable via their workflow"
ON "WorkflowExecution"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Workflow"
    WHERE "Workflow"."id" = "WorkflowExecution"."workflowId"
    AND "Workflow"."restaurantId" IN (
      SELECT "restaurantId" FROM "User"
      WHERE "id" = auth.uid()::text
    )
  )
);

-- ==========================================
-- POLITIQUES RLS - CAMPAIGN
-- ==========================================

-- Politique : Les utilisateurs peuvent voir les campagnes de leur restaurant
CREATE POLICY "Users can view campaigns from their restaurant"
ON "Campaign"
FOR SELECT
USING (
  "restaurantId" IN (
    SELECT "restaurantId" FROM "User"
    WHERE "id" = auth.uid()::text
  )
);

-- Politique : Gestion uniquement par les utilisateurs du restaurant
CREATE POLICY "Campaigns can be managed by restaurant users"
ON "Campaign"
FOR ALL
USING (
  "restaurantId" IN (
    SELECT "restaurantId" FROM "User"
    WHERE "id" = auth.uid()::text
  )
);

-- ==========================================
-- POLITIQUES RLS - DAILYANALYTICS
-- ==========================================

-- Politique : Les utilisateurs peuvent voir les analytics de leur restaurant
CREATE POLICY "Users can view analytics from their restaurant"
ON "DailyAnalytics"
FOR SELECT
USING (
  "restaurantId" IN (
    SELECT "restaurantId" FROM "User"
    WHERE "id" = auth.uid()::text
  )
);
