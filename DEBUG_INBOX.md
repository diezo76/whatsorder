# 🔍 Débogage Inbox - Conversation Non Visible

## Problème
La conversation avec +201276921081 n'apparaît pas dans l'inbox.

## Causes Possibles

### 1. RestaurantId ne correspond pas ⚠️

**Vérification** : Exécutez ce SQL dans Supabase :

```sql
-- Vérifier le restaurantId de la conversation
SELECT 
    c.id,
    c."customerPhone",
    c."restaurantId" as conversation_restaurant_id,
    r.name as restaurant_name
FROM conversations c
LEFT JOIN restaurants r ON r.id = c."restaurantId"
WHERE c."customerPhone" = '+201276921081';

-- Vérifier le restaurantId de votre utilisateur connecté
SELECT 
    u.id,
    u.email,
    u."restaurantId" as user_restaurant_id,
    r.name as restaurant_name
FROM users u
LEFT JOIN restaurants r ON r.id = u."restaurantId"
WHERE u.email = 'VOTRE_EMAIL@example.com'; -- Remplacez par votre email
```

**Solution** : Si les `restaurantId` ne correspondent pas, mettez à jour la conversation :

```sql
-- Remplacer 'VOTRE_RESTAURANT_ID' par le vrai ID
UPDATE conversations 
SET "restaurantId" = 'VOTRE_RESTAURANT_ID'
WHERE "customerPhone" = '+201276921081';
```

---

### 2. Format de réponse API incorrect ✅ CORRIGÉ

La route API a été adaptée pour retourner le format attendu par la page inbox.

**Vérification** : Ouvrez la console du navigateur (F12) et vérifiez :
- La requête `/api/conversations` retourne bien des données
- Pas d'erreurs dans la console

---

### 3. Token JWT invalide ou expiré

**Vérification** :
1. Ouvrez la console du navigateur (F12)
2. Onglet Network
3. Rechargez la page inbox
4. Cliquez sur la requête `/api/conversations`
5. Vérifiez le statut de la réponse :
   - **200** : OK
   - **401** : Token invalide → Reconnectez-vous
   - **500** : Erreur serveur → Vérifiez les logs

---

### 4. Messages manquants

**Vérification** : Exécutez ce SQL :

```sql
-- Vérifier les messages de la conversation
SELECT 
    m.id,
    m.sender,
    m.content,
    m."isRead",
    m."createdAt"
FROM messages m
JOIN conversations c ON c.id = m."conversationId"
WHERE c."customerPhone" = '+201276921081'
ORDER BY m."createdAt" ASC;
```

Si aucun message, la conversation peut ne pas apparaître car `lastMessageAt` pourrait être NULL.

---

## 🔧 Solutions Rapides

### Solution 1 : Vérifier dans la Console

1. Ouvrez `/dashboard/inbox`
2. Ouvrez la console (F12)
3. Tapez :
```javascript
fetch('/api/conversations', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log('Conversations:', d));
```

Vérifiez si la conversation apparaît dans la réponse.

---

### Solution 2 : Forcer le restaurantId

Si vous savez votre `restaurantId`, mettez à jour la conversation :

```sql
-- Remplacer 'VOTRE_RESTAURANT_ID' par votre vrai restaurantId
UPDATE conversations 
SET "restaurantId" = 'VOTRE_RESTAURANT_ID'
WHERE "customerPhone" = '+201276921081';
```

---

### Solution 3 : Recréer la Conversation

Supprimez et recréez la conversation avec le bon restaurantId :

```sql
-- Supprimer la conversation existante
DELETE FROM messages WHERE "conversationId" IN (
  SELECT id FROM conversations WHERE "customerPhone" = '+201276921081'
);
DELETE FROM conversations WHERE "customerPhone" = '+201276921081';

-- Puis réexécutez le script create-test-conversation.sql
-- MAIS modifiez-le pour utiliser votre restaurantId
```

---

## 📋 Checklist de Vérification

- [ ] La conversation existe dans la base (vérifier avec SQL)
- [ ] Le `restaurantId` de la conversation correspond à votre utilisateur
- [ ] Les messages existent pour cette conversation
- [ ] Le token JWT est valide (pas d'erreur 401)
- [ ] La route API retourne bien les données (vérifier dans Network)
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] `user.restaurantId` est défini dans le contexte auth

---

## 🐛 Logs à Vérifier

### Console Navigateur
- Erreurs JavaScript
- Erreurs de requête API
- Warnings React

### Network Tab
- Statut de la requête `/api/conversations`
- Corps de la réponse
- Headers (Authorization)

### Logs Serveur
- Erreurs Prisma
- Erreurs d'authentification
- Erreurs de requête SQL

---

**Script SQL de débogage** : `scripts/debug-conversations.sql`
