# 📋 Compte Rendu - Correction Erreur API "Server configuration error"

**Date :** 12 janvier 2026, 20:55 UTC  
**Agent :** Claude (Assistant IA)  
**Tâche :** Résoudre l'erreur "Server configuration error" sur l'API publique des restaurants

---

## 🔍 Problème Identifié

### Symptôme
```bash
curl https://whatsorder-3bkiee7zv-diiezos-projects.vercel.app/api/public/restaurants/nile-bites
# ❌ {"error":"Server configuration error"}
```

### Cause Racine

L'utilisateur testait une **ancienne URL de déploiement** créée **avant** l'ajout de la variable d'environnement `SUPABASE_SERVICE_ROLE_KEY`.

**Timeline :**
- **-21 min** : Déploiement `whatsorder-3bkiee7zv` (SANS la variable)
- **-10 min** : Ajout de `SUPABASE_SERVICE_ROLE_KEY` sur Vercel
- **-7 min** : Nouveau déploiement `whatsorder-gumaas58k` (AVEC la variable)
- **Maintenant** : L'utilisateur teste encore l'ancienne URL

### Code Impliqué

```typescript
// apps/web/lib/supabase-client.ts (lignes 63-72)
export const supabaseAdmin = (() => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set...');
    return null; // ← Cause l'erreur dans l'API
  }

  return createClient(supabaseUrl, supabaseServiceKey);
})();
```

```typescript
// apps/web/app/api/public/restaurants/[slug]/route.ts (lignes 19-25)
if (!supabaseAdmin) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  return NextResponse.json(
    { error: 'Server configuration error' }, // ← Message d'erreur
    { status: 500 }
  );
}
```

---

## ✅ Solution Appliquée

### Étape 1 : Vérification des Variables d'Environnement

```bash
vercel env ls
```

**Résultat :**
```
✅ SUPABASE_SERVICE_ROLE_KEY    Encrypted    Development, Preview, Production    10m ago
```

La variable était bien configurée.

### Étape 2 : Nouveau Déploiement

```bash
cd "/Users/diezowee/whatsapp order"
vercel --prod --yes
```

**Nouvelle URL créée :** https://whatsorder-h0jrbanvh-diiezos-projects.vercel.app

### Étape 3 : Vérification

```bash
# Test avec la nouvelle URL
curl https://whatsorder-h0jrbanvh-diiezos-projects.vercel.app/api/public/restaurants/nile-bites
```

**Résultat :**
```json
✅ {
  "id": "168cfa18-e4a5-419f-bab9-a72c6676c362",
  "name": "Nile Bites",
  "slug": "nile-bites",
  "phone": "+201276921081",
  "email": "contact@nilebites.com",
  ...
}
```

### Étape 4 : Test avec le Domaine de Production

```bash
# Test avec le domaine personnalisé
curl https://www.whataybo.com/api/public/restaurants/nile-bites
```

**Résultat :**
```json
✅ {
  "id": "168cfa18-e4a5-419f-bab9-a72c6676c362",
  "name": "Nile Bites",
  ...
}
```

---

## 📊 État Actuel

### Variables d'Environnement Configurées

| Variable | Environnements | Statut |
|----------|---------------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development | ✅ Configurée |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | ✅ Configurée |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | ✅ Configurée |
| `DATABASE_URL` | Production, Preview | ✅ Configurée |
| `DIRECT_URL` | Production, Preview | ✅ Configurée |
| `JWT_SECRET` | Production, Preview | ✅ Configurée |

### URLs de Production

- **Domaine Principal** : https://www.whataybo.com ✅
- **Dernier Déploiement** : https://whatsorder-h0jrbanvh-diiezos-projects.vercel.app ✅

### Endpoints API Testés

| Endpoint | Méthode | Statut | Réponse |
|----------|---------|--------|---------|
| `/api/public/restaurants/nile-bites` | GET | ✅ 200 | Données du restaurant |
| `/api/public/restaurants/nile-bites/menu` | GET | 🔄 Non testé | - |

---

## 🎯 Points Clés pour le Prochain Agent

### ⚠️ Important à Savoir

1. **Toujours utiliser l'URL de production actuelle**
   - Domaine : `https://www.whataybo.com`
   - Ou la dernière URL de déploiement : `vercel ls | head -3`

2. **Les anciennes URLs de déploiement restent actives**
   - Chaque `vercel --prod` crée une nouvelle URL unique
   - Les anciennes URLs peuvent avoir des configurations obsolètes
   - Ne pas s'y fier pour les tests

3. **Variables d'environnement**
   - Toute modification de variable nécessite un **redéploiement**
   - Vérifier avec : `vercel env ls`
   - Redéployer avec : `vercel --prod`

4. **Structure des Routes API**
   ```
   /api/public/restaurants/[slug]          → GET restaurant
   /api/public/restaurants/[slug]/menu     → GET menu
   ```

### 🔧 Commandes Utiles

```bash
# Vérifier les variables d'environnement
vercel env ls

# Lister les déploiements récents
vercel ls --prod

# Obtenir l'URL de production actuelle
vercel ls --prod | head -3

# Redéployer en production
vercel --prod

# Tester l'API
curl https://www.whataybo.com/api/public/restaurants/nile-bites
```

### 📝 Configuration Vercel

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["fra1"],  // Région : Francfort (Europe)
  "buildCommand": "cd apps/web && pnpm build",
  "outputDirectory": "apps/web/.next"
}
```

---

## ✅ État Final

- ✅ Variable `SUPABASE_SERVICE_ROLE_KEY` configurée sur tous les environnements
- ✅ Déploiement effectué avec la variable
- ✅ API fonctionnelle sur le domaine de production (`www.whataybo.com`)
- ✅ Endpoint `/api/public/restaurants/[slug]` opérationnel
- ✅ Authentification Supabase Admin fonctionnelle

---

## 🚀 Prochaines Étapes Recommandées

1. **Tester tous les endpoints API** avec le domaine de production
2. **Configurer un alias permanent** pour éviter les changements d'URL
3. **Vérifier les logs Vercel** pour s'assurer qu'il n'y a pas d'autres erreurs
4. **Documenter les autres endpoints** de l'API

---

**Fin du Compte Rendu**  
Tous les objectifs ont été atteints. L'API est maintenant fonctionnelle. 🎉
