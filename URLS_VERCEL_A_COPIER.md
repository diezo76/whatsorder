# 📋 URLs à Copier-Coller dans Vercel

## 🔗 URLs Supabase Complètes

### DATABASE_URL (Production)

```
postgresql://postgres.rvndgopsysdyycelmfuu:Siinadiiezo29@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### DIRECT_URL (Production)

```
postgresql://postgres.rvndgopsysdyycelmfuu:Siinadiiezo29@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## ⚙️ Configuration dans Vercel Dashboard

### Étape 1 : Accéder aux Variables d'Environnement

1. Allez sur : **https://vercel.com/dashboard**
2. Sélectionnez le projet : **whatsorder-web**
3. Cliquez sur **"Settings"** (menu gauche)
4. Cliquez sur **"Environment Variables"**

### Étape 2 : Ajouter DATABASE_URL

1. Cliquez sur **"Add New"**
2. **Key:** `DATABASE_URL`
3. **Value:** Copiez-collez cette URL exacte :
   ```
   postgresql://postgres.rvndgopsysdyycelmfuu:Siinadiiezo29@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. **Environments:** ✅ Cochez **"Production"**
5. Cliquez sur **"Save"**

### Étape 3 : Ajouter DIRECT_URL

1. Cliquez sur **"Add New"**
2. **Key:** `DIRECT_URL`
3. **Value:** Copiez-collez cette URL exacte :
   ```
   postgresql://postgres.rvndgopsysdyycelmfuu:Siinadiiezo29@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. **Environments:** ✅ Cochez **"Production"**
5. Cliquez sur **"Save"**

### Étape 4 : Vérifier les Variables Existantes

Assurez-vous que ces variables existent aussi pour **Production** :

- ✅ `JWT_SECRET` (doit être configuré)
- ✅ `NODE_ENV=production`
- ✅ `NEXT_PUBLIC_SUPABASE_URL` (si utilisé)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (si utilisé)
- ✅ `OPENAI_API_KEY` (si utilisé)

### Étape 5 : Redéployer

1. Allez dans **"Deployments"**
2. Cliquez sur **"..."** du dernier déploiement
3. Cliquez sur **"Redeploy"**
4. **Décochez** "Use existing Build Cache"
5. Cliquez sur **"Redeploy"**

---

## ✅ Vérification

Après redéploiement, testez :

```bash
cd "/Users/diezowee/whatsapp order"
./test-production.sh https://whatsorder-web-diiezos-projects.vercel.app
```

Le login devrait maintenant fonctionner ! 🎉
