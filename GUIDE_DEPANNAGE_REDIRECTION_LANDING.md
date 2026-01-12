# Guide de Dépannage - Redirection vers Login au lieu de Landing Page

## 🔍 Problème

Quand vous accédez à `https://whataybo.com`, vous êtes redirigé vers `/login` au lieu de voir la landing page.

## ✅ Solutions

### Solution 1 : Vider le Cache du Navigateur

1. **Chrome/Edge** :
   - Appuyez sur `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
   - Sélectionnez "Images et fichiers en cache"
   - Cliquez sur "Effacer les données"

2. **Firefox** :
   - Appuyez sur `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
   - Sélectionnez "Cache"
   - Cliquez sur "Effacer maintenant"

3. **Safari** :
   - `Cmd+Option+E` pour vider le cache
   - OU : Safari → Préférences → Avancé → Afficher le menu Développement → Vider les caches

4. **Recharger en force** :
   - `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)

### Solution 2 : Vérifier le Déploiement Vercel

1. **Vérifier le dernier déploiement** :
   - Allez sur : https://vercel.com/dashboard
   - Sélectionnez votre projet
   - Vérifiez que le dernier déploiement a réussi
   - Vérifiez que le commit avec la landing page est bien déployé

2. **Redéployer si nécessaire** :
   - Si le dernier déploiement est ancien, faites un nouveau push :
   ```bash
   git add .
   git commit -m "fix: Ensure landing page displays correctly"
   git push origin main
   ```

3. **Vérifier les logs Vercel** :
   - Dans Vercel Dashboard → Deployments → Cliquez sur le dernier déploiement
   - Vérifiez les logs pour voir s'il y a des erreurs

### Solution 3 : Vérifier la Configuration Vercel

1. **Vérifier les Redirects** :
   - Vercel Dashboard → Settings → Redirects
   - Vérifiez qu'il n'y a pas de redirect de `/` vers `/login`
   - Si oui, supprimez-le

2. **Vérifier les Rewrites** :
   - Vercel Dashboard → Settings → Rewrites
   - Vérifiez qu'il n'y a pas de rewrite qui pourrait causer le problème

### Solution 4 : Vérifier le Domaine

**Important** : Assurez-vous d'utiliser le bon domaine :
- ✅ **https://whataybo.com** (nouveau domaine)
- ❌ **https://whatsorder.com** (ancien domaine, peut avoir des redirects)

Si vous utilisez encore `whatsorder.com`, vous devez :
1. Configurer le domaine `whataybo.com` dans Vercel
2. OU mettre à jour les redirects pour `whatsorder.com`

### Solution 5 : Vérifier le Code

Le fichier `apps/web/app/page.tsx` devrait contenir la landing page complète, pas de redirection.

**Vérifiez que le fichier contient bien** :
- ✅ `export default function LandingPage()`
- ✅ Pas de `router.push('/login')` ou `window.location.href = '/login'`
- ✅ Pas de `useEffect` qui redirige

### Solution 6 : Test en Navigation Privée

1. Ouvrez une fenêtre de navigation privée :
   - Chrome : `Ctrl+Shift+N` (Windows) ou `Cmd+Shift+N` (Mac)
   - Firefox : `Ctrl+Shift+P` (Windows) ou `Cmd+Shift+P` (Mac)
   - Safari : `Cmd+Shift+N`

2. Accédez à : `https://whataybo.com`

3. Si ça fonctionne en navigation privée, c'est un problème de cache

### Solution 7 : Vérifier les Cookies/LocalStorage

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet "Application" (Chrome) ou "Stockage" (Firefox)
3. Vérifiez :
   - **Cookies** : Supprimez tous les cookies pour `whataybo.com`
   - **Local Storage** : Supprimez tous les éléments pour `whataybo.com`
   - **Session Storage** : Supprimez tous les éléments

4. Rechargez la page

## 🔧 Vérifications Techniques

### Vérifier le Code Source

1. Ouvrez : `https://whataybo.com`
2. Affichez le code source (Ctrl+U / Cmd+U)
3. Recherchez "LandingPage" ou "Whataybo"
4. Si vous ne trouvez pas ces mots, c'est que l'ancienne version est encore déployée

### Vérifier la Route dans Next.js

Le fichier `apps/web/app/page.tsx` devrait être la landing page. Vérifiez qu'il n'y a pas d'autre fichier qui pourrait prendre le dessus.

### Vérifier le Middleware

Le middleware (`apps/web/middleware.ts`) ne devrait **PAS** rediriger depuis `/` :
- Le matcher est : `['/dashboard/:path*', '/login', '/register']`
- La route `/` n'est **PAS** dans le matcher, donc le middleware ne devrait pas la toucher

## 📋 Checklist de Dépannage

- [ ] Cache du navigateur vidé
- [ ] Page rechargée en force (Ctrl+Shift+R)
- [ ] Testé en navigation privée
- [ ] Cookies/LocalStorage supprimés
- [ ] Dernier déploiement Vercel vérifié
- [ ] Logs Vercel vérifiés (pas d'erreurs)
- [ ] Redirects Vercel vérifiés (pas de redirect `/` → `/login`)
- [ ] Domaine correct utilisé (`whataybo.com` pas `whatsorder.com`)
- [ ] Code source vérifié (contient "LandingPage")
- [ ] Fichier `apps/web/app/page.tsx` vérifié (pas de redirection)

## 🚨 Si Rien ne Fonctionne

1. **Vérifier le fichier page.tsx** :
   - Ouvrez `apps/web/app/page.tsx`
   - Vérifiez qu'il contient bien la landing page complète
   - Vérifiez qu'il n'y a pas de redirection

2. **Forcer un nouveau déploiement** :
   ```bash
   # Faire un petit changement pour forcer le déploiement
   git add apps/web/app/page.tsx
   git commit -m "fix: Force redeploy landing page"
   git push origin main
   ```

3. **Contacter le support Vercel** :
   - Si le problème persiste après toutes ces vérifications
   - Fournissez les logs de déploiement
   - Indiquez le domaine utilisé

## ✅ Solution Rapide

**Si vous voulez une solution immédiate** :

1. Videz le cache : `Ctrl+Shift+R` (ou `Cmd+Shift+R`)
2. Testez en navigation privée
3. Si ça fonctionne, c'est un problème de cache
4. Si ça ne fonctionne pas, vérifiez le déploiement Vercel

---

**Note** : Le code actuel ne devrait **PAS** rediriger depuis `/` vers `/login`. Si vous êtes redirigé, c'est probablement un problème de cache ou de configuration Vercel.
