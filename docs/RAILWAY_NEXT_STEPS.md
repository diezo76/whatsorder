# 🚂 Railway - Prochaines Étapes

**Date** : 11 janvier 2026  
**Statut** : Service API lié ✅

---

## ✅ Ce qui est fait

- [x] Projet Railway créé : `whatsorder-api`
- [x] Service `api` créé et lié
- [x] Fichier `railway.json` configuré

---

## 📋 Prochaines Étapes

### 1. Ajouter PostgreSQL

**Via Dashboard (Recommandé)** :
1. Ouvrir le dashboard : `railway open`
2. Cliquer sur **"New"** (en haut à droite)
3. Sélectionner **"Database"**
4. Choisir **"PostgreSQL"**
5. Railway créera automatiquement la variable `DATABASE_URL`

**Via CLI (interactif)** :
```bash
railway add --database postgres
# Suivre les instructions interactives
```

### 2. Configurer les Variables d'Environnement

**Via Dashboard** :
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

**Via CLI** :
```bash
railway variables set JWT_SECRET="votre-secret-jwt-256-bits"
railway variables set JWT_EXPIRES_IN="7d"
railway variables set FRONTEND_URL="https://votre-domaine.com"
railway variables set OPENAI_API_KEY="sk-proj-..."
railway variables set OPENAI_MODEL="gpt-4-turbo-preview"
railway variables set NODE_ENV="production"
railway variables set PORT="4000"
```

**Note** : `DATABASE_URL` sera créée automatiquement quand vous ajoutez PostgreSQL.

### 3. Générer un Secret JWT

```bash
# Générer un secret JWT sécurisé (256 bits)
openssl rand -hex 32
```

Copier le résultat et l'utiliser pour `JWT_SECRET`.

### 4. Déployer

```bash
railway up
```

Railway va automatiquement :
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

### Voir les Variables

```bash
railway variables
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

# Voir les logs en temps réel
railway logs --follow

# Voir les variables
railway variables

# Déployer
railway up

# Exécuter une commande dans le service
railway run pnpm prisma migrate deploy
railway run pnpm prisma generate
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

### Erreur de Connexion à la Base de Données

Vérifier que PostgreSQL est ajouté et que `DATABASE_URL` existe :
```bash
railway variables | grep DATABASE_URL
```

---

## ✅ Checklist

- [x] Projet Railway créé
- [x] Service `api` créé et lié
- [x] Fichier `railway.json` créé
- [ ] PostgreSQL ajouté
- [ ] Variables d'environnement configurées
- [ ] Déploiement réussi
- [ ] API accessible et fonctionnelle

---

**Prochaine étape** : Ajouter PostgreSQL via le dashboard Railway.
