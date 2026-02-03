-- Script pour vérifier si la migration inbox avancée a été appliquée
-- Exécuter ce script dans Supabase SQL Editor pour vérifier

-- 1. Vérifier les nouveaux enums
SELECT 
    typname as enum_name,
    CASE 
        WHEN typname IN ('ConversationStatus', 'ConversationPriority', 'MessageType', 'BroadcastStatus', 'MessageSender') 
        THEN '✅ Existe' 
        ELSE '❌ Manquant' 
    END as status
FROM pg_type 
WHERE typname IN ('ConversationStatus', 'ConversationPriority', 'MessageType', 'BroadcastStatus', 'MessageSender')
ORDER BY typname;

-- 2. Vérifier les nouvelles colonnes dans conversations
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('status', 'priority', 'assignedToId', 'tags', 'internalNotes', 'customerPhone', 'isUnread', 'closedAt', 'closedById', 'assignedAt')
        THEN '✅ Existe'
        ELSE '❌ Manquant'
    END as status
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND column_name IN ('status', 'priority', 'assignedToId', 'tags', 'internalNotes', 'customerPhone', 'isUnread', 'closedAt', 'closedById', 'assignedAt')
ORDER BY column_name;

-- 3. Vérifier les nouvelles colonnes dans messages
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('type', 'sender', 'isRead', 'readAt', 'isSystemMessage', 'metadata')
        THEN '✅ Existe'
        ELSE '❌ Manquant'
    END as status
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('type', 'sender', 'isRead', 'readAt', 'isSystemMessage', 'metadata')
ORDER BY column_name;

-- 4. Vérifier les nouvelles colonnes dans users
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('notifyOnNewMessage', 'notifyOnAssignment', 'isActive', 'lastLoginAt')
        THEN '✅ Existe'
        ELSE '❌ Manquant'
    END as status
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('notifyOnNewMessage', 'notifyOnAssignment', 'isActive', 'lastLoginAt')
ORDER BY column_name;

-- 5. Vérifier les nouvelles tables
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('message_templates', 'broadcasts', 'broadcast_recipients')
        THEN '✅ Existe'
        ELSE '❌ Manquant'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('message_templates', 'broadcasts', 'broadcast_recipients')
ORDER BY table_name;

-- 6. Résumé
SELECT 
    'Enums créés' as check_type,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 5 THEN '✅ OK' ELSE '❌ Manquant' END as status
FROM pg_type 
WHERE typname IN ('ConversationStatus', 'ConversationPriority', 'MessageType', 'BroadcastStatus', 'MessageSender')

UNION ALL

SELECT 
    'Colonnes conversations' as check_type,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 10 THEN '✅ OK' ELSE '❌ Manquant' END as status
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND column_name IN ('status', 'priority', 'assignedToId', 'tags', 'internalNotes', 'customerPhone', 'isUnread', 'closedAt', 'closedById', 'assignedAt')

UNION ALL

SELECT 
    'Colonnes messages' as check_type,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 6 THEN '✅ OK' ELSE '❌ Manquant' END as status
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('type', 'sender', 'isRead', 'readAt', 'isSystemMessage', 'metadata')

UNION ALL

SELECT 
    'Colonnes users' as check_type,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 4 THEN '✅ OK' ELSE '❌ Manquant' END as status
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('notifyOnNewMessage', 'notifyOnAssignment', 'isActive', 'lastLoginAt')

UNION ALL

SELECT 
    'Nouvelles tables' as check_type,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 3 THEN '✅ OK' ELSE '❌ Manquant' END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('message_templates', 'broadcasts', 'broadcast_recipients');
