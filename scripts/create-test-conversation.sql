-- Script pour créer une conversation de test avec le numéro +201276921081
-- Exécuter ce script dans Supabase SQL Editor

-- 1. Récupérer le premier restaurant (ou utiliser un ID spécifique)
DO $$
DECLARE
    v_restaurant_id TEXT;
    v_customer_id TEXT;
    v_conversation_id TEXT;
    v_user_id TEXT;
BEGIN
    -- Récupérer le restaurant "nile bites" ou celui de l'utilisateur admin@whatsorder.com
    SELECT COALESCE(
        (SELECT "restaurantId" FROM users WHERE email = 'admin@whatsorder.com' LIMIT 1),
        (SELECT id FROM restaurants WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites' LIMIT 1),
        (SELECT id FROM restaurants LIMIT 1)
    ) INTO v_restaurant_id;
    
    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Aucun restaurant trouvé dans la base de données';
    END IF;
    
    RAISE NOTICE 'Restaurant ID: %', v_restaurant_id;
    
    -- Récupérer le premier utilisateur du restaurant (pour les messages)
    SELECT id INTO v_user_id FROM users WHERE "restaurantId" = v_restaurant_id LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Aucun utilisateur trouvé pour ce restaurant';
    END IF;
    
    RAISE NOTICE 'User ID: %', v_user_id;
    
    -- 2. Créer ou récupérer le client avec ce numéro
    INSERT INTO customers (id, phone, name, "restaurantId", "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid()::TEXT,
        '+201276921081',
        'Client Test',
        v_restaurant_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (phone, "restaurantId") DO UPDATE
    SET name = 'Client Test',
        "updatedAt" = NOW()
    RETURNING id INTO v_customer_id;
    
    RAISE NOTICE 'Customer ID: %', v_customer_id;
    
    -- 3. Créer la conversation
    INSERT INTO conversations (
        id,
        "customerPhone",
        "customerId",
        "restaurantId",
        status,
        priority,
        "isUnread",
        "lastMessageAt",
        "createdAt",
        "updatedAt"
    )
    VALUES (
        gen_random_uuid()::TEXT,
        '+201276921081',
        v_customer_id,
        v_restaurant_id,
        'OPEN',
        'NORMAL',
        true,
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_conversation_id;
    
    -- Si la conversation existe déjà, la récupérer
    IF v_conversation_id IS NULL THEN
        SELECT id INTO v_conversation_id 
        FROM conversations 
        WHERE "customerPhone" = '+201276921081' 
        AND "restaurantId" = v_restaurant_id
        LIMIT 1;
    END IF;
    
    RAISE NOTICE 'Conversation ID: %', v_conversation_id;
    
    -- 4. Créer quelques messages de test pour simuler une conversation
    
    -- Message 1 : Du client (inbound)
    INSERT INTO messages (
        id,
        "conversationId",
        type,
        sender,
        content,
        direction,
        "isRead",
        "createdAt",
        "updatedAt"
    )
    VALUES (
        gen_random_uuid()::TEXT,
        v_conversation_id,
        'TEXT',
        'CUSTOMER',
        'Bonjour, je voudrais commander quelque chose',
        'inbound',
        false,
        NOW() - INTERVAL '10 minutes',
        NOW() - INTERVAL '10 minutes'
    );
    
    -- Message 2 : Du staff (outbound)
    INSERT INTO messages (
        id,
        "conversationId",
        type,
        sender,
        content,
        direction,
        "isRead",
        "createdAt",
        "updatedAt"
    )
    VALUES (
        gen_random_uuid()::TEXT,
        v_conversation_id,
        'TEXT',
        'STAFF',
        'Bonjour ! Bien sûr, que souhaitez-vous commander ?',
        'outbound',
        true,
        NOW() - INTERVAL '9 minutes',
        NOW() - INTERVAL '9 minutes'
    );
    
    -- Message 3 : Du client (inbound)
    INSERT INTO messages (
        id,
        "conversationId",
        type,
        sender,
        content,
        direction,
        "isRead",
        "createdAt",
        "updatedAt"
    )
    VALUES (
        gen_random_uuid()::TEXT,
        v_conversation_id,
        'TEXT',
        'CUSTOMER',
        'Je voudrais 2 pizzas margherita et une boisson',
        'inbound',
        false,
        NOW() - INTERVAL '5 minutes',
        NOW() - INTERVAL '5 minutes'
    );
    
    -- Message 4 : Du staff (outbound)
    INSERT INTO messages (
        id,
        "conversationId",
        type,
        sender,
        content,
        direction,
        "isRead",
        "createdAt",
        "updatedAt"
    )
    VALUES (
        gen_random_uuid()::TEXT,
        v_conversation_id,
        'TEXT',
        'STAFF',
        'Parfait ! Votre commande est en cours de préparation. Total : 150 EGP',
        'outbound',
        true,
        NOW() - INTERVAL '3 minutes',
        NOW() - INTERVAL '3 minutes'
    );
    
    -- Message 5 : Du client (inbound) - le plus récent
    INSERT INTO messages (
        id,
        "conversationId",
        type,
        sender,
        content,
        direction,
        "isRead",
        "createdAt",
        "updatedAt"
    )
    VALUES (
        gen_random_uuid()::TEXT,
        v_conversation_id,
        'TEXT',
        'CUSTOMER',
        'Merci beaucoup ! À quelle heure sera prête ?',
        'inbound',
        false,
        NOW() - INTERVAL '1 minute',
        NOW() - INTERVAL '1 minute'
    );
    
    -- Mettre à jour lastMessageAt de la conversation
    UPDATE conversations
    SET "lastMessageAt" = NOW() - INTERVAL '1 minute',
        "isUnread" = true,
        "updatedAt" = NOW()
    WHERE id = v_conversation_id;
    
    RAISE NOTICE '✅ Conversation de test créée avec succès !';
    RAISE NOTICE '   Conversation ID: %', v_conversation_id;
    RAISE NOTICE '   Customer Phone: +201276921081';
    RAISE NOTICE '   5 messages créés';
    
END $$;

-- Vérification : Afficher la conversation créée
SELECT 
    c.id as conversation_id,
    c."customerPhone",
    c.status,
    c.priority,
    c."isUnread",
    c."lastMessageAt",
    cu.name as customer_name,
    COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN customers cu ON cu.id = c."customerId"
LEFT JOIN messages m ON m."conversationId" = c.id
WHERE c."customerPhone" = '+201276921081'
GROUP BY c.id, c."customerPhone", c.status, c.priority, c."isUnread", c."lastMessageAt", cu.name;
