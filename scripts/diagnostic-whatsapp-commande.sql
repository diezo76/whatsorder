-- Script de diagnostic pour vérifier pourquoi les commandes WhatsApp ne fonctionnent pas
-- Restaurant: "nile bites"
-- Utilisateur: admin@whatsorder.com

-- ============================================
-- 1. VÉRIFICATION DU RESTAURANT ET CONNEXION WHATSAPP
-- ============================================
SELECT 
    id as restaurant_id,
    name,
    slug,
    phone,
    "whatsappNumber",
    CASE 
        WHEN ("whatsappApiToken" IS NULL OR "whatsappApiToken" = '' OR "whatsappApiToken" = 'your-access-token') 
          OR ("whatsappBusinessId" IS NULL OR "whatsappBusinessId" = '' OR "whatsappBusinessId" = 'your-phone-number-id')
        THEN '❌ DÉCONNECTÉ'
        ELSE '✅ CONNECTÉ'
    END as whatsapp_status,
    LENGTH("whatsappApiToken") as token_length,
    LENGTH("whatsappBusinessId") as business_id_length,
    "isActive" as restaurant_active
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
    "isActive" as user_active
FROM users
WHERE email = 'admin@whatsorder.com';

-- ============================================
-- 3. VÉRIFICATION DES COMMANDES RÉCENTES
-- ============================================
SELECT 
    o.id as order_id,
    o."orderNumber",
    o.status,
    o.total,
    o."createdAt",
    c.phone as customer_phone,
    c.name as customer_name,
    r.name as restaurant_name
FROM orders o
LEFT JOIN customers c ON c.id = o."customerId"
LEFT JOIN restaurants r ON r.id = o."restaurantId"
WHERE r.slug = 'nile-bites' OR LOWER(r.name) LIKE '%nile%bites%'
ORDER BY o."createdAt" DESC
LIMIT 10;

-- ============================================
-- 4. VÉRIFICATION DES CONVERSATIONS WHATSAPP
-- ============================================
SELECT 
    c.id as conversation_id,
    c."whatsappPhone" as customer_phone,
    c."isActive",
    c."lastMessageAt",
    cu.name as customer_name,
    cu.phone as customer_db_phone,
    COUNT(m.id) as message_count,
    MAX(m."createdAt") as last_message_date
FROM conversations c
LEFT JOIN customers cu ON cu.id = c."customerId"
LEFT JOIN messages m ON m."conversationId" = c.id
WHERE c."restaurantId" IN (
    SELECT id FROM restaurants 
    WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites'
)
GROUP BY c.id, c."whatsappPhone", c."isActive", c."lastMessageAt", cu.name, cu.phone
ORDER BY c."lastMessageAt" DESC
LIMIT 10;

-- ============================================
-- 5. VÉRIFICATION DES MESSAGES RÉCENTS
-- ============================================
SELECT 
    m.id as message_id,
    m.content,
    m.direction,
    m.type,
    m.status,
    m."whatsappId",
    m."createdAt",
    c."whatsappPhone" as conversation_phone,
    conv.id as conversation_id
FROM messages m
LEFT JOIN conversations conv ON conv.id = m."conversationId"
LEFT JOIN customers c ON c.id = conv."customerId"
WHERE conv."restaurantId" IN (
    SELECT id FROM restaurants 
    WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites'
)
ORDER BY m."createdAt" DESC
LIMIT 20;

-- ============================================
-- 6. VÉRIFICATION DES CLIENTS
-- ============================================
SELECT 
    id as customer_id,
    phone,
    name,
    "restaurantId",
    "createdAt",
    "updatedAt"
FROM customers
WHERE "restaurantId" IN (
    SELECT id FROM restaurants 
    WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites'
)
ORDER BY "createdAt" DESC
LIMIT 10;

-- ============================================
-- 7. RÉSUMÉ DES PROBLÈMES POSSIBLES
-- ============================================
-- 
-- ❌ PROBLÈME 1: Restaurant déconnecté de WhatsApp
--    Solution: Exécuter scripts/reconnect-whatsapp-restaurant.sql
--
-- ❌ PROBLÈME 2: Webhook non configuré dans Meta Business Manager
--    Solution: Configurer le webhook dans Meta Business Manager
--    URL: https://votre-domaine.com/api/webhooks/whatsapp
--    Token: Utiliser WHATSAPP_WEBHOOK_VERIFY_TOKEN depuis .env
--
-- ❌ PROBLÈME 3: Messages WhatsApp entrants non traités
--    Vérifier les logs du serveur pour voir si les webhooks sont reçus
--    Vérifier que le serveur backend est démarré
--
-- ❌ PROBLÈME 4: Commandes créées mais pas envoyées via WhatsApp
--    Vérifier que l'endpoint POST /api/orders envoie bien les messages WhatsApp
--    Vérifier que le restaurant a whatsappApiToken et whatsappBusinessId configurés
