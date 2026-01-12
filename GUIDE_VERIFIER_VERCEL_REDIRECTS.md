# Guide - Vérifier et Corriger les Redirects Vercel

## 🔍 ÉTAPE 1 : Accéder aux Settings Vercel

1. **Ouvrez** : https://vercel.com/dashboard
2. **Connectez-vous** avec votre compte
3. **Sélectionnez votre projet** : whataybo (ou le nom de votre projet)

## 🔍 ÉTAPE 2 : Vérifier les Redirects

1. **Cliquez sur "Settings"** (en haut de la page)
2. **Dans le menu de gauche**, cliquez sur **"Redirects"**

### Ce que vous devez voir :

**Si vous voyez des redirects**, vérifiez s'il y a :
- ❌ Un redirect de `/` vers `/login`
- ❌ Un redirect de `/` vers `/dashboard`
- ❌ Tout autre redirect qui touche la route `/`

### Si vous trouvez un redirect problématique :

1. **Cliquez sur les 3 points** (⋯) à droite du redirect
2. **Cliquez sur "Delete"** ou "Supprimer"
3. **Confirmez la suppression**

### Si vous ne voyez AUCUN redirect :

C'est bon ! Le problème vient peut-être d'ailleurs (cache, etc.)

## 🔍 ÉTAPE 3 : Vérifier les Rewrites

1. **Toujours dans Settings**, cliquez sur **"Rewrites"**

### Ce que vous devez voir :

**Si vous voyez des rewrites**, vérifiez qu'ils ne causent pas de problème.

**Normalement**, vous ne devriez pas avoir de rewrite de `/` vers autre chose.

## 🔍 ÉTAPE 4 : Vérifier les Headers

1. **Toujours dans Settings**, cliquez sur **"Headers"**

### Ce que vous devez voir :

Les headers ne devraient pas causer de redirection, mais vérifiez quand même.

## 🔍 ÉTAPE 5 : Vérifier les Domains

1. **Toujours dans Settings**, cliquez sur **"Domains"**

### Vérifications :

- ✅ Le domaine `whataybo.com` est bien configuré
- ✅ Le statut est "Active" avec ✅
- ✅ Pas de redirects configurés au niveau du domaine

## 🔍 ÉTAPE 6 : Vérifier les Deployments

1. **Allez dans l'onglet "Deployments"** (en haut)
2. **Vérifiez le dernier déploiement** :
   - ✅ Statut : "Ready" (vert)
   - ✅ Pas d'erreurs dans les logs
   - ✅ Le commit avec la landing page est bien déployé

### Si le dernier déploiement est ancien :

1. **Cliquez sur les 3 points** (⋯) du dernier déploiement
2. **Cliquez sur "Redeploy"**
3. **Attendez** 2-3 minutes

## 🔍 ÉTAPE 7 : Vérifier les Environment Variables

1. **Settings → Environment Variables**

### Vérifications :

- Vérifiez qu'il n'y a pas de variable qui pourrait causer une redirection
- Vérifiez que `NEXT_PUBLIC_API_URL` est correct (ou pas défini si API sur même domaine)

## ✅ Solution si vous trouvez un Redirect

### Option 1 : Supprimer le Redirect

1. **Settings → Redirects**
2. **Trouvez le redirect** de `/` vers `/login`
3. **Cliquez sur les 3 points** (⋯)
4. **Cliquez sur "Delete"**
5. **Sauvegardez**

### Option 2 : Modifier le Redirect

Si vous ne pouvez pas supprimer, modifiez-le pour qu'il ne touche pas `/` :

**Au lieu de** :
```
Source: /
Destination: /login
```

**Changez en** :
```
Source: /old-page
Destination: /login
```

## 🚨 Si vous ne trouvez AUCUN redirect dans Vercel

Le problème vient probablement de :

1. **Cache du navigateur** :
   - Videz complètement le cache
   - Testez en navigation privée

2. **Cache Vercel** :
   - Faites un nouveau déploiement pour forcer le cache à se vider

3. **Ancien déploiement** :
   - Vérifiez que le dernier déploiement contient bien la landing page
   - Redéployez si nécessaire

4. **Domaine incorrect** :
   - Utilisez `https://whataybo.com` (pas `whatsorder.com`)

## 📋 Checklist Complète

- [ ] Redirects Vercel vérifiés (Settings → Redirects)
- [ ] Aucun redirect de `/` vers `/login` trouvé
- [ ] Rewrites Vercel vérifiés (Settings → Rewrites)
- [ ] Headers Vercel vérifiés (Settings → Headers)
- [ ] Domains vérifiés (Settings → Domains)
- [ ] Dernier déploiement vérifié (Deployments)
- [ ] Environment Variables vérifiés (Settings → Environment Variables)
- [ ] Cache navigateur vidé
- [ ] Testé en navigation privée
- [ ] Domaine correct utilisé (`whataybo.com`)

## 🔧 Actions à Prendre

### Si vous trouvez un redirect :

1. **Supprimez-le** immédiatement
2. **Redéployez** si nécessaire
3. **Videz le cache** du navigateur
4. **Testez** : `https://whataybo.com`

### Si vous ne trouvez pas de redirect :

1. **Redéployez** pour forcer le cache à se vider :
   ```bash
   git add .
   git commit -m "fix: Force redeploy to clear cache"
   git push origin main
   ```

2. **Videz complètement le cache** du navigateur

3. **Testez en navigation privée**

4. **Vérifiez le code source** :
   - Ouvrez `https://whataybo.com`
   - Ctrl+U pour voir le code source
   - Recherchez "LandingPage" ou "Whataybo"
   - Si vous ne trouvez pas ces mots, l'ancienne version est encore déployée

## 📸 Screenshots à Prendre (pour debug)

Si le problème persiste, prenez des screenshots de :

1. **Settings → Redirects** (pour voir s'il y a des redirects)
2. **Deployments** (pour voir le dernier déploiement)
3. **Le code source** de `https://whataybo.com` (Ctrl+U)

Ces screenshots aideront à identifier le problème.

---

**Important** : Le fichier `vercel.json` a été mis à jour pour empêcher les redirects. Après avoir vérifié dans Vercel, déployez les changements.
