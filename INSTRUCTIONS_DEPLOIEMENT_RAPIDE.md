# 🚀 Instructions de Déploiement Rapide sur Vercel

## Option 1 : Déploiement Automatique via Git (Recommandé)

Si votre projet est connecté à GitHub/GitLab/Bitbucket :

```bash
# 1. Ajouter tous les fichiers modifiés
git add .

# 2. Créer un commit
git commit -m "feat: Ajout système d'onboarding rapide et corrections settings"

# 3. Pousser vers le dépôt
git push origin main
```

**Vercel déploiera automatiquement** dès que le push est détecté ! ✅

---

## Option 2 : Déploiement via CLI Vercel

```bash
# Depuis la racine du projet
bash scripts/deploy-vercel.sh
```

Ou manuellement :

```bash
# 1. Aller dans le dossier web
cd apps/web

# 2. Déployer en production
vercel --prod
```

---

## Option 3 : Déploiement via Dashboard Vercel

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Cliquer sur les **trois points (⋯)** à côté du dernier déploiement
4. Cliquer sur **"Redeploy"**
5. Sélectionner **"Use existing Build Cache"** ou le dernier commit
6. Cliquer sur **"Redeploy"**

---

## ⚠️ Vérifications Importantes Avant Déploiement

### Variables d'Environnement

Assurez-vous que ces variables sont configurées dans Vercel :

✅ **Obligatoires :**
- `DATABASE_URL` - URL Supabase PostgreSQL
- `SUPABASE_URL` - URL projet Supabase  
- `SUPABASE_ANON_KEY` - Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - ⚠️ **CRITIQUE** pour les API routes
- `JWT_SECRET` - Secret pour les tokens JWT

✅ **Optionnelles mais recommandées :**
- `NEXT_PUBLIC_APP_URL` - URL de l'app (ex: https://www.whataybo.com)

### Vérifier les Variables

```bash
# Via CLI Vercel
vercel env ls
```

---

## 🧪 Test Post-Déploiement

Une fois déployé, tester :

1. **Onboarding** : https://www.whataybo.com/onboarding
2. **Settings** : https://www.whataybo.com/dashboard/settings
3. **API Restaurant** : https://www.whataybo.com/api/restaurant

---

## 📊 Voir les Logs

```bash
# Logs en temps réel
vercel logs --follow

# Logs du dernier déploiement
vercel logs
```

---

## 🐛 En Cas de Problème

### Erreur "Server configuration error"
→ Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est bien configurée

### Build échoue
→ Vérifier les logs : `vercel logs --follow`

### Routes API 404
→ Vérifier que `vercel.json` est correctement configuré

---

**Bon déploiement ! 🎉**
