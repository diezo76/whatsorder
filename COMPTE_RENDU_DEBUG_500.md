# 📋 Compte Rendu - Debug Erreur 500 Restaurant API

**Date** : 12 janvier 2026  
**Agent** : Assistant IA  
**Problème** : Erreur 500 sur `/api/public/restaurants/nile-bites`  
**Statut** : ✅ CODE CORRIGÉ

---

## 🔍 Problème Identifié

**Erreur** :
```
Failed to load resource: the server responded with a status of 500
Error fetching restaurant data: G
```

**Causes possibles** :
1. `SUPABASE_SERVICE_ROLE_KEY` manquante sur Vercel
2. `supabaseAdmin` est `null` (pas de vérification)
3. Gestion d'erreurs insuffisante
4. Restaurant n'existe pas dans Supabase

---

## ✅ Corrections Appliquées

### 1. Vérification de `supabaseAdmin` ✅

**Avant** :
```typescript
const { data, error } = await supabaseAdmin!.from('Restaurant')...
```

**Problème** : Utilisation de `!` sans vérification, peut causer une erreur si `null`

**Après** :
```typescript
if (!supabaseAdmin) {
  return NextResponse.json(
    { error: 'Server configuration error' },
    { status: 500 }
  );
}
const { data, error } = await supabaseAdmin.from('Restaurant')...
```

---

### 2. Gestion d'Erreurs Améliorée ✅

**Améliorations** :
- ✅ Détection du code d'erreur Supabase `PGRST116` (not found)
- ✅ Messages d'erreur plus clairs
- ✅ Logs détaillés pour debugging
- ✅ Gestion des erreurs pour les users (non critique)

**Code** :
```typescript
if (restaurantError) {
  console.error('Error fetching restaurant:', restaurantError);
  if (restaurantError.code === 'PGRST116') {
    return NextResponse.json(
      { error: 'Restaurant not found' },
      { status: 404 }
    );
  }
  return NextResponse.json(
    { error: restaurantError.message || 'Failed to fetch restaurant' },
    { status: 500 }
  );
}
```

---

### 3. Gestion des Items de Menu ✅

**Améliorations** :
- ✅ Vérification `supabaseAdmin` dans la boucle Promise.all
- ✅ Gestion d'erreurs pour chaque catégorie
- ✅ Retourne tableau vide si erreur (non bloquant)

---

## 📝 Fichiers Modifiés

1. ✅ `apps/web/app/api/public/restaurants/[slug]/route.ts`
   - Vérification `supabaseAdmin`
   - Gestion d'erreurs améliorée
   - Logs détaillés

2. ✅ `apps/web/app/api/public/restaurants/[slug]/menu/route.ts`
   - Vérification `supabaseAdmin`
   - Gestion d'erreurs pour catégories et items
   - Vérification dans Promise.all

---

## ⚠️ Action Requise

### Vérifier les Variables d'Environnement sur Vercel

**Variable critique** : `SUPABASE_SERVICE_ROLE_KEY`

**Comment vérifier** :
1. Vercel Dashboard → Projet → Settings → Environment Variables
2. Vérifier que `SUPABASE_SERVICE_ROLE_KEY` existe
3. Si manquante, l'ajouter depuis Supabase Dashboard → Settings → API → service_role key

**Comment ajouter** :
```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Coller la clé depuis Supabase
```

---

## 🧪 Tests à Effectuer

### Test 1 : API Restaurant

```bash
curl https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app/api/public/restaurants/nile-bites
```

**Résultats possibles** :
- ✅ 200 : Restaurant trouvé
- ❌ 404 : Restaurant n'existe pas
- ❌ 500 : Variable d'environnement manquante ou erreur serveur

### Test 2 : API Menu

```bash
curl https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app/api/public/restaurants/nile-bites/menu
```

### Test 3 : Frontend

1. Ouvrir le site
2. Cliquer sur "Essayer la démo"
3. Vérifier la console (F12) pour les erreurs

---

## 📊 Diagnostic

### Si Erreur 500 Persiste

1. **Vérifier les logs Vercel** :
   ```bash
   vercel logs https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app
   ```

2. **Vérifier les variables** :
   ```bash
   vercel env ls
   ```

3. **Vérifier Supabase** :
   - Restaurant existe ?
   - `isActive = true` ?
   - RLS désactivé ou politiques correctes ?

---

## ✅ Résultat Attendu

Après correction et vérification des variables :

- ✅ API retourne 200 (pas 500)
- ✅ Données du restaurant retournées
- ✅ Page `/nile-bites` s'affiche correctement
- ✅ Menu s'affiche (si catégories/items créés)

---

## 📚 Documentation Créée

1. ✅ `DEBUG_ERREUR_500_RESTAURANT.md` - Guide de dépannage complet
2. ✅ `COMPTE_RENDU_DEBUG_500.md` - Ce fichier

---

**Le code est corrigé et déployé ! Il reste à vérifier les variables d'environnement sur Vercel.** 🚀

*Consultez `DEBUG_ERREUR_500_RESTAURANT.md` pour le guide complet de dépannage.*
