# 🚂 Instructions Railway - Configuration Finale

**Date** : 11 janvier 2026

---

## ✅ Fichiers Créés

- ✅ `apps/api/nixpacks.toml` - Force Railway à utiliser pnpm
- ✅ `apps/api/railway.json` - Configuration Railway
- ✅ `.gitignore` - Exclut package-lock.json

---

## 🎯 Configuration Requise dans Railway Dashboard

### ÉTAPE CRITIQUE : Configurer Root Directory

**C'est la clé pour que Railway voie le `pnpm-lock.yaml` !**

1. Ouvrir le dashboard :
   ```bash
   railway open
   ```

2. Dans le dashboard :
   - Cliquer sur le service **`api`**
   - Aller dans **"Settings"** (en haut à droite)
   - Trouver **"Root Directory"**
   - Configurer : **`apps/api`**
   - **Sauvegarder**

**Pourquoi ?**
- Railway copiera depuis la **racine** du projet
- Il verra le `pnpm-lock.yaml` à la racine
- Il utilisera le `nixpacks.toml` dans `apps/api`
- Les commandes s'exécuteront depuis `apps/api`

---

## 🚀 Déploiement

### 1. Configurer Root Directory (OBLIGATOIRE)

Via Dashboard Railway → Service `api` → Settings → Root Directory = `apps/api`

### 2. Ajouter PostgreSQL

Via Dashboard :
- **"New"** → **"Database"** → **"PostgreSQL"**
- Railway créera automatiquement `DATABASE_URL`

### 3. Configurer les Variables

Via Dashboard → Service `api` → Variables → New Variable :

```env
JWT_SECRET=238addc223ff1f4cd6242b5a12795eef7fa33b3c5518f27b614e040cd4d033fa
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://votre-domaine.com
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview
NODE_ENV=production
PORT=4000
```

### 4. Déployer

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
railway up
```

### 5. Vérifier

```bash
railway logs --build
```

Vous devriez voir :
- ✅ `pnpm install --frozen-lockfile` (pas `npm ci`)
- ✅ Build réussi

---

## 🔍 Vérification

### Vérifier que Railway utilise pnpm

Dans les logs de build, vous devriez voir :
```
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm build
```

**Pas** :
```
npm ci  ❌
```

---

## 🐛 Si le Problème Persiste

### Option 1 : Supprimer package-lock.json

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
rm package-lock.json
```

### Option 2 : Vérifier Root Directory

Dans Railway Dashboard :
- Service `api` → Settings
- Vérifier que Root Directory = `apps/api`
- Sauvegarder
- Redéployer

---

## ✅ Checklist

- [x] `nixpacks.toml` créé
- [x] `railway.json` configuré
- [ ] **Root Directory configuré dans Railway Settings** ⚠️ IMPORTANT
- [ ] PostgreSQL ajouté
- [ ] Variables configurées
- [ ] Déploiement réussi

---

**L'étape la plus importante : Configurer Root Directory = `apps/api` dans Railway Settings !**
