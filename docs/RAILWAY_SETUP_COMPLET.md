# 🚂 Configuration Complète Railway - Guide Pas à Pas

**Date** : 11 janvier 2026  
**Objectif** : Configurer PostgreSQL et toutes les variables d'environnement

---

## 📋 Étape 1 : Ouvrir le Dashboard Railway

```bash
railway open
```

Ou directement : https://railway.com/project/d8a86a8e-7b11-404f-aa20-ac6e7258ab0f

---

## 📋 Étape 2 : Configurer Root Directory (IMPORTANT)

1. Dans le dashboard Railway
2. Cliquer sur le service **`api`**
3. Aller dans **"Settings"** (icône engrenage en haut à droite)
4. Trouver **"Root Directory"**
5. Entrer : **`apps/api`**
6. Cliquer sur **"Save"**

**Pourquoi ?** Railway doit builder depuis la racine pour voir le `pnpm-lock.yaml`.

---

## 📋 Étape 3 : Ajouter PostgreSQL

### Via Dashboard (Recommandé)

1. Dans le projet Railway (pas dans le service `api`)
2. Cliquer sur **"New"** (bouton en haut à droite)
3. Sélectionner **"Database"**
4. Choisir **"PostgreSQL"**
5. Railway va créer automatiquement :
   - Un service PostgreSQL
   - La variable `DATABASE_URL` dans le service `api`

**Note** : `DATABASE_URL` sera automatiquement partagée avec le service `api`.

### Vérifier que PostgreSQL est ajouté

1. Vous devriez voir un nouveau service **"Postgres"** dans le projet
2. Dans le service `api` → **Variables**, vous devriez voir `DATABASE_URL`

---

## 📋 Étape 4 : Configurer les Variables d'Environnement

### Dans le Dashboard Railway

1. Cliquer sur le service **`api`**
2. Aller dans l'onglet **"Variables"**
3. Cliquer sur **"New Variable"**
4. Ajouter chaque variable une par une :

#### Variables Requises

| Variable | Valeur | Description |
|----------|--------|-------------|
| `JWT_SECRET` | `238addc223ff1f4cd6242b5a12795eef7fa33b3c5518f27b614e040cd4d033fa` | Secret JWT (déjà généré) |
| `JWT_EXPIRES_IN` | `7d` | Durée de validité du token |
| `NODE_ENV` | `production` | Environnement de production |
| `PORT` | `4000` | Port du serveur |
| `FRONTEND_URL` | `https://votre-domaine.com` | URL du frontend (à adapter) |
| `OPENAI_API_KEY` | `sk-proj-...` | Clé API OpenAI (à remplir) |
| `OPENAI_MODEL` | `gpt-4-turbo-preview` | Modèle OpenAI |

#### Variables Optionnelles

| Variable | Valeur | Description |
|----------|--------|-------------|
| `REDIS_URL` | `redis://...` | URL Redis (si vous ajoutez Redis) |
| `WHATSAPP_API_TOKEN` | `...` | Token WhatsApp API (optionnel) |
| `WHATSAPP_PHONE_NUMBER_ID` | `...` | ID du numéro WhatsApp (optionnel) |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | `...` | ID du compte business (optionnel) |

### Instructions Détaillées

Pour chaque variable :
1. Cliquer sur **"New Variable"**
2. **Key** : Entrer le nom de la variable (ex: `JWT_SECRET`)
3. **Value** : Entrer la valeur
4. Cliquer sur **"Add"**

**Exemple pour JWT_SECRET** :
- Key : `JWT_SECRET`
- Value : `238addc223ff1f4cd6242b5a12795eef7fa33b3c5518f27b614e040cd4d033fa`
- Add

---

## 📋 Étape 5 : Vérifier les Variables

Dans le service `api` → **Variables**, vous devriez voir :

```
✅ DATABASE_URL (créée automatiquement par PostgreSQL)
✅ JWT_SECRET
✅ JWT_EXPIRES_IN
✅ NODE_ENV
✅ PORT
✅ FRONTEND_URL
✅ OPENAI_API_KEY
✅ OPENAI_MODEL
```

---

## 📋 Étape 6 : Déployer

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
railway up
```

### Vérifier les Logs

```bash
railway logs --build
```

Vous devriez voir :
- ✅ `pnpm install --frozen-lockfile` (pas `npm ci`)
- ✅ `pnpm prisma generate`
- ✅ `pnpm build`
- ✅ `pnpm prisma migrate deploy`
- ✅ `pnpm start`
- ✅ Build réussi ✅

---

## 📋 Étape 7 : Vérifier que l'API Fonctionne

### Obtenir l'URL de l'API

```bash
railway status
```

Ou dans le dashboard Railway :
- Service `api` → **Settings**
- Voir **"Public Domain"** ou **"Deployments"**

### Tester l'API

```bash
# Health check
curl https://votre-api-url.up.railway.app/api/health

# Devrait retourner :
# {"status":"ok","timestamp":"...","service":"whatsorder-api"}
```

---

## 🔍 Dépannage

### Erreur "DATABASE_URL not found"

**Solution** :
1. Vérifier que PostgreSQL est ajouté
2. Vérifier que `DATABASE_URL` existe dans les variables du service `api`
3. Si elle n'existe pas, Railway devrait la créer automatiquement
4. Sinon, vérifier dans PostgreSQL → Variables → "Connect" → Copier la connection string

### Erreur "JWT_SECRET not found"

**Solution** :
1. Vérifier que `JWT_SECRET` est bien ajoutée dans les variables
2. Vérifier l'orthographe (pas de fautes)
3. Redéployer après avoir ajouté la variable

### Erreur Prisma

**Solution** :
```bash
railway run pnpm prisma generate
railway run pnpm prisma migrate deploy
```

### Erreur de Build (npm ci)

**Solution** :
1. Vérifier que Root Directory = `apps/api` dans Railway Settings
2. Vérifier que `nixpacks.toml` existe dans `apps/api`
3. Supprimer `package-lock.json` si présent :
   ```bash
   cd "/Users/diezowee/whatsapp order/apps/api"
   rm package-lock.json
   ```

---

## ✅ Checklist Complète

### Configuration Railway
- [ ] Root Directory configuré (`apps/api`)
- [ ] PostgreSQL ajouté
- [ ] Variables d'environnement configurées

### Variables
- [ ] `DATABASE_URL` (automatique avec PostgreSQL)
- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRES_IN`
- [ ] `NODE_ENV`
- [ ] `PORT`
- [ ] `FRONTEND_URL`
- [ ] `OPENAI_API_KEY`
- [ ] `OPENAI_MODEL`

### Déploiement
- [ ] Build réussi avec pnpm
- [ ] Migrations Prisma exécutées
- [ ] API accessible
- [ ] Health check fonctionne

---

## 🎯 Résumé des Actions

1. ✅ Ouvrir Railway Dashboard
2. ✅ Configurer Root Directory = `apps/api`
3. ✅ Ajouter PostgreSQL
4. ✅ Ajouter toutes les variables d'environnement
5. ✅ Déployer avec `railway up`
6. ✅ Vérifier que l'API fonctionne

---

## 📝 Notes Importantes

- **Root Directory** : Doit être `apps/api` pour que Railway voie le `pnpm-lock.yaml`
- **DATABASE_URL** : Créée automatiquement quand vous ajoutez PostgreSQL
- **Variables sensibles** : Ne jamais les commiter dans Git
- **FRONTEND_URL** : À adapter selon votre domaine de production

---

**Une fois toutes ces étapes terminées, votre API sera déployée et fonctionnelle sur Railway ! 🚀**
