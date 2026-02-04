# Compte Rendu - Diagnostic Erreur 500 "Internal Server Error"

## 📋 Problème

L'utilisateur signale une erreur "Internal server error" (500) sur l'application.

## ✅ Améliorations apportées

### 1. **Vérification JWT_SECRET**
- Ajout de vérifications explicites pour `JWT_SECRET` dans toutes les routes d'authentification
- Messages d'erreur clairs si `JWT_SECRET` n'est pas défini
- Logs détaillés pour identifier le problème

**Fichiers modifiés** :
- `apps/web/app/api/auth/login/route.ts`
- `apps/web/app/api/auth/me/route.ts`
- `apps/web/lib/server/auth-app.ts`

### 2. **Amélioration gestion erreurs Prisma**
- Vérification que `DATABASE_URL` est défini au démarrage
- Détection spécifique des erreurs de connexion Prisma (code P1001)
- Logs détaillés avec code d'erreur, message et stack trace

**Fichiers modifiés** :
- `apps/web/lib/server/prisma.ts`
- `apps/web/app/api/public/restaurants/[slug]/route.ts`

### 3. **Logs améliorés**
- Tous les `console.error` incluent maintenant :
  - Message d'erreur
  - Stack trace
  - Code d'erreur (si disponible)
- Préfixe `❌` pour faciliter la recherche dans les logs

## 🔍 Diagnostic

### Pour identifier la cause exacte de l'erreur 500 :

1. **Vérifier les logs Vercel** :
   ```
   https://vercel.com/diiezos-projects/whatsorder-web/3qEa4Vi7xEStnjjBFBFGcr7tWLG2
   ```
   Clique sur "Functions" puis sur une fonction qui a échoué pour voir les logs.

2. **Tester les routes publiques** :
   ```
   GET https://whataybo.com/api/public/restaurants/doctor-grill
   ```
   - Si ça fonctionne → Le problème vient de l'authentification (tokens invalides)
   - Si ça échoue → Le problème vient de la connexion à la base de données

3. **Tester la connexion** :
   ```
   POST https://whataybo.com/api/auth/login
   Body: { "email": "chauffeuregypte@gmail.com", "password": "Siinadiiezo29" }
   ```
   - Si ça fonctionne → Le problème vient des tokens existants (il faut se reconnecter)
   - Si ça échoue → Vérifier les logs pour voir l'erreur exacte

## 🎯 Causes possibles

### 1. **JWT_SECRET non défini**
**Symptôme** : Erreur "Server configuration error"  
**Solution** : Vérifier que `JWT_SECRET` est bien configuré sur Vercel

### 2. **Tokens JWT invalides**
**Symptôme** : Erreur 401 "Invalid or expired token" sur les routes authentifiées  
**Solution** : Se reconnecter pour obtenir de nouveaux tokens

### 3. **Erreur de connexion Prisma**
**Symptôme** : Erreur "Database connection error" ou code P1001  
**Causes possibles** :
- `DATABASE_URL` incorrect ou non défini
- `DIRECT_URL` incorrect ou non défini
- Problème de connexion réseau avec Supabase
- Base de données Supabase endormie (mode free tier)

**Solution** :
- Vérifier les variables d'environnement sur Vercel
- Vérifier le statut de Supabase : https://supabase.com/dashboard/project/rvndgopsysdyycelmfuu
- Réveiller la base de données si nécessaire

### 4. **Erreur dans le code**
**Symptôme** : Stack trace dans les logs  
**Solution** : Corriger le bug identifié dans les logs

## 📝 Variables d'environnement à vérifier

Sur Vercel, vérifier que ces variables sont bien définies :

- ✅ `JWT_SECRET` : `MpwALS2wa4ht5A1PsTdBIhZXT7VrVqpxZJHWysFevkeH241R2Zi7QXIxTKfbsu/jcxlQxYNX7A0+aPNsscdS8w==`
- ✅ `DATABASE_URL` : `postgresql://postgres.rvndgopsysdyycelmfuu:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`
- ✅ `DIRECT_URL` : `postgresql://postgres:[PASSWORD]@db.rvndgopsysdyycelmfuu.supabase.co:5432/postgres`
- ✅ `NEXT_PUBLIC_SUPABASE_URL` : `https://rvndgopsysdyycelmfuu.supabase.co`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` : (clé anon)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` : (clé service role)

## 🚀 Déploiement

- **ID** : `dpl_3qEa4Vi7xEStnjjBFBFGcr7tWLG2`
- **État** : ✅ READY
- **Commit** : `ea5d37a5ca67679a0b0a4f1e39d32bf5a7953d24`
- **Message** : "fix: Improve error handling and logging for JWT_SECRET and database connection"

## 📋 Prochaines étapes

1. **Vérifier les logs Vercel** pour voir l'erreur exacte
2. **Tester une route publique** pour isoler le problème
3. **Tester la connexion** pour vérifier si c'est un problème de tokens
4. **Partager les logs** si l'erreur persiste pour un diagnostic plus approfondi

---

**Date** : 2026-01-15  
**Déploiement** : `dpl_3qEa4Vi7xEStnjjBFBFGcr7tWLG2`
