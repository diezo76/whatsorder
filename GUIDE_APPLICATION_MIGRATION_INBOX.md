# 📋 Guide d'Application de la Migration Inbox Avancée

## ⚠️ Important

**NE PAS utiliser `prisma db push`** - Cela essaierait de supprimer vos tables existantes !

Utilisez plutôt la migration SQL manuelle qui est sûre et préserve toutes vos données.

---

## ✅ Méthode Recommandée : Supabase Dashboard

### Étape 1 : Ouvrir Supabase Dashboard

1. Allez sur https://supabase.com
2. Connectez-vous à votre projet
3. Ouvrez le **SQL Editor** dans le menu de gauche

### Étape 2 : Copier le SQL de Migration

1. Ouvrez le fichier : `apps/web/prisma/migrations/add_advanced_inbox_features/migration.sql`
2. Copiez **tout le contenu** du fichier

### Étape 3 : Exécuter le SQL

1. Collez le SQL dans l'éditeur SQL de Supabase
2. Cliquez sur **"Run"** ou appuyez sur `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

### Étape 4 : Vérifier les Résultats

Vous devriez voir :
- ✅ Tous les nouveaux enums créés
- ✅ Nouvelles colonnes ajoutées aux tables existantes
- ✅ Nouvelles tables créées (`message_templates`, `broadcasts`, `broadcast_recipients`)
- ✅ Index créés

---

## 🔄 Alternative : Via Terminal (psql)

Si vous préférez utiliser la ligne de commande :

```bash
cd apps/web

# Récupérer l'URL de la base de données depuis .env
source .env 2>/dev/null || true

# Exécuter la migration
psql "$DATABASE_URL" -f prisma/migrations/add_advanced_inbox_features/migration.sql
```

---

## ✅ Vérification Post-Migration

Après avoir appliqué la migration, vérifiez que tout fonctionne :

```bash
cd apps/web

# Vérifier l'état des migrations
npx prisma migrate status

# Générer le client Prisma (si pas déjà fait)
npx prisma generate

# Ouvrir Prisma Studio pour vérifier les données
npx prisma studio
```

---

## 🛡️ Sécurité de la Migration

Cette migration est **100% sûre** car elle :

- ✅ Utilise `IF NOT EXISTS` pour éviter les erreurs si les objets existent déjà
- ✅ Utilise `ADD COLUMN IF NOT EXISTS` pour éviter les erreurs si les colonnes existent déjà
- ✅ Préserve toutes les données existantes
- ✅ Ajoute seulement de nouveaux champs avec des valeurs par défaut
- ✅ Ne supprime aucune table ni colonne existante

---

## 📊 Ce que la Migration Ajoute

### Nouveaux Enums
- `ConversationStatus` (OPEN, CLOSED, RESOLVED, SPAM)
- `ConversationPriority` (LOW, NORMAL, HIGH, URGENT)
- `MessageType` (TEXT, IMAGE, VIDEO, AUDIO, DOCUMENT, LOCATION, ORDER_LINK, TEMPLATE)
- `BroadcastStatus` (DRAFT, SCHEDULED, SENDING, SENT, FAILED)
- `MessageSender` (CUSTOMER, STAFF, SYSTEM)

### Nouvelles Colonnes dans `conversations`
- `customerPhone` (TEXT, requis)
- `status` (ConversationStatus, défaut: OPEN)
- `priority` (ConversationPriority, défaut: NORMAL)
- `assignedToId` (TEXT, nullable)
- `assignedAt` (TIMESTAMP, nullable)
- `isUnread` (BOOLEAN, défaut: true)
- `closedAt` (TIMESTAMP, nullable)
- `closedById` (TEXT, nullable)
- `tags` (TEXT[], défaut: [])
- `internalNotes` (TEXT, nullable)

### Nouvelles Colonnes dans `messages`
- `type` (MessageType, défaut: TEXT)
- `sender` (MessageSender, requis)
- `isRead` (BOOLEAN, défaut: false)
- `readAt` (TIMESTAMP, nullable)
- `isSystemMessage` (BOOLEAN, défaut: false)
- `metadata` (JSONB, nullable)

### Nouvelles Colonnes dans `users`
- `notifyOnNewMessage` (BOOLEAN, défaut: true)
- `notifyOnAssignment` (BOOLEAN, défaut: true)
- `isActive` (BOOLEAN, défaut: true)
- `lastLoginAt` (TIMESTAMP, nullable)

### Nouvelles Tables
- `message_templates` - Templates de messages réutilisables
- `broadcasts` - Campagnes d'envoi groupé
- `broadcast_recipients` - Suivi des destinataires

---

## 🐛 Dépannage

### Erreur : "type already exists"
C'est normal si vous exécutez la migration plusieurs fois. La migration utilise `IF NOT EXISTS` pour éviter cette erreur.

### Erreur : "column already exists"
C'est normal si vous exécutez la migration plusieurs fois. La migration utilise `ADD COLUMN IF NOT EXISTS` pour éviter cette erreur.

### Erreur : "cannot alter column because it is not null"
Si vous avez des conversations sans `customerPhone`, la migration essaiera de les remplir automatiquement. Si cela échoue, vous pouvez modifier manuellement les valeurs NULL avant de rendre la colonne NOT NULL.

---

## ✅ Après la Migration

Une fois la migration appliquée avec succès :

1. ✅ Le schéma Prisma est synchronisé avec la base de données
2. ✅ Le client Prisma peut être utilisé avec les nouveaux champs
3. ✅ Vous pouvez commencer à implémenter les fonctionnalités inbox avancées

---

**Date de création** : 11 janvier 2026  
**Migration** : `add_advanced_inbox_features`
