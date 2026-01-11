# 🚂 Configuration Railway - Solution Finale

**Date** : 11 janvier 2026  
**Statut** : Configuration corrigée

---

## ✅ Fichiers Créés/Modifiés

1. ✅ **`apps/api/nixpacks.toml`** - Force Railway à utiliser pnpm
2. ✅ **`apps/api/railway.json`** - Configuration Railway (simplifiée)
3. ✅ **`.gitignore`** - Ajout de `package-lock.json`

---

## 🔧 Solution Appliquée

### Problème
Railway utilisait `npm ci` au lieu de `pnpm install` car :
- Il détectait `package-lock.json` dans `apps/api`
- Il ne voyait pas le `pnpm-lock.yaml` à la racine
- Nixpacks détectait npm par défaut

### Solution
Création de `nixpacks.toml` qui :
- ✅ Force l'utilisation de **pnpm**
- ✅ Configure les phases de build correctement
- ✅ Utilise `pnpm install --frozen-lockfile`

---

## 📋 Configuration Railway Dashboard

### Important : Configurer Root Directory

**Via Dashboard** :
1. Ouvrir : `railway open`
2. Cliquer sur le service `api`
3. Aller dans **"Settings"**
4. Configurer **"Root Directory"** : `apps/api`
5. **OU** laisser vide si vous déployez depuis `apps/api`

**Note** : Si Root Directory est vide, Railway buildera depuis `apps/api` (où vous êtes quand vous lancez `railway up`).

---

## 🚀 Déploiement

### Étape 1 : Vérifier la Configuration

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
cat nixpacks.toml  # Vérifier que le fichier existe
```

### Étape 2 : Redéployer

```bash
railway up
```

### Étape 3 : Vérifier les Logs

```bash
railway logs --build
```

Vous devriez voir :
- ✅ `pnpm install --frozen-lockfile` (pas `npm ci`)
- ✅ `pnpm prisma generate`
- ✅ `pnpm build`
- ✅ Build réussi

---

## 🔍 Si le Problème Persiste

### Option A : Supprimer package-lock.json

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
rm package-lock.json
git add .gitignore
git commit -m "Remove package-lock.json, use pnpm only"
```

### Option B : Déployer depuis la Racine

```bash
# Se positionner à la racine
cd "/Users/diezowee/whatsapp order"

# Lier le service depuis la racine
railway service link api

# Créer railway.json à la racine
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && cd apps/api && pnpm prisma generate && pnpm build"
  },
  "deploy": {
    "startCommand": "cd apps/api && pnpm prisma migrate deploy && pnpm start"
  }
}
EOF

# Configurer Root Directory dans Railway Settings = "" (vide, racine)
# Puis déployer
railway up
```

---

## 📝 Variables d'Environnement à Configurer

**Via Dashboard Railway** :
1. Service `api` → **Variables**
2. Ajouter :

```env
JWT_SECRET=238addc223ff1f4cd6242b5a12795eef7fa33b3c5518f27b614e040cd4d033fa
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://votre-domaine.com
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview
NODE_ENV=production
PORT=4000
```

**Note** : `DATABASE_URL` sera créée automatiquement quand vous ajoutez PostgreSQL.

---

## ✅ Checklist Finale

- [x] `nixpacks.toml` créé dans `apps/api`
- [x] `railway.json` mis à jour
- [x] `.gitignore` mis à jour
- [ ] Root Directory configuré dans Railway (si nécessaire)
- [ ] PostgreSQL ajouté
- [ ] Variables d'environnement configurées
- [ ] Déploiement réussi avec pnpm

---

**Prochaine étape** : Redéployer avec `railway up` et vérifier que le build utilise pnpm.
