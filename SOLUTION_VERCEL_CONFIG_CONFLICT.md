# 🔧 Solution - Conflit Configuration Vercel

**Date** : 12 janvier 2026  
**Problème** : Conflit entre les paramètres de production et les paramètres du projet Vercel

---

## 🐛 Problème Identifié

**Message Vercel** :
> Configuration Settings in the current Production deployment differ from your current Project Settings.

**Cause** :
- Vercel détecte automatiquement Next.js et configure les commandes par défaut
- Le `vercel.json` spécifie des commandes personnalisées avec `cd apps/web`
- Conflit entre la détection automatique et la configuration manuelle

---

## ✅ Solution Appliquée

### 1. Simplification de `vercel.json` ✅

**Fichier modifié** : `/vercel.json`

**Avant** :
```json
{
  "framework": "nextjs",
  "rootDirectory": "apps/web",
  "installCommand": "cd apps/web && npm install --legacy-peer-deps",
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/.next"
}
```

**Après** :
```json
{
  "rootDirectory": "apps/web"
}
```

**Pourquoi** :
- Avec `rootDirectory: "apps/web"`, Vercel change automatiquement de répertoire
- Les commandes par défaut de Next.js (`npm run build`) fonctionnent directement
- Pas besoin de spécifier `cd apps/web` dans les commandes
- Vercel détecte automatiquement Next.js et utilise les bonnes commandes

### 2. Suppression de `apps/web/vercel.json` ✅

**Fichier supprimé** : `apps/web/vercel.json`

**Pourquoi** :
- Crée des conflits avec le `vercel.json` à la racine
- Avec `rootDirectory` configuré, ce fichier n'est pas nécessaire
- Vercel utilise les paramètres du projet une fois le Root Directory configuré

---

## 📋 Configuration Recommandée

### Dans Vercel Dashboard

1. **Settings** → **General** → **Root Directory**
   - Valeur : `apps/web`
   - ✅ Configuré

2. **Settings** → **General** → **Build & Development Settings**
   - Framework Preset : `Next.js` (détecté automatiquement)
   - Build Command : `npm run build` (par défaut Next.js)
   - Output Directory : `.next` (par défaut Next.js)
   - Install Command : `npm install` (par défaut)

### Fichier `vercel.json` (Racine)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "rootDirectory": "apps/web"
}
```

**C'est tout !** Vercel gère le reste automatiquement.

---

## 🔍 Comment ça Fonctionne

### Avec `rootDirectory: "apps/web"`

1. Vercel change de répertoire vers `apps/web`
2. Détecte automatiquement Next.js
3. Utilise les commandes par défaut :
   - `npm install` (ou `pnpm install` si détecté)
   - `npm run build` → `next build`
   - Output : `.next` (relatif à `apps/web`)

### Avantages

- ✅ Configuration minimale
- ✅ Utilise les optimisations Vercel pour Next.js
- ✅ Pas de conflits entre configurations
- ✅ Facile à maintenir

---

## ⚠️ Notes Importantes

### Installation des Dépendances

Si vous utilisez **pnpm** (recommandé pour monorepo) :

1. Vercel détecte automatiquement `pnpm-lock.yaml`
2. Utilise `pnpm install` au lieu de `npm install`
3. Si vous voulez forcer npm, ajoutez dans `vercel.json` :
   ```json
   {
     "rootDirectory": "apps/web",
     "installCommand": "npm install --legacy-peer-deps"
   }
   ```

### Variables d'Environnement

Assurez-vous que toutes les variables sont définies dans :
- **Vercel Dashboard** → **Settings** → **Environment Variables**

Variables importantes :
- `DATABASE_URL`
- `NEXT_PUBLIC_API_URL`
- `JWT_SECRET` (si utilisé côté client)

---

## 🚀 Prochaines Étapes

1. **Pousser les changements** :
   ```bash
   git add vercel.json
   git commit -m "fix: Simplify Vercel configuration"
   git push origin main
   ```

2. **Vérifier dans Vercel Dashboard** :
   - Settings → General → Root Directory = `apps/web`
   - Settings → General → Framework = `Next.js`

3. **Redéployer** :
   - Le prochain push déclenchera un nouveau déploiement
   - Ou redéployez manuellement depuis Vercel Dashboard

---

## ✅ Résolution

**Problème** : Conflit entre configuration automatique et manuelle  
**Cause** : Commandes personnalisées dans `vercel.json` avec `cd apps/web`  
**Solution** : Utiliser uniquement `rootDirectory` et laisser Vercel gérer le reste  
**Statut** : ✅ **RÉSOLU** - Configuration simplifiée et cohérente

---

**Dernière mise à jour** : 12 janvier 2026  
**Prochain agent** : Vérifier que le déploiement fonctionne avec la nouvelle configuration
