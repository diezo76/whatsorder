# 🔧 Solution : Erreurs 404 Next.js

## ❌ Problème

Erreurs 404 pour les fichiers statiques Next.js :
```
Failed to load resource: the server responded with a status of 404 (Not Found)
- main-app.js
- app-pages-internals.js
- layout.css
```

## ✅ Solution

### 1. Nettoyer le cache Next.js

```bash
cd apps/web
rm -rf .next
```

### 2. Redémarrer le serveur de développement

```bash
# Depuis la racine du projet
pnpm --filter web dev

# OU depuis apps/web
cd apps/web
pnpm dev
```

### 3. Si le problème persiste

#### Option A : Réinstaller les dépendances
```bash
cd apps/web
rm -rf node_modules .next
pnpm install
pnpm dev
```

#### Option B : Vérifier le port
Assurez-vous que le port 3000 n'est pas utilisé par un autre processus :
```bash
lsof -ti:3000
# Si un processus est trouvé, le tuer :
kill -9 $(lsof -ti:3000)
```

#### Option C : Vérifier les variables d'environnement
Assurez-vous que `apps/web/.env.local` existe et contient les bonnes valeurs :
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://rvndgopsysdyycelmfuu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

## 🔍 Causes Possibles

1. **Cache corrompu** : Le dossier `.next` contient des fichiers obsolètes
2. **Serveur non démarré** : Le serveur de développement Next.js n'est pas en cours d'exécution
3. **Build incomplet** : Le build Next.js n'a pas été complété correctement
4. **Port occupé** : Un autre processus utilise le port 3000

## 📝 Vérification

Après avoir nettoyé le cache et redémarré le serveur, vous devriez voir :
- ✅ Le serveur démarre sur `http://localhost:3000`
- ✅ Les fichiers statiques sont générés dans `.next/static/`
- ✅ Plus d'erreurs 404 dans la console du navigateur

## 🚀 Commandes Rapides

```bash
# Nettoyer et redémarrer
cd apps/web
rm -rf .next
pnpm dev
```

---

**Note** : Si vous utilisez `pnpm dev` depuis la racine, assurez-vous que les deux serveurs (web et api) démarrent correctement.
