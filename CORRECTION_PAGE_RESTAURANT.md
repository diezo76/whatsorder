# 🔧 Correction - Page Restaurant "Introuvable"

**Problème** : Quand on clique sur "Essayer la démo", la page affiche "Restaurant non trouvé"

**Cause** : Les routes API publiques manquaient ou le restaurant n'existe pas dans Supabase

---

## ✅ Solution Appliquée

### 1. Routes API Créées ✅

**Fichiers créés** :
- ✅ `apps/web/app/api/public/restaurants/[slug]/route.ts`
- ✅ `apps/web/app/api/public/restaurants/[slug]/menu/route.ts`

**Fonctionnalités** :
- ✅ Récupération du restaurant par slug depuis Supabase
- ✅ Récupération du menu (catégories + items)
- ✅ Filtrage des restaurants actifs uniquement
- ✅ Format de réponse compatible avec le frontend

---

## 🔍 Vérifications à Faire

### 1. Vérifier que le Restaurant Existe dans Supabase

**Option A : Via Supabase Dashboard**

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. **Table Editor** → Table `Restaurant`
4. Vérifier qu'il y a un restaurant avec :
   - **slug** : `nile-bites`
   - **isActive** : `true`

**Option B : Via SQL Editor**

```sql
SELECT id, name, slug, "isActive" 
FROM "Restaurant" 
WHERE slug = 'nile-bites';
```

**Si le restaurant n'existe pas**, créez-le :

```sql
INSERT INTO "Restaurant" (
  id, name, slug, phone, email, address, 
  currency, timezone, language, "isActive"
) VALUES (
  gen_random_uuid(),
  'Nile Bites',
  'nile-bites',
  '+201234567890',
  'contact@nilebites.com',
  'Cairo, Egypt',
  'EGP',
  'Africa/Cairo',
  'ar',
  true
);
```

---

### 2. Tester les Routes API

**Test 1 : Restaurant**

```bash
curl https://whatsorder-9uimunnpu-diiezos-projects.vercel.app/api/public/restaurants/nile-bites
```

**Résultat attendu** : JSON avec les données du restaurant

**Test 2 : Menu**

```bash
curl https://whatsorder-9uimunnpu-diiezos-projects.vercel.app/api/public/restaurants/nile-bites/menu
```

**Résultat attendu** : JSON avec les catégories et items

---

### 3. Vérifier les Variables d'Environnement

Sur Vercel Dashboard → Settings → Environment Variables :

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (important pour les API Routes)

---

## 🐛 Dépannage

### Erreur : "Restaurant not found"

**Causes possibles** :
1. Le restaurant n'existe pas dans Supabase
2. Le slug est incorrect (vérifier la casse)
3. Le restaurant n'est pas actif (`isActive = false`)
4. Variables d'environnement manquantes

**Solutions** :
1. Créer le restaurant (voir SQL ci-dessus)
2. Vérifier le slug exact dans Supabase
3. Mettre `isActive = true`
4. Vérifier les variables sur Vercel

---

### Erreur : "Failed to fetch menu"

**Causes possibles** :
1. Pas de catégories dans la base
2. Erreur de requête Supabase
3. Problème de format des données

**Solutions** :
1. Créer des catégories de test :

```sql
-- Récupérer l'ID du restaurant
SELECT id FROM "Restaurant" WHERE slug = 'nile-bites';

-- Créer une catégorie (remplacer RESTAURANT_ID)
INSERT INTO "Category" (
  id, name, slug, "restaurantId", "isActive", "sortOrder"
) VALUES (
  gen_random_uuid(),
  'Plats Principaux',
  'plats-principaux',
  'RESTAURANT_ID',
  true,
  1
);
```

---

### Erreur : Variables d'environnement manquantes

**Vérifier sur Vercel** :

```bash
vercel env ls
```

**Ajouter si manquantes** :

```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Coller la clé depuis Supabase Dashboard → Settings → API
```

---

## ✅ Checklist de Validation

- [ ] Restaurant `nile-bites` existe dans Supabase
- [ ] Restaurant a `isActive = true`
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Route `/api/public/restaurants/nile-bites` retourne 200
- [ ] Route `/api/public/restaurants/nile-bites/menu` retourne 200
- [ ] Page `/nile-bites` s'affiche correctement

---

## 🧪 Test Complet

1. **Ouvrir** : https://whatsorder-9uimunnpu-diiezos-projects.vercel.app
2. **Cliquer** sur "Essayer la démo"
3. **Vérifier** que la page du restaurant s'affiche

**Si ça ne marche toujours pas** :
- Ouvrir la console du navigateur (F12)
- Vérifier les erreurs dans l'onglet Console
- Vérifier les requêtes dans l'onglet Network

---

## 📝 Résumé des Changements

### Fichiers Créés
1. ✅ `apps/web/app/api/public/restaurants/[slug]/route.ts`
2. ✅ `apps/web/app/api/public/restaurants/[slug]/menu/route.ts`

### Fichiers Modifiés
- Aucun (nouveaux fichiers)

---

**Les routes API sont créées et déployées ! Il reste à vérifier que le restaurant existe dans Supabase.** 🚀
