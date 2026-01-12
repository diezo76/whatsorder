# 🔧 Solution - Erreur 404 sur Vercel pour /api/auth/health

**Date** : 12 janvier 2026  
**Problème** : `Failed to load resource: the server responded with a status of 404 ()` sur `https://whatsorder-web.vercel.app/api/auth/health`

---

## 🔍 Diagnostic

### État Actuel ✅

- ✅ Route créée : `apps/web/app/api/auth/health/route.ts`
- ✅ Route dupliquée supprimée : `apps/web/pages/api/auth/health.ts`
- ✅ Code correct et fonctionnel localement
- ❌ Route non disponible sur Vercel (404)

### Cause Probable

**Vercel n'a pas été redéployé** avec les nouvelles modifications. Les routes API dans Next.js App Router nécessitent un nouveau build pour être disponibles.

---

## ✅ Solution : Redéployer sur Vercel

### Option 1 : Redéploiement via Dashboard Vercel (Recommandé)

#### Étape 1 : Ouvrir Vercel Dashboard
1. Allez sur https://vercel.com/dashboard
2. Connectez-vous à votre compte
3. Sélectionnez le projet **whatsorder-web**

#### Étape 2 : Redéployer
1. Cliquez sur l'onglet **"Deployments"**
2. Trouvez le dernier déploiement
3. Cliquez sur les **"..."** (trois points) à droite
4. Cliquez sur **"Redeploy"**
5. **IMPORTANT** : Décochez **"Use existing Build Cache"**
6. Cliquez sur **"Redeploy"**

#### Étape 3 : Attendre le Build
- Le build prend généralement 2-5 minutes
- Surveillez les logs pour vérifier qu'il n'y a pas d'erreurs
- Attendez que le statut soit **"Ready"**

#### Étape 4 : Tester
```bash
curl https://whatsorder-web.vercel.app/api/auth/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "service": "auth",
  "timestamp": "2026-01-12T...",
  "environment": "production"
}
```

---

### Option 2 : Push sur GitHub (Déploiement Automatique)

Si vous avez configuré l'intégration GitHub avec Vercel, un simple push déclenchera un nouveau déploiement :

#### Étape 1 : Committer les Changements
```bash
cd "/Users/diezowee/whatsapp order"
git add .
git commit -m "fix: Add /api/auth/health route in App Router"
git push origin main
```

#### Étape 2 : Vérifier le Déploiement
1. Allez sur Vercel Dashboard
2. Onglet **"Deployments"**
3. Un nouveau déploiement devrait apparaître automatiquement
4. Attendez qu'il soit terminé (statut "Ready")

#### Étape 3 : Tester
```bash
curl https://whatsorder-web.vercel.app/api/auth/health
```

---

## 🔍 Vérifications Supplémentaires

### 1. Vérifier la Configuration Root Directory

Assurez-vous que le **Root Directory** est configuré sur `apps/web` :

1. Vercel Dashboard → **Settings** → **General**
2. Vérifiez que **Root Directory** = `apps/web`
3. Si ce n'est pas le cas, modifiez-le et redéployez

### 2. Vérifier les Logs de Build

Dans Vercel Dashboard → **Deployments** → Cliquez sur le dernier déploiement → **Build Logs**

**Recherchez** :
- ✅ `✓ Compiled successfully`
- ✅ Pas d'erreurs liées à `app/api/auth/health`
- ❌ Si vous voyez des erreurs, notez-les

### 3. Vérifier que le Fichier est Présent

Dans les logs de build, vous devriez voir :
```
✓ Collecting page data
✓ Generating static pages
✓ Collecting build traces
```

Si vous voyez des erreurs comme :
```
Error: Cannot find module './app/api/auth/health/route'
```

→ Le fichier n'est pas détecté par Next.js. Vérifiez :
- Le chemin du fichier est correct
- Le fichier est bien commité dans Git
- Le Root Directory est correctement configuré

---

## 🐛 Dépannage Avancé

### Problème 1 : Route toujours 404 après redéploiement

**Solution** :
1. Vérifiez que le fichier `apps/web/app/api/auth/health/route.ts` existe bien
2. Vérifiez que l'export `GET` est correct :
   ```typescript
   export async function GET() {
     return NextResponse.json({ ... });
   }
   ```
3. Vérifiez les logs de build pour des erreurs TypeScript
4. Essayez de créer une route de test simple pour vérifier que les routes API fonctionnent

### Problème 2 : Build échoue

**Solution** :
1. Vérifiez les logs de build dans Vercel
2. Vérifiez que toutes les dépendances sont installées
3. Vérifiez que `next.config.js` est correct
4. Essayez de build localement : `cd apps/web && npm run build`

### Problème 3 : Route fonctionne localement mais pas sur Vercel

**Causes possibles** :
- Cache Vercel (solution : décocher "Use existing Build Cache")
- Variables d'environnement manquantes
- Problème de configuration Next.js

**Solution** :
1. Videz le cache Vercel lors du redéploiement
2. Vérifiez les variables d'environnement dans Vercel Settings
3. Comparez la configuration locale avec celle de Vercel

---

## 📝 Checklist de Vérification

Avant de tester sur Vercel, vérifiez localement :

- [ ] Le fichier `apps/web/app/api/auth/health/route.ts` existe
- [ ] La route fonctionne localement : `curl http://localhost:3000/api/auth/health`
- [ ] Pas d'erreurs dans la console Next.js
- [ ] Le fichier est commité dans Git
- [ ] Le Root Directory est configuré sur `apps/web` dans Vercel

Après redéploiement sur Vercel :

- [ ] Le build s'est terminé avec succès
- [ ] Pas d'erreurs dans les logs de build
- [ ] La route répond : `curl https://whatsorder-web.vercel.app/api/auth/health`
- [ ] La réponse JSON est correcte

---

## 🚀 Commandes Utiles

### Tester Localement
```bash
# Démarrer le serveur de développement
cd apps/web
pnpm dev

# Dans un autre terminal, tester la route
curl http://localhost:3000/api/auth/health
```

### Build Local (Simuler Vercel)
```bash
cd apps/web
pnpm build
pnpm start

# Tester en production locale
curl http://localhost:3000/api/auth/health
```

### Vérifier les Fichiers
```bash
# Vérifier que le fichier existe
ls -la apps/web/app/api/auth/health/route.ts

# Vérifier le contenu
cat apps/web/app/api/auth/health/route.ts
```

---

## ✅ Résolution Attendue

Après avoir suivi ces étapes, la route `/api/auth/health` devrait être accessible sur Vercel et retourner :

```json
{
  "status": "ok",
  "service": "auth",
  "timestamp": "2026-01-12T14:30:00.000Z",
  "environment": "production"
}
```

---

## 📚 Références

- [Next.js App Router API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Guide Vercel Monorepo](./GUIDE_VERCEL_MONOREPO.md)

---

**Dernière mise à jour** : 12 janvier 2026  
**Statut** : En attente de redéploiement Vercel
