# 🚂 Setup Railway - Guide Rapide

**Date** : 11 janvier 2026

---

## ✅ Étape 1 : Initialisation (FAIT)

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
railway init --name whatsorder-api
```

**Résultat** :
- ✅ Projet créé : `whatsorder-api`
- ✅ URL : https://railway.com/project/d8a86a8e-7b11-404f-aa20-ac6e7258ab0f
- ✅ Fichier `railway.json` créé

---

## 📋 Prochaines Étapes

### Étape 2 : Ajouter PostgreSQL (via Dashboard - Recommandé)

1. **Ouvrir le dashboard** :
   ```bash
   railway open
   ```
   Ou directement : https://railway.com/project/d8a86a8e-7b11-404f-aa20-ac6e7258ab0f

2. **Dans le dashboard** :
   - Cliquer sur **"New"** (en haut à droite)
   - Sélectionner **"Database"**
   - Choisir **"PostgreSQL"**
   - Railway créera automatiquement la variable `DATABASE_URL`

### Étape 3 : Créer le Service API (via Dashboard)

1. **Dans le dashboard** :
   - Cliquer sur **"New"**
   - Sélectionner **"Empty Service"**
   - Nommer le service : `api`
   - Railway va créer le service

2. **Lier le service au code local** :
   ```bash
   railway service link api
   ```

### Étape 4 : Configurer les Variables d'Environnement

**Via Dashboard (Recommandé)** :
1. Aller dans le service `api`
2. Cliquer sur l'onglet **"Variables"**
3. Ajouter les variables suivantes :

```env
JWT_SECRET=votre-secret-jwt-256-bits
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://votre-domaine.com
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview
NODE_ENV=production
PORT=4000
```

**Note** : `DATABASE_URL` sera créée automatiquement quand vous ajoutez PostgreSQL.

**Via CLI** :
```bash
railway variables set JWT_SECRET="votre-secret-jwt"
railway variables set JWT_EXPIRES_IN="7d"
railway variables set FRONTEND_URL="https://votre-domaine.com"
railway variables set OPENAI_API_KEY="sk-proj-..."
railway variables set OPENAI_MODEL="gpt-4-turbo-preview"
railway variables set NODE_ENV="production"
railway variables set PORT="4000"
```

### Étape 5 : Déployer

```bash
railway up
```

Railway va :
1. Installer les dépendances (`pnpm install`)
2. Générer le client Prisma (`pnpm prisma generate`)
3. Compiler TypeScript (`pnpm build`)
4. Exécuter les migrations (`pnpm prisma migrate deploy`)
5. Démarrer le serveur (`pnpm start`)

---

## 🔍 Vérification

### Vérifier le Statut

```bash
railway status
```

### Voir les Logs

```bash
railway logs
```

### Tester l'API

Une fois déployé, Railway fournira une URL comme :
```
https://whatsorder-api-production.up.railway.app
```

Tester le health check :
```bash
curl https://whatsorder-api-production.up.railway.app/api/health
```

---

## 📝 Commandes Utiles

```bash
# Ouvrir le dashboard
railway open

# Voir le statut
railway status

# Voir les logs
railway logs

# Voir les variables
railway variables

# Déployer
railway up

# Lier un service
railway service link api

# Exécuter une commande dans le service
railway run pnpm prisma migrate deploy
```

---

## 🐛 Dépannage

### Erreur "No service linked"

```bash
railway service link api
```

### Erreur de Build

Vérifier les logs :
```bash
railway logs --build
```

### Erreur Prisma

```bash
railway run pnpm prisma generate
railway run pnpm prisma migrate deploy
```

---

## ✅ Checklist

- [x] Railway CLI installé et authentifié
- [x] Projet Railway créé (`whatsorder-api`)
- [x] Fichier `railway.json` créé
- [ ] PostgreSQL ajouté au projet
- [ ] Service `api` créé et lié
- [ ] Variables d'environnement configurées
- [ ] Déploiement réussi
- [ ] API accessible et fonctionnelle

---

**Prochaine étape** : Ouvrir le dashboard Railway et ajouter PostgreSQL + créer le service API.
