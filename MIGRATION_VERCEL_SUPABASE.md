# 🚀 Migration de Railway vers Vercel + Supabase

**Date** : 12 janvier 2026  
**Objectif** : Migrer complètement de Railway vers Vercel (frontend + API) et Supabase (base de données)

---

## 📊 Vue d'Ensemble

### Architecture Actuelle (Railway)
```
Railway PostgreSQL → Railway API (Express) → Railway/Vercel Web (Next.js)
```

### Nouvelle Architecture (Vercel + Supabase)
```
Supabase PostgreSQL → Vercel (Next.js + API Routes) → Clients
```

### Avantages
- ✅ **Coûts** : Plans gratuits pour démarrer
- ✅ **Simplicité** : 2 plateformes au lieu de 3
- ✅ **Performance** : Edge Functions Vercel
- ✅ **DX** : Déploiement automatique via Git
- ✅ **Scalabilité** : Auto-scaling inclus

---

## 🎯 Plan de Migration (3 Phases)

### Phase 1 : Setup Supabase (30 min)
- Créer projet Supabase
- Migrer le schéma de base de données
- Exporter/Importer les données
- Configurer RLS (Row Level Security)

### Phase 2 : Adapter l'Application (2-3h)
- Remplacer Prisma par Supabase Client
- OU garder Prisma avec Supabase URL
- Migrer l'API Express vers Next.js API Routes (optionnel)
- Configurer l'authentification Supabase

### Phase 3 : Déploiement Vercel (15 min)
- Connecter le repository GitHub
- Configurer les variables d'environnement
- Déployer
- Tester

---

## 📋 Phase 1 : Setup Supabase

### 1.1 Créer un Projet Supabase

1. Allez sur https://supabase.com
2. Créez un compte (gratuit)
3. **Create New Project** :
   - **Name** : `whatsorder`
   - **Database Password** : Générer un mot de passe fort (NOTEZ-LE !)
   - **Region** : Europe West (Frankfurt) ou le plus proche
   - **Plan** : Free (500MB, 50K monthly active users)

⏳ Attendre 2-3 minutes que le projet soit créé.

---

### 1.2 Récupérer les Credentials

Une fois le projet créé, allez dans **Settings** → **API** :

```env
# URL du projet
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Clé anonyme (publique)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clé service (privée, pour le backend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL de connexion directe (pour Prisma)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

⚠️ **NOTEZ CES VALEURS** - vous en aurez besoin !

---

### 1.3 Migrer le Schéma de Base de Données

#### Option A : Utiliser Prisma (Recommandé si vous gardez Prisma)

```bash
cd "/Users/diezowee/whatsapp order/apps/api"

# Mettre à jour .env avec la DATABASE_URL Supabase
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Pousser le schéma vers Supabase
pnpm prisma db push

# Générer le client Prisma
pnpm prisma generate
```

#### Option B : Utiliser SQL Editor Supabase

1. Dans Supabase Dashboard → **SQL Editor**
2. Copier le contenu de votre dernière migration Prisma
3. Exécuter le SQL

**Fichier à copier** : `apps/api/prisma/migrations/[derniere-migration]/migration.sql`

---

### 1.4 Migrer les Données (si vous avez des données en prod)

#### Depuis Railway PostgreSQL

```bash
# 1. Exporter depuis Railway
railway login
railway link  # Sélectionner le projet avec PostgreSQL
railway run pg_dump $DATABASE_URL > backup.sql

# 2. Importer vers Supabase
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" < backup.sql
```

#### Alternative : Interface Supabase

1. Supabase Dashboard → **Table Editor**
2. Importer les données manuellement (CSV)
3. Ou utiliser **SQL Editor** pour insérer

---

### 1.5 Configurer RLS (Row Level Security)

Supabase active RLS par défaut. Vous devez créer des politiques.

Dans **SQL Editor** :

```sql
-- Désactiver RLS pour les tables non-publiques (temporaire pour dev)
ALTER TABLE "Restaurant" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuItem" DISABLE ROW LEVEL SECURITY;
-- ... etc pour toutes les tables

-- OU créer des politiques permissives (à affiner plus tard)
ALTER TABLE "Restaurant" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active restaurants"
ON "Restaurant" FOR SELECT
USING ("isActive" = true);

CREATE POLICY "Allow authenticated users full access"
ON "Restaurant" FOR ALL
USING (auth.role() = 'authenticated');
```

⚠️ **Important** : Pour commencer, vous pouvez désactiver RLS sur toutes les tables. Vous l'affinerez plus tard.

---

## 📋 Phase 2 : Adapter l'Application

### 2.1 Choix d'Architecture API

Vous avez 2 options :

#### Option A : Garder Express + Prisma (Plus Rapide)
- ✅ Peu de changements de code
- ✅ Garder la structure actuelle
- ❌ Besoin de déployer l'API séparément

#### Option B : Migrer vers Next.js API Routes + Supabase Client (Recommandé)
- ✅ Tout dans Vercel
- ✅ Pas de serveur Express séparé
- ✅ Utiliser les fonctionnalités Supabase (Auth, Storage, etc.)
- ❌ Plus de refactoring

**Je recommande l'Option A pour commencer, puis migrer vers B progressivement.**

---

### 2.2 Option A : Garder Express + Prisma

#### Étape 1 : Mettre à jour les variables d'environnement

Fichier `apps/api/.env` :

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# JWT (garder les mêmes)
JWT_SECRET=votre-secret
JWT_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=production

# Frontend
FRONTEND_URL=https://votre-site.vercel.app

# Supabase (optionnel, pour utiliser les features Supabase plus tard)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Étape 2 : Tester localement

```bash
cd apps/api
pnpm dev
```

Vérifier que l'API se connecte bien à Supabase.

#### Étape 3 : Déployer l'API sur Vercel (oui, Vercel peut héberger Express !)

**Créer `apps/api/vercel.json`** :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

**Créer `apps/api/api/index.js`** (entrypoint pour Vercel) :

```javascript
// Import de votre app Express compilée
import app from '../dist/index.js';

// Export pour Vercel
export default app;
```

**Déployer** :

```bash
cd apps/api
vercel --prod
```

---

### 2.3 Option B : Migrer vers Next.js API Routes

#### Étape 1 : Installer Supabase Client

```bash
cd apps/web
pnpm add @supabase/supabase-js
```

#### Étape 2 : Créer le client Supabase

**Créer `apps/web/lib/supabase.ts`** :

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client avec clé service (pour API Routes côté serveur)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

#### Étape 3 : Créer les API Routes Next.js

**Exemple : `apps/web/app/api/auth/login/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Chercher l'utilisateur dans Supabase
    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

#### Étape 4 : Migrer toutes les routes API

Pour chaque route Express dans `apps/api/src/routes/`, créer l'équivalent dans `apps/web/app/api/`.

**Structure** :
```
apps/web/app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   └── me/route.ts
├── public/
│   └── restaurants/
│       └── [slug]/
│           ├── route.ts
│           └── menu/
│               └── route.ts
└── dashboard/
    └── menu/
        └── route.ts
```

---

## 📋 Phase 3 : Déploiement Vercel

### 3.1 Préparer le Projet

#### Créer `vercel.json` à la racine

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "buildCommand": "pnpm --filter @whataybo/web build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["fra1"]
}
```

#### Mettre à jour `package.json` racine

```json
{
  "scripts": {
    "build": "pnpm --filter @whataybo/web build",
    "start": "pnpm --filter @whataybo/web start",
    "dev": "pnpm --filter @whataybo/web dev"
  }
}
```

---

### 3.2 Déployer sur Vercel

#### Via le Dashboard Vercel (Recommandé)

1. Allez sur https://vercel.com
2. **Import Project** → Connecter votre repository GitHub
3. **Configure Project** :
   - **Framework Preset** : Next.js
   - **Root Directory** : `apps/web` (ou laisser vide si vercel.json configure)
   - **Build Command** : `pnpm build` (ou auto-détecté)
   - **Output Directory** : `.next` (auto-détecté)
   - **Install Command** : `pnpm install`

4. **Environment Variables** - Ajouter :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (si vous gardez Prisma)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# JWT
JWT_SECRET=votre-secret-jwt
JWT_EXPIRES_IN=7d

# App
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://votre-site.vercel.app

# OpenAI (si utilisé)
OPENAI_API_KEY=sk-proj-...
```

5. **Deploy** !

---

#### Via CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
cd "/Users/diezowee/whatsapp order"
vercel --prod
```

---

### 3.3 Configuration Post-Déploiement

#### Domaine Personnalisé (Optionnel)

1. Vercel Dashboard → **Settings** → **Domains**
2. Ajouter votre domaine
3. Configurer les DNS selon les instructions

#### CORS (si API séparée)

Si vous gardez l'API Express séparée, configurer CORS :

```typescript
// apps/api/src/index.ts
app.use(cors({
  origin: [
    'https://votre-site.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

---

## ✅ Checklist de Migration

### Supabase
- [ ] Projet créé
- [ ] Credentials récupérés
- [ ] Schéma migré (Prisma ou SQL)
- [ ] Données migrées (si applicable)
- [ ] RLS configuré

### Application
- [ ] Variables d'environnement mises à jour
- [ ] Tests en local réussis
- [ ] Connexion Supabase fonctionnelle
- [ ] API Routes créées (si Option B)

### Vercel
- [ ] Repository connecté
- [ ] Variables d'environnement configurées
- [ ] Build réussi
- [ ] Site accessible
- [ ] Fonctionnalités testées

### Cleanup
- [ ] Arrêter les services Railway
- [ ] Supprimer les projets Railway (après confirmation)
- [ ] Mettre à jour la documentation

---

## 🧪 Tests de Validation

Après migration, tester :

```bash
# 1. Page d'accueil
curl https://votre-site.vercel.app/

# 2. API publique
curl https://votre-site.vercel.app/api/public/restaurants/nile-bites

# 3. Login
curl -X POST https://votre-site.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@whatsorder.com","password":"Admin123!"}'

# 4. Route protégée
curl https://votre-site.vercel.app/api/dashboard/menu \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💰 Comparaison des Coûts

### Avant (Railway)
- PostgreSQL : $5-10/mois
- API : $5/mois
- Web : $0 (si sur Vercel) ou $5/mois
- **Total : $10-20/mois**

### Après (Vercel + Supabase)
- Supabase Free : $0 (500MB DB, 50K MAU, 2GB file storage)
- Vercel Hobby : $0 (100GB bandwidth, serverless functions)
- **Total : $0/mois** (jusqu'à dépassement des limites)

**Limites Supabase Free** :
- 500 MB database space
- 1 GB file storage
- 50K monthly active users
- 2 GB bandwidth

**Limites Vercel Hobby** :
- 100 GB bandwidth
- 100 serverless function executions/day
- 100 hours build time/month

---

## 🚨 Points d'Attention

### 1. Prisma avec Supabase

Supabase utilise PostgreSQL standard, donc Prisma fonctionne parfaitement.

**Problème connu** : Connection pooling

**Solution** : Utiliser Supabase Connection Pooler

```env
# Au lieu de :
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Utiliser (pour Prisma) :
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true"
```

Port `6543` = Connection pooler (PgBouncer)

---

### 2. Authentification

**Option A** : Garder votre système JWT actuel ✅

**Option B** : Migrer vers Supabase Auth (recommandé à long terme)

Avec Supabase Auth :
- ✅ Gestion automatique des sessions
- ✅ OAuth providers (Google, GitHub, etc.)
- ✅ Magic links
- ✅ RLS automatique

---

### 3. File Upload

Si vous uploadez des fichiers (images menu, etc.) :

**Avant** : Cloudinary

**Après** : Supabase Storage (inclus dans le plan gratuit)

```typescript
import { supabase } from '@/lib/supabase';

// Upload
const { data, error } = await supabase.storage
  .from('menu-images')
  .upload('public/item-1.jpg', file);

// Get URL
const { data: urlData } = supabase.storage
  .from('menu-images')
  .getPublicUrl('public/item-1.jpg');
```

---

## 📚 Ressources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma + Supabase](https://supabase.com/docs/guides/integrations/prisma)

### Tutoriels
- [Next.js + Supabase Auth](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Deploying to Vercel](https://vercel.com/docs/deployments/overview)

---

## 🎯 Plan d'Action Recommandé

### Jour 1 (2-3h)
1. ✅ Créer projet Supabase
2. ✅ Migrer le schéma
3. ✅ Tester la connexion en local
4. ✅ Migrer les données (si prod)

### Jour 2 (2-3h)
1. ✅ Mettre à jour les variables d'environnement
2. ✅ Tester l'API en local avec Supabase
3. ✅ Créer le projet Vercel
4. ✅ Déployer en preview

### Jour 3 (1h)
1. ✅ Tester en production
2. ✅ Corriger les bugs
3. ✅ Déployer en production
4. ✅ Arrêter Railway

---

**Migration terminée ! Vous êtes maintenant 100% sur Vercel + Supabase ! 🎉**

Pour toute question, consultez ce guide ou les documentations officielles.
