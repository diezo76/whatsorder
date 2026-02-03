-- Script pour reconnecter le restaurant "nile bites" à WhatsApp Business API
-- ⚠️ IMPORTANT: Remplacez les valeurs placeholder par vos vraies credentials WhatsApp

-- ============================================
-- ÉTAPE 1: VÉRIFICATION AVANT RECONNEXION
-- ============================================
SELECT 
    id as restaurant_id,
    name,
    slug,
    "whatsappNumber",
    CASE 
        WHEN ("whatsappApiToken" IS NULL OR "whatsappApiToken" = '') 
          OR ("whatsappBusinessId" IS NULL OR "whatsappBusinessId" = '') 
        THEN '❌ DÉCONNECTÉ'
        ELSE '✅ CONNECTÉ'
    END as status_actuel,
    "whatsappApiToken" IS NOT NULL AND "whatsappApiToken" != '' as a_token,
    "whatsappBusinessId" IS NOT NULL AND "whatsappBusinessId" != '' as a_business_id
FROM restaurants
WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites'
LIMIT 1;

-- ============================================
-- ÉTAPE 2: RECONNEXION WHATSAPP
-- ============================================
-- ⚠️ DÉCOMMENTEZ ET REMPLACEZ LES VALEURS CI-DESSOUS AVANT D'EXÉCUTER
-- 
-- Pour obtenir vos credentials WhatsApp :
-- 1. Allez sur https://business.facebook.com/
-- 2. Accédez à votre Meta Business Account
-- 3. Allez dans "WhatsApp" > "API Setup"
-- 4. Copiez le "Phone number ID" (whatsappBusinessId)
-- 5. Copiez le "Temporary access token" ou créez un token permanent (whatsappApiToken)

DO $$
DECLARE
    v_restaurant_id TEXT;
    v_whatsapp_token TEXT := 'VOTRE_ACCESS_TOKEN_ICI';  -- ⚠️ REMPLACEZ PAR VOTRE TOKEN
    v_whatsapp_business_id TEXT := 'VOTRE_PHONE_NUMBER_ID_ICI';  -- ⚠️ REMPLACEZ PAR VOTRE ID
    v_whatsapp_number TEXT := '+201276921081';  -- Numéro WhatsApp du restaurant
BEGIN
    -- Récupérer le restaurant "nile bites"
    SELECT id INTO v_restaurant_id 
    FROM restaurants 
    WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites'
    LIMIT 1;
    
    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Restaurant "nile bites" non trouvé';
    END IF;
    
    -- Vérifier que les valeurs ne sont pas les placeholders
    IF v_whatsapp_token = 'VOTRE_ACCESS_TOKEN_ICI' OR v_whatsapp_business_id = 'VOTRE_PHONE_NUMBER_ID_ICI' THEN
        RAISE EXCEPTION '⚠️ Veuillez remplacer les valeurs placeholder par vos vraies credentials WhatsApp';
    END IF;
    
    -- Mettre à jour les credentials WhatsApp
    UPDATE restaurants
    SET 
        "whatsappApiToken" = v_whatsapp_token,
        "whatsappBusinessId" = v_whatsapp_business_id,
        "whatsappNumber" = v_whatsapp_number,
        "updatedAt" = NOW()
    WHERE id = v_restaurant_id;
    
    RAISE NOTICE '✅ Restaurant reconnecté à WhatsApp Business API';
    RAISE NOTICE 'Restaurant ID: %', v_restaurant_id;
    RAISE NOTICE 'WhatsApp Number: %', v_whatsapp_number;
    RAISE NOTICE 'Business ID configuré: %', CASE WHEN v_whatsapp_business_id IS NOT NULL THEN 'Oui' ELSE 'Non' END;
    RAISE NOTICE 'Token configuré: %', CASE WHEN v_whatsapp_token IS NOT NULL THEN 'Oui' ELSE 'Non' END;
END $$;

-- ============================================
-- ÉTAPE 3: VÉRIFICATION POST-RECONNEXION
-- ============================================
SELECT 
    id as restaurant_id,
    name,
    slug,
    "whatsappNumber",
    CASE 
        WHEN ("whatsappApiToken" IS NOT NULL AND "whatsappApiToken" != '') 
          AND ("whatsappBusinessId" IS NOT NULL AND "whatsappBusinessId" != '') 
        THEN '✅ CONNECTÉ'
        ELSE '❌ DÉCONNECTÉ'
    END as status_connexion,
    LENGTH("whatsappApiToken") as token_length,
    LENGTH("whatsappBusinessId") as business_id_length,
    LEFT("whatsappApiToken", 10) || '...' as token_preview,
    "whatsappBusinessId" as business_id,
    "updatedAt" as derniere_mise_a_jour
FROM restaurants
WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites';
