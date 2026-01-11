# 🚂 Railway - Quick Start Guide

**Date** : 11 janvier 2026

---

## ✅ Ce qui est Fait

- [x] Projet Railway créé : `whatsorder-api`
- [x] Service `api` créé et lié
- [x] Fichier `nixpacks.toml` créé (force pnpm)
- [x] Fichier `railway.json` configuré

---

## 🎯 Actions à Faire MAINTENANT

### 1. Ouvrir Railway Dashboard

```bash
railway open
```

### 2. Configurer Root Directory ⚠️ IMPORTANT

1. Service `api` → **Settings**
2. **Root Directory** : `apps/api`
3. **Save**

### 3. Ajouter PostgreSQL

1. Dans le projet (pas dans le service)
2. **"New"** → **"Database"** → **"PostgreSQL"**
3. ✅ `DATABASE_URL` créée automatiquement

### 4. Ajouter les Variables

Service `api` → **Variables** → **"New Variable"**

**Copier-coller ces valeurs** :

```
JWT_SECRET=238addc223ff1f4cd6242b5a12795eef7fa33b3c5518f27b614e040cd4d033fa
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://votre-domaine.com
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview
```

### 5. Déployer

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
railway up
```

---

## ✅ Checklist

- [ ] Root Directory = `apps/api` configuré
- [ ] PostgreSQL ajouté
- [ ] Variables ajoutées (7 variables)
- [ ] Déploiement réussi
- [ ] API accessible

---

**C'est tout ! Une fois ces étapes faites, votre API sera déployée ! 🚀**
