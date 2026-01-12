# 🚀 Guide de Déploiement sur Vercel

**Date :** 12 janvier 2026  
**Projet :** Whataybo - Système de commande restaurant via WhatsApp

---

## 📋 Prérequis

1. ✅ Compte Vercel configuré
2. ✅ Projet connecté à Vercel
3. ✅ Variables d'environnement configurées
4. ✅ Base de données Supabase configurée

---

## 🔧 Méthodes de Déploiement

### Méthode 1 : Déploiement via Git (Recommandé)

Si votre projet est connecté à un dépôt Git (GitHub, GitLab, Bitbucket) :

1. **Committer les changements**
   ```bash
   git add .
   git commit -m "feat: Ajout système d'onboarding rapide et corrections settings"
   git push origin main
   ```

2. **Vercel déploiera automatiquement**
   - Vercel détecte automatiquement le push
   - Le déploiement démarre automatiquement
   - Vous recevrez une notification une fois terminé

---

### Méthode 2 : Déploiement via CLI Vercel

1. **Installer Vercel CLI** (si pas déjà installé)
   ```bash
   npm i -g vercel
   ```

2. **Se connecter à Vercel**
   ```bash
   vercel login
   ```

3. **Déployer**
   ```bash
   cd apps/web
   vercel --prod
   ```

   Ou depuis la racine :
   ```bash
   vercel --prod --cwd apps/web
   ```

---

### Méthode 3 : Déploiement via Dashboard Vercel

1. **Aller sur** https://vercel.com/dashboard
2. **Sélectionner votre projet**
3. **Cliquer sur "Redeploy"** dans les trois points (⋯)
4. **Sélectionner le dernier commit** ou "Use existing Build Cache"
5. **Cliquer sur "Redeploy"**

---

## ⚙️ Configuration Vercel

### Variables d'Environnement Requises

Assurez-vous que ces variables sont configurées dans Vercel :

**Base de données :**
- `DATABASE_URL` - URL de connexion Supabase PostgreSQL
- `SUPABASE_URL` - URL de votre projet Supabase
- `SUPABASE_ANON_KEY` - Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clé service role Supabase ⚠️ **IMPORTANT**

**Authentification :**
- `JWT_SECRET` - Secret pour signer les tokens JWT

**Application :**
- `NEXT_PUBLIC_API_URL` - URL de l'API (optionnel, utilise l'origine par défaut)
- `NEXT_PUBLIC_APP_URL` - URL de l'application (ex: https://www.whataybo.com)

---

## 🔍 Vérification Post-Déploiement

### 1. Vérifier le Déploiement

```bash
# Vérifier le statut
vercel ls

# Voir les logs
vercel logs --follow
```

### 2. Tester les Fonctionnalités

**Nouvelles fonctionnalités à tester :**
- ✅ Système d'onboarding rapide (`/onboarding`)
- ✅ Persistance des paramètres restaurant après actualisation
- ✅ Modification du restaurant dans les settings

**Tests recommandés :**
1. **Onboarding**
   - Créer un nouveau compte
   - Vérifier la redirection vers `/onboarding`
   - Compléter les 3 étapes
   - Vérifier la création du restaurant et du menu

2. **Settings**
   - Modifier le nom du restaurant
   - Actualiser la page (F5)
   - Vérifier que les modifications persistent

3. **API**
   - Tester `/api/restaurant` (GET)
   - Tester `/api/restaurant` (PUT)
   - Tester `/api/onboarding/quick-setup` (POST)
   - Tester `/api/onboarding/check` (GET)

---

## 🐛 Résolution de Problèmes

### Erreur : "Server configuration error"

**Cause :** `SUPABASE_SERVICE_ROLE_KEY` manquante

**Solution :**
1. Aller sur Vercel Dashboard → Projet → Settings → Environment Variables
2. Ajouter `SUPABASE_SERVICE_ROLE_KEY` avec la valeur de Supabase
3. Redéployer

### Erreur : Build failed

**Vérifier :**
- Les dépendances sont à jour (`pnpm install`)
- Les types TypeScript sont corrects (`pnpm typecheck`)
- Les variables d'environnement sont configurées

### Erreur : API routes 404

**Vérifier :**
- Le fichier `vercel.json` est correctement configuré
- Les routes API sont dans `apps/web/app/api/`
- Le build Next.js s'est terminé avec succès

---

## 📝 Checklist de Déploiement

Avant de déployer, vérifier :

- [ ] Tous les fichiers sont commités
- [ ] Les tests locaux passent
- [ ] Les variables d'environnement sont configurées
- [ ] `SUPABASE_SERVICE_ROLE_KEY` est présente
- [ ] Le build local fonctionne (`pnpm build`)
- [ ] Les migrations Prisma sont appliquées sur Supabase

---

## 🎯 Commandes Rapides

```bash
# Build local pour tester
cd apps/web
pnpm build

# Déployer via CLI
vercel --prod

# Voir les logs en temps réel
vercel logs --follow

# Lister les déploiements
vercel ls
```

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs Vercel
2. Vérifier les logs Supabase
3. Vérifier les variables d'environnement
4. Consulter la documentation Vercel : https://vercel.com/docs

---

**Bon déploiement ! 🚀**
