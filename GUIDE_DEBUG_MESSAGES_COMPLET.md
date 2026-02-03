# 🔍 Guide Complet de Débogage - Messages Non Affichés

**Date** : 11 janvier 2026

---

## 🎯 Objectif

Identifier pourquoi les messages ne s'affichent pas dans ChatArea malgré les corrections.

---

## 📋 Checklist de Débogage

### ✅ Étape 1 : Vérifier la Console du Navigateur

1. **Ouvrez la console** (F12 → Console)
2. **Sélectionnez une conversation**
3. **Cherchez ces logs** dans l'ordre :

```
📨 Messages bruts reçus: X [...]
🔄 Mapping message RAW: {...}
✅ Message mappé: {...}
📤 ChatArea rendering message: {...}
💬 MessageBubble rendering: {...}
```

**Questions à se poser** :
- ✅ Les messages sont-ils chargés depuis l'API ?
- ✅ Le mapping fonctionne-t-il ?
- ✅ Le champ `content` est-il présent et non vide ?
- ✅ Les messages arrivent-ils jusqu'à MessageBubble ?

---

### ✅ Étape 2 : Vérifier l'API Directement

#### Option A : Via le Navigateur

1. Ouvrez la console (F12)
2. Tapez :
```javascript
// Récupérer le token
const token = localStorage.getItem('token');
console.log('Token:', token);

// Récupérer l'ID de conversation (remplacez par un ID réel)
const conversationId = 'VOTRE_CONVERSATION_ID';

// Appeler l'API
fetch(`/api/conversations/${conversationId}/messages`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('📨 Réponse API:', data);
  console.log('📨 Messages:', data.messages);
  console.log('📨 Premier message:', data.messages?.[0]);
  console.log('📨 Contenu premier message:', data.messages?.[0]?.content);
});
```

#### Option B : Via curl

```bash
# Remplacer CONVERSATION_ID et TOKEN
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/conversations/CONVERSATION_ID/messages | jq '.'
```

#### Option C : Via le script fourni

```bash
./scripts/test-api-messages.sh CONVERSATION_ID TOKEN
```

**Vérifications** :
- ✅ L'API retourne-t-elle `{ success: true, messages: [...] }` ?
- ✅ Les messages ont-ils un champ `content` ?
- ✅ Le champ `content` contient-il du texte ?
- ✅ Les champs `sender`, `type`, `direction` sont-ils présents ?

---

### ✅ Étape 3 : Vérifier la Base de Données

Exécutez ce script SQL dans Supabase :

```sql
-- Voir les messages d'une conversation
SELECT 
  m.id,
  m.content,
  m.type,
  m.sender,
  m.direction,
  m.status,
  m."mediaUrl",
  m."createdAt",
  m."isRead",
  LENGTH(m.content) as content_length,
  CASE 
    WHEN m.content IS NULL THEN 'NULL'
    WHEN m.content = '' THEN 'EMPTY'
    ELSE 'HAS_CONTENT'
  END as content_status
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
```

**Vérifications** :
- ✅ Les messages existent-ils dans la DB ?
- ✅ Le champ `content` contient-il du texte ?
- ✅ Le champ `sender` est-il `CUSTOMER`, `STAFF` ou `SYSTEM` ?
- ✅ Le champ `type` est-il `TEXT`, `IMAGE`, etc. ?

---

### ✅ Étape 4 : Vérifier le Mapping

Dans la console, après avoir sélectionné une conversation, vous devriez voir :

```
🔄 Mapping message RAW: {
  "id": "...",
  "content": "Texte du message",
  "type": "TEXT",
  "sender": "CUSTOMER",
  ...
}
```

Puis :

```
✅ Message mappé: {
  "id": "...",
  "content": "Texte du message",
  "direction": "inbound",
  "type": "text",
  ...
}
```

**Vérifications** :
- ✅ Le mapping convertit-il `sender: CUSTOMER` → `direction: inbound` ?
- ✅ Le mapping convertit-il `type: TEXT` → `type: text` ?
- ✅ Le champ `content` est-il préservé après le mapping ?

---

### ✅ Étape 5 : Vérifier le Rendu

Dans la console, vous devriez voir :

```
💬 MessageBubble rendering: {
  id: "...",
  content: "Texte du message",
  contentType: "string",
  contentLength: 25,
  isEmpty: false,
  ...
}
```

**Vérifications** :
- ✅ MessageBubble reçoit-il les messages ?
- ✅ Le champ `content` est-il présent ?
- ✅ `isEmpty` est-il `false` ?

---

## 🐛 Problèmes Courants et Solutions

### Problème 1 : `content` est NULL dans la DB

**Symptôme** : Messages sans contenu dans la DB

**Solution** :
```sql
-- Vérifier les messages sans contenu
SELECT id, content, type, sender 
FROM messages 
WHERE content IS NULL OR content = '';

-- Mettre à jour les messages sans contenu (si nécessaire)
UPDATE messages 
SET content = '(Message sans contenu)' 
WHERE content IS NULL OR content = '';
```

---

### Problème 2 : L'API ne retourne pas les messages

**Symptôme** : `messages: []` dans la réponse API

**Solution** :
1. Vérifier que la conversation existe
2. Vérifier que les messages appartiennent à cette conversation
3. Vérifier les permissions (restaurantId)

---

### Problème 3 : Le mapping échoue

**Symptôme** : Erreur dans la console lors du mapping

**Solution** :
- Vérifier que tous les champs requis sont présents
- Vérifier les logs "🔄 Mapping message RAW"
- Vérifier que le format des données correspond au schéma

---

### Problème 4 : MessageBubble ne reçoit pas les messages

**Symptôme** : Pas de log "💬 MessageBubble rendering"

**Solution** :
- Vérifier que `messages.length > 0` dans ChatArea
- Vérifier que `messages.map()` est appelé
- Vérifier qu'il n'y a pas d'erreur dans le rendu

---

## 🛠️ Corrections Appliquées

### 1. Mapping Amélioré ✅

- Gestion de tous les cas (`sender`, `direction`, `type`)
- Conversion de `createdAt` (Date → string)
- Validation des champs requis
- Logs détaillés pour chaque étape

### 2. Logs de Débogage Complets ✅

- Logs dans l'API (serveur)
- Logs dans `loadMessages` (client)
- Logs dans `mapMessageToChatFormat` (client)
- Logs dans `ChatArea` (client)
- Logs dans `MessageBubble` (client)

### 3. Affichage de Debug ✅

- Message "(Message vide)" si contenu vide
- Informations de debug dans MessageBubble
- Logs détaillés dans la console

---

## 📝 Prochaines Étapes

1. **Ouvrir la console** (F12)
2. **Sélectionner une conversation**
3. **Copier TOUS les logs** de la console
4. **Partager les logs** pour analyse

Les logs devraient montrer exactement où le problème se situe :
- Si les messages ne sont pas chargés depuis l'API
- Si le mapping ne fonctionne pas
- Si le contenu est vide
- Si les messages n'arrivent pas jusqu'au rendu

---

## 🆘 Si le Problème Persiste

1. **Copier tous les logs de la console** (depuis le début)
2. **Exécuter le script SQL** et partager les résultats
3. **Tester l'API directement** avec curl et partager la réponse
4. **Vérifier les messages dans Supabase Dashboard**

---

**Date** : 11 janvier 2026  
**Statut** : 🔍 **EN ATTENTE DE RETOUR UTILISATEUR AVEC LOGS**
