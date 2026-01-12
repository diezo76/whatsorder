# 🚀 Guide d'Exécution - Migration Automatique

**Date** : 12 janvier 2026  
**Durée** : 15-30 minutes  
**Difficulté** : Facile (tout est automatisé)

---

## ✅ Scripts Créés

Tous les scripts sont prêts dans le dossier `scripts/` :

1. **`setup-supabase.sh`** - Configuration complète de Supabase
2. **`deploy-vercel.sh`** - Déploiement sur Vercel
3. **`migrate-all.sh`** - Migration complète (tout-en-un)

---

## 🚀 Option 1 : Migration Automatique Complète (Recommandé)

Un seul script fait tout pour vous !

```bash
cd "/Users/diezowee/whatsapp order"
./scripts/migrate-all.sh
```

**Ce script va :**
1. ✅ Vous guider dans la création du projet Supabase
2. ✅ Configurer automatiquement les fichiers `.env`
3. ✅ Migrer le schéma de base de données
4. ✅ Vous proposer de tester en local
5. ✅ Déployer sur Vercel
6. ✅ Configurer les variables d'environnement

**Suivez simplement les instructions à l'écran !**

---

## 🎯 Option 2 : Migration Étape par Étape

Si vous préférez contrôler chaque étape :

### Étape 1 : Configuration Supabase

```bash
cd "/Users/diezowee/whatsapp order"
./scripts/setup-supabase.sh
```

**Ce que fait ce script :**
- Vous guide dans la création du projet Supabase
- Récupère les credentials
- Crée les fichiers `.env` automatiquement
- Migre le schéma avec Prisma
- (Optionnel) Exécute le seed
- (Optionnel) Désactive RLS

**Durée : 10-15 minutes**

---

### Étape 2 : Test en local

```bash
# Terminal 1 - Backend
cd apps/api
pnpm dev

# Terminal 2 - Frontend
cd apps/web
pnpm dev
```

Ouvrez http://localhost:3000 et testez :
- ✅ Page d'accueil
- ✅ Login/Register
- ✅ Dashboard
- ✅ Menu public

**Durée : 5 minutes**

---

### Étape 3 : Déploiement Vercel

```bash
cd "/Users/diezowee/whatsapp order"
./scripts/deploy-vercel.sh
```

**Ce que fait ce script :**
- Installe Vercel CLI si nécessaire
- Configure le projet Vercel
- Ajoute les variables d'environnement
- Déploie en preview ou production
- Affiche l'URL du site

**Durée : 5-10 minutes**

---

## 📋 Ce dont vous aurez besoin

### Avant de commencer

1. **Compte Supabase** (gratuit)
   - Créer sur https://supabase.com

2. **Compte Vercel** (gratuit)
   - Créer sur https://vercel.com

3. **Repository GitHub connecté**
   - Votre code doit être sur GitHub

### Informations à préparer

Le script vous demandera :

**Pour Supabase :**
- Project URL (ex: `https://xxxxx.supabase.co`)
- anon/public key (commence par `eyJhbGci...`)
- service_role key (commence par `eyJhbGci...`)
- Database password (que vous aurez créé)

**Pour Vercel :**
- Rien ! Le script utilise les infos de `.env.local`

---

## 🔍 Dépannage

### Le script setup-supabase.sh ne s'exécute pas

```bash
# Donner les permissions d'exécution
chmod +x scripts/setup-supabase.sh
chmod +x scripts/deploy-vercel.sh
chmod +x scripts/migrate-all.sh
```

---

### Erreur "command not found: pnpm"

```bash
# Installer pnpm
npm install -g pnpm
```

---

### Erreur "prisma: command not found"

```bash
cd apps/api
pnpm install
```

---

### Erreur de connexion à la base de données

Vérifiez que :
1. Le mot de passe est correct
2. L'URL utilise le port `6543` (connection pooler)
3. Le paramètre `?pgbouncer=true` est présent

**Format correct :**
```
postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:6543/postgres?pgbouncer=true
```

---

### Build Vercel échoue

1. Vérifier que toutes les variables d'env sont ajoutées
2. Vérifier les logs : `vercel logs`
3. Tester le build en local : `cd apps/web && pnpm build`

---

## ✅ Validation Post-Migration

### Tests à effectuer

```bash
# 1. Vérifier que le site est accessible
open $(vercel --prod)

# 2. Tester les routes principales
curl https://votre-site.vercel.app/
curl https://votre-site.vercel.app/nile-bites

# 3. Voir les logs
vercel logs --follow
```

### Checklist

- [ ] Page d'accueil s'affiche
- [ ] Login fonctionne
- [ ] Dashboard accessible (avec auth)
- [ ] Menu public `/nile-bites` fonctionne
- [ ] API retourne les bonnes données
- [ ] Pas d'erreurs dans les logs

---

## 🧹 Nettoyage Railway

Une fois que tout fonctionne sur Vercel + Supabase :

### 1. Arrêter les services Railway

```bash
railway login
railway link  # Sélectionner chaque projet

# Pour chaque service
railway down
```

### 2. Supprimer les projets (après ~1 semaine de tests)

1. Allez sur https://railway.app/dashboard
2. Sélectionnez chaque projet
3. Settings → Danger Zone → Delete Project

---

## 💰 Économies Réalisées

| Avant (Railway) | Après (Vercel + Supabase) |
|-----------------|---------------------------|
| $10-20/mois | $0/mois |

**💸 Économie annuelle : $120-240**

---

## 📚 Ressources

### Scripts
- `scripts/migrate-all.sh` - Migration complète
- `scripts/setup-supabase.sh` - Configuration Supabase
- `scripts/deploy-vercel.sh` - Déploiement Vercel

### Documentation
- `README_MIGRATION.md` - Vue d'ensemble
- `QUICK_START_VERCEL_SUPABASE.md` - Guide rapide
- `MIGRATION_VERCEL_SUPABASE.md` - Guide complet

### Liens
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

---

## 🚀 Commencer Maintenant

**Option Rapide (recommandée) :**
```bash
cd "/Users/diezowee/whatsapp order"
./scripts/migrate-all.sh
```

**Option Contrôlée :**
```bash
# 1. Supabase
./scripts/setup-supabase.sh

# 2. Tester en local
cd apps/web && pnpm dev

# 3. Déployer
./scripts/deploy-vercel.sh
```

---

**Bonne migration ! 🎉**

*Temps estimé : 15-30 minutes pour la migration complète*
