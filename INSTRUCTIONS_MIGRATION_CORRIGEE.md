# ✅ Instructions - Migration Corrigée

## ⚠️ Problème Résolu

Vous avez rencontré l'erreur : `type "UserRole" already exists`

Cela signifie que certains types ENUM ont déjà été créés lors d'une tentative précédente.

---

## ✅ Solution : Utiliser le Fichier Sécurisé

J'ai créé **deux versions** du fichier SQL :

### Version 1 : `APPLY_MIGRATIONS.sql` (avec DROP)
- ✅ Supprime les types existants avant de les recréer
- ⚠️ **Attention** : Peut supprimer des données si des tables utilisent ces types

### Version 2 : `APPLY_MIGRATIONS_SAFE.sql` (Recommandé) ⭐
- ✅ Vérifie si les types existent avant de les créer
- ✅ Ne supprime rien
- ✅ Sécurisé pour réexécution multiple
- ✅ Gère aussi les contraintes existantes

---

## 🚀 Instructions

### Option A : Utiliser le Fichier Sécurisé (Recommandé)

1. **Ouvrez Supabase SQL Editor**
   - https://supabase.com → votre projet → SQL Editor → New Query

2. **Copiez le fichier sécurisé**
   - Ouvrez : `apps/api/prisma/migrations/APPLY_MIGRATIONS_SAFE.sql`
   - Copiez tout le contenu (Cmd+A puis Cmd+C)
   - Collez dans l'éditeur SQL de Supabase

3. **Exécutez**
   - Cliquez sur **Run** (ou Cmd+Enter)
   - ✅ Aucune erreur ne devrait apparaître, même si les types existent déjà

### Option B : Utiliser le Fichier avec DROP

Si vous préférez supprimer et recréer les types :

1. **Ouvrez Supabase SQL Editor**
2. **Copiez** : `apps/api/prisma/migrations/APPLY_MIGRATIONS.sql`
3. **Exécutez**

⚠️ **Note** : Cette version supprimera les types existants. Si des tables utilisent ces types, elles seront aussi supprimées.

---

## 🔍 Vérification

Après l'exécution, vérifiez dans Supabase Dashboard > Table Editor :

- ✅ Restaurant
- ✅ User
- ✅ Category
- ✅ MenuItem
- ✅ Customer
- ✅ Order
- ✅ OrderItem
- ✅ Conversation
- ✅ Message
- ✅ InternalNote
- ✅ Workflow
- ✅ WorkflowExecution
- ✅ Campaign
- ✅ DailyAnalytics

---

## 🎯 Prochaines Étapes

Une fois les migrations appliquées :

1. **Redémarrer le serveur API**
   ```bash
   cd "/Users/diezowee/whatsapp order"
   pnpm --filter api dev
   ```

2. **Tester la route**
   ```bash
   curl http://localhost:4000/api/public/restaurants/nile-bites
   ```

3. **(Optionnel) Seed la base**
   ```bash
   cd apps/api
   pnpm db:seed
   ```

---

**Utilisez `APPLY_MIGRATIONS_SAFE.sql` pour éviter toute erreur !** 🎉
