# 🔧 Correction du Déploiement Vercel

**Problème** : Le build échoue car Vercel ne trouve pas les modules (`Module not found`)

**Cause** : La configuration du Root Directory n'est pas correcte pour le monorepo

---

## ✅ Solution Immédiate (2 minutes)

### Via le Dashboard Vercel (Recommandé)

1. **Aller sur https://vercel.com/dashboard**

2. **Sélectionner le projet** : `whatsorder-web`

3. **Aller dans Settings** → **General**

4. **Section "Build & Development Settings"** :
   - **Root Directory** : `apps/web` ✅ (IMPORTANT !)
   - **Build Command** : Laisser vide (auto-détecté)
   - **Output Directory** : Laisser vide (auto-détecté)
   - **Install Command** : `pnpm install`

5. **Sauvegarder** les changements

6. **Redéployer** :
   - Allez dans **Deployments**
   - Cliquez sur **Redeploy** (three dots menu)
   - Ou utilisez CLI :

```bash
cd "/Users/diezowee/whatsapp order"
vercel --prod
```

---

## Alternative : Via le Fichier vercel.json

Le fichier `vercel.json` à la racine a été corrigé avec :

```json
{
  "buildCommand": "cd apps/web && pnpm build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install"
}
```

Mais la méthode du Dashboard est plus fiable.

---

## ✅ Vérification

Après le redéploiement, vérifiez que :

1. **Le build réussit** (pas de "Module not found")
2. **Le site est accessible**
3. **Login fonctionne**

---

## 🆘 Si le Problème Persiste

### Solution 1 : Recréer le Link Vercel

```bash
cd "/Users/diezowee/whatsapp order"

# Supprimer le lien actuel
rm -rf .vercel

# Relancer le script
./scripts/finaliser-deploiement.sh
```

Cette fois, quand le script demande "In which directory?", répondez : `apps/web`

---

### Solution 2 : Vérifier les Variables d'Environnement

```bash
vercel env ls
```

Vérifiez que toutes les variables sont présentes :
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `NODE_ENV`

---

### Solution 3 : Build Local pour Tester

```bash
cd "/Users/diezowee/whatsapp order/apps/web"
pnpm build
```

Si le build local fonctionne, le problème vient de la configuration Vercel.

---

## 📝 Résumé

**Action immédiate** :
1. Aller sur https://vercel.com/dashboard
2. Projet `whatsorder-web` → Settings → General
3. **Root Directory** : `apps/web`
4. Sauvegarder
5. Redéployer

**Durée : 2 minutes**

---

Une fois corrigé, le déploiement devrait réussir ! 🚀
