# 🔗 Guide : URLs Supabase pour Vercel

## 📍 Votre Projet Supabase

**Project Reference:** `rvndgopsysdyycelmfuu`  
**Project URL:** `https://rvndgopsysdyycelmfuu.supabase.co`

---

## 🔧 Comment Obtenir les Bonnes URLs

### Option 1 : Via Supabase Dashboard (Recommandé)

1. **Allez sur:** https://supabase.com/dashboard/project/rvndgopsysdyycelmfuu

2. **Settings → Database**

3. **Récupérez l'URL du Pooler:**

   **a) Connection Pooling (Transaction mode):**
   - Section: **"Connection Pooling"**
   - Mode: **"Transaction"** (recommandé pour Prisma)
   - Copiez l'URL complète
   - Format attendu:
     ```
     postgresql://postgres.rvndgopsysdyycelmfuu:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```

   **b) Si Transaction mode n'est pas disponible:**
   - Utilisez **"Session"** mode
   - Format similaire mais avec `?pgbouncer=true&connection_limit=1`

---

### Option 2 : Construire l'URL Manuellement

Si vous connaissez votre mot de passe Supabase et votre région :

**Format:**
```
postgresql://postgres.rvndgopsysdyycelmfuu:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Régions communes:**
- `us-east-1` (US East)
- `us-west-1` (US West)
- `eu-west-1` (Europe West)
- `ap-southeast-1` (Asia Pacific)

**Exemple complet:**
```
postgresql://postgres.rvndgopsysdyycelmfuu:VotreMotDePasse123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## ⚙️ Configuration dans Vercel

### Variables à Configurer

**1. DATABASE_URL:**
```
postgresql://postgres.rvndgopsysdyycelmfuu:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**2. DIRECT_URL:**
```
postgresql://postgres.rvndgopsysdyycelmfuu:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

⚠️ **Important:** Utilisez la **même URL** (pooler, port 6543) pour les deux variables !

---

## 🔍 Vérification

### Test 1 : Vérifier l'URL depuis votre Terminal

```bash
# Remplacez [PASSWORD] et [REGION] par vos valeurs
psql "postgresql://postgres.rvndgopsysdyycelmfuu:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Si la connexion fonctionne, vous verrez:
# psql (version)
# Type "help" for help.
# rvndgopsysdyycelmfuu=>
```

### Test 2 : Vérifier dans Vercel

1. Vercel Dashboard → Projet → Settings → Environment Variables
2. Vérifiez que les URLs contiennent:
   - ✅ `pooler.supabase.com` (pas `db.xxx.supabase.co`)
   - ✅ Port `6543` (pas `5432`)
   - ✅ Paramètre `?pgbouncer=true`

---

## 🚨 Erreurs Courantes

### Erreur: "Can't reach database server at ...:5432"

**Cause:** `DIRECT_URL` pointe vers le port 5432 au lieu de 6543

**Solution:** Utilisez le pooler (port 6543) pour `DIRECT_URL` aussi

### Erreur: "password authentication failed"

**Cause:** Mot de passe incorrect ou non URL-encodé

**Solution:** 
- Vérifiez le mot de passe dans Supabase Dashboard
- Si le mot de passe contient des caractères spéciaux, encodez-les:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - etc.

### Erreur: "connection timeout"

**Cause:** Région incorrecte ou pooler non activé

**Solution:**
- Vérifiez la région dans Supabase Dashboard
- Assurez-vous que Connection Pooling est activé

---

## 📋 Checklist Finale

- [ ] URL pooler récupérée depuis Supabase Dashboard
- [ ] Port 6543 utilisé (pas 5432)
- [ ] `DATABASE_URL` configurée dans Vercel avec pooler
- [ ] `DIRECT_URL` configurée dans Vercel avec pooler (même URL)
- [ ] Variables configurées pour Production
- [ ] Mot de passe correct (URL-encodé si nécessaire)
- [ ] Redéploiement effectué
- [ ] Test de connexion réussi

---

## 🎯 Après Configuration

Une fois les URLs corrigées dans Vercel :

1. **Redéployez** le projet
2. **Testez le login:**
   ```bash
   ./test-production.sh https://whatsorder-web-diiezos-projects.vercel.app
   ```

Le login devrait maintenant fonctionner ! ✅
