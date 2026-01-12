# 🔧 Debug - Erreur 500 sur /api/public/restaurants/nile-bites

**Erreur** : `Failed to load resource: the server responded with a status of 500`

**Cause probable** : Variable d'environnement `SUPABASE_SERVICE_ROLE_KEY` manquante ou incorrecte

---

## ✅ Corrections Appliquées

### 1. Gestion d'Erreurs Améliorée ✅

**Fichiers modifiés** :
- ✅ `apps/web/app/api/public/restaurants/[slug]/route.ts`
- ✅ `apps/web/app/api/public/restaurants/[slug]/menu/route.ts`

**Améliorations** :
- ✅ Vérification que `supabaseAdmin` n'est pas `null`
- ✅ Gestion d'erreurs détaillée avec codes d'erreur Supabase
- ✅ Logs d'erreur améliorés pour le debugging
- ✅ Messages d'erreur plus clairs

---

## 🔍 Vérifications à Faire

### 1. Vérifier les Variables d'Environnement sur Vercel

**Ouvrir** : https://vercel.com/dashboard → Projet `whatsorder-web` → Settings → Environment Variables

**Variables requises** :
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **CRITIQUE pour les API Routes**
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `NODE_ENV`

**Si `SUPABASE_SERVICE_ROLE_KEY` manque** :

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. **Settings** → **API**
4. Copier la **`service_role` key** (⚠️ Ne pas utiliser l'anon key)
5. Sur Vercel, ajouter :
   - **Key** : `SUPABASE_SERVICE_ROLE_KEY`
   - **Value** : La clé service_role
   - **Environment** : Production (et Preview si nécessaire)
6. **Redéployer** :

```bash
vercel --prod
```

---

### 2. Vérifier que le Restaurant Existe

**Via Supabase SQL Editor** :

```sql
SELECT id, name, slug, "isActive" 
FROM "Restaurant" 
WHERE slug = 'nile-bites';
```

**Si le restaurant n'existe pas**, exécuter le script :

```sql
-- Copier le contenu de scripts/create-demo-restaurant-simple.sql
-- Et l'exécuter dans Supabase SQL Editor
```

---

### 3. Tester l'API Directement

**Test 1 : Restaurant**

```bash
curl https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app/api/public/restaurants/nile-bites
```

**Résultat attendu** :
- ✅ Status 200 avec JSON du restaurant
- ❌ Status 500 = Variable d'environnement manquante
- ❌ Status 404 = Restaurant n'existe pas

**Test 2 : Menu**

```bash
curl https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app/api/public/restaurants/nile-bites/menu
```

---

## 🐛 Dépannage par Erreur

### Erreur 500 avec "Server configuration error"

**Cause** : `SUPABASE_SERVICE_ROLE_KEY` manquante

**Solution** :
1. Ajouter la variable sur Vercel (voir ci-dessus)
2. Redéployer

---

### Erreur 500 avec message Supabase

**Cause** : Erreur de connexion ou requête Supabase

**Solution** :
1. Vérifier les logs Vercel :
   ```bash
   vercel logs https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app
   ```
2. Vérifier que les noms de colonnes sont corrects
3. Vérifier que RLS n'est pas trop restrictif

---

### Erreur 404 "Restaurant not found"

**Cause** : Le restaurant n'existe pas ou n'est pas actif

**Solution** :
1. Créer le restaurant avec le script SQL
2. Vérifier que `isActive = true`

---

## 📊 Vérification Complète

### Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` ajoutée sur Vercel
- [ ] Restaurant `nile-bites` existe dans Supabase
- [ ] Restaurant a `isActive = true`
- [ ] Variables d'environnement redéployées
- [ ] Test API retourne 200 (pas 500)

---

## 🧪 Test Complet

### 1. Test API

```bash
# Test restaurant
curl -v https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app/api/public/restaurants/nile-bites

# Test menu
curl -v https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app/api/public/restaurants/nile-bites/menu
```

### 2. Test Frontend

1. Ouvrir : https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app
2. Ouvrir DevTools (F12) → Console
3. Cliquer sur "Essayer la démo"
4. Vérifier les erreurs dans la console

---

## 🔧 Solution Rapide

**Si l'erreur persiste** :

1. **Vérifier les variables** :
   ```bash
   vercel env ls
   ```

2. **Ajouter SUPABASE_SERVICE_ROLE_KEY** :
   ```bash
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   # Coller la clé depuis Supabase Dashboard
   ```

3. **Redéployer** :
   ```bash
   vercel --prod
   ```

4. **Tester** :
   ```bash
   curl https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app/api/public/restaurants/nile-bites
   ```

---

## 📝 Résumé des Corrections

### Code Modifié

1. ✅ Vérification `supabaseAdmin !== null`
2. ✅ Gestion d'erreurs améliorée
3. ✅ Codes d'erreur Supabase gérés
4. ✅ Logs détaillés pour debugging

### Actions Requises

1. ⚠️ Vérifier `SUPABASE_SERVICE_ROLE_KEY` sur Vercel
2. ⚠️ Créer le restaurant dans Supabase (si pas fait)
3. ⚠️ Redéployer après ajout de variables

---

**Le code est corrigé ! Il reste à vérifier les variables d'environnement sur Vercel.** 🚀
