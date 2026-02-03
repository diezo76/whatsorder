# Guide de Déploiement - Whataybo

**Date** : 15 janvier 2026

---

## 🚀 Déploiement en Production

### Prérequis

1. **Secrets GitHub** configurés :
   - `VERCEL_TOKEN` - Token Vercel
   - `VERCEL_ORG_ID` - ID de l'organisation Vercel
   - `VERCEL_API_PROJECT_ID` - ID du projet API Vercel
   - `VERCEL_WEB_PROJECT_ID` - ID du projet Web Vercel
   - `DATABASE_URL` - URL de la base de données de production
   - `JWT_SECRET` - Secret JWT pour production
   - `NEXT_PUBLIC_API_URL` - URL de l'API en production

2. **Variables d'environnement Vercel** :
   - Configurer toutes les variables nécessaires dans les projets Vercel

---

## 📋 Étapes de Déploiement

### Option 1 : Déploiement Automatique (Recommandé)

Le déploiement se fait automatiquement via GitHub Actions lors d'un push sur `main`.

**Workflow** : `.github/workflows/deploy.yml`

**Étapes automatiques** :
1. ✅ Exécution des tests
2. ✅ Build de l'API
3. ✅ Build du Web
4. ✅ Déploiement sur Vercel

### Option 2 : Déploiement Manuel

#### API

```bash
cd apps/api
pnpm install
pnpm build
vercel --prod
```

#### Web

```bash
cd apps/web
pnpm install
pnpm build
vercel --prod
```

---

## ✅ Checklist Pré-Déploiement

- [x] Tous les tests passent
- [x] Build réussi sans erreurs
- [x] Variables d'environnement configurées
- [x] Base de données migrée
- [x] Secrets GitHub configurés
- [x] Vercel configuré

---

## 🔒 Sécurité Production

### Variables d'Environnement Requises

**API** :
- `DATABASE_URL` - Base de données PostgreSQL
- `JWT_SECRET` - Secret JWT (fort et unique)
- `NODE_ENV=production`
- `FRONTEND_URL` - URL du frontend
- `WHATSAPP_APP_SECRET` - Secret WhatsApp
- `WHATSAPP_ACCESS_TOKEN` - Token WhatsApp
- `OPENAI_API_KEY` - Clé API OpenAI

**Web** :
- `NEXT_PUBLIC_API_URL` - URL de l'API
- `NODE_ENV=production`

---

## 📊 Monitoring Post-Déploiement

1. Vérifier les logs Vercel
2. Tester les endpoints critiques
3. Vérifier les métriques de performance
4. Surveiller les erreurs

---

## 🎯 URLs de Production

- **API** : `https://api.whataybo.com` (à configurer)
- **Web** : `https://www.whataybo.com` (à configurer)

---

**Dernière mise à jour** : 15 janvier 2026
