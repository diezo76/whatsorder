# 🚀 Migration Railway → Vercel + Supabase

## 🎯 Pourquoi Migrer ?

| Avant (Railway) | Après (Vercel + Supabase) |
|-----------------|---------------------------|
| 💰 $10-20/mois | ✅ $0/mois (gratuit) |
| 🔧 3 plateformes | ✅ 2 plateformes |
| ⚙️ Config manuelle | ✅ Git push = deploy |
| 📦 Services séparés | ✅ Tout intégré |

---

## 📚 Guides Disponibles

### 1. 🚀 Quick Start (15 min)
**Fichier** : `QUICK_START_VERCEL_SUPABASE.md`

Pour une migration rapide en 3 étapes :
1. Créer Supabase (5 min)
2. Déployer Vercel (5 min)
3. Tester (5 min)

👉 **Commencez par celui-ci si vous voulez tester rapidement !**

---

### 2. 📖 Guide Complet (2-3h)
**Fichier** : `MIGRATION_VERCEL_SUPABASE.md`

Guide détaillé avec :
- ✅ Migration du schéma de base de données
- ✅ 2 options d'architecture (Express ou API Routes)
- ✅ Configuration RLS
- ✅ Troubleshooting complet
- ✅ Tests de validation

👉 **Utilisez celui-ci pour une migration en production complète**

---

### 3. 📋 Compte Rendu Technique
**Fichier** : `COMPTE_RENDU_MIGRATION_VERCEL_SUPABASE.md`

Compte rendu détaillé pour l'équipe technique :
- Architecture avant/après
- Fichiers créés/modifiés
- Checklist complète
- Plan d'action sur 4 jours

---

## ⚡ Démarrage Rapide (5 min)

### Étape 1 : Supabase
```bash
# 1. Créer un compte sur https://supabase.com
# 2. Créer un nouveau projet "whatsorder"
# 3. Copier les credentials (Settings → API)
```

### Étape 2 : Migration DB
```bash
cd apps/api

# Mettre DATABASE_URL dans .env avec l'URL Supabase
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true"

pnpm prisma db push
```

### Étape 3 : Vercel
```bash
# 1. Aller sur https://vercel.com
# 2. Import GitHub repository
# 3. Root Directory : apps/web
# 4. Ajouter les variables d'environnement
# 5. Deploy !
```

---

## 🔧 Configuration

### Variables d'Environnement Vercel

Ajouter dans Vercel Dashboard → Settings → Environment Variables :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Database (pour Prisma)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true

# JWT
JWT_SECRET=votre-secret-jwt
JWT_EXPIRES_IN=7d

# App
NODE_ENV=production
```

---

## ✅ Checklist Rapide

### Supabase
- [ ] Compte créé
- [ ] Projet créé
- [ ] Credentials copiés
- [ ] Schéma migré

### Vercel
- [ ] Repository connecté
- [ ] Variables ajoutées
- [ ] Build réussi
- [ ] Site accessible

### Tests
- [ ] Page d'accueil fonctionne
- [ ] Login fonctionne
- [ ] Dashboard accessible
- [ ] API retourne des données

### Cleanup
- [ ] Arrêter Railway
- [ ] Supprimer projets Railway (après tests)

---

## 🆘 Problèmes Fréquents

### Build échoue
```bash
# Vérifier les variables d'environnement dans Vercel
# Vérifier les logs : Vercel Dashboard → Deployments → View Logs
```

### Cannot connect to database
```bash
# Utiliser le port 6543 (connection pooler)
DATABASE_URL="...@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true"
```

### API errors
```bash
# Vérifier SUPABASE_SERVICE_ROLE_KEY
# Désactiver RLS temporairement :
# ALTER TABLE "Restaurant" DISABLE ROW LEVEL SECURITY;
```

---

## 📊 Comparaison des Coûts

### Railway (Actuel)
```
PostgreSQL : $5-10/mois
API        : $5/mois
Web        : $0-5/mois
────────────────────────
Total      : $10-20/mois
```

### Vercel + Supabase (Nouveau)
```
Supabase Free : $0/mois (500MB DB, 50K users)
Vercel Hobby  : $0/mois (100GB bandwidth)
────────────────────────
Total         : $0/mois
```

💰 **Économie : $10-20/mois** (~$120-240/an)

---

## 🎯 Plan d'Action

### Option 1 : Migration Rapide (1 jour)
1. Matin : Setup Supabase + migration schéma
2. Après-midi : Déploiement Vercel + tests
3. Soir : Arrêter Railway

### Option 2 : Migration Progressive (1 semaine)
1. Jour 1-2 : Setup Supabase
2. Jour 3-4 : Tests en local
3. Jour 5 : Déploiement Vercel (preview)
4. Jour 6 : Tests en preview
5. Jour 7 : Production + cleanup

👉 **Je recommande l'Option 2 pour la production**

---

## 📞 Support

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma + Supabase](https://supabase.com/docs/guides/integrations/prisma)

### Guides Locaux
- `QUICK_START_VERCEL_SUPABASE.md` - Migration 15 min
- `MIGRATION_VERCEL_SUPABASE.md` - Guide complet
- `COMPTE_RENDU_MIGRATION_VERCEL_SUPABASE.md` - Compte rendu technique

---

## 🚀 Prochaine Étape

**Commencez maintenant :**

```bash
# Ouvrir le guide quick start
open QUICK_START_VERCEL_SUPABASE.md

# Ou lire directement :
cat QUICK_START_VERCEL_SUPABASE.md
```

---

**Bonne migration ! 🎉**

*Questions ? Consultez `MIGRATION_VERCEL_SUPABASE.md` pour plus de détails.*
