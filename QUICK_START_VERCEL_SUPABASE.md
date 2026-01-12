# ⚡ Quick Start : Vercel + Supabase (15 minutes)

## 🎯 Objectif
Migrer de Railway vers Vercel + Supabase en 15 minutes.

---

## 📋 Étape 1 : Supabase (5 min)

### 1. Créer un projet
- Allez sur https://supabase.com
- **New Project** → Name: `whatsorder`
- Notez le **Database Password**
- Region: Europe West

### 2. Récupérer les credentials
Settings → API → Copier :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 3. Migrer le schéma
```bash
cd apps/api
# Mettre DATABASE_URL dans .env avec l'URL Supabase
pnpm prisma db push
```

---

## 📋 Étape 2 : Vercel (5 min)

### 1. Import du projet
- Allez sur https://vercel.com
- **New Project** → Import votre repository GitHub

### 2. Configuration
- **Framework** : Next.js
- **Root Directory** : `apps/web`
- **Build Command** : `pnpm build`

### 3. Variables d'environnement
Ajouter dans Vercel :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true
JWT_SECRET=votre-secret
NODE_ENV=production
```

### 4. Deploy
Cliquez sur **Deploy** !

---

## 📋 Étape 3 : Tester (5 min)

### 1. Vérifier le site
- Ouvrir l'URL Vercel générée
- Tester la page d'accueil
- Tester `/nile-bites`
- Tester login

### 2. Si ça marche → Arrêter Railway
```bash
# Arrêter les services Railway
railway down
```

---

## ✅ C'est tout !

Votre application tourne maintenant sur :
- ✅ **Vercel** : Frontend + API
- ✅ **Supabase** : Base de données
- ✅ **Coût** : $0/mois (plans gratuits)

---

## 🆘 Problèmes ?

### Build échoue
→ Vérifier que les variables d'env sont bien ajoutées

### Cannot connect to database
→ Vérifier DATABASE_URL (utiliser le port 6543 pour pooling)

### API errors
→ Vérifier SUPABASE_SERVICE_ROLE_KEY

---

**Pour plus de détails, voir `MIGRATION_VERCEL_SUPABASE.md`**
