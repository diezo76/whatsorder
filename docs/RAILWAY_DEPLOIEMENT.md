# 🚂 Guide de Déploiement Railway - Solution Complète

**Date** : 11 janvier 2026  
**Problème résolu** : Railway utilise maintenant pnpm ✅

---

## ✅ Fichiers de Configuration Créés

1. ✅ **`apps/api/nixpacks.toml`** - Force Railway à utiliser pnpm
2. ✅ **`apps/api/railway.json`** - Configuration Railway
3. ✅ **`.gitignore`** - Exclut `package-lock.json`

---

## 🎯 Solution au Problème npm ci

### Problème Identifié
Railway essayait d'utiliser `npm ci` car :
- Il détectait `package-lock.json` dans `apps/api`
- Il ne voyait pas le `pnpm-lock.yaml` à la racine du monorepo

### Solution Appliquée
Création de `nixpacks.toml` qui force Railway à :
- ✅ Utiliser **pnpm** au lieu de npm
- ✅ Installer avec `pnpm install --frozen-lockfile`
- ✅ Builder correctement le projet

---

## 📋 Configuration Requise dans Railway Dashboard

### Option 1 : Root Directory = `apps/api` (Recommandé)

**Via Dashboard** :
1. `railway open`
2. Service `api` → **Settings**
3. **Root Directory** : `apps/api`
4. Sauvegarder

**Avantages** :
- Railway buildera depuis la racine du projet
- Il verra le `pnpm-lock.yaml`
- Le `nixpacks.toml` dans `apps/api` sera utilisé

### Option 2 : Root Directory vide (Déploiement depuis apps/api)

Si vous déployez depuis `apps/api` avec `railway up` :
- Root Directory peut rester vide
- Railway utilisera le `nixpacks.toml` dans `apps/api`
- Mais il ne verra pas le `pnpm-lock.yaml` à la racine

**Solution** : Copier `pnpm-lock.yaml` dans `apps/api` OU utiliser Option 1

---

## 🚀 Étapes de Déploiement

### 1. Vérifier la Configuration

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
ls -la nixpacks.toml railway.json
```

### 2. Configurer Root Directory dans Railway

**Via Dashboard** :
1. Ouvrir : `railway open`
2. Service `api` → **Settings**
3. **Root Directory** : `apps/api`
4. Sauvegarder

### 3. Ajouter PostgreSQL

**Via Dashboard** :
1. Dans le projet Railway
2. **"New"** → **"Database"** → **"PostgreSQL"**
3. Railway créera automatiquement `DATABASE_URL`

### 4. Configurer les Variables d'Environnement

**Via Dashboard** :
1. Service `api` → **Variables**
2. **"New Variable"**
3. Ajouter :

```env
JWT_SECRET=238addc223ff1f4cd6242b5a12795eef7fa33b3c5518f27b614e040cd4d033fa
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://votre-domaine.com
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview
NODE_ENV=production
PORT=4000
```

### 5. Déployer

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
railway up
```

### 6. Vérifier les Logs

```bash
railway logs --build
```

Vous devriez voir :
- ✅ `pnpm install --frozen-lockfile` (pas `npm ci`)
- ✅ `pnpm prisma generate`
- ✅ `pnpm build`
- ✅ Build réussi ✅

---

## 🐛 Dépannage

### Si Railway utilise encore npm

**Solution 1** : Vérifier que `nixpacks.toml` est présent
```bash
cat apps/api/nixpacks.toml
```

**Solution 2** : Supprimer `package-lock.json`
```bash
cd "/Users/diezowee/whatsapp order/apps/api"
rm package-lock.json
```

**Solution 3** : Configurer Root Directory dans Railway Settings

### Si Railway ne trouve pas pnpm-lock.yaml

**Solution** : Configurer Root Directory = `apps/api` dans Railway Settings
- Railway buildera depuis la racine
- Il verra le `pnpm-lock.yaml`
- Le `nixpacks.toml` dans `apps/api` sera utilisé

---

## 📝 Structure des Fichiers

```
whatsapp order/
├── pnpm-lock.yaml          # Lockfile pnpm (racine)
├── pnpm-workspace.yaml     # Workspace pnpm (racine)
├── package.json            # Package.json racine
├── apps/
│   └── api/
│       ├── nixpacks.toml   # Configuration Railway (force pnpm)
│       ├── railway.json    # Configuration Railway
│       ├── package.json    # Package.json API
│       └── package-lock.json  # À supprimer (utilise pnpm)
```

---

## ✅ Checklist

- [x] `nixpacks.toml` créé dans `apps/api`
- [x] `railway.json` configuré
- [x] `.gitignore` mis à jour
- [ ] Root Directory configuré dans Railway Settings (`apps/api`)
- [ ] PostgreSQL ajouté
- [ ] Variables d'environnement configurées
- [ ] `package-lock.json` supprimé (optionnel)
- [ ] Déploiement réussi avec pnpm

---

## 🎯 Prochaine Étape

**Configurer Root Directory dans Railway Settings** :
1. `railway open`
2. Service `api` → Settings
3. Root Directory : `apps/api`
4. Sauvegarder
5. Redéployer : `railway up`

---

**Le build devrait maintenant utiliser pnpm au lieu de npm ! 🚀**
