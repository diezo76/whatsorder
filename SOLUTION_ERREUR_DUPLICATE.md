# 🔧 Solution - Erreur Duplicate Key

**Erreur** : `duplicate key value violates unique constraint "MenuItem_categoryId_slug_key"`

**Cause** : Le script SQL essaie d'insérer des items qui existent déjà dans la base de données.

---

## ✅ Solution

### Script SQL Corrigé Créé

**Fichier** : `scripts/create-demo-restaurant-safe.sql`

**Améliorations** :
- ✅ Utilise `ON CONFLICT DO UPDATE` pour gérer les doublons
- ✅ Vérifie l'existence avant d'insérer
- ✅ Met à jour les données existantes au lieu de créer des doublons
- ✅ Préserve les IDs existants

---

## 🚀 Utilisation

### Option 1 : Utiliser le Nouveau Script (Recommandé)

1. **Ouvrir Supabase SQL Editor**
2. **Copier** le contenu de `scripts/create-demo-restaurant-safe.sql`
3. **Exécuter** le script

**Résultat** :
- ✅ Crée le restaurant s'il n'existe pas
- ✅ Met à jour le restaurant s'il existe déjà
- ✅ Crée les catégories si elles n'existent pas
- ✅ Met à jour les items existants au lieu de créer des doublons

---

### Option 2 : Supprimer les Doublons Manuellement

Si vous préférez nettoyer d'abord :

```sql
-- Supprimer les items existants pour recommencer proprement
DELETE FROM "MenuItem" 
WHERE "categoryId" IN (
  SELECT id FROM "Category" 
  WHERE "restaurantId" = (SELECT id FROM "Restaurant" WHERE slug = 'nile-bites')
);

-- Puis exécuter le script original
```

---

## 🔍 Vérification

Après exécution du script, vérifier :

```sql
SELECT 
  r.name as restaurant,
  COUNT(DISTINCT c.id) as categories,
  COUNT(DISTINCT m.id) as items
FROM "Restaurant" r
LEFT JOIN "Category" c ON c."restaurantId" = r.id
LEFT JOIN "MenuItem" m ON m."categoryId" = c.id
WHERE r.slug = 'nile-bites'
GROUP BY r.id, r.name;
```

**Résultat attendu** :
- restaurant: Nile Bites
- categories: 3
- items: 3

---

## ✅ Test Final

1. **Tester l'API** :
   ```bash
   curl https://whatsorder-otk1qzb6g-diiezos-projects.vercel.app/api/public/restaurants/nile-bites
   ```

2. **Tester la page** :
   - Ouvrir : https://whatsorder-otk1qzb6g-diiezos-projects.vercel.app
   - Cliquer sur "Essayer la démo"
   - La page devrait s'afficher avec le menu

---

**Utilisez le script `create-demo-restaurant-safe.sql` qui gère automatiquement les conflits ! 🚀**
