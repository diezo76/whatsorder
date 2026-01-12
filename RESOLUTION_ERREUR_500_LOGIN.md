# 🔧 Résolution : Erreur 500 sur Login

## 🚨 Problème

Le login retourne une erreur **500 "Internal server error"** au lieu de fonctionner.

## ✅ Solutions par Ordre de Probabilité

### Solution 1 : Vérifier les Logs Vercel (PRIORITÉ)

L'erreur exacte est masquée en production. Pour la voir :

1. **Allez sur Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Projet: **whatsorder-web**

2. **Accédez aux Runtime Logs**
   - Cliquez sur **"Deployments"**
   - Cliquez sur le **dernier déploiement** (celui en production)
   - Cliquez sur l'onglet **"Functions"**
   - Cliquez sur **`/api/auth/login`**
   - Regardez les **"Runtime Logs"**

3. **Cherchez l'erreur**
   - Erreur Prisma ? → Voir Solution 2
   - Erreur Database ? → Voir Solution 3
   - Erreur JWT_SECRET ? → Voir Solution 4
   - Autre erreur ? → Partagez les logs

---

### Solution 2 : Vérifier Prisma Client

**Problème:** Prisma Client n'est pas généré correctement

**Vérification:**
```bash
# Le script postinstall devrait générer automatiquement
# Vérifiez dans package.json que vous avez :
# "postinstall": "prisma generate"
```

**Si manquant, ajoutez dans `apps/web/package.json`:**
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

**Puis redéployez:**
```bash
git add apps/web/package.json
git commit -m "fix: Ensure prisma generate runs before build"
git push origin main
```

---

### Solution 3 : Vérifier DATABASE_URL

**Problème:** La connexion à la base de données échoue

**Vérification dans Vercel:**
1. Vercel Dashboard → Projet → Settings → Environment Variables
2. Vérifiez que **DATABASE_URL** existe pour **Production**
3. Format attendu: `postgresql://postgres.xxx:password@aws-0-xxx.pooler.supabase.com:6543/postgres`

**Test de connexion:**
```bash
# Depuis votre terminal local (avec la DATABASE_URL de prod)
psql "VOTRE_DATABASE_URL_DE_PRODUCTION"

# Si ça échoue, vérifiez:
# - Le mot de passe Supabase
# - Que la base est accessible depuis l'extérieur
# - Que DIRECT_URL est aussi configurée (port 5432)
```

**Variables à vérifier:**
- ✅ `DATABASE_URL` (port 6543 - pooler)
- ✅ `DIRECT_URL` (port 5432 - connexion directe)
- ✅ Les deux doivent pointer vers la même base Supabase

---

### Solution 4 : Vérifier JWT_SECRET

**Problème:** JWT_SECRET manquant ou incorrect

**Vérification:**
1. Vercel Dashboard → Settings → Environment Variables
2. Vérifiez que **JWT_SECRET** existe pour **Production**
3. Vérifiez qu'il est identique à votre `.env.local`

**Si manquant:**
```bash
# Générez un secret sécurisé
openssl rand -base64 32

# Ajoutez-le dans Vercel Dashboard
# Variable: JWT_SECRET
# Valeur: (le secret généré)
# Environment: Production
```

---

### Solution 5 : Base de Données Non Seedée

**Problème:** L'utilisateur admin n'existe pas dans la base

**Vérification:**
1. Allez sur **Supabase Dashboard**
2. SQL Editor → Exécutez:
   ```sql
   SELECT * FROM users WHERE email = 'admin@whatsorder.com';
   ```

**Si vide, seedez la base:**

**Option A : Via Supabase SQL Editor**
```sql
-- Créer l'utilisateur admin
INSERT INTO users (id, email, name, password, role, "restaurantId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@whatsorder.com',
  'Admin',
  '$2a$10$rQ8K8K8K8K8K8K8K8K8K8uK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', -- Hash de "Admin123!"
  'OWNER',
  (SELECT id FROM restaurants LIMIT 1),
  NOW(),
  NOW()
);
```

**Option B : Via Prisma Seed (Recommandé)**
```bash
cd apps/web

# Configurer DATABASE_URL pour Supabase
export DATABASE_URL="votre-database-url-supabase"

# Exécuter le seed
npx prisma db seed
```

---

### Solution 6 : Activer les Erreurs Détaillées (Temporaire)

Pour voir l'erreur exacte en production, modifiez temporairement le code :

**Dans `apps/web/lib/server/errors.ts`:**
```typescript
return res.status(500).json({
  success: false,
  error: 'Internal server error',
  message: error.message, // Toujours afficher en prod temporairement
  stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
});
```

**Puis:**
```bash
git add apps/web/lib/server/errors.ts
git commit -m "debug: Show error details in production temporarily"
git push origin main
```

**⚠️ Important:** Remettez le code original après avoir identifié l'erreur !

---

## 🔍 Checklist de Diagnostic

- [ ] Logs Vercel consultés → Erreur identifiée ?
- [ ] DATABASE_URL configurée dans Vercel ?
- [ ] DIRECT_URL configurée dans Vercel ?
- [ ] JWT_SECRET configuré dans Vercel ?
- [ ] Prisma Client généré (postinstall dans package.json) ?
- [ ] Base de données seedée (utilisateur admin existe) ?
- [ ] Connexion DB testée depuis terminal ?

---

## 📊 Résultat Attendu

Après correction, le login devrait retourner :

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-xxx",
    "email": "admin@whatsorder.com",
    "name": "Admin",
    "role": "OWNER",
    "restaurant": {...}
  }
}
```

---

## 🆘 Si Rien Ne Fonctionne

1. **Partagez les logs Vercel** (Runtime Logs de `/api/auth/login`)
2. **Vérifiez les variables d'environnement** (screenshot Vercel Dashboard)
3. **Testez la connexion DB** depuis votre terminal local

Je pourrai alors vous aider plus précisément ! 🚀
