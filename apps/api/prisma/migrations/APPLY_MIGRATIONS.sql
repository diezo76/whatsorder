-- Migration complète pour créer toutes les tables
-- À exécuter dans Supabase SQL Editor
-- Copiez-collez ce fichier entier dans Supabase Dashboard > SQL Editor > New Query

-- Supprimer les types existants s'ils existent (pour éviter les erreurs)
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "DeliveryType" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "OrderSource" CASCADE;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF', 'DELIVERY');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('DELIVERY', 'PICKUP', 'DINE_IN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'ONLINE', 'WALLET');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('WHATSAPP', 'WEBSITE', 'PHONE', 'WALK_IN');

-- CreateTable
CREATE TABLE IF NOT EXISTS "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo',
    "language" TEXT NOT NULL DEFAULT 'ar',
    "openingHours" JSONB,
    "deliveryZones" JSONB,
    "whatsappNumber" TEXT,
    "whatsappApiToken" TEXT,
    "whatsappBusinessId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "restaurantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MenuItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "descriptionAr" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "compareAtPrice" DOUBLE PRECISION,
    "image" TEXT,
    "images" TEXT[],
    "variants" JSONB,
    "modifiers" JSONB,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "calories" INTEGER,
    "preparationTime" INTEGER,
    "tags" TEXT[],
    "allergens" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "address" TEXT,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastOrderAt" TIMESTAMP(3),
    "language" TEXT NOT NULL DEFAULT 'ar',
    "notes" TEXT,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "deliveryType" "DeliveryType" NOT NULL,
    "deliveryAddress" TEXT,
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryNotes" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "source" "OrderSource" NOT NULL DEFAULT 'WHATSAPP',
    "customerNotes" TEXT,
    "kitchenNotes" TEXT,
    "assignedToId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "estimatedDeliveryAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "restaurantId" TEXT NOT NULL,
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "customization" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "whatsappPhone" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "whatsappId" TEXT,
    "mediaUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "aiParsed" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "InternalNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" TEXT NOT NULL,
    "conditions" JSONB,
    "actions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WorkflowExecution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "context" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "messag" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "segmentation" JSONB,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "targetCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DailyAnalytics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "cancelledOrders" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newCustomers" INTEGER NOT NULL DEFAULT 0,
    "returningCustomers" INTEGER NOT NULL DEFAULT 0,
    "messagesReceived" INTEGER NOT NULL DEFAULT 0,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Restaurant_slug_key" ON "Restaurant"("slug");
CREATE INDEX IF NOT EXISTS "Restaurant_slug_idx" ON "Restaurant"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_restaurantId_idx" ON "User"("restaurantId");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "Category_restaurantId_isActive_idx" ON "Category"("restaurantId", "isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_restaurantId_slug_key" ON "Category"("restaurantId", "slug");
CREATE INDEX IF NOT EXISTS "MenuItem_categoryId_isActive_isAvailable_idx" ON "MenuItem"("categoryId", "isActive", "isAvailable");
CREATE INDEX IF NOT EXISTS "MenuItem_isFeatured_idx" ON "MenuItem"("isFeatured");
CREATE UNIQUE INDEX IF NOT EXISTS "MenuItem_categoryId_slug_key" ON "MenuItem"("categoryId", "slug");
CREATE INDEX IF NOT EXISTS "Customer_restaurantId_phone_idx" ON "Customer"("restaurantId", "phone");
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_restaurantId_phone_key" ON "Customer"("restaurantId", "phone");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX IF NOT EXISTS "Order_restaurantId_status_idx" ON "Order"("restaurantId", "status");
CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "Order_orderNumber_idx" ON "Order"("orderNumber");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "Conversation_restaurantId_isActive_idx" ON "Conversation"("restaurantId", "isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_restaurantId_whatsappPhone_key" ON "Conversation"("restaurantId", "whatsappPhone");
CREATE UNIQUE INDEX IF NOT EXISTS "Message_whatsappId_key" ON "Message"("whatsappId");
CREATE INDEX IF NOT EXISTS "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
CREATE INDEX IF NOT EXISTS "Message_whatsappId_idx" ON "Message"("whatsappId");
CREATE INDEX IF NOT EXISTS "InternalNote_orderId_idx" ON "InternalNote"("orderId");
CREATE INDEX IF NOT EXISTS "InternalNote_conversationId_idx" ON "InternalNote"("conversationId");
CREATE INDEX IF NOT EXISTS "Workflow_restaurantId_isActive_idx" ON "Workflow"("restaurantId", "isActive");
CREATE INDEX IF NOT EXISTS "WorkflowExecution_workflowId_executedAt_idx" ON "WorkflowExecution"("workflowId", "executedAt");
CREATE INDEX IF NOT EXISTS "Campaign_restaurantId_status_idx" ON "Campaign"("restaurantId", "status");
CREATE INDEX IF NOT EXISTS "DailyAnalytics_restaurantId_date_idx" ON "DailyAnalytics"("restaurantId", "date");
CREATE UNIQUE INDEX IF NOT EXISTS "DailyAnalytics_restaurantId_date_key" ON "DailyAnalytics"("restaurantId", "date");

-- AddForeignKey
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_restaurantId_fkey";
ALTER TABLE "User" ADD CONSTRAINT "User_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_restaurantId_fkey";
ALTER TABLE "Category" ADD CONSTRAINT "Category_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MenuItem" DROP CONSTRAINT IF EXISTS "MenuItem_categoryId_fkey";
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Customer" DROP CONSTRAINT IF EXISTS "Customer_restaurantId_fkey";
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_customerId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_assignedToId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_restaurantId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_orderId_fkey";
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_menuItemId_fkey";
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_customerId_fkey";
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_restaurantId_fkey";
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_conversationId_fkey";
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InternalNote" DROP CONSTRAINT IF EXISTS "InternalNote_userId_fkey";
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InternalNote" DROP CONSTRAINT IF EXISTS "InternalNote_orderId_fkey";
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InternalNote" DROP CONSTRAINT IF EXISTS "InternalNote_conversationId_fkey";
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Workflow" DROP CONSTRAINT IF EXISTS "Workflow_restaurantId_fkey";
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkflowExecution" DROP CONSTRAINT IF EXISTS "WorkflowExecution_workflowId_fkey";
ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Campaign" DROP CONSTRAINT IF EXISTS "Campaign_restaurantId_fkey";
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DailyAnalytics" DROP CONSTRAINT IF EXISTS "DailyAnalytics_restaurantId_fkey";
ALTER TABLE "DailyAnalytics" ADD CONSTRAINT "DailyAnalytics_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
