-- Script de débogage pour vérifier les conversations
-- Exécuter dans Supabase SQL Editor

-- 1. Vérifier toutes les conversations avec leurs détails
SELECT 
    c.id,
    c."customerPhone",
    c.status,
    c.priority,
    c."isUnread",
    c."lastMessageAt",
    c."restaurantId",
    cu.name as customer_name,
    cu.phone as customer_phone,
    COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN customers cu ON cu.id = c."customerId"
LEFT JOIN messages m ON m."conversationId" = c.id
GROUP BY c.id, c."customerPhone", c.status, c.priority, c."isUnread", c."lastMessageAt", c."restaurantId", cu.name, cu.phone
ORDER BY c."lastMessageAt" DESC;

-- 2. Vérifier le restaurantId de la conversation de test
SELECT 
    c.id,
    c."customerPhone",
    c."restaurantId",
    r.name as restaurant_name,
    r.slug as restaurant_slug
FROM conversations c
LEFT JOIN restaurants r ON r.id = c."restaurantId"
WHERE c."customerPhone" = '+201276921081';

-- 3. Vérifier les utilisateurs et leurs restaurantId
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u."restaurantId",
    r.name as restaurant_name
FROM users u
LEFT JOIN restaurants r ON r.id = u."restaurantId"
ORDER BY u."restaurantId", u.role;

-- 4. Vérifier si la conversation a des messages
SELECT 
    c.id as conversation_id,
    c."customerPhone",
    COUNT(m.id) as message_count,
    MAX(m."createdAt") as last_message_date
FROM conversations c
LEFT JOIN messages m ON m."conversationId" = c.id
WHERE c."customerPhone" = '+201276921081'
GROUP BY c.id, c."customerPhone";
