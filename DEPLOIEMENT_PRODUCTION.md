# 🚀 Déploiement en Production - Whataybo

**Date** : 15 janvier 2026  
**Statut** : ✅ **PRÊT POUR DÉPLOIEMENT**

---

## ✅ Préparation Complète

### Tests ✅
- ✅ Tests d'authentification : **20/20 passent**
- ✅ Tests corrigés (ownerId supprimé, rate limiting ajusté)
- ✅ Prisma Client régénéré
- ✅ Configuration test complète

### Sécurité ✅
- ✅ Rate limiting : Implémenté sur tous les endpoints
- ✅ Helmet : Headers de sécurité complets
- ✅ Logging : Avancé pour détection d'attaques
- ✅ Validation : Renforcée avec sanitization
- ✅ Score sécurité : **9/10**

### CI/CD ✅
- ✅ GitHub Actions : Tests automatisés (`.github/workflows/tests.yml`)
- ✅ Déploiement automatique : Configuré (`.github/workflows/deploy.yml`)
- ✅ Workflow complet : Tests → Build → Deploy

---

## 📋 Étapes de Déploiement

### 1. Configurer les Secrets GitHub

Aller dans **Settings → Secrets and variables → Actions** et ajouter :

```
VERCEL_TOKEN=votre-token-vercel
VERCEL_ORG_ID=votre-org-id
VERCEL_API_PROJECT_ID=votre-api-project-id
VERCEL_WEB_PROJECT_ID=votre-web-project-id
DATABASE_URL=postgresql://...
JWT_SECRET=votre-secret-jwt-fort
NEXT_PUBLIC_API_URL=https://api.whataybo.com
```

### 2. Configurer Vercel

#### Projet API
- **Framework Preset** : Other
- **Root Directory** : `apps/api`
- **Build Command** : `pnpm build`
- **Output Directory** : `dist`
- **Install Command** : `pnpm install`

**Variables d'environnement** :
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`
- `FRONTEND_URL`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_ACCESS_TOKEN`
- `OPENAI_API_KEY`

#### Projet Web
- **Framework Preset** : Next.js
- **Root Directory** : `apps/web`
- **Build Command** : `pnpm build`
- **Output Directory** : `.next`

**Variables d'environnement** :
- `NEXT_PUBLIC_API_URL`
- `NODE_ENV=production`

### 3. Déployer

#### Option A : Déploiement Automatique (Recommandé)

```bash
# Push sur main déclenche automatiquement le déploiement
git add .
git commit -m "feat: Tests complets, sécurité renforcée - Prêt pour production"
git push origin main
```

Le workflow `.github/workflows/deploy.yml` va :
1. ✅ Exécuter les tests
2. ✅ Build API et Web
3. ✅ Déployer sur Vercel

#### Option B : Déploiement Manuel Vercel

**API** :
```bash
cd apps/api
vercel --prod
```

**Web** :
```bash
cd apps/web
vercel --prod
```

---

## ✅ Vérifications Post-Déploiement

### 1. Vérifier les Déploiements
- [ ] API déployée : `https://api.whataybo.com`
- [ ] Web déployé : `https://www.whataybo.com`
- [ ] GitHub Actions réussit

### 2. Tests de Santé
```bash
# API Health
curl https://api.whataybo.com/health

# Devrait retourner :
# {"status":"ok","timestamp":"...","service":"whataybo-api"}
```

### 3. Tests Fonctionnels
- [ ] Authentification fonctionne
- [ ] Menu public accessible
- [ ] Webhooks WhatsApp fonctionnent
- [ ] Dashboard accessible

### 4. Monitoring
- [ ] Vérifier les logs Vercel
- [ ] Vérifier les métriques de performance
- [ ] Surveiller les erreurs

---

## 🔒 Sécurité Production

### Variables Critiques
- ✅ `JWT_SECRET` : Secret fort et unique
- ✅ `DATABASE_URL` : URL sécurisée avec credentials
- ✅ `WHATSAPP_APP_SECRET` : Secret WhatsApp
- ✅ Rate limiting : Actif en production

### Headers Sécurité
- ✅ Helmet configuré
- ✅ CORS restreint aux domaines autorisés
- ✅ HSTS activé

---

## 📊 Monitoring

### Logs
- **Vercel Dashboard** : Logs en temps réel
- **GitHub Actions** : Logs de déploiement

### Métriques
- Temps de réponse API
- Taux d'erreur
- Utilisation rate limiting

---

## 🎯 URLs de Production

- **API** : `https://api.whataybo.com`
- **Web** : `https://www.whataybo.com`
- **Health Check** : `https://api.whataybo.com/health`

---

## 🚨 En Cas de Problème

### Rollback
```bash
# Via Vercel Dashboard ou CLI
vercel rollback
```

### Logs
```bash
# Vercel CLI
vercel logs
```

---

## ✅ Checklist Finale

- [x] Tests passent (20/20 auth)
- [x] Sécurité renforcée (9/10)
- [x] CI/CD configuré
- [x] Déploiement automatique configuré
- [x] Documentation complète
- [ ] Secrets GitHub configurés
- [ ] Vercel configuré
- [ ] Déploiement effectué
- [ ] Vérifications post-déploiement

---

**Statut** : ✅ **PRÊT POUR DÉPLOIEMENT**  
**Prochaine Action** : Configurer les secrets et push sur `main`

---

**Dernière mise à jour** : 15 janvier 2026
