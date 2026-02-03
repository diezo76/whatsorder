# 🔍 Guide de Débogage - Messages Non Affichés

**Date** : 11 janvier 2026

---

## 🐛 Problème

Les messages ne s'affichent pas dans ChatArea (bulles vides).

---

## 🔍 Étapes de Débogage

### 1. Vérifier les Messages dans la Base de Données

Exécutez le script SQL pour vérifier si les messages existent :

```bash
psql -h [HOST] -U [USER] -d [DATABASE] -f scripts/check-messages.sql
```

Ou connectez-vous à Supabase et exécutez :

```sql
-- Voir les messages d'une conversation
SELECT 
  m.id,
  m.content,
  m.type,
  m.sender,
  m.direction,
  m.status,
  m."createdAt"
FROM messages m
WHERE m."conversationId" = 'VOTRE_CONVERSATION_ID'
ORDER BY m."createdAt" ASC;
```

**Vérifications** :
- ✅ Les messages existent-ils dans la DB ?
- ✅ Le champ `content` contient-il du texte ?
- ✅ Le champ `sender` est-il `CUSTOMER` ou `STAFF` ?
- ✅ Le champ `type` est-il `TEXT`, `IMAGE`, etc. ?

---

### 2. Vérifier la Console du Navigateur

Ouvrez la console (F12) et cherchez ces logs :

#### Logs Attendus

1. **Chargement des messages** :
   ```
   📨 Messages bruts reçus: X [...]
   📨 Messages mappés: X [...]
   ```

2. **Mapping individuel** :
   ```
   🔄 Mapping message: {...}
   ✅ Message mappé: {...}
   ```

3. **Rendu ChatArea** :
   ```
   📤 ChatArea rendering message: {...}
   ```

4. **Rendu MessageBubble** :
   ```
   💬 MessageBubble rendering: {...}
   ```

#### Vérifications

- ✅ Les messages sont-ils chargés depuis l'API ?
- ✅ Le mapping fonctionne-t-il ?
- ✅ Le champ `content` est-il présent après le mapping ?
- ✅ Les messages arrivent-ils jusqu'à ChatArea ?
- ✅ Les messages arrivent-ils jusqu'à MessageBubble ?

---

### 3. Vérifier l'API Directement

Testez l'API directement dans le navigateur ou avec curl :

```bash
# Remplacer CONVERSATION_ID et TOKEN
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/conversations/CONVERSATION_ID/messages
```

**Vérifications** :
- ✅ L'API retourne-t-elle des messages ?
- ✅ Le format est-il correct ?
- ✅ Le champ `content` est-il présent ?

---

### 4. Vérifier le Format des Données

#### Format Attendu de l'API

```json
{
  "success": true,
  "messages": [
    {
      "id": "...",
      "conversationId": "...",
      "content": "Texte du message",
      "type": "TEXT",
      "sender": "CUSTOMER",
      "direction": "inbound",
      "status": "sent",
      "mediaUrl": null,
      "createdAt": "2026-01-11T...",
      "isRead": false
    }
  ]
}
```

#### Format Après Mapping (ChatArea)

```typescript
{
  id: string;
  content: string; // ⚠️ DOIT CONTENIR DU TEXTE
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'document';
  conversationId: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  mediaUrl: string | null;
}
```

---

### 5. Problèmes Courants et Solutions

#### Problème 1 : `content` est vide ou null

**Symptôme** : Les bulles sont vides

**Solution** :
- Vérifier dans la DB que `content` n'est pas NULL
- Vérifier que le mapping préserve `content`
- Vérifier que MessageBubble affiche bien `message.content`

#### Problème 2 : Messages non chargés

**Symptôme** : Aucun log "📨 Messages bruts reçus"

**Solution** :
- Vérifier que `loadMessages` est appelé
- Vérifier que l'API répond correctement
- Vérifier les erreurs dans la console

#### Problème 3 : Mapping incorrect

**Symptôme** : Logs montrent des messages mais format incorrect

**Solution** :
- Vérifier que `mapMessageToChatFormat` est appelé
- Vérifier que le mapping convertit correctement `sender` → `direction`
- Vérifier que le mapping convertit correctement `type` → `type`

#### Problème 4 : Messages non rendus

**Symptôme** : Messages mappés mais pas affichés

**Solution** :
- Vérifier que `messages.length > 0` dans ChatArea
- Vérifier que `messages.map()` est appelé
- Vérifier que MessageBubble reçoit bien les props

---

## 🛠️ Corrections Appliquées

### 1. Logs de Débogage Ajoutés ✅

- Logs dans `loadMessages` pour voir les messages bruts et mappés
- Logs dans `mapMessageToChatFormat` pour chaque message
- Logs dans `ChatArea` pour chaque message rendu
- Logs dans `MessageBubble` pour chaque bulle rendue

### 2. Gestion des Cas Limites ✅

- Affichage "(Message vide)" si `content` est vide
- Warning si un message n'a pas de contenu
- Vérification que `content` existe avant le mapping

### 3. Script SQL de Vérification ✅

- Script pour vérifier les messages dans la DB
- Script pour voir le format des messages
- Script pour compter les messages vides

---

## 📝 Prochaines Étapes

1. **Ouvrir la console** (F12)
2. **Sélectionner une conversation**
3. **Vérifier les logs** :
   - "📨 Messages bruts reçus" → Voir si l'API retourne des messages
   - "📨 Messages mappés" → Voir si le mapping fonctionne
   - "📤 ChatArea rendering message" → Voir si ChatArea reçoit les messages
   - "💬 MessageBubble rendering" → Voir si MessageBubble reçoit les messages
4. **Vérifier le contenu** :
   - Est-ce que `content` contient du texte ?
   - Est-ce que `content` est vide ou null ?

---

## 🆘 Si le Problème Persiste

1. **Copier les logs de la console** et les partager
2. **Exécuter le script SQL** et partager les résultats
3. **Vérifier l'API directement** avec curl ou Postman
4. **Vérifier les messages dans la DB** avec Supabase Dashboard

---

**Date** : 11 janvier 2026  
**Statut** : 🔍 **EN ATTENTE DE RETOUR UTILISATEUR**
