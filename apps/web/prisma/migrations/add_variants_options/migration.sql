-- Migration: Add variants and options support
-- Date: 2026-01-11
-- Description: Adds MenuItemVariant, MenuItemOption, and OrderItemOption tables
--              without dropping existing tables

-- Step 1: Create the MenuItemOptionType enum
CREATE TYPE "MenuItemOptionType" AS ENUM ('ADDON', 'MODIFICATION', 'INSTRUCTION');

-- Step 2: Alter MenuItem table to add new columns
-- Make price nullable (if it's not already)
ALTER TABLE "menu_items" 
  ALTER COLUMN "price" DROP NOT NULL;

-- Add hasVariants column
ALTER TABLE "menu_items" 
  ADD COLUMN IF NOT EXISTS "hasVariants" BOOLEAN NOT NULL DEFAULT false;

-- Step 3: Create MenuItemVariant table
CREATE TABLE IF NOT EXISTS "menu_item_variants" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "trackInventory" BOOLEAN NOT NULL DEFAULT false,
    "stockQuantity" INTEGER,
    "lowStockAlert" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_item_variants_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create MenuItemOption table
CREATE TABLE IF NOT EXISTS "menu_item_options" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "type" "MenuItemOptionType" NOT NULL DEFAULT 'ADDON',
    "priceModifier" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isMultiple" BOOLEAN NOT NULL DEFAULT false,
    "maxSelections" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_item_options_pkey" PRIMARY KEY ("id")
);

-- Step 5: Alter OrderItem table to add variantId
ALTER TABLE "order_items" 
  ADD COLUMN IF NOT EXISTS "variantId" TEXT;

-- Step 6: Create OrderItemOption table
CREATE TABLE IF NOT EXISTS "order_item_options" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "priceModifier" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_options_pkey" PRIMARY KEY ("id")
);

-- Step 7: Add foreign keys
-- MenuItemVariant -> MenuItem
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'menu_item_variants_menuItemId_fkey'
    ) THEN
        ALTER TABLE "menu_item_variants" 
          ADD CONSTRAINT "menu_item_variants_menuItemId_fkey" 
          FOREIGN KEY ("menuItemId") 
          REFERENCES "menu_items"("id") 
          ON DELETE CASCADE 
          ON UPDATE CASCADE;
    END IF;
END $$;

-- MenuItemOption -> MenuItem
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'menu_item_options_menuItemId_fkey'
    ) THEN
        ALTER TABLE "menu_item_options" 
          ADD CONSTRAINT "menu_item_options_menuItemId_fkey" 
          FOREIGN KEY ("menuItemId") 
          REFERENCES "menu_items"("id") 
          ON DELETE CASCADE 
          ON UPDATE CASCADE;
    END IF;
END $$;

-- OrderItem -> MenuItemVariant
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_items_variantId_fkey'
    ) THEN
        ALTER TABLE "order_items" 
          ADD CONSTRAINT "order_items_variantId_fkey" 
          FOREIGN KEY ("variantId") 
          REFERENCES "menu_item_variants"("id") 
          ON DELETE SET NULL 
          ON UPDATE CASCADE;
    END IF;
END $$;

-- OrderItemOption -> OrderItem
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_item_options_orderItemId_fkey'
    ) THEN
        ALTER TABLE "order_item_options" 
          ADD CONSTRAINT "order_item_options_orderItemId_fkey" 
          FOREIGN KEY ("orderItemId") 
          REFERENCES "order_items"("id") 
          ON DELETE CASCADE 
          ON UPDATE CASCADE;
    END IF;
END $$;

-- OrderItemOption -> MenuItemOption
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_item_options_optionId_fkey'
    ) THEN
        ALTER TABLE "order_item_options" 
          ADD CONSTRAINT "order_item_options_optionId_fkey" 
          FOREIGN KEY ("optionId") 
          REFERENCES "menu_item_options"("id") 
          ON DELETE RESTRICT 
          ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 8: Create indexes
CREATE INDEX IF NOT EXISTS "menu_item_variants_menuItemId_idx" ON "menu_item_variants"("menuItemId");
CREATE INDEX IF NOT EXISTS "menu_item_options_menuItemId_idx" ON "menu_item_options"("menuItemId");
CREATE INDEX IF NOT EXISTS "order_items_variantId_idx" ON "order_items"("variantId");
CREATE INDEX IF NOT EXISTS "order_item_options_orderItemId_idx" ON "order_item_options"("orderItemId");
CREATE INDEX IF NOT EXISTS "order_item_options_optionId_idx" ON "order_item_options"("optionId");
CREATE INDEX IF NOT EXISTS "menu_items_restaurantId_idx" ON "menu_items"("restaurantId");
CREATE INDEX IF NOT EXISTS "menu_items_isActive_idx" ON "menu_items"("isActive");
