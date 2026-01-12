# 🔍 Analyse des Politiques RLS - Table Restaurant

**Date** : 11 janvier 2026  
**Agent** : Composer (Cursor AI)

---

## ✅ État Actuel

Les politiques RLS sont **activées** sur la table `Restaurant` avec 2 politiques :

### Politique 1 : Lecture Publique ✅
```sql
"Restaurants are viewable by everyone"
- Type: SELECT
- Condition: "isActive" = true
- Statut: ✅ Correcte
```

### Politique 2 : Mise à Jour par Utilisateurs ⚠️
```sql
"Restaurants can be updated by restaurant users"
- Type: UPDATE
- Condition: EXISTS (SELECT 1 FROM "User" 
              WHERE "User"."restaurantId" = "Restaurant".id 
              AND "User"."id" = auth.uid()::text)
- Statut: ⚠️ Incohérence de syntaxe détectée
```

---

## ⚠️ Problème Identifié

Dans la **politique 2**, il y a une **incohérence de syntaxe** :

```sql
WHERE "User"."restaurantId" = "Restaurant".id
                                    ^^^
                          Manque les guillemets doubles
```

**Problème** :
- `"Restaurant".id` devrait être `"Restaurant"."id"` pour être cohérent
- Bien que `id` ne soit pas en camelCase et fonctionne sans guillemets, il est préférable d'être cohérent avec le reste du code

---

## ✅ Solution

J'ai créé un script de correction : `CORRECTION_POLITIQUES_RESTAURANT.sql`

Ce script :
1. ✅ Supprime les politiques existantes
2. ✅ Recrée les politiques avec la syntaxe correcte
3. ✅ Utilise des guillemets doubles pour toutes les colonnes (cohérence)
4. ✅ Vérifie les politiques créées

---

## 🚀 Instructions

### Étape 1 : Exécuter le Script de Correction

1. Ouvrez Supabase SQL Editor
2. Copiez le contenu de `CORRECTION_POLITIQUES_RESTAURANT.sql`
3. Exécutez le script
4. Vérifiez qu'il n'y a pas d'erreurs

### Étape 2 : Vérifier les Politiques

Le script affiche automatiquement les politiques créées. Vous devriez voir :

```json
[
  {
    "policyname": "Restaurants are viewable by everyone",
    "cmd": "SELECT",
    "qual": "(\"isActive\" = true)"
  },
  {
    "policyname": "Restaurants can be updated by restaurant users",
    "cmd": "UPDATE",
    "qual": "(EXISTS (SELECT 1 FROM \"User\" WHERE \"User\".\"restaurantId\" = \"Restaurant\".\"id\" AND \"User\".\"id\" = (auth.uid())::text)))"
  }
]
```

---

## 📋 Vérification Complète

Pour vérifier toutes les politiques RLS sur toutes les tables :

```sql
-- Voir toutes les politiques
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## ⚠️ Note Importante

**Les politiques utilisent `auth.uid()`** qui fonctionne avec **Supabase Auth**.

Comme vous utilisez votre propre système JWT :
- ✅ Votre API backend utilise la **Service Role Key** qui bypass RLS
- ✅ Les politiques RLS protègent contre les accès directs à la base de données
- ✅ Votre API continue de fonctionner normalement

---

## ✅ Résultat Attendu

Après correction :
- ✅ Politiques RLS cohérentes et correctes
- ✅ Syntaxe uniforme (guillemets doubles partout)
- ✅ Protection contre les accès non autorisés
- ✅ API backend fonctionne toujours (Service Role Key)

---

**Dernière mise à jour** : 11 janvier 2026
