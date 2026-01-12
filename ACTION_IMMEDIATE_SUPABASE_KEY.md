# ⚡ ACTION IMMÉDIATE - Ajouter SUPABASE_SERVICE_ROLE_KEY

**Erreur actuelle** : `{"error":"Server configuration error"}`  
**Cause** : Variable `SUPABASE_SERVICE_ROLE_KEY` manquante sur Vercel

---

## 🚀 Solution en 3 Étapes (2 minutes)

### Étape 1 : Récupérer la Clé (30 secondes)

1. **Ouvrir** : https://supabase.com/dashboard
2. **Sélectionner** votre projet
3. **Settings** → **API**
4. **Section "Project API keys"**
5. **Copier** la clé **`service_role`** (⚠️ PAS l'anon key !)
   - C'est la clé la PLUS LONGUE
   - Elle commence par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### Étape 2 : Ajouter sur Vercel (1 minute)

**Option A : Via CLI (Plus Rapide)**

```bash
cd "/Users/diezowee/whatsapp order"

# Ajouter pour production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Quand il demande la valeur, COLLER la clé service_role que vous avez copiée
# Appuyer sur Entrée

# Ajouter pour preview aussi
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
# Coller la même clé
# Appuyer sur Entrée
```

**Option B : Via Dashboard**

1. **Ouvrir** : https://vercel.com/dashboard
2. **Projet** `whatsorder-web` → **Settings** → **Environment Variables**
3. **Add New** :
   - **Key** : `SUPABASE_SERVICE_ROLE_KEY`
   - **Value** : Coller la clé service_role
   - **Environment** : ✅ Production ✅ Preview
4. **Save**

---

### Étape 3 : Redéployer (30 secondes)

```bash
cd "/Users/diezowee/whatsapp order"
vercel --prod
```

---

## ✅ Vérification

Après redéploiement, tester :

```bash
curl https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app/api/public/restaurants/nile-bites
```

**Résultat attendu** :
- ✅ `{"id":"...","name":"Nile Bites",...}` = SUCCÈS !
- ❌ `{"error":"Server configuration error"}` = Variable toujours manquante

---

## 🆘 Si ça ne Marche Pas

### Vérifier que la Variable est Ajoutée

```bash
vercel env ls | grep SUPABASE_SERVICE_ROLE_KEY
```

**Si rien n'apparaît** = Variable pas ajoutée, recommencer l'étape 2.

---

### Vérifier que c'est la Bonne Clé

**⚠️ IMPORTANT** : Il y a 2 clés dans Supabase :

1. **`anon` key** → Déjà configurée (courte)
2. **`service_role` key** → C'est celle-ci qu'il faut ajouter (longue)

**Dans Supabase Dashboard → Settings → API** :
- Vous voyez 2 clés
- Utiliser celle marquée **`service_role`** (pas `anon`)

---

## 📋 Checklist Rapide

- [ ] Clé `service_role` copiée depuis Supabase
- [ ] Variable `SUPABASE_SERVICE_ROLE_KEY` ajoutée sur Vercel (CLI ou Dashboard)
- [ ] Variable ajoutée pour Production ET Preview
- [ ] Redéployé (`vercel --prod`)
- [ ] Test API retourne 200 (pas 500)

---

**Faites ces 3 étapes maintenant et l'erreur sera résolue ! 🚀**
