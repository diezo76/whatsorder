# Instructions - Correction Erreurs Prepared Statements

## 🔴 Problème

Erreur PostgreSQL `42P05`: "prepared statement already exists" avec Supabase Connection Pooler.

## ✅ Solution appliquée dans le code

Le code modifie automatiquement la `DATABASE_URL` pour ajouter :
- `pgbouncer=true` - Désactive les prepared statements pour PgBouncer
- `statement_cache_size=0` - Désactive complètement le cache des prepared statements

## ⚠️ Action requise sur Vercel

**IMPORTANT** : Pour que la correction fonctionne immédiatement, mettre à jour la `DATABASE_URL` sur Vercel :

### 1. Aller sur Vercel
👉 https://vercel.com/diiezos-projects/whatsorder-web/settings/environment-variables

### 2. Modifier `DATABASE_URL`

**Format actuel** (probablement) :
```
postgresql://postgres.rvndgopsysdyycelmfuu:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

**Format requis** :
```
postgresql://postgres.rvndgopsysdyycelmfuu:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&statement_cache_size=0
```

### 3. Redéployer

Après avoir modifié la variable, redéployer l'application :
- Soit attendre le prochain déploiement automatique
- Soit déclencher un redéploiement manuel

## 🔍 Vérification

Après le déploiement, tester :
1. **Login** : https://whataybo.com/dashboard/login
2. **Route publique** : https://whataybo.com/api/public/restaurants/doctor-grill

Si les erreurs `42P05` persistent, vérifier les logs Vercel pour confirmer que la nouvelle `DATABASE_URL` est utilisée.

## 📝 Notes techniques

- Le code ajoute automatiquement ces paramètres si ils ne sont pas présents
- Cependant, il est recommandé de les mettre directement dans Vercel pour éviter tout délai
- `pgbouncer=true` indique à Prisma d'utiliser le mode transactionnel de PgBouncer
- `statement_cache_size=0` désactive complètement le cache des prepared statements

---

**Date** : 2026-01-15  
**Commit** : `8efd0ab`
