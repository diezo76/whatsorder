-- ============================================
-- Script: Ajout des colonnes Stripe et PayPal
-- Date: 2026-01-15
-- Description: Ajoute les colonnes manquantes pour
--              l'intégration Stripe Connect et PayPal
-- ============================================

-- 🔷 Colonnes Stripe Connect
ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "stripeAccountId" TEXT;

ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "stripeAccountStatus" TEXT;

ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "stripeOnboardingComplete" BOOLEAN DEFAULT false;

ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "stripeConnectedAt" TIMESTAMP WITH TIME ZONE;

-- 🔶 Colonnes PayPal
ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "paypalMerchantId" TEXT;

ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "paypalEmail" TEXT;

ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "paypalOnboardingComplete" BOOLEAN DEFAULT false;

ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "paypalConnectedAt" TIMESTAMP WITH TIME ZONE;

-- 💳 Options de paiement
ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "enableCashPayment" BOOLEAN DEFAULT true;

ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "enableCardPayment" BOOLEAN DEFAULT true;

ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "enableStripePayment" BOOLEAN DEFAULT false;

ALTER TABLE "restaurants" 
ADD COLUMN IF NOT EXISTS "enablePaypalPayment" BOOLEAN DEFAULT false;

-- ✅ Vérification
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name IN (
    'stripeAccountId', 
    'stripeAccountStatus', 
    'stripeOnboardingComplete',
    'stripeConnectedAt',
    'paypalMerchantId',
    'paypalEmail',
    'paypalOnboardingComplete',
    'paypalConnectedAt',
    'enableCashPayment',
    'enableCardPayment',
    'enableStripePayment',
    'enablePaypalPayment'
)
ORDER BY column_name;
