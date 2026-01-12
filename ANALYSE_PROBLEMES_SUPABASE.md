# 🔍 Analyse des Problèmes Identifiés dans Supabase

**Date** : 11 janvier 2026  
**Agent** : Composer (Cursor AI)

---

## 🎯 Problèmes Identifiés

### ❌ Problème 1 : Table `Restaurant` Absente de la Liste "UNRESTRICTED"

**Observation** :
- La table `Restaurant` (PascalCase) existe dans votre schéma Prisma
- Elle **n'apparaît PAS** dans la liste des tables marquées "UNRESTRICTED" dans Supabase
- D'autres tables comme `categories`, `conversations`, `customers`, `menu_items`, `messages`, `order_items` sont visibles avec le tag "UNRESTRICTED"

**Impact** :
- Cela pourrait expliquer pourquoi l'API retourne parfois des erreurs 404
- La table `Restaurant` pourrait avoir des politiques RLS différentes ou manquantes
- Les accès directs à la base de données pourraient être bloqués

**Solution** :
1. Vérifier que la table `Restaurant` existe bien dans Supabase
2. Vérifier ses politiques RLS
3. S'assurer qu'elle est bien accessible

---

### ❌ Problème 2 : Incohérence de Nommage (PascalCase vs snake_case)

**Observation** :
- **Tables Prisma (PascalCase)** : `Restaurant`, `Order`, `OrderItem`, `Customer`, `Conversation`, `Message`, etc.
- **Tables Database (snake_case)** : `categories`, `conversations`, `customers`, `menu_items`, `messages`, `order_items`

**Explication** :
- Prisma crée les tables avec des guillemets doubles, préservant la casse : `"Restaurant"`
- Certaines tables apparaissent en snake_case dans Supabase, ce qui suggère :
  - Soit elles ont été créées manuellement
  - Soit Supabase les affiche différemment
  - Soit il y a deux schémas différents

**Impact** :
- Confusion lors des requêtes SQL
- Risque d'erreurs de casse dans les politiques RLS
- Difficulté à maintenir la cohérence

**Solution** :
1. Vérifier le schéma exact dans Supabase : `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
2. Uniformiser le nommage si nécessaire
3. Utiliser toujours des guillemets doubles dans les requêtes SQL

---

### ❌ Problème 3 : Typo dans `Orderltem`

**Observation** :
- Dans la liste, il y a `Orderltem` (avec un 'l' minuscule) au lieu de `OrderItem`
- La table correspondante en snake_case est `order_items`

**Impact** :
- Erreurs potentielles dans le code si vous référencez `Orderltem`
- Confusion lors du développement

**Solution** :
- Vérifier si c'est juste un problème d'affichage dans Supabase
- Si c'est réel, corriger dans le schéma Prisma et recréer la table

---

### ❌ Problème 4 : Colonnes camelCase vs snake_case

**Observation** :
- Les colonnes Prisma sont en camelCase : `isActive`, `isAvailable`, `restaurantId`, etc.
- PostgreSQL peut les interpréter différemment selon la casse

**Impact** :
- Erreur `column "isactive" does not exist` (que nous venons de corriger)
- Besoin d'utiliser des guillemets doubles dans toutes les requêtes SQL

**Solution** :
- ✅ Déjà corrigé dans `ENABLE_RLS_CORRIGE.sql`
- Toujours utiliser des guillemets doubles pour les colonnes camelCase

---

## 🔍 Vérifications à Effectuer

### 1. Vérifier l'Existence de la Table Restaurant

```sql
-- Dans Supabase SQL Editor
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%estaurant%';
```

### 2. Vérifier les Politiques RLS sur Restaurant

```sql
-- Voir les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'Restaurant';
```

### 3. Vérifier la Casse Exacte des Colonnes

```sql
-- Voir toutes les colonnes de Restaurant
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'Restaurant'
ORDER BY ordinal_position;
```

### 4. Vérifier Toutes les Tables du Schéma

```sql
-- Lister toutes les tables
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## ✅ Actions Recommandées

### Action 1 : Vérifier la Table Restaurant

1. Ouvrez Supabase SQL Editor
2. Exécutez la requête de vérification ci-dessus
3. Si la table n'existe pas, exécutez `APPLY_MIGRATIONS_SAFE.sql`
4. Si elle existe mais n'apparaît pas, vérifiez les permissions

### Action 2 : Uniformiser le Nommage

1. Décider d'une convention : PascalCase (comme Prisma) ou snake_case
2. Si vous choisissez PascalCase, utiliser toujours des guillemets doubles
3. Mettre à jour toutes les requêtes SQL en conséquence

### Action 3 : Activer RLS Correctement

1. Exécuter `ENABLE_RLS_CORRIGE.sql` (version corrigée)
2. Vérifier que toutes les tables ont RLS activé
3. Vérifier que les politiques sont correctes

### Action 4 : Corriger la Typo Orderltem

1. Vérifier si c'est réel ou juste un problème d'affichage
2. Si réel, corriger dans le schéma Prisma
3. Créer une migration pour renommer si nécessaire

---

## 📋 Checklist de Vérification

- [ ] Table `Restaurant` existe dans Supabase
- [ ] Table `Restaurant` apparaît dans la liste des tables
- [ ] Politiques RLS vérifiées pour `Restaurant`
- [ ] Nommage uniformisé (PascalCase ou snake_case)
- [ ] Typo `Orderltem` vérifiée et corrigée si nécessaire
- [ ] Colonnes camelCase correctement référencées avec guillemets doubles
- [ ] Script RLS exécuté avec succès
- [ ] API testée après corrections

---

## 🚨 Problème le Plus Critique

**La table `Restaurant` absente de la liste "UNRESTRICTED"** est le problème le plus critique car :

1. Elle pourrait expliquer les erreurs 404
2. Elle pourrait avoir des politiques RLS différentes
3. Elle pourrait ne pas être accessible correctement

**Action immédiate recommandée** :
1. Vérifier l'existence de la table `Restaurant`
2. Vérifier ses politiques RLS
3. S'assurer qu'elle est accessible

---

**Dernière mise à jour** : 11 janvier 2026
