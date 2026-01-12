# 🔍 Diagnostic Complet - Commandes et Notifications

**Date :** 12 janvier 2026  
**Utilisateur testé :** admin@whatsorder.com  
**Restaurant ID :** 168cfa18-e4a5-419f-bab9-a72c6676c362 (Nile Bites)

---

## 📊 État Actuel

### ✅ Ce qui Fonctionne

1. **Utilisateur Admin**
   - ✅ Email : `admin@whatsorder.com`
   - ✅ Restaurant associé : Nile Bites
   - ✅ ID Restaurant : `168cfa18-e4a5-419f-bab9-a72c6676c362`

2. **Système Realtime**
   - ✅ Supabase Realtime activé pour : `orders`, `conversations`, `messages` (minuscules)
   - ✅ Hook `useRealtimeOrders` créé et intégré dans la page `/dashboard/orders`
   - ✅ Hook `useSocket` créé pour Socket.io (backup)

3. **Page Dashboard Commandes**
   - ✅ Page Kanban avec colonnes par statut
   - ✅ Intégration hooks realtime
   - ✅ Indicateur de connexion realtime

---

## ❌ Problèmes Identifiés

### 🔴 PROBLÈME CRITIQUE #1 : Incohérence des Tables

**Symptôme :** Les commandes ne sont pas reçues en temps réel

**Cause :**
- Il existe **2 tables différentes** dans Supabase :
  - `Order` (majuscule, Prisma) → **0 commandes** (table utilisée par l'API)
  - `orders` (minuscule, ancien schéma) → **2 commandes** (anciennes)

- Le hook `useRealtimeOrders` écoute la table **`orders`** (minuscule)
- Mais l'API crée les commandes dans la table **`Order`** (majuscule)

**Preuve :**
```sql
-- Table Order (majuscule) - Utilisée par Prisma
SELECT COUNT(*) FROM "Order";  -- Résultat : 0

-- Table orders (minuscule) - Ancien schéma
SELECT COUNT(*) FROM orders;   -- Résultat : 2
```

**Impact :**
- Les nouvelles commandes créées via l'API ne déclenchent **AUCUNE notification**
- Le hook realtime écoute la mauvaise table
- Les commandes existent mais ne sont pas visibles

---

### 🔴 PROBLÈME CRITIQUE #2 : Realtime Non Activé pour Order (Majuscule)

**Symptôme :** Même si on corrige le hook, Realtime ne fonctionnera pas

**Cause :**
- Supabase Realtime est activé pour `orders` (minuscule)
- Mais **PAS** pour `Order` (majuscule)

**Vérification :**
```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Résultat actuel :
-- orders (minuscule) ✅
-- conversations (minuscule) ✅
-- messages (minuscule) ✅
-- Order (majuscule) ❌ MANQUANT
```

---

### 🟡 PROBLÈME #3 : Pas de Système de Statut En Ligne/Hors Ligne

**Symptôme :** Impossible de savoir si un utilisateur est connecté

**Cause :**
- Le schéma `User` n'a **pas de champ** pour le statut en ligne
- Pas de système de présence implémenté

**Champs manquants :**
- `isOnline` (boolean)
- `lastSeenAt` (DateTime)
- `presenceStatus` (enum: ONLINE, AWAY, OFFLINE)

---

### 🟡 PROBLÈME #4 : Pas de Notifications Email

**Symptôme :** Aucun email reçu quand une commande est créée

**Cause :**
- **Aucun système d'email** configuré
- Pas de service d'envoi d'emails (Resend, SendGrid, etc.)
- Pas de templates d'emails
- Pas de trigger pour envoyer des emails lors de création de commande

---

### 🟡 PROBLÈME #5 : Socket.io Non Configuré en Production

**Symptôme :** Socket.io ne fonctionne pas en production

**Cause :**
- Socket.io nécessite un serveur backend dédié
- L'API backend n'est peut-être pas déployée
- Pas de configuration Socket.io sur Vercel

**Note :** Socket.io est utilisé comme backup, mais Supabase Realtime est la solution principale.

---

## 🔧 Solutions Proposées

### Solution 1 : Activer Realtime pour Order (Majuscule) ⚡ PRIORITÉ 1

**Action :** Ajouter la table `Order` à la publication Supabase Realtime

```sql
-- Dans Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE "Order";
ALTER PUBLICATION supabase_realtime ADD TABLE "OrderItem";
ALTER PUBLICATION supabase_realtime ADD TABLE "Conversation";
ALTER PUBLICATION supabase_realtime ADD TABLE "Message";
```

**Puis modifier le hook :**

```typescript
// apps/web/hooks/useRealtimeOrders.ts
// Ligne 51 : Changer 'orders' en 'Order'
table: 'Order',  // Au lieu de 'orders'
```

---

### Solution 2 : Unifier les Tables (Option Alternative)

**Action :** Migrer toutes les données de `orders` vers `Order` et supprimer `orders`

**⚠️ Attention :** Cette solution nécessite une migration complète et peut casser l'ancien code.

---

### Solution 3 : Ajouter le Statut En Ligne/Hors Ligne

**Action :** Ajouter les champs au schéma User

```prisma
// apps/api/prisma/schema.prisma
model User {
  // ... champs existants
  isOnline     Boolean   @default(false)
  lastSeenAt   DateTime?
  presenceStatus String?  // "ONLINE" | "AWAY" | "OFFLINE"
}
```

**Puis créer une migration :**
```bash
cd apps/api
pnpm prisma migrate dev --name add_user_presence
```

---

### Solution 4 : Configurer les Notifications Email

**Action :** Installer et configurer un service d'email

**Option A : Resend (Recommandé)**
```bash
pnpm add resend
```

**Option B : SendGrid**
```bash
pnpm add @sendgrid/mail
```

**Puis créer un service d'email :**
```typescript
// apps/api/src/services/email.service.ts
export class EmailService {
  async sendOrderNotification(email: string, order: Order) {
    // Envoyer email de notification
  }
}
```

**Et déclencher dans l'API :**
```typescript
// apps/web/app/api/orders/route.ts
// Après création de commande (ligne 198)
await emailService.sendOrderNotification(
  user.email,
  order
);
```

---

## 📋 Plan d'Action Immédiat

### Étape 1 : Corriger Realtime (5 minutes) ⚡ URGENT

1. **Activer Realtime pour Order :**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE "Order";
   ```

2. **Modifier le hook :**
   ```typescript
   // apps/web/hooks/useRealtimeOrders.ts
   table: 'Order',  // Ligne 51
   ```

3. **Tester :**
   - Créer une commande via l'API
   - Vérifier qu'elle apparaît en temps réel dans le dashboard

---

### Étape 2 : Vérifier les Commandes Existantes (2 minutes)

```sql
-- Vérifier les commandes dans Order (majuscule)
SELECT o.id, o."orderNumber", o.status, o."createdAt", 
       r.name as restaurant_name, c.name as customer_name 
FROM "Order" o 
JOIN "Restaurant" r ON o."restaurantId" = r.id 
JOIN "Customer" c ON o."customerId" = c.id 
ORDER BY o."createdAt" DESC;

-- Vérifier les commandes dans orders (minuscule)
SELECT * FROM orders ORDER BY "createdAt" DESC LIMIT 10;
```

---

### Étape 3 : Tester la Création de Commande (5 minutes)

**Via l'API :**
```bash
curl -X POST https://www.whataybo.com/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUSTOMER_ID",
    "items": [{"menuItemId": "ITEM_ID", "quantity": 2}],
    "deliveryType": "DELIVERY",
    "deliveryAddress": "123 Test Street"
  }'
```

**Vérifier :**
- La commande apparaît dans `Order` (majuscule)
- La notification apparaît dans le dashboard
- Le toast "Nouvelle commande" s'affiche

---

## 🧪 Tests à Effectuer

### Test 1 : Création de Commande
- [ ] Créer une commande via l'API
- [ ] Vérifier qu'elle apparaît dans la table `Order`
- [ ] Vérifier que la notification apparaît dans le dashboard
- [ ] Vérifier que le toast s'affiche

### Test 2 : Mise à Jour de Commande
- [ ] Changer le statut d'une commande
- [ ] Vérifier que la mise à jour apparaît en temps réel
- [ ] Vérifier que la commande se déplace dans le Kanban

### Test 3 : Statut En Ligne
- [ ] Se connecter avec admin@whatsorder.com
- [ ] Vérifier le statut en ligne (quand implémenté)
- [ ] Se déconnecter
- [ ] Vérifier le statut hors ligne

### Test 4 : Notifications Email
- [ ] Créer une commande
- [ ] Vérifier la réception de l'email (quand configuré)
- [ ] Vérifier le contenu de l'email

---

## 📝 Notes Techniques

### Architecture Realtime Actuelle

```
Frontend (Next.js)
  ↓
useRealtimeOrders Hook
  ↓
Supabase Realtime Client
  ↓
PostgreSQL Publication: supabase_realtime
  ↓
Table: orders (minuscule) ❌ MAUVAISE TABLE
```

### Architecture Realtime Attendue

```
Frontend (Next.js)
  ↓
useRealtimeOrders Hook
  ↓
Supabase Realtime Client
  ↓
PostgreSQL Publication: supabase_realtime
  ↓
Table: Order (majuscule) ✅ BONNE TABLE
```

---

## 🎯 Résumé

### Problèmes Critiques
1. ❌ Hook écoute `orders` (minuscule) au lieu de `Order` (majuscule)
2. ❌ Realtime non activé pour `Order` (majuscule)
3. ❌ Aucune commande dans `Order` (table utilisée par l'API)

### Problèmes Secondaires
4. ⚠️ Pas de statut en ligne/hors ligne
5. ⚠️ Pas de notifications email

### Actions Immédiates
1. ⚡ Activer Realtime pour `Order` (majuscule)
2. ⚡ Modifier le hook pour écouter `Order`
3. ⚡ Tester la création de commande

---

**Fin du Diagnostic**
