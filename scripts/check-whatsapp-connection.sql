-- Script pour vérifier et reconnecter le restaurant WhatsApp
-- Restaurant: "nile bites"
-- Utilisateur: admin@whatsorder.com

-- ============================================
-- 1. VÉRIFICATION DU RESTAURANT
-- ============================================
SELECT 
    id as restaurant_id,
    name,
    slug,
    phone,
    "whatsappNumber",
    CASE 
        WHEN "whatsappApiToken" IS NULL OR "whatsappApiToken" = '' THEN '❌ NON CONFIGURÉ'
        ELSE '✅ CONFIGURÉ'
    END as whatsapp_token_status,
    CASE 
        WHEN "whatsappBusinessId" IS NULL OR "whatsappBusinessId" = '' THEN '❌ NON CONFIGURÉ'
        ELSE '✅ CONFIGURÉ'
    END as whatsapp_business_id_status,
    CASE 
        WHEN ("whatsappApiToken" IS NULL OR "whatsappApiToken" = '') 
          OR ("whatsappBusinessId" IS NULL OR "whatsappBusinessId" = '') 
        THEN '❌ DÉCONNECTÉ'
        ELSE '✅ CONNECTÉ'
    END as whatsapp_connection_status,
    "whatsappApiToken",
    "whatsappBusinessId",
    "isActive",
    "createdAt",
    "updatedAt"
FROM restaurants
WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites'
LIMIT 1;

-- ============================================
-- 2. VÉRIFICATION DE L'UTILISATEUR ADMIN
-- ============================================
SELECT 
    id as user_id,
    email,
    name,
    "restaurantId" as user_restaurant_id,
    role,
    "isActive"
FROM users
WHERE email = 'admin@whatsorder.com';

-- ============================================
-- 3. STATISTIQUES DES CONVERSATIONS
-- ============================================
SELECT 
    COUNT(*) as total_conversations,
    COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_conversations,
    MAX("lastMessageAt") as last_message_date
FROM conversations
WHERE "restaurantId" IN (
    SELECT id FROM restaurants 
    WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites'
);

-- ============================================
-- 4. INSTRUCTIONS POUR RECONNECTER WHATSAPP
-- ============================================
-- Pour reconnecter le restaurant à WhatsApp Business API, vous devez :
--
-- 1. Obtenir les credentials depuis Meta Business Manager :
--    - WhatsApp Business ID (Phone Number ID)
--    - Access Token (WhatsApp API Token)
--
-- 2. Exécuter la requête suivante en remplaçant les valeurs :
--
-- UPDATE restaurants
-- SET 
--     "whatsappApiToken" = 'VOTRE_ACCESS_TOKEN_ICI',
--     "whatsappBusinessId" = 'VOTRE_PHONE_NUMBER_ID_ICI',
--     "updatedAt" = NOW()
-- WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites';
--
-- 3. Vérifier la connexion en exécutant à nouveau la section 1

-- ============================================
-- 5. SCRIPT DE RECONNEXION (À DÉCOMMENTER ET MODIFIER)
-- ============================================
-- ⚠️ DÉCOMMENTEZ ET REMPLACEZ LES VALEURS CI-DESSOUS AVANT D'EXÉCUTER
/*
DO $$
DECLARE
    v_restaurant_id TEXT;
BEGIN
    -- Récupérer le restaurant "nile bites"
    SELECT id INTO v_restaurant_id 
    FROM restaurants 
    WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites'
    LIMIT 1;
    
    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Restaurant "nile bites" non trouvé';
    END IF;
    
    -- ⚠️ REMPLACEZ CES VALEURS PAR VOS VRAIES CREDENTIALS WHATSAPP
    UPDATE restaurants
    SET 
        "whatsappApiToken" = 'VOTRE_ACCESS_TOKEN_ICI',  -- Ex: 'EAAxxxxxxxxxxxxx'
        "whatsappBusinessId" = 'VOTRE_PHONE_NUMBER_ID_ICI',  -- Ex: '123456789012345'
        "whatsappNumber" = '+201276921081',  -- Numéro WhatsApp du restaurant
        "updatedAt" = NOW()
    WHERE id = v_restaurant_id;
    
    RAISE NOTICE '✅ Restaurant reconnecté à WhatsApp Business API';
    RAISE NOTICE 'Restaurant ID: %', v_restaurant_id;
END $$;
*/

-- ============================================
-- 6. VÉRIFICATION POST-RECONNEXION
-- ============================================
-- Exécutez cette requête après avoir reconnecté pour vérifier :
/*
SELECT 
    name,
    CASE 
        WHEN ("whatsappApiToken" IS NOT NULL AND "whatsappApiToken" != '') 
          AND ("whatsappBusinessId" IS NOT NULL AND "whatsappBusinessId" != '') 
        THEN '✅ CONNECTÉ'
        ELSE '❌ DÉCONNECTÉ'
    END as connection_status,
    "whatsappNumber",
    LENGTH("whatsappApiToken") as token_length,
    LENGTH("whatsappBusinessId") as business_id_length
FROM restaurants
WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites';
*/
