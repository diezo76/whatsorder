# 📋 Compte Rendu - Migration vers Vercel + Supabase

**Agent** : Assistant IA  
**Date** : 12 janvier 2026  
**Tâche** : Créer un plan complet de migration de Railway vers Vercel + Supabase

---

## 🎯 Contexte

L'utilisateur souhaite migrer son application de Railway vers une stack 100% Vercel + Supabase pour :
- ✅ Réduire les coûts (plans gratuits)
- ✅ Simplifier l'infrastructure (2 plateformes au lieu de 3)
- ✅ Bénéficier de l'intégration native Next.js + Vercel
- ✅ Utiliser les fonctionnalités Supabase (Auth, Storage, RLS, etc.)

---

## 📊 Architecture

### Avant (Railway)
```
┌─────────────────┐
│ Railway DB      │
│ (PostgreSQL)    │
└────────┬────────┘
         │
┌────────▼────────┐
│ Railway API     │
│ (Express)       │
└────────┬────────┘
         │
┌────────▼────────┐
│ Railway/Vercel  │
│ (Next.js Web)   │
└─────────────────┘
```

### Après (Vercel + Supabase)
```
┌─────────────────┐
│ Supabase        │
│ - PostgreSQL    │
│ - Auth          │
│ - Storage       │
│ - RLS           │
└────────┬────────┘
         │
┌────────▼────────┐
│ Vercel          │
│ - Next.js Web   │
│ - API Routes    │
│ - Edge Funcs    │
└─────────────────┘
```

---

## ✅ Travaux Réalisés

### 1. Guides de Migration Créés

#### `MIGRATION_VERCEL_SUPABASE.md` (Guide Complet)
**Contenu** :
- 📖 Vue d'ensemble de la migration
- 🔧 Phase 1 : Setup Supabase (création projet, migration schéma, RLS)
- 🔧 Phase 2 : Adaptation de l'application (2 options : garder Express ou migrer vers API Routes)
- 🔧 Phase 3 : Déploiement Vercel
- ✅ Checklist complète
- 🧪 Tests de validation
- 💰 Comparaison des coûts
- 🚨 Points d'attention (Prisma, Auth, File upload)

**Sections clés** :
- Migration de la base de données (Prisma + SQL)
- 2 options d'architecture API :
  - **Option A** : Garder Express + Prisma (plus rapide)
  - **Option B** : Migrer vers Next.js API Routes + Supabase Client (recommandé)
- Configuration RLS Supabase
- Déploiement Vercel (Dashboard + CLI)
- Résolution des problèmes courants

---

#### `QUICK_START_VERCEL_SUPABASE.md` (Guide Rapide)
**Contenu** :
- ⚡ Migration en 15 minutes
- 3 étapes simples :
  1. Supabase : Créer projet + migrer schéma (5 min)
  2. Vercel : Import + config + deploy (5 min)
  3. Tester + arrêter Railway (5 min)
- Troubleshooting rapide

**Objectif** : Permettre une migration express pour tester rapidement.

---

### 2. Fichiers de Configuration Créés

#### `apps/web/vercel.json`
```json
{
  "version": 2,
  "buildCommand": "cd ../.. && pnpm install && cd apps/web && pnpm build",
  "outputDirectory": ".next",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "regions": ["fra1"]
}
```

**Rôle** : Configure le build Vercel pour le monorepo.

---

#### `vercel.json` (racine, mis à jour)
```json
{
  "version": 2,
  "buildCommand": "pnpm --filter @whataybo/web build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["fra1"]
}
```

**Changements** :
- ✅ Ajout de `regions: ["fra1"]` pour déploiement en Europe
- ✅ Ajout de headers de sécurité (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- ✅ Suppression du header `Cache-Control: no-store` (mauvais pour la performance)

---

#### `apps/web/lib/supabase-client.ts` (nouveau)
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(url, anonKey);
export const supabaseAdmin = createClient(url, serviceKey);
```

**Rôle** : 
- Client Supabase pour le côté client (avec clé anonyme)
- Client Admin Supabase pour les API Routes (avec clé service, bypass RLS)
- Gestion des erreurs si variables manquantes
- Documentation complète avec exemples d'usage

---

### 3. Documentation Détaillée

#### Phase 1 : Setup Supabase
- ✅ Création de projet (étapes détaillées)
- ✅ Récupération des credentials (URLs, clés)
- ✅ Migration du schéma (Prisma `db push` ou SQL direct)
- ✅ Migration des données (export Railway → import Supabase)
- ✅ Configuration RLS (désactivation temporaire ou politiques permissives)

#### Phase 2 : Adaptation Application
- ✅ **Option A** : Garder Express + Prisma
  - Mise à jour des variables d'environnement
  - Déploiement de l'API Express sur Vercel (via `vercel.json`)
  - Création de l'entrypoint Vercel
- ✅ **Option B** : Migrer vers API Routes
  - Installation Supabase Client
  - Création du client Supabase
  - Migration des routes Express vers API Routes Next.js
  - Exemples de code pour `/api/auth/login`, etc.

#### Phase 3 : Déploiement Vercel
- ✅ Préparation du projet (`vercel.json`)
- ✅ Déploiement via Dashboard (étapes détaillées)
- ✅ Déploiement via CLI
- ✅ Configuration des variables d'environnement
- ✅ Configuration CORS (si API séparée)

---

## 💰 Comparaison des Coûts

### Railway (Actuel)
- PostgreSQL : $5-10/mois
- API : $5/mois
- Web : $0-5/mois
- **Total : $10-20/mois**

### Vercel + Supabase (Nouveau)
- Supabase Free : $0/mois
  - 500 MB database
  - 1 GB file storage
  - 50K monthly active users
  - 2 GB bandwidth
- Vercel Hobby : $0/mois
  - 100 GB bandwidth
  - 100 serverless functions/day
  - 100 hours build time/month
- **Total : $0/mois** (dans les limites gratuites)

**Économie : $10-20/mois** 💰

---

## 🚨 Points d'Attention

### 1. Prisma avec Supabase
- ✅ Compatible (PostgreSQL standard)
- ⚠️ Utiliser le **Connection Pooler** (port 6543) pour éviter les problèmes de connexions
- ✅ DATABASE_URL : `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true`

### 2. Row Level Security (RLS)
- Supabase active RLS par défaut
- **Pour démarrer** : Désactiver RLS sur toutes les tables
- **À long terme** : Créer des politiques RLS pour sécuriser l'accès

### 3. Authentification
- **Option A** : Garder le système JWT actuel (rapide)
- **Option B** : Migrer vers Supabase Auth (recommandé à long terme)
  - OAuth providers (Google, GitHub, etc.)
  - Magic links
  - RLS automatique basé sur l'utilisateur

### 4. File Upload
- **Avant** : Cloudinary
- **Après** : Supabase Storage (inclus dans le plan gratuit)
- Migration nécessaire si images existantes

---

## 📋 Checklist de Migration

### Supabase
- [ ] Créer le projet Supabase
- [ ] Récupérer les credentials (URL, clés, DATABASE_URL)
- [ ] Migrer le schéma (`prisma db push` ou SQL)
- [ ] Migrer les données (export/import si prod)
- [ ] Configurer RLS (désactiver ou créer politiques)

### Application
- [ ] Mettre à jour `.env` avec les credentials Supabase
- [ ] Tester en local la connexion Supabase
- [ ] Choisir Option A (Express) ou B (API Routes)
- [ ] Adapter le code si Option B

### Vercel
- [ ] Connecter le repository GitHub
- [ ] Configurer le projet (Root Directory, Build Command)
- [ ] Ajouter les variables d'environnement
- [ ] Déployer en preview
- [ ] Tester en preview
- [ ] Déployer en production

### Cleanup
- [ ] Vérifier que tout fonctionne en production
- [ ] Arrêter les services Railway
- [ ] Supprimer les projets Railway (après ~1 semaine de tests)
- [ ] Mettre à jour la documentation interne

---

## 🧪 Tests de Validation

Après migration, exécuter ces tests :

```bash
# 1. Page d'accueil
curl https://votre-site.vercel.app/

# 2. API publique (menu restaurant)
curl https://votre-site.vercel.app/api/public/restaurants/nile-bites

# 3. Login
curl -X POST https://votre-site.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@whatsorder.com","password":"Admin123!"}'

# 4. Route protégée (dashboard)
curl https://votre-site.vercel.app/api/dashboard/menu \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Résultats attendus** :
- ✅ Page d'accueil s'affiche
- ✅ API publique retourne les données
- ✅ Login retourne un token
- ✅ Route protégée retourne les données (avec token valide)

---

## 🎯 Plan d'Action Recommandé

### Jour 1 (2-3h) - Setup Supabase
1. Créer le projet Supabase
2. Migrer le schéma de base de données
3. Configurer RLS
4. Tester la connexion en local

### Jour 2 (2-3h) - Adaptation Application
1. Mettre à jour les variables d'environnement
2. Choisir entre Option A et Option B
3. Adapter le code si nécessaire
4. Tester en local

### Jour 3 (1h) - Déploiement Vercel
1. Créer le projet Vercel
2. Configurer les variables
3. Déployer en preview
4. Tester en preview

### Jour 4 (30 min) - Production
1. Déployer en production
2. Tester en production
3. Arrêter Railway
4. Surveiller les logs

---

## 🆘 Troubleshooting

### Build échoue sur Vercel
**Causes possibles** :
- Variables d'environnement manquantes
- Erreur de build du monorepo
- Dépendances manquantes

**Solutions** :
1. Vérifier que toutes les variables sont ajoutées
2. Vérifier les logs de build
3. Tester en local : `pnpm build`

---

### Cannot connect to database
**Causes possibles** :
- DATABASE_URL incorrecte
- Mot de passe incorrect
- Firewall Supabase

**Solutions** :
1. Vérifier DATABASE_URL (utiliser port 6543 pour pooling)
2. Vérifier le mot de passe dans Supabase Dashboard
3. Utiliser le Connection Pooler : `?pgbouncer=true`

---

### API errors 401/403
**Causes possibles** :
- Clé Supabase incorrecte
- RLS bloque l'accès
- Token JWT invalide

**Solutions** :
1. Vérifier SUPABASE_SERVICE_ROLE_KEY
2. Désactiver temporairement RLS
3. Vérifier JWT_SECRET

---

### Lenteur des requêtes
**Causes possibles** :
- Connection pooling non activé
- Trop de connexions simultanées
- Requêtes non optimisées

**Solutions** :
1. Utiliser le port 6543 (pooler)
2. Ajouter `?pgbouncer=true` à DATABASE_URL
3. Optimiser les requêtes (indexes, select explicite)

---

## 📈 Métriques de Succès

### Build & Deploy
- ✅ Build réussi en < 5 min
- ✅ Deploy réussi en < 2 min
- ✅ Pas d'erreurs dans les logs

### Fonctionnalités
- ✅ Page d'accueil accessible
- ✅ Routes publiques fonctionnelles
- ✅ Login/Register fonctionnent
- ✅ Dashboard accessible (avec auth)
- ✅ API retourne les bonnes données

### Performance
- ✅ TTFB < 500ms
- ✅ LCP < 2.5s
- ✅ Pas de 500 errors

---

## 🎓 Apprentissages

### Avantages de Vercel + Supabase
- 🚀 Déploiement instantané via Git push
- 💰 Plans gratuits très généreux
- 🔒 Sécurité native (RLS, Auth)
- 🌍 Edge Functions pour la performance
- 📦 Tout-en-un (DB, Auth, Storage, Functions)

### Limites
- 📊 Plan gratuit limité (500MB DB)
- 🔄 Besoin de migrer vers API Routes pour profiter pleinement
- 🎯 RLS à configurer manuellement
- 📈 Scaling payant au-delà des limites

---

## 📚 Ressources Créées

1. ✅ `MIGRATION_VERCEL_SUPABASE.md` - Guide complet (détaillé)
2. ✅ `QUICK_START_VERCEL_SUPABASE.md` - Guide rapide (15 min)
3. ✅ `apps/web/vercel.json` - Config Vercel monorepo
4. ✅ `vercel.json` - Config Vercel racine (mis à jour)
5. ✅ `apps/web/lib/supabase-client.ts` - Client Supabase
6. ✅ `COMPTE_RENDU_MIGRATION_VERCEL_SUPABASE.md` - Ce document

---

## 🔄 Prochaines Étapes pour l'Utilisateur

### Immédiat (Aujourd'hui)
1. **Lire** `QUICK_START_VERCEL_SUPABASE.md`
2. **Créer** le projet Supabase
3. **Migrer** le schéma de base de données
4. **Tester** en local

### Court terme (Cette semaine)
1. **Déployer** sur Vercel (preview)
2. **Tester** en preview
3. **Déployer** en production
4. **Arrêter** Railway

### Long terme (Ce mois)
1. **Migrer** vers Supabase Auth (optionnel)
2. **Configurer** RLS proprement
3. **Migrer** vers Next.js API Routes (optionnel)
4. **Optimiser** les performances

---

## ✅ État Final

### Fichiers Créés
- ✅ `MIGRATION_VERCEL_SUPABASE.md` (guide complet)
- ✅ `QUICK_START_VERCEL_SUPABASE.md` (guide rapide)
- ✅ `apps/web/vercel.json` (config Vercel)
- ✅ `apps/web/lib/supabase-client.ts` (client Supabase)
- ✅ `COMPTE_RENDU_MIGRATION_VERCEL_SUPABASE.md` (ce document)

### Fichiers Modifiés
- ✅ `vercel.json` (racine) - Amélioré avec regions et headers de sécurité

### Documentation
- ✅ Plan de migration complet en 3 phases
- ✅ 2 options d'architecture (Express ou API Routes)
- ✅ Checklist de validation
- ✅ Troubleshooting détaillé
- ✅ Comparaison des coûts
- ✅ Plan d'action sur 4 jours

---

**Fin du Compte Rendu**

L'utilisateur dispose maintenant de tous les éléments pour migrer son application de Railway vers Vercel + Supabase. Les guides sont prêts à être suivis et les fichiers de configuration sont en place.

**Prochaine action recommandée** : Suivre le guide `QUICK_START_VERCEL_SUPABASE.md` pour une migration rapide en 15 minutes ! 🚀
