# 🔧 Guide Configuration Variables d'Environnement Vercel

**Date** : 11 janvier 2026  
**Objectif** : Configurer les variables d'environnement nécessaires pour le déploiement Vercel

---

## 📋 Variables Requises

### Variables Supabase (Obligatoires pour Realtime)

Ces variables doivent être configurées dans Vercel pour que les fonctionnalités realtime fonctionnent :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-supabase
```

### Variables API (Optionnelles)

Si vous utilisez une API externe :

```env
NEXT_PUBLIC_API_URL=https://votre-api.com
```

---

## 🔧 Configuration dans Vercel

### Étape 1 : Accéder aux Variables d'Environnement

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Settings** > **Environment Variables**

### Étape 2 : Ajouter les Variables

Pour chaque variable :

1. Cliquer sur **Add New**
2. Entrer le **Name** (ex: `NEXT_PUBLIC_SUPABASE_URL`)
3. Entrer la **Value** (ex: `https://xxx.supabase.co`)
4. Sélectionner les **Environments** :
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development** (optionnel)
5. Cliquer sur **Save**

### Étape 3 : Récupérer les Valeurs Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Settings** > **API**
4. Copier :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ✅ Vérification

### Vérifier que les Variables sont Configurées

Dans Vercel Dashboard > Settings > Environment Variables, vous devriez voir :

- ✅ `NEXT_PUBLIC_SUPABASE_URL` (Production, Preview)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production, Preview)

### Redéployer après Configuration

Après avoir ajouté/modifié les variables :

1. Aller dans **Deployments**
2. Cliquer sur les **3 points** du dernier déploiement
3. Sélectionner **Redeploy**
4. Attendre que le déploiement se termine (~2-3 minutes)

---

## 🐛 Dépannage

### Erreur : "Missing Supabase environment variables"

**Cause** : Les variables ne sont pas configurées dans Vercel

**Solution** :
1. Vérifier que les variables sont bien ajoutées dans Vercel
2. Vérifier qu'elles sont activées pour **Production** et **Preview**
3. Redéployer après avoir ajouté les variables

### Erreur : "Failed to subscribe"

**Cause** : Les variables sont configurées mais incorrectes

**Solution** :
1. Vérifier que `NEXT_PUBLIC_SUPABASE_URL` commence par `https://`
2. Vérifier que `NEXT_PUBLIC_SUPABASE_ANON_KEY` est la bonne clé (anon public)
3. Vérifier dans Supabase Dashboard > Settings > API

### Les Variables ne Sont Pas Disponibles au Runtime

**Cause** : Les variables doivent commencer par `NEXT_PUBLIC_` pour être accessibles côté client

**Solution** :
- ✅ Utiliser `NEXT_PUBLIC_SUPABASE_URL` (pas `SUPABASE_URL`)
- ✅ Utiliser `NEXT_PUBLIC_SUPABASE_ANON_KEY` (pas `SUPABASE_ANON_KEY`)

---

## 📝 Notes Importantes

1. **Variables `NEXT_PUBLIC_*`** : Accessibles côté client (navigateur)
2. **Sécurité** : Ne jamais exposer des clés secrètes avec `NEXT_PUBLIC_`
3. **Redéploiement** : Toujours redéployer après avoir modifié les variables
4. **Environnements** : Configurer pour Production ET Preview pour tester

---

**Dernière mise à jour** : 11 janvier 2026
