# 📱 Créer une Conversation de Test

## 🎯 Objectif

Créer une conversation de test avec le numéro **+201276921081** pour tester l'inbox avancée.

---

## 🚀 Méthode 1 : Via Supabase Dashboard (Recommandé)

### Étapes :

1. **Ouvrir Supabase Dashboard**
   - Allez sur https://supabase.com
   - Connectez-vous
   - Sélectionnez votre projet

2. **Ouvrir SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche
   - Cliquez sur "New query"

3. **Copier le Script**
   - Ouvrez le fichier : `scripts/create-test-conversation.sql`
   - Sélectionnez tout le contenu (Cmd+A / Ctrl+A)
   - Copiez (Cmd+C / Ctrl+C)

4. **Coller et Exécuter**
   - Collez dans l'éditeur SQL de Supabase
   - Cliquez sur "Run" ou appuyez sur `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

5. **Vérifier le Résultat**
   - Vous devriez voir des messages "NOTICE" avec les IDs créés
   - Une requête SELECT à la fin affiche la conversation créée

---

## 🔧 Méthode 2 : Via Terminal (psql)

```bash
cd "/Users/diezowee/whatsapp order"

# Charger DATABASE_URL depuis .env
cd apps/web
source .env 2>/dev/null || true

# Appliquer le script
psql "$DATABASE_URL" -f ../scripts/create-test-conversation.sql
```

---

## ✅ Ce qui sera créé

### 1. Client
- **Nom** : "Client Test"
- **Téléphone** : +201276921081
- Créé ou mis à jour si existe déjà

### 2. Conversation
- **Statut** : OPEN
- **Priorité** : NORMAL
- **Non lue** : true
- **Dernier message** : Il y a 1 minute

### 3. Messages (5 messages)
1. **Client** (il y a 10 min) : "Bonjour, je voudrais commander quelque chose"
2. **Staff** (il y a 9 min) : "Bonjour ! Bien sûr, que souhaitez-vous commander ?"
3. **Client** (il y a 5 min) : "Je voudrais 2 pizzas margherita et une boisson"
4. **Staff** (il y a 3 min) : "Parfait ! Votre commande est en cours de préparation. Total : 150 EGP"
5. **Client** (il y a 1 min) : "Merci beaucoup ! À quelle heure sera prête ?" ⚠️ **Non lu**

---

## 🧪 Tester dans l'Application

Une fois la conversation créée :

1. **Ouvrir l'inbox** : `/dashboard/inbox`
2. **Vérifier** : La conversation avec +201276921081 devrait apparaître
3. **Tester les filtres** :
   - Filtre "Non lus seulement" → devrait apparaître
   - Filtre "Statut: OPEN" → devrait apparaître
4. **Ouvrir la conversation** : Cliquer dessus pour voir les 5 messages
5. **Tester les actions** :
   - Assigner à un staff
   - Changer le statut
   - Marquer comme lu

---

## 🔍 Vérification SQL

Pour vérifier que tout a été créé :

```sql
-- Vérifier la conversation
SELECT 
    c.id,
    c."customerPhone",
    c.status,
    c.priority,
    c."isUnread",
    c."lastMessageAt",
    cu.name as customer_name
FROM conversations c
LEFT JOIN customers cu ON cu.id = c."customerId"
WHERE c."customerPhone" = '+201276921081';

-- Vérifier les messages
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

---

## 🐛 Dépannage

### Erreur : "Aucun restaurant trouvé"
**Solution** : Créez d'abord un restaurant via l'application ou un script SQL.

### Erreur : "Aucun utilisateur trouvé"
**Solution** : Créez d'abord un utilisateur via l'application ou un script SQL.

### La conversation n'apparaît pas dans l'inbox
**Vérifications** :
1. Vérifiez que vous êtes connecté avec un utilisateur du même restaurant
2. Vérifiez que `restaurantId` de la conversation correspond à votre restaurant
3. Rafraîchissez la page
4. Vérifiez la console du navigateur pour les erreurs

---

**Date** : 11 janvier 2026  
**Script** : `scripts/create-test-conversation.sql`
