# 🔧 Ajouter SUPABASE_SERVICE_ROLE_KEY sur Vercel

**Erreur** : "Server configuration error"  
**Cause** : Variable `SUPABASE_SERVICE_ROLE_KEY` manquante sur Vercel

---

## ✅ Solution Rapide (2 minutes)

### Étape 1 : Récupérer la Clé depuis Supabase

1. **Ouvrir** : https://supabase.com/dashboard
2. **Sélectionner** votre projet
3. **Settings** → **API**
4. **Section "Project API keys"**
5. **Copier** la clé **`service_role`** (⚠️ PAS l'anon key !)
   - Elle commence par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Elle est beaucoup plus longue que l'anon key

---

### Étape 2 : Ajouter sur Vercel (Option A - Dashboard)

1. **Ouvrir** : https://vercel.com/dashboard
2. **Sélectionner** : Projet `whatsorder-web`
3. **Settings** → **Environment Variables**
4. **Cliquer** sur **"Add New"**
5. **Remplir** :
   - **Key** : `SUPABASE_SERVICE_ROLE_KEY`
   - **Value** : Coller la clé service_role (celle que vous avez copiée)
   - **Environment** : ✅ Production ✅ Preview ✅ Development
6. **Cliquer** sur **"Save"**

---

### Étape 2 : Ajouter sur Vercel (Option B - CLI)

```bash
cd "/Users/diezowee/whatsapp order"

# Ajouter pour production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Quand demandé, coller la clé service_role

# Ajouter pour preview aussi
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
# Coller la même clé

# Ajouter pour development aussi
vercel env add SUPABASE_SERVICE_ROLE_KEY development
# Coller la même clé
```

---

### Étape 3 : Redéployer

```bash
cd "/Users/diezowee/whatsapp order"
vercel --prod
```

Ou depuis le Dashboard Vercel :
- **Deployments** → Three dots (⋮) → **Redeploy**

---

## ✅ Vérification

### Test 1 : Vérifier que la Variable est Ajoutée

```bash
vercel env ls
```

Vous devriez voir `SUPABASE_SERVICE_ROLE_KEY` dans la liste.

---

### Test 2 : Tester l'API

```bash
curl https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app/api/public/restaurants/nile-bites
```

**Résultat attendu** :
- ✅ Status 200 avec JSON du restaurant
- ❌ Status 500 "Server configuration error" = Variable toujours manquante

---

## 🆘 Si ça ne Marche Toujours Pas

### Vérifier les Logs Vercel

```bash
vercel logs https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app
```

Cherchez les erreurs mentionnant `SUPABASE_SERVICE_ROLE_KEY`.

---

### Vérifier que c'est la Bonne Clé

**⚠️ IMPORTANT** : Il y a 2 clés dans Supabase :

1. **`anon` key** (publique) → Déjà configurée comme `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **`service_role` key** (privée) → C'est celle-ci qu'il faut ajouter !

**Comment reconnaître** :
- `anon` key : Plus courte, commence par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- `service_role` key : Plus longue, commence aussi par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Dans Supabase Dashboard** :
- Section "Project API keys"
- Il y a 2 clés listées
- Utiliser celle marquée **`service_role`** (pas `anon`)

---

## 📋 Checklist

- [ ] Clé `service_role` copiée depuis Supabase
- [ ] Variable `SUPABASE_SERVICE_ROLE_KEY` ajoutée sur Vercel
- [ ] Variable ajoutée pour Production, Preview ET Development
- [ ] Redéployé sur Vercel
- [ ] Test API retourne 200 (pas 500)

---

## 🚀 Après Ajout

Une fois la variable ajoutée et redéployée :

1. **Tester l'API** :
   ```bash
   curl https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app/api/public/restaurants/nile-bites
   ```

2. **Tester la page** :
   - Ouvrir le site
   - Cliquer sur "Essayer la démo"
   - La page devrait s'afficher (si le restaurant existe)

---

**Action immédiate : Ajouter `SUPABASE_SERVICE_ROLE_KEY` sur Vercel ! 🚀**
