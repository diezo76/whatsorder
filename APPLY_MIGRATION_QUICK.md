# ⚡ Application Rapide de la Migration SQL

## 🚀 Méthode 1 : Script Automatique (Recommandé)

```bash
cd "/Users/diezowee/whatsapp order"

# Charger les variables d'environnement
cd apps/web
source .env 2>/dev/null || true
export DATABASE_URL

# Retourner à la racine et exécuter le script
cd ../..
./scripts/apply-inbox-migration.sh
```

---

## 🎯 Méthode 2 : Via Supabase Dashboard (Plus Simple)

### Étapes :

1. **Ouvrir Supabase Dashboard**
   - Allez sur https://supabase.com
   - Connectez-vous
   - Sélectionnez votre projet

2. **Ouvrir SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche
   - Cliquez sur "New query"

3. **Copier le SQL**
   - Ouvrez le fichier : `apps/web/prisma/migrations/add_advanced_inbox_features/migration.sql`
   - Sélectionnez tout le contenu (Cmd+A / Ctrl+A)
   - Copiez (Cmd+C / Ctrl+C)

4. **Coller et Exécuter**
   - Collez dans l'éditeur SQL de Supabase
   - Cliquez sur "Run" ou appuyez sur `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

5. **Vérifier le Résultat**
   - Vous devriez voir "Success. No rows returned"
   - Vérifiez qu'il n'y a pas d'erreurs

---

## 🔧 Méthode 3 : Via Terminal (psql)

```bash
cd "/Users/diezowee/whatsapp order"

# Charger DATABASE_URL depuis .env
cd apps/web
source .env 2>/dev/null || true

# Appliquer la migration
psql "$DATABASE_URL" -f prisma/migrations/add_advanced_inbox_features/migration.sql
```

---

## ✅ Après l'Application

Une fois la migration appliquée :

```bash
cd apps/web

# Générer le client Prisma
npx prisma generate

# Vérifier l'état des migrations
npx prisma migrate status
```

---

## 🐛 Dépannage

### Erreur : "type already exists"
✅ **Normal** - La migration utilise `IF NOT EXISTS`, donc c'est sans danger

### Erreur : "column already exists"
✅ **Normal** - La migration utilise `ADD COLUMN IF NOT EXISTS`, donc c'est sans danger

### Erreur : "cannot alter column because it is not null"
⚠️ **Action requise** - Il y a des conversations sans `customerPhone`. La migration essaie de les remplir automatiquement, mais si cela échoue :

```sql
-- Vérifier les conversations sans customerPhone
SELECT id, "customerId", "whatsappPhone" FROM conversations WHERE "customerPhone" IS NULL;

-- Remplir manuellement si nécessaire
UPDATE conversations 
SET "customerPhone" = COALESCE("whatsappPhone", '')
WHERE "customerPhone" IS NULL;
```

### Erreur : "relation does not exist"
❌ **Problème** - Les tables de base n'existent pas. Vous devez d'abord appliquer les migrations de base :

```bash
cd apps/web
npx prisma migrate deploy
```

---

## 📋 Vérification Post-Migration

Vérifiez que tout est bien créé :

```sql
-- Vérifier les nouveaux enums
SELECT typname FROM pg_type WHERE typname IN ('ConversationStatus', 'ConversationPriority', 'MessageType', 'BroadcastStatus', 'MessageSender');

-- Vérifier les nouvelles colonnes dans conversations
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND column_name IN ('status', 'priority', 'assignedToId', 'tags', 'internalNotes');

-- Vérifier les nouvelles tables
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('message_templates', 'broadcasts', 'broadcast_recipients');
```

---

**Date** : 11 janvier 2026  
**Migration** : `add_advanced_inbox_features`
