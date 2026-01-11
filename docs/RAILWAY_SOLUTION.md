# 🔧 Solution Railway - Problème npm ci

**Date** : 11 janvier 2026  
**Problème** : Railway utilise `npm ci` au lieu de `pnpm install`

---

## ✅ Solution Appliquée

J'ai créé le fichier `apps/api/nixpacks.toml` qui force Railway à utiliser **pnpm** au lieu de npm.

### Fichier Créé

**`apps/api/nixpacks.toml`** :
```toml
[phases.setup]
nixPkgs = ["nodejs_18", "pnpm"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile"]

[phases.build]
cmds = [
  "pnpm prisma generate",
  "pnpm build"
]

[start]
cmd = "pnpm prisma migrate deploy && pnpm start"
```

Ce fichier indique à Railway/Nixpacks :
- ✅ D'utiliser **pnpm** au lieu de npm
- ✅ D'installer avec `pnpm install --frozen-lockfile`
- ✅ De générer Prisma puis builder
- ✅ De migrer Prisma puis démarrer

---

## 🚀 Prochaines Étapes

### 1. Supprimer package-lock.json (Optionnel)

Si vous avez un `package-lock.json` dans `apps/api`, vous pouvez le supprimer car vous utilisez pnpm :

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
rm package-lock.json
```

**Note** : Je l'ai ajouté au `.gitignore` pour éviter qu'il soit créé à nouveau.

### 2. Redéployer

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
railway up
```

Railway devrait maintenant :
1. ✅ Utiliser pnpm au lieu de npm
2. ✅ Installer les dépendances avec `pnpm install --frozen-lockfile`
3. ✅ Générer Prisma
4. ✅ Builder TypeScript
5. ✅ Migrer Prisma
6. ✅ Démarrer le serveur

---

## 🔍 Vérification

### Vérifier les Logs de Build

```bash
railway logs --build
```

Vous devriez voir :
- `pnpm install --frozen-lockfile` au lieu de `npm ci`
- Les commandes Prisma s'exécuter correctement
- Le build TypeScript réussir

### Vérifier le Déploiement

```bash
railway status
railway logs
```

---

## 🐛 Si le Problème Persiste

### Option 1 : Configurer Root Directory dans Railway

1. `railway open`
2. Service `api` → **Settings**
3. **Root Directory** : `apps/api`
4. Sauvegarder
5. Redéployer

### Option 2 : Déployer depuis la Racine

```bash
# Se positionner à la racine
cd "/Users/diezowee/whatsapp order"

# Lier le service depuis la racine
railway service link api

# Créer railway.json à la racine
# (voir guide complet)
```

---

## 📝 Checklist

- [x] Fichier `nixpacks.toml` créé dans `apps/api`
- [ ] `package-lock.json` supprimé (si présent)
- [ ] Redéploiement réussi
- [ ] Build réussi avec pnpm
- [ ] API accessible

---

**Prochaine étape** : Redéployer avec `railway up` et vérifier que le build utilise pnpm.
