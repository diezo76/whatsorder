# ✅ Instructions - Script RLS Corrigé

## ⚠️ Problème Résolu

L'erreur `column "isactive" does not exist` était due à la casse des colonnes. PostgreSQL est sensible à la casse quand les colonnes sont créées avec des guillemets doubles.

## ✅ Solution

J'ai créé une **version corrigée** du script : `ENABLE_RLS_CORRIGE.sql`

### Changements Effectués

1. ✅ **Toutes les colonnes camelCase** sont maintenant correctement référencées avec des guillemets doubles :
   - `"isActive"` au lieu de `isActive`
   - `"isAvailable"` au lieu de `isAvailable`
   - `"restaurantId"` au lieu de `restaurantId`
   - etc.

2. ✅ **Suppression des politiques existantes** avant création (évite les conflits)

3. ✅ **Toutes les références de colonnes** sont maintenant correctes

---

## 🚀 Instructions d'Utilisation

### Étape 1 : Ouvrir Supabase SQL Editor

1. Allez sur https://supabase.com
2. Ouvrez votre projet
3. Cliquez sur **SQL Editor** > **New Query**

### Étape 2 : Copier le Script Corrigé

1. Ouvrez le fichier : `apps/api/prisma/migrations/ENABLE_RLS_CORRIGE.sql`
2. Copiez **tout le contenu** (Cmd+A puis Cmd+C)
3. Collez dans l'éditeur SQL de Supabase

### Étape 3 : Exécuter

1. Cliquez sur **Run** (ou Cmd+Enter)
2. Vérifiez qu'il n'y a **aucune erreur**
3. Vous devriez voir un message de succès

### Étape 4 : Vérifier

1. Allez dans **Table Editor**
2. Sélectionnez une table (ex: `Order`)
3. Vous devriez voir **"RLS enabled"** au lieu de **"RLS disabled"**
4. Les tables ne devraient plus être marquées "UNRESTRICTED"

---

## 🔍 Vérification des Colonnes

Si vous voulez vérifier la casse exacte des colonnes dans votre base de données :

```sql
-- Dans Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Restaurant' 
AND column_name LIKE '%active%';
```

Cela vous montrera exactement comment les colonnes sont nommées.

---

## ⚠️ Note Importante

Le script utilise `auth.uid()` qui fonctionne avec **Supabase Auth**.

Comme vous utilisez votre propre système JWT, votre API backend continuera de fonctionner car elle utilise la **Service Role Key** qui bypass RLS.

Les politiques RLS protègent contre les accès directs à la base de données, mais votre API (qui utilise la Service Role Key) n'est pas affectée.

---

## 🐛 En Cas d'Erreur

Si vous obtenez encore une erreur :

1. **Vérifiez la casse exacte** des colonnes avec la requête SQL ci-dessus
2. **Vérifiez les logs** dans Supabase Dashboard > Logs
3. **Exécutez le script par sections** si nécessaire (une table à la fois)

---

**Le script corrigé devrait maintenant fonctionner sans erreur !** ✅
