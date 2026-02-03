-- Script pour vérifier les messages dans la base de données
-- Utilisez ce script pour voir si les messages existent et leur format

-- 1. Vérifier les conversations avec leurs messages
SELECT 
  c.id as conversation_id,
  c."customerPhone",
  c."restaurantId",
  COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON m."conversationId" = c.id
GROUP BY c.id, c."customerPhone", c."restaurantId"
ORDER BY c."lastMessageAt" DESC
LIMIT 10;

-- 2. Voir les messages d'une conversation spécifique
-- Remplacez 'CONVERSATION_ID' par l'ID réel d'une conversation
SELECT 
  m.id,
  m."conversationId",
  m.content,
  m.type,
  m.sender,
  m.direction,
  m.status,
  m."mediaUrl",
  m."createdAt",
  m."isRead"
FROM messages m
WHERE m."conversationId" = (
  SELECT id FROM conversations 
  WHERE "restaurantId" = (
    SELECT "restaurantId" FROM users WHERE email = 'admin@whatsorder.com' LIMIT 1
  )
  ORDER BY "lastMessageAt" DESC
  LIMIT 1
)
ORDER BY m."createdAt" ASC;

-- 3. Vérifier si les messages ont du contenu
SELECT 
  COUNT(*) as total_messages,
  COUNT(CASE WHEN content IS NULL OR content = '' THEN 1 END) as empty_content,
  COUNT(CASE WHEN content IS NOT NULL AND content != '' THEN 1 END) as with_content
FROM messages;

-- 4. Voir les 10 derniers messages avec leur contenu
SELECT 
  m.id,
  LEFT(m.content, 50) as content_preview,
  m.type,
  m.sender,
  m.direction,
  m.status,
  m."createdAt",
  c."customerPhone"
FROM messages m
JOIN conversations c ON c.id = m."conversationId"
WHERE c."restaurantId" = (
  SELECT "restaurantId" FROM users WHERE email = 'admin@whatsorder.com' LIMIT 1
)
ORDER BY m."createdAt" DESC
LIMIT 10;
