# 🚂 Guide de Déploiement Frontend (whatsorder-web) sur Railway

**Date** : 12 janvier 2026

---

## ✅ Fichiers Créés

Les fichiers de configuration Railway ont été créés :
- ✅ `apps/web/nixpacks.toml` - Configuration du build
- ✅ `apps/web/railway.json` - Configuration du déploiement
- ✅ `apps/web/.railwayignore` - Fichiers à ignorer

---

## 🔧 Configuration Railway Dashboard

### 1. Ouvrir le Projet Railway

Dans votre terminal :
```bash
railway open
```

Ou allez sur : https://railway.app/dashboard

---

### 2. Configurer le Service Web

#### A. Root Directory ⚠️ CRITIQUE
1. Cliquez sur votre service `whatsorder-web`
2. Allez dans **Settings**
3. **Root Directory** : Laissez VIDE (le build part depuis la racine du monorepo)
4. **Build Command** : (sera géré par nixpacks.toml)
5. **Start Command** : (sera géré par railway.json)
6. Cliquez sur **Save**

#### B. Variables d'Environnement

Allez dans l'onglet **Variables** et ajoutez :

```env
# URL de l'API (remplacez par votre URL Railway de l'API)
NEXT_PUBLIC_API_URL=https://votre-api.railway.app

# Optionnel : URL de base du site
NEXT_PUBLIC_BASE_URL=https://votre-site.railway.app

# Node Environment
NODE_ENV=production
```

**⚠️ IMPORTANT** : Remplacez `https://votre-api.railway.app` par l'URL réelle de votre service API Railway.

---

## 🚀 Déploiement

### Option 1 : Depuis le Dashboard Railway

1. Connectez votre repository GitHub au service
2. Sélectionnez la branche `main`
3. Railway déclenchera automatiquement un build

### Option 2 : Depuis le Terminal (CLI)

```bash
cd "/Users/diezowee/whatsapp order"

# Lier le projet Railway (choisir whatsorder-web)
railway link

# Déployer
railway up
```

---

## 🐛 Résolution des Erreurs Courantes

### Erreur 1 : "Module not found: Can't resolve '@whataybo/types'"

**Cause** : Les packages du monorepo ne sont pas trouvés

**Solution** : Vérifier que dans `nixpacks.toml`, l'installation se fait depuis la racine :
```toml
[phases.install]
cmds = [
  "cd /app && pnpm install --frozen-lockfile"
]
```

---

### Erreur 2 : "NEXT_PUBLIC_API_URL is undefined"

**Cause** : Variable d'environnement manquante

**Solution** :
1. Allez dans Railway Dashboard → Service → Variables
2. Ajoutez `NEXT_PUBLIC_API_URL=https://votre-api.railway.app`
3. Redéployez

---

### Erreur 3 : "Page redirects to /login automatically"

**Cause** : Problème avec le middleware ou AuthContext

**Solution** : Vérifier que la page d'accueil (/) est bien exclue des redirections dans `middleware.ts` :

```typescript
if (request.nextUrl.pathname === '/') {
  return NextResponse.next(); // ✅ Pas de redirection
}
```

---

### Erreur 4 : Build échoue avec "Cannot find module 'prisma'"

**Cause** : Prisma n'est pas nécessaire pour le build web, mais est dans le postinstall

**Solution** : Le script postinstall gère déjà cette erreur :
```json
"postinstall": "pnpm exec prisma generate || echo 'Prisma generate skipped'"
```

Si le problème persiste, désactiver temporairement dans `apps/web/package.json`.

---

## ✅ Vérification Post-Déploiement

### 1. Vérifier que le site est accessible

```bash
# Ouvrir l'URL du déploiement
railway open
```

Ou visitez directement l'URL générée (ex: `https://whatsorder-web-production-xxxx.railway.app`)

### 2. Tester les pages principales

- [ ] Page d'accueil `/` s'affiche correctement
- [ ] Page de connexion `/login` accessible
- [ ] Page de menu public `/nile-bites` accessible
- [ ] Dashboard `/dashboard` redirige vers `/login` si non connecté

### 3. Vérifier les logs

```bash
railway logs
```

Ou dans Railway Dashboard → Service → Deployments → Cliquez sur le déploiement → **View Logs**

---

## 📋 Checklist de Déploiement

- [ ] Fichiers de configuration Railway créés (`nixpacks.toml`, `railway.json`)
- [ ] Service `whatsorder-web` créé sur Railway
- [ ] Root Directory configuré (vide pour monorepo)
- [ ] Variable `NEXT_PUBLIC_API_URL` ajoutée
- [ ] Repository GitHub connecté
- [ ] Build réussi (pas d'erreurs)
- [ ] Site accessible via l'URL Railway
- [ ] Page d'accueil s'affiche sans redirection
- [ ] API est accessible depuis le frontend

---

## 🔗 URLs à Configurer

Après déploiement, mettez à jour ces URLs :

### Dans Railway (Variables du service API)
```env
FRONTEND_URL=https://whatsorder-web-production-xxxx.railway.app
```

### Dans Railway (Variables du service Web)
```env
NEXT_PUBLIC_API_URL=https://whatsorder-api-production-xxxx.railway.app
```

---

## 📊 Monitoring

### Vérifier les métriques

Railway Dashboard → Service → Metrics :
- CPU Usage
- Memory Usage
- Network
- Logs

### Alertes recommandées

- Build failures
- Deployment errors
- High memory usage (> 500MB)

---

## 🛠️ Commandes Utiles

```bash
# Voir les logs en temps réel
railway logs --tail

# Redéployer
railway up --detach

# Voir les variables d'environnement
railway variables

# Ouvrir le dashboard
railway open

# Voir le statut
railway status
```

---

## 📝 Notes Importantes

### Middleware et Redirections

Le middleware actuel (`apps/web/middleware.ts`) :
- ✅ Laisse passer la page d'accueil `/` SANS redirection
- ✅ Protège `/dashboard/*` (mais la vérification se fait côté client)
- ✅ Redirige `/login` et `/register` vers `/dashboard` si déjà connecté

**Pas de modifications nécessaires** - le middleware est correct.

### Supabase (Optionnel)

Si vous utilisez Supabase, ajoutez aussi :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 🆘 Support

Si les erreurs persistent :

1. **Vérifier les logs** : `railway logs --tail`
2. **Vérifier les variables** : Railway Dashboard → Variables
3. **Rebuild** : Railway Dashboard → Deployments → Three dots → Redeploy

---

**C'est tout ! Votre frontend Next.js devrait maintenant être déployé avec succès ! 🚀**

---

## 📄 Prochaines Étapes

Après un déploiement réussi :
1. Configurer un domaine personnalisé (Railway → Settings → Domains)
2. Activer les CORS sur l'API pour accepter le domaine du frontend
3. Configurer les variables de production (OPENAI_API_KEY, etc.)
4. Tester le flow complet : Login → Dashboard → Menu public
