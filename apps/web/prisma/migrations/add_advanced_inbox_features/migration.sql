-- Migration: Add Advanced Inbox Features
-- Date: 2026-01-11
-- Description: Adds conversation statuses, priorities, assignment, templates, broadcasts

-- Step 1: Create new enums (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ConversationStatus') THEN
        CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'CLOSED', 'RESOLVED', 'SPAM');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ConversationPriority') THEN
        CREATE TYPE "ConversationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MessageType') THEN
        CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'LOCATION', 'ORDER_LINK', 'TEMPLATE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BroadcastStatus') THEN
        CREATE TYPE "BroadcastStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MessageSender') THEN
        CREATE TYPE "MessageSender" AS ENUM ('CUSTOMER', 'STAFF', 'SYSTEM');
    END IF;
END $$;

-- Step 2: Alter Conversation table
-- Add new columns
ALTER TABLE "conversations" 
  ADD COLUMN IF NOT EXISTS "customerPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
  ADD COLUMN IF NOT EXISTS "priority" "ConversationPriority" NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN IF NOT EXISTS "assignedToId" TEXT,
  ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "isUnread" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "closedById" TEXT,
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "internalNotes" TEXT;

-- Populate customerPhone from existing data if possible
UPDATE "conversations" 
SET "customerPhone" = (
  SELECT "phone" FROM "customers" WHERE "customers"."id" = "conversations"."customerId"
)
WHERE "customerPhone" IS NULL AND "customerId" IS NOT NULL;

-- Set default for conversations without customerPhone (use empty string or existing whatsappPhone)
UPDATE "conversations"
SET "customerPhone" = COALESCE("whatsappPhone", '')
WHERE "customerPhone" IS NULL;

-- Make customerPhone required after populating (only if all rows have a value)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "conversations" WHERE "customerPhone" IS NULL) THEN
        ALTER TABLE "conversations" ALTER COLUMN "customerPhone" SET NOT NULL;
    END IF;
END $$;

-- Step 3: Alter Message table
-- Add new columns
ALTER TABLE "messages" 
  ADD COLUMN IF NOT EXISTS "type" "MessageType" NOT NULL DEFAULT 'TEXT',
  ADD COLUMN IF NOT EXISTS "sender" "MessageSender",
  ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "isSystemMessage" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- Populate sender from existing direction field
UPDATE "messages" 
SET "sender" = CASE 
  WHEN "direction" = 'inbound' THEN 'CUSTOMER'::"MessageSender"
  WHEN "direction" = 'outbound' THEN 'STAFF'::"MessageSender"
  ELSE 'CUSTOMER'::"MessageSender"
END
WHERE "sender" IS NULL;

-- Set default for messages without direction (assume CUSTOMER)
UPDATE "messages"
SET "sender" = 'CUSTOMER'::"MessageSender"
WHERE "sender" IS NULL;

-- Make sender required after populating (only if all rows have a value)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "messages" WHERE "sender" IS NULL) THEN
        ALTER TABLE "messages" ALTER COLUMN "sender" SET NOT NULL;
    END IF;
END $$;

-- Step 4: Alter User table
-- Add new columns
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "notifyOnNewMessage" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "notifyOnAssignment" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

-- Step 5: Create MessageTemplate table
CREATE TABLE IF NOT EXISTS "message_templates" (
  "id" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "contentAr" TEXT,
  "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "lastUsedAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- Step 6: Create Broadcast table
CREATE TABLE IF NOT EXISTS "broadcasts" (
  "id" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "messageAr" TEXT,
  "targetAudience" JSONB NOT NULL,
  "recipientCount" INTEGER NOT NULL DEFAULT 0,
  "sentCount" INTEGER NOT NULL DEFAULT 0,
  "deliveredCount" INTEGER NOT NULL DEFAULT 0,
  "readCount" INTEGER NOT NULL DEFAULT 0,
  "respondedCount" INTEGER NOT NULL DEFAULT 0,
  "status" "BroadcastStatus" NOT NULL DEFAULT 'DRAFT',
  "scheduledAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "broadcasts_pkey" PRIMARY KEY ("id")
);

-- Step 7: Create BroadcastRecipient table
CREATE TABLE IF NOT EXISTS "broadcast_recipients" (
  "id" TEXT NOT NULL,
  "broadcastId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "sentAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "readAt" TIMESTAMP(3),
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "broadcast_recipients_pkey" PRIMARY KEY ("id")
);

-- Step 8: Add foreign keys
-- Conversation -> User (assignedTo)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'conversations_assignedToId_fkey'
    ) THEN
        ALTER TABLE "conversations" 
          ADD CONSTRAINT "conversations_assignedToId_fkey" 
          FOREIGN KEY ("assignedToId") 
          REFERENCES "users"("id") 
          ON DELETE SET NULL 
          ON UPDATE CASCADE;
    END IF;
END $$;

-- Conversation -> User (closedBy)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'conversations_closedById_fkey'
    ) THEN
        ALTER TABLE "conversations" 
          ADD CONSTRAINT "conversations_closedById_fkey" 
          FOREIGN KEY ("closedById") 
          REFERENCES "users"("id") 
          ON DELETE SET NULL 
          ON UPDATE CASCADE;
    END IF;
END $$;

-- MessageTemplate -> Restaurant
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'message_templates_restaurantId_fkey'
    ) THEN
        ALTER TABLE "message_templates" 
          ADD CONSTRAINT "message_templates_restaurantId_fkey" 
          FOREIGN KEY ("restaurantId") 
          REFERENCES "restaurants"("id") 
          ON DELETE CASCADE 
          ON UPDATE CASCADE;
    END IF;
END $$;

-- Broadcast -> Restaurant
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'broadcasts_restaurantId_fkey'
    ) THEN
        ALTER TABLE "broadcasts" 
          ADD CONSTRAINT "broadcasts_restaurantId_fkey" 
          FOREIGN KEY ("restaurantId") 
          REFERENCES "restaurants"("id") 
          ON DELETE CASCADE 
          ON UPDATE CASCADE;
    END IF;
END $$;

-- Broadcast -> User (createdBy)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'broadcasts_createdById_fkey'
    ) THEN
        ALTER TABLE "broadcasts" 
          ADD CONSTRAINT "broadcasts_createdById_fkey" 
          FOREIGN KEY ("createdById") 
          REFERENCES "users"("id") 
          ON DELETE RESTRICT 
          ON UPDATE CASCADE;
    END IF;
END $$;

-- BroadcastRecipient -> Broadcast
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'broadcast_recipients_broadcastId_fkey'
    ) THEN
        ALTER TABLE "broadcast_recipients" 
          ADD CONSTRAINT "broadcast_recipients_broadcastId_fkey" 
          FOREIGN KEY ("broadcastId") 
          REFERENCES "broadcasts"("id") 
          ON DELETE CASCADE 
          ON UPDATE CASCADE;
    END IF;
END $$;

-- BroadcastRecipient -> Customer
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'broadcast_recipients_customerId_fkey'
    ) THEN
        ALTER TABLE "broadcast_recipients" 
          ADD CONSTRAINT "broadcast_recipients_customerId_fkey" 
          FOREIGN KEY ("customerId") 
          REFERENCES "customers"("id") 
          ON DELETE RESTRICT 
          ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 9: Create indexes
CREATE INDEX IF NOT EXISTS "conversations_customerPhone_idx" ON "conversations"("customerPhone");
CREATE INDEX IF NOT EXISTS "conversations_status_idx" ON "conversations"("status");
CREATE INDEX IF NOT EXISTS "conversations_assignedToId_idx" ON "conversations"("assignedToId");
CREATE INDEX IF NOT EXISTS "conversations_lastMessageAt_idx" ON "conversations"("lastMessageAt");
CREATE INDEX IF NOT EXISTS "messages_createdAt_idx" ON "messages"("createdAt");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "message_templates_restaurantId_idx" ON "message_templates"("restaurantId");
CREATE INDEX IF NOT EXISTS "message_templates_category_idx" ON "message_templates"("category");
CREATE INDEX IF NOT EXISTS "broadcasts_restaurantId_idx" ON "broadcasts"("restaurantId");
CREATE INDEX IF NOT EXISTS "broadcasts_status_idx" ON "broadcasts"("status");
CREATE INDEX IF NOT EXISTS "broadcast_recipients_broadcastId_idx" ON "broadcast_recipients"("broadcastId");
CREATE INDEX IF NOT EXISTS "broadcast_recipients_customerId_idx" ON "broadcast_recipients"("customerId");
