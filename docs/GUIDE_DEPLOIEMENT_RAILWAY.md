# 🚂 Guide de Déploiement sur Railway - WhatsOrder API

**Date** : 11 janvier 2026  
**Plateforme** : Railway.app

---

## 📋 Prérequis

- Compte Railway créé (https://railway.app)
- Railway CLI installé : `npm i -g @railway/cli`
- Authentifié avec Railway : `railway login`

---

## 🚀 Étapes de Déploiement

### 1. Se Positionner dans le Répertoire API

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
```

### 2. Initialiser Railway

```bash
railway init
```

**Options à choisir** :
- **Create new project** (créer un nouveau projet)
- **Nom du projet** : `whatsorder-api`

### 3. Configurer les Variables d'Environnement

Après l'initialisation, Railway va créer un fichier `.railway` dans le répertoire. Vous devez ensuite configurer les variables d'environnement :

```bash
# Via CLI
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="votre-secret-jwt"
railway variables set FRONTEND_URL="https://votre-domaine.com"
railway variables set OPENAI_API_KEY="sk-proj-..."

# Ou via le dashboard Railway
# https://railway.app/project/[project-id]/variables
```

### 4. Créer un Service pour l'API

```bash
# Créer un service vide pour l'API
railway add --service api

# Ou via le dashboard Railway
# New > Empty Service > Nommer "api"
```

### 5. Ajouter une Base de Données PostgreSQL

**Option A : Via le Dashboard Railway (Recommandé)**
1. Ouvrir le dashboard : `railway open`
2. Cliquer sur "New"
3. Sélectionner "Database"
4. Choisir "PostgreSQL"
5. Railway créera automatiquement la variable `DATABASE_URL`

**Option B : Via CLI (interactif)**
```bash
railway add --database postgres
# Suivre les instructions interactives
```

Railway va automatiquement créer la variable `DATABASE_URL` avec la connexion.

### 6. Configurer le Build et le Start

Railway détecte automatiquement les scripts dans `package.json` :
- **Build** : `pnpm build` (ou `npm run build`)
- **Start** : `pnpm start` (ou `npm start`)

### 7. Configurer Prisma

Créer un fichier `railway.json` à la racine de `apps/api` :

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm prisma generate && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm prisma migrate deploy && pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 8. Déployer

```bash
# Déployer le projet
railway up

# Ou pousser vers le repo Git connecté
git push
```

---

## 🔧 Configuration Recommandée

### Variables d'Environnement Requises

```env
# Database (créée automatiquement par Railway)
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=votre-secret-jwt-256-bits
JWT_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=production

# Frontend
FRONTEND_URL=https://votre-domaine.com

# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview

# Redis (optionnel, si vous ajoutez Redis)
REDIS_URL=redis://...
```

### Scripts Package.json

Railway utilise automatiquement ces scripts :

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy"
  }
}
```

---

## 📝 Fichiers à Créer

### railway.json (optionnel)

Créer `apps/api/railway.json` :

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm prisma migrate deploy && pnpm start"
  }
}
```

### .railwayignore (optionnel)

Créer `apps/api/.railwayignore` pour exclure des fichiers :

```
node_modules
.env
.env.local
*.log
dist
```

---

## 🔍 Commandes Utiles

### Gestion du Projet

```bash
# Voir le statut
railway status

# Voir les logs
railway logs

# Ouvrir le dashboard
railway open

# Voir les variables
railway variables

# Déployer
railway up
```

### Base de Données

```bash
# Ouvrir Prisma Studio
railway run pnpm prisma studio

# Exécuter les migrations
railway run pnpm prisma migrate deploy

# Générer le client Prisma
railway run pnpm prisma generate
```

---

## 🐛 Dépannage

### Erreur de Build

```bash
# Vérifier les logs de build
railway logs --build

# Vérifier les variables d'environnement
railway variables
```

### Erreur de Connexion à la Base de Données

```bash
# Vérifier que PostgreSQL est ajouté
railway add postgresql

# Vérifier la variable DATABASE_URL
railway variables | grep DATABASE_URL
```

### Erreur Prisma

```bash
# Générer le client Prisma
railway run pnpm prisma generate

# Exécuter les migrations
railway run pnpm prisma migrate deploy
```

---

## 📊 Monitoring

### Logs en Temps Réel

```bash
railway logs --follow
```

### Métriques

- Accéder au dashboard Railway
- Section "Metrics" pour voir CPU, RAM, Network

---

## 🔒 Sécurité

### Variables Sensibles

- Ne jamais commiter les variables d'environnement
- Utiliser Railway Variables pour les secrets
- Activer 2FA sur votre compte Railway

### HTTPS

Railway fournit automatiquement HTTPS pour tous les déploiements.

---

## 🚀 Déploiement Automatique

### Via Git

1. Connecter votre repo GitHub/GitLab à Railway
2. Railway déploie automatiquement à chaque push
3. Configurer les branches dans les settings

### Via CLI

```bash
# Déployer manuellement
railway up

# Déployer depuis un commit spécifique
railway up --detach
```

---

## 📝 Checklist de Déploiement

- [ ] Railway CLI installé et authentifié
- [ ] Projet Railway créé (`whatsorder-api`)
- [ ] PostgreSQL ajouté au projet
- [ ] Variables d'environnement configurées
- [ ] `railway.json` créé (optionnel)
- [ ] Build réussi
- [ ] Migrations Prisma exécutées
- [ ] API accessible via l'URL Railway
- [ ] Health check fonctionne (`/health`)

---

## 🔗 URLs

Après le déploiement, Railway fournira :
- **API URL** : `https://whatsorder-api-production.up.railway.app`
- **Dashboard** : https://railway.app/project/[project-id]

---

**Bon déploiement ! 🚂**
