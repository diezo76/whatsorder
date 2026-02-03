-- Script pour corriger le restaurantId de la conversation de test
-- Restaurant: "nile bites"
-- Utilisateur: admin@whatsorder.com

-- 1. Vérifier le restaurant "nile bites"
SELECT 
    id as restaurant_id,
    name,
    slug
FROM restaurants
WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites';

-- 2. Vérifier l'utilisateur admin@whatsorder.com
SELECT 
    id as user_id,
    email,
    "restaurantId" as user_restaurant_id,
    name,
    role
FROM users
WHERE email = 'admin@whatsorder.com';

-- 3. Vérifier la conversation actuelle
SELECT 
    c.id as conversation_id,
    c."customerPhone",
    c."restaurantId" as current_restaurant_id,
    r.name as restaurant_name
FROM conversations c
LEFT JOIN restaurants r ON r.id = c."restaurantId"
WHERE c."customerPhone" = '+201276921081';

-- 4. CORRIGER le restaurantId de la conversation
DO $$
DECLARE
    v_restaurant_id TEXT;
    v_user_restaurant_id TEXT;
BEGIN
    -- Récupérer le restaurant "nile bites"
    SELECT id INTO v_restaurant_id 
    FROM restaurants 
    WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites'
    LIMIT 1;
    
    -- Récupérer le restaurantId de l'utilisateur admin
    SELECT "restaurantId" INTO v_user_restaurant_id
    FROM users
    WHERE email = 'admin@whatsorder.com'
    LIMIT 1;
    
    -- Utiliser le restaurantId de l'utilisateur si trouvé, sinon celui du restaurant
    IF v_user_restaurant_id IS NOT NULL THEN
        v_restaurant_id := v_user_restaurant_id;
    END IF;
    
    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Restaurant "nile bites" non trouvé';
    END IF;
    
    RAISE NOTICE 'Restaurant ID trouvé: %', v_restaurant_id;
    
    -- Mettre à jour la conversation
    UPDATE conversations
    SET 
        "restaurantId" = v_restaurant_id,
        "updatedAt" = NOW()
    WHERE "customerPhone" = '+201276921081';
    
    -- Mettre à jour aussi le client si nécessaire
    UPDATE customers
    SET 
        "restaurantId" = v_restaurant_id,
        "updatedAt" = NOW()
    WHERE phone = '+201276921081';
    
    RAISE NOTICE '✅ Conversation mise à jour avec restaurantId: %', v_restaurant_id;
END $$;

-- 5. Vérification finale
SELECT 
    c.id as conversation_id,
    c."customerPhone",
    c."restaurantId",
    r.name as restaurant_name,
    cu.name as customer_name,
    COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN restaurants r ON r.id = c."restaurantId"
LEFT JOIN customers cu ON cu.id = c."customerId"
LEFT JOIN messages m ON m."conversationId" = c.id
WHERE c."customerPhone" = '+201276921081'
GROUP BY c.id, c."customerPhone", c."restaurantId", r.name, cu.name;
