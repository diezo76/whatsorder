# 🚨 Solution Critique - Toutes les Routes API retournent 404 sur Vercel

**Date** : 12 janvier 2026  
**Problème** : Toutes les routes API dans `app/api/` retournent 404 sur Vercel  
**Impact** : `/api/auth/health`, `/api/restaurant`, `/api/conversations`, etc. - toutes retournent 404

---

## 🔍 Diagnostic

### Test Effectué

```bash
# Toutes ces routes retournent 404 :
curl https://whatsorder-web.vercel.app/api/auth/health      # 404
curl https://whatsorder-web.vercel.app/api/restaurant       # 404
curl https://whatsorder-web.vercel.app/api/conversations    # 404
```

### Cause Probable

**Le Root Directory n'est pas correctement configuré dans Vercel**, ou **Vercel ne détecte pas les routes API dans App Router**.

---

## ✅ Solution : Vérifier et Corriger la Configuration Vercel

### Étape 1 : Vérifier le Root Directory

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet **whatsorder-web**
3. Cliquez sur **Settings** → **General**
4. Vérifiez la section **Root Directory**

**Doit être** : `apps/web`  
**Si c'est** : `.` ou vide → **PROBLÈME TROUVÉ !**

### Étape 2 : Corriger le Root Directory

1. Cliquez sur **Edit** à côté de Root Directory
2. Tapez : `apps/web`
3. Cliquez sur **Save**

### Étape 3 : Vérifier les Build Settings

Dans **Settings** → **General** → **Build & Development Settings**, vérifiez :

- **Framework Preset** : `Next.js` (devrait être détecté automatiquement)
- **Build Command** : `npm run build` ou `cd apps/web && npm run build`
- **Output Directory** : `.next` ou `apps/web/.next`
- **Install Command** : `npm install` ou `cd apps/web && npm install`

### Étape 4 : Redéployer avec Cache Vidé

1. Allez dans **Deployments**
2. Cliquez sur les **"..."** du dernier déploiement
3. Cliquez sur **Redeploy**
4. **IMPORTANT** : **Décochez** "Use existing Build Cache"
5. Cliquez sur **Redeploy**

### Étape 5 : Vérifier les Logs de Build

Pendant le build, vérifiez les logs pour voir :

✅ **Bon signe** :
```
✓ Detected Next.js
✓ Running "npm install" in /vercel/path0/apps/web
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
```

❌ **Mauvais signe** :
```
Running "npm install" in /vercel/path0
(Note: Pas de "apps/web" dans le chemin)
```

---

## 🔧 Solution Alternative : Configuration via vercel.json

Si le Root Directory ne peut pas être configuré dans l'interface, utilisez `vercel.json` :

### Option 1 : vercel.json à la Racine (Recommandé)

**Fichier** : `/vercel.json` (à la racine du repo)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "cd apps/web && npm install --legacy-peer-deps",
  "framework": "nextjs",
  "rootDirectory": "apps/web"
}
```

### Option 2 : vercel.json dans apps/web

**Fichier** : `/apps/web/vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install --legacy-peer-deps"
}
```

**ET** configurez le Root Directory sur `apps/web` dans l'interface Vercel.

---

## 🐛 Dépannage Avancé

### Problème 1 : Routes API toujours 404 après configuration

**Vérifications** :

1. **Le fichier existe bien dans Git** :
   ```bash
   git ls-files apps/web/app/api/auth/health/route.ts
   ```

2. **Le fichier est présent dans le build** :
   - Vérifiez les logs de build Vercel
   - Cherchez des erreurs TypeScript
   - Vérifiez que Next.js détecte les routes API

3. **Test local** :
   ```bash
   cd apps/web
   npm run build
   npm start
   curl http://localhost:3000/api/auth/health
   ```
   Si ça fonctionne localement mais pas sur Vercel → Problème de configuration Vercel

### Problème 2 : Build échoue

**Vérifications** :

1. **Variables d'environnement** :
   - Vérifiez que toutes les variables nécessaires sont définies dans Vercel
   - Settings → Environment Variables

2. **Dépendances** :
   - Vérifiez que `package.json` dans `apps/web` est correct
   - Vérifiez que toutes les dépendances sont installées

3. **TypeScript** :
   - Vérifiez qu'il n'y a pas d'erreurs TypeScript
   - `cd apps/web && npm run type-check`

### Problème 3 : Next.js ne détecte pas les routes API

**Solution** :

1. Vérifiez que vous utilisez Next.js 13+ (App Router)
2. Vérifiez que les fichiers sont nommés `route.ts` (pas `api.ts` ou autre)
3. Vérifiez la structure :
   ```
   app/
   └── api/
       └── auth/
           └── health/
               └── route.ts  ✅ Correct
   ```

---

## 📋 Checklist de Vérification

Avant de tester sur Vercel :

- [ ] Root Directory = `apps/web` (dans Vercel Settings)
- [ ] Framework = Next.js (détecté automatiquement)
- [ ] Build Command = `cd apps/web && npm run build` ou `npm run build` (si Root Directory configuré)
- [ ] Output Directory = `.next` ou `apps/web/.next`
- [ ] Install Command = `cd apps/web && npm install` ou `npm install` (si Root Directory configuré)
- [ ] Variables d'environnement définies
- [ ] Fichiers commités dans Git
- [ ] Build local fonctionne : `cd apps/web && npm run build && npm start`

Après redéploiement :

- [ ] Build réussi sans erreurs
- [ ] Logs montrent `apps/web` dans les chemins
- [ ] Routes API répondent correctement
- [ ] Pas d'erreurs 404

---

## 🚀 Commandes de Test

### Test Local (Production Build)

```bash
cd apps/web
npm run build
npm start

# Dans un autre terminal
curl http://localhost:3000/api/auth/health
```

### Test sur Vercel

```bash
# Attendez que le déploiement soit terminé, puis :
curl https://whatsorder-web.vercel.app/api/auth/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "service": "auth",
  "timestamp": "...",
  "environment": "production"
}
```

---

## ⚠️ Note Importante

Si **toutes** les routes API retournent 404, c'est un problème de configuration Vercel, pas un problème avec le code. Le code est correct, mais Vercel ne trouve pas les fichiers parce que le Root Directory n'est pas configuré correctement.

---

## 📚 Références

- [Vercel Monorepo Configuration](https://vercel.com/docs/projects/overview/monorepos)
- [Next.js App Router API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Guide Vercel Monorepo](./GUIDE_VERCEL_MONOREPO.md)

---

**Dernière mise à jour** : 12 janvier 2026  
**Statut** : En attente de correction de la configuration Vercel
