# 🚀 Guide de Déploiement en Production

**Date** : 15 janvier 2026  
**Statut** : ✅ Prêt pour déploiement

---

## ✅ Vérifications Pré-Déploiement

### 1. Base de Données Supabase
- ✅ Toutes les tables créées (14 tables)
- ✅ RLS activé sur toutes les tables
- ✅ Politiques RLS créées (multi-tenant)
- ✅ Index et contraintes en place
- ✅ Client Prisma généré

### 2. Code
- ✅ Client Prisma généré
- ✅ Schéma Prisma synchronisé avec Supabase
- ✅ Build fonctionnel

---

## 🔧 Configuration Variables d'Environnement Vercel

### Variables Obligatoires

Ajoutez ces variables dans Vercel Dashboard > Settings > Environment Variables :

#### Supabase (Obligatoire)
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-publique
```

#### Base de Données (Obligatoire)
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### JWT (Obligatoire)
```env
JWT_SECRET=votre-secret-jwt-tres-securise
JWT_EXPIRES_IN=7d
```

#### API (Optionnel)
```env
NEXT_PUBLIC_API_URL=https://votre-api.vercel.app
```

### Comment Récupérer les Valeurs Supabase

1. **Project URL** :
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet
   - Settings > API > Project URL

2. **Anon Key** :
   - Settings > API > anon public key

3. **Database URL** :
   - Settings > Database > Connection string
   - Utiliser le format "URI" et remplacer `[YOUR-PASSWORD]` par votre mot de passe

---

## 🚀 Déploiement

### Option 1 : Via Git (Recommandé)

Si vous avez l'intégration Git activée sur Vercel :

```bash
# 1. Vérifier que tout est commité
git status

# 2. Commit les changements
git add .
git commit -m "feat: Tables Supabase créées avec RLS et déploiement production"

# 3. Push sur main
git push origin main
```

Vercel déploiera automatiquement.

### Option 2 : Via CLI Vercel

```bash
# 1. Installer Vercel CLI (si pas déjà installé)
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer en production
vercel --prod
```

---

## ✅ Vérifications Post-Déploiement

### 1. Vérifier le Déploiement
- [ ] Le déploiement Vercel est réussi
- [ ] L'application est accessible
- [ ] Pas d'erreurs dans les logs Vercel

### 2. Vérifier Supabase
- [ ] Les tables sont toujours présentes
- [ ] RLS est toujours activé
- [ ] Les politiques RLS sont toujours en place

### 3. Tester l'Application
- [ ] La page d'accueil se charge
- [ ] L'authentification fonctionne
- [ ] Les données se chargent depuis Supabase

---

## 🔍 Commandes Utiles

### Vérifier les Variables d'Environnement Vercel
```bash
vercel env ls
```

### Voir les Logs de Déploiement
```bash
vercel logs [deployment-url]
```

### Redéployer
```bash
vercel --prod
```

---

## 📝 Notes Importantes

1. **Variables `NEXT_PUBLIC_*`** : Accessibles côté client (navigateur)
2. **Sécurité** : Ne jamais exposer des clés secrètes avec `NEXT_PUBLIC_`
3. **Redéploiement** : Toujours redéployer après avoir modifié les variables
4. **Environnements** : Configurer pour Production ET Preview

---

## 🐛 Dépannage

### Erreur : "Missing Supabase environment variables"
**Solution** : Vérifier que les variables sont bien configurées dans Vercel Dashboard

### Erreur : "Failed to connect to database"
**Solution** : Vérifier que `DATABASE_URL` est correcte et que Supabase accepte les connexions

### Erreur : "RLS policy violation"
**Solution** : Vérifier que les politiques RLS sont toujours en place dans Supabase

---

**Dernière mise à jour** : 15 janvier 2026
