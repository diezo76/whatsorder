# Compte Rendu - Correction Erreurs Prepared Statements Prisma

## 📋 Problème identifié

Les erreurs 500 étaient causées par des conflits de **prepared statements** entre Prisma et le Supabase Connection Pooler.

### Erreurs PostgreSQL observées :
- **`42P05`** : "prepared statement \"s0\" already exists"
- **`26000`** : "prepared statement \"s0\" does not exist"
- **`08P01`** : "bind message supplies 2 parameters, but prepared statement \"s0\" requires 3"

### Cause
Prisma utilise des **prepared statements** (requêtes préparées) pour optimiser les performances. Cependant, avec un **Connection Pooler** comme celui de Supabase (PgBouncer), ces prepared statements sont partagés entre plusieurs connexions, ce qui cause des conflits :
- Plusieurs requêtes simultanées essaient de créer le même prepared statement
- Les prepared statements sont supprimés par une connexion alors qu'une autre les utilise encore
- Les paramètres ne correspondent pas entre les requêtes

## ✅ Solution appliquée

### 1. **Modification de `apps/web/lib/server/prisma.ts`**
Ajout du paramètre `pgbouncer=true` à la `DATABASE_URL` pour désactiver les prepared statements :

```typescript
// Désactiver les prepared statements pour éviter les conflits avec le Connection Pooler
const databaseUrl = process.env.DATABASE_URL.includes('pgbouncer=true')
  ? process.env.DATABASE_URL
  : `${process.env.DATABASE_URL}${process.env.DATABASE_URL.includes('?') ? '&' : '?'}pgbouncer=true`;
```

### 2. **Vérification sur Vercel**
**IMPORTANT** : Vérifier que la `DATABASE_URL` sur Vercel contient `pgbouncer=true`.

Si ce n'est pas le cas, mettre à jour la variable d'environnement :

```bash
# Format attendu :
postgresql://postgres.rvndgopsysdyycelmfuu:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 🔧 Action requise sur Vercel

Si la `DATABASE_URL` sur Vercel ne contient pas `pgbouncer=true`, il faut l'ajouter :

1. Aller sur https://vercel.com/diiezos-projects/whatsorder-web/settings/environment-variables
2. Modifier `DATABASE_URL` pour ajouter `?pgbouncer=true` à la fin
3. Redéployer l'application

**Format actuel** :
```
postgresql://postgres.rvndgopsysdyycelmfuu:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

**Format requis** :
```
postgresql://postgres.rvndgopsysdyycelmfuu:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 📝 Notes techniques

- **Pourquoi `pgbouncer=true` ?**
  - Prisma détecte ce paramètre et désactive automatiquement les prepared statements
  - Cela évite les conflits avec PgBouncer (Connection Pooler de Supabase)
  - Les performances peuvent être légèrement réduites, mais la stabilité est garantie

- **Alternative** : Utiliser `DIRECT_URL` au lieu de `DATABASE_URL`
  - Le `DIRECT_URL` n'utilise pas de pooler, donc pas de problème de prepared statements
  - Cependant, cela peut causer des problèmes de connexion avec trop de requêtes simultanées
  - **Recommandation** : Utiliser le pooler avec `pgbouncer=true`

## 🚀 Déploiement

- **Commit** : `475fd8e`
- **Message** : "fix: Disable prepared statements for Prisma with Supabase Connection Pooler"
- **Fichiers modifiés** :
  - `apps/web/lib/server/prisma.ts`

## ✅ Résultat attendu

Après le déploiement et la mise à jour de `DATABASE_URL` sur Vercel :
- ✅ Plus d'erreurs `42P05` (prepared statement already exists)
- ✅ Plus d'erreurs `26000` (prepared statement does not exist)
- ✅ Plus d'erreurs `08P01` (bind message parameters mismatch)
- ✅ Toutes les routes API fonctionnent correctement

---

**Date** : 2026-01-15  
**Commit** : `475fd8e`
