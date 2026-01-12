# 🔧 Fix Postinstall Prisma pour Vercel

**Date** : 11 janvier 2026  
**Problème** : `postinstall: sh: line 1: prisma: command not found`  
**Statut** : ✅ Corrigé

---

## 🐛 Problème

Lors du déploiement Vercel, l'erreur suivante se produisait :

```
postinstall: sh: line 1: prisma: command not found
ELIFECYCLE  Command failed.
Error: Command "pnpm install" exited with 1
```

**Cause** : Le script `postinstall` dans `apps/web/package.json` essayait d'exécuter `prisma generate` mais Prisma n'était pas disponible dans le PATH lors de l'exécution du postinstall.

---

## ✅ Solution Appliquée

### 1. Modification du Script Postinstall

**Avant** :
```json
"postinstall": "prisma generate"
```

**Après** :
```json
"postinstall": "pnpm exec prisma generate || echo 'Prisma generate skipped'"
```

**Changements** :
- Utilisation de `pnpm exec` au lieu de `prisma` directement pour utiliser la version installée par pnpm
- Ajout d'un fallback (`|| echo ...`) pour éviter l'échec si Prisma n'est pas disponible
- Le script `build` contient déjà `prisma generate`, donc le postinstall est optionnel

### 2. Amélioration de la Configuration Vercel

**Fichier** : `vercel.json`

**Changements** :
- Ajout de `--frozen-lockfile` pour des builds reproductibles
- Simplification de la configuration

---

## 📋 Fichiers Modifiés

1. `apps/web/package.json` - Script postinstall corrigé
2. `vercel.json` - Configuration améliorée

---

## 🧪 Tests

### Test Local

```bash
cd apps/web
rm -rf node_modules/.prisma
pnpm install
```

**Résultat attendu** : ✅ Installation réussie, Prisma généré

### Test Vercel

Le déploiement Vercel devrait maintenant :
1. ✅ Installer les dépendances sans erreur
2. ✅ Exécuter le postinstall avec succès (ou le skip si Prisma non disponible)
3. ✅ Générer Prisma Client lors du build
4. ✅ Build réussi

---

## 🔍 Pourquoi Cette Solution Fonctionne

1. **`pnpm exec`** : Utilise la version de Prisma installée par pnpm, pas celle du système
2. **Fallback** : Si Prisma n'est pas disponible, le script ne fait pas échouer l'installation
3. **Build script** : `prisma generate` est déjà dans le script `build`, donc le postinstall est optionnel

---

## ⚠️ Alternative (si le problème persiste)

Si le problème persiste, on peut supprimer complètement le postinstall :

```json
// Supprimer cette ligne :
"postinstall": "pnpm exec prisma generate || echo 'Prisma generate skipped'",
```

Car `prisma generate` est déjà dans le script `build` :
```json
"build": "prisma generate && next build"
```

---

## 📊 Statut

- [x] Script postinstall corrigé
- [x] Configuration Vercel améliorée
- [x] Code commité et pushé
- [ ] Déploiement Vercel vérifié (en attente)

---

**Dernière mise à jour** : 11 janvier 2026
