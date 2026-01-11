# 🔐 Guide des Variables d'Environnement Railway

**Date** : 11 janvier 2026  
**Service** : whatsorder-api

---

## 📋 Variables Requises

### Variables Obligatoires

| Variable | Valeur | Description | Où l'ajouter |
|----------|--------|-------------|--------------|
| `DATABASE_URL` | `postgresql://...` | ✅ **Créée automatiquement** quand vous ajoutez PostgreSQL | Automatique |
| `JWT_SECRET` | `238addc223ff1f4cd6242b5a12795eef7fa33b3c5518f27b614e040cd4d033fa` | Secret JWT (256 bits) | Service `api` → Variables |
| `JWT_EXPIRES_IN` | `7d` | Durée de validité du token JWT | Service `api` → Variables |
| `NODE_ENV` | `production` | Environnement de production | Service `api` → Variables |
| `PORT` | `4000` | Port du serveur Express | Service `api` → Variables |
| `FRONTEND_URL` | `https://votre-domaine.com` | URL du frontend (à adapter) | Service `api` → Variables |

### Variables Optionnelles (mais Recommandées)

| Variable | Valeur | Description | Où l'ajouter |
|----------|--------|-------------|--------------|
| `OPENAI_API_KEY` | `sk-proj-...` | Clé API OpenAI pour le parsing IA | Service `api` → Variables |
| `OPENAI_MODEL` | `gpt-4-turbo-preview` | Modèle OpenAI à utiliser | Service `api` → Variables |

### Variables Optionnelles (WhatsApp)

| Variable | Valeur | Description | Où l'ajouter |
|----------|--------|-------------|--------------|
| `WHATSAPP_API_TOKEN` | `...` | Token API WhatsApp | Service `api` → Variables |
| `WHATSAPP_PHONE_NUMBER_ID` | `...` | ID du numéro WhatsApp | Service `api` → Variables |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | `...` | ID du compte business | Service `api` → Variables |

---

## 🚀 Instructions Pas à Pas

### Étape 1 : Ouvrir Railway Dashboard

```bash
railway open
```

Ou directement : https://railway.com/project/d8a86a8e-7b11-404f-aa20-ac6e7258ab0f

### Étape 2 : Configurer Root Directory

1. Cliquer sur le service **`api`**
2. Aller dans **"Settings"** (icône engrenage)
3. **Root Directory** : `apps/api`
4. **Save**

### Étape 3 : Ajouter PostgreSQL

1. Dans le projet Railway (pas dans le service)
2. **"New"** → **"Database"** → **"PostgreSQL"**
3. Railway créera automatiquement `DATABASE_URL`

### Étape 4 : Ajouter les Variables

Dans le service `api` → **Variables** → **"New Variable"**

#### Variable 1 : JWT_SECRET
- **Key** : `JWT_SECRET`
- **Value** : `238addc223ff1f4cd6242b5a12795eef7fa33b3c5518f27b614e040cd4d033fa`
- **Add**

#### Variable 2 : JWT_EXPIRES_IN
- **Key** : `JWT_EXPIRES_IN`
- **Value** : `7d`
- **Add**

#### Variable 3 : NODE_ENV
- **Key** : `NODE_ENV`
- **Value** : `production`
- **Add**

#### Variable 4 : PORT
- **Key** : `PORT`
- **Value** : `4000`
- **Add**

#### Variable 5 : FRONTEND_URL
- **Key** : `FRONTEND_URL`
- **Value** : `https://votre-domaine.com` (à adapter)
- **Add**

#### Variable 6 : OPENAI_API_KEY
- **Key** : `OPENAI_API_KEY`
- **Value** : `sk-proj-...` (votre clé OpenAI)
- **Add**

#### Variable 7 : OPENAI_MODEL
- **Key** : `OPENAI_MODEL`
- **Value** : `gpt-4-turbo-preview`
- **Add**

---

## ✅ Vérification

Dans le service `api` → **Variables**, vous devriez voir :

```
✅ DATABASE_URL (automatique)
✅ JWT_SECRET
✅ JWT_EXPIRES_IN
✅ NODE_ENV
✅ PORT
✅ FRONTEND_URL
✅ OPENAI_API_KEY
✅ OPENAI_MODEL
```

---

## 🚀 Déployer

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
railway up
```

---

## 🔍 Vérifier le Déploiement

```bash
# Voir les logs
railway logs

# Voir le statut
railway status

# Tester l'API
curl https://votre-api-url.up.railway.app/api/health
```

---

## 📝 Notes

- **DATABASE_URL** : Créée automatiquement, ne pas l'ajouter manuellement
- **JWT_SECRET** : Utilisez le secret généré avec `openssl rand -hex 32`
- **FRONTEND_URL** : À adapter selon votre domaine de production
- **OPENAI_API_KEY** : Optionnel mais recommandé pour le parsing IA

---

**Une fois toutes les variables configurées, redéployez avec `railway up` ! 🚀**
