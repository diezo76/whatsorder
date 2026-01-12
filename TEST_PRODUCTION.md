# 🧪 Guide de Test Production Vercel

## 📍 URL de Production

**URL Principale:** `https://whatsorder-web-diiezos-projects.vercel.app`

**URL Alternative:** `https://whatsorder-web.vercel.app` (si configurée)

⚠️ **Note:** Le déploiement semble avoir une protection Vercel activée. Si vous obtenez une erreur 401 "Authentication Required", vous devez :

1. Aller sur Vercel Dashboard → Votre projet → Settings → Deployment Protection
2. Désactiver temporairement la protection pour les tests
3. Ou utiliser un token d'accès Vercel

---

## 🔧 ÉTAPE 1 : Vérifier les Variables d'Environnement

### Variables Requises dans Vercel Dashboard

Allez sur : **Vercel Dashboard → whatsorder-web → Settings → Environment Variables**

Vérifiez que ces variables existent pour **Production** :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL PostgreSQL Supabase | `postgresql://postgres.xxx...` |
| `DIRECT_URL` | URL directe PostgreSQL (port 5432) | `postgresql://postgres.xxx...` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase | `eyJhbGciOiJI...` |
| `JWT_SECRET` | Secret pour JWT | `votre-secret-jwt` |
| `JWT_EXPIRES_IN` | Expiration JWT | `7d` |
| `OPENAI_API_KEY` | Clé API OpenAI | `sk-proj-xxx...` |
| `OPENAI_MODEL` | Modèle OpenAI | `gpt-4-turbo-preview` |
| `NODE_ENV` | Environnement | `production` |

### Ajouter une Variable Manquante

1. Cliquez sur **"Add"**
2. Entrez le nom et la valeur
3. Sélectionnez **"Production"** dans Environment
4. Cliquez sur **"Save"**
5. Redéployez : **Deployments → Latest → "..." → Redeploy**

---

## 🧪 ÉTAPE 2 : Tests API Routes

### Script de Test Automatique

Un script de test est disponible : `test-production.sh`

```bash
# Exécuter le script
cd ~/whatsapp-order
./test-production.sh https://whatsorder-web-diiezos-projects.vercel.app
```

### Tests Manuels

#### 2.1 Health Check

```bash
export PROD_URL="https://whatsorder-web-diiezos-projects.vercel.app"

curl $PROD_URL/api/auth/health
```

**✅ Attendu:**
```json
{
  "status": "ok",
  "service": "auth",
  "timestamp": "2026-01-12T...",
  "environment": "production"
}
```

#### 2.2 Login Admin

```bash
curl -X POST $PROD_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@whatsorder.com",
    "password": "Admin123!"
  }'
```

**✅ Attendu:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-xxx",
    "email": "admin@whatsorder.com",
    "name": "Admin",
    "role": "OWNER",
    "restaurantId": "uuid-restaurant"
  }
}
```

**⚠️ COPIEZ LE TOKEN:**
```bash
export PROD_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 2.3 Get Profile

```bash
curl $PROD_URL/api/auth/me \
  -H "Authorization: Bearer $PROD_TOKEN"
```

#### 2.4 Menu Items

```bash
curl $PROD_URL/api/menu/items \
  -H "Authorization: Bearer $PROD_TOKEN"
```

#### 2.5 Orders List

```bash
curl $PROD_URL/api/orders \
  -H "Authorization: Bearer $PROD_TOKEN"
```

#### 2.6 Analytics Dashboard

```bash
curl "$PROD_URL/api/analytics/dashboard-stats?period=today" \
  -H "Authorization: Bearer $PROD_TOKEN"
```

#### 2.7 Create Order

```bash
# D'abord, récupérer les IDs nécessaires
MENU_ITEM_ID=$(curl -s $PROD_URL/api/menu/items \
  -H "Authorization: Bearer $PROD_TOKEN" \
  | jq -r '.items[0].id')

CUSTOMER_ID=$(curl -s $PROD_URL/api/orders \
  -H "Authorization: Bearer $PROD_TOKEN" \
  | jq -r '.orders[0].customerId')

# Créer la commande
curl -X POST $PROD_URL/api/orders \
  -H "Authorization: Bearer $PROD_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"items\": [
      {
        \"menuItemId\": \"$MENU_ITEM_ID\",
        \"quantity\": 3,
        \"variant\": \"Large\",
        \"notes\": \"Test commande production\"
      }
    ],
    \"deliveryType\": \"DELIVERY\",
    \"deliveryAddress\": \"456 Avenue des Pyramides, Giza\",
    \"customerNotes\": \"Commande de test Vercel\"
  }"
```

---

## 🌐 ÉTAPE 3 : Tests Frontend

### 3.1 Page Login

1. Ouvrez : `https://whatsorder-web-diiezos-projects.vercel.app/login`
2. Entrez :
   - Email: `admin@whatsorder.com`
   - Password: `Admin123!`
3. Cliquez sur "Se connecter"

**✅ Attendu:** Redirection vers `/dashboard`

### 3.2 Dashboard

URL: `https://whatsorder-web-diiezos-projects.vercel.app/dashboard`

**Vérifiez:**
- ✅ KPIs affichés (Revenus, Commandes, etc.)
- ✅ Sidebar avec Menu, Commandes, Inbox, Analytics, Paramètres

### 3.3 Page Menu

URL: `https://whatsorder-web-diiezos-projects.vercel.app/dashboard/menu`

**Vérifiez:**
- ✅ Catégories affichées
- ✅ Items du menu listés
- ✅ Boutons Edit/Delete fonctionnent

**Test CRUD:**
1. Cliquez sur "Edit" d'un item
2. Modifiez le prix (ex: 50 → 55)
3. Sauvegardez
4. Rafraîchissez la page
5. ✅ Vérifiez que le prix = 55

### 3.4 Kanban Orders

URL: `https://whatsorder-web-diiezos-projects.vercel.app/dashboard/orders`

**Vérifiez:**
- ✅ Colonnes Kanban affichées (En Attente, Confirmée, etc.)
- ✅ Cards de commandes visibles
- ✅ Drag & Drop fonctionne

**Test Drag & Drop:**
1. Glissez une card vers "Confirmée"
2. ✅ Toast de confirmation apparaît
3. Rafraîchissez la page
4. ✅ La card reste dans "Confirmée"

### 3.5 Analytics

URL: `https://whatsorder-web-diiezos-projects.vercel.app/dashboard/analytics`

**Vérifiez:**
- ✅ Graphes de revenus affichés
- ✅ Top items listés
- ✅ Statistiques correctes

### 3.6 Menu Public

URL: `https://whatsorder-web-diiezos-projects.vercel.app/nile-bites`

**Vérifiez:**
- ✅ Header "Nile Bites"
- ✅ Items du menu affichés
- ✅ Images chargées
- ✅ Panier fonctionne

**Test Checkout:**
1. Ajoutez un item au panier
2. Cliquez sur l'icône panier
3. Vérifiez le total
4. Cliquez sur "Commander via WhatsApp"
5. ✅ Redirection WhatsApp avec message pré-rempli

---

## 🗄️ ÉTAPE 4 : Vérifier dans Supabase

### 4.1 Vérifier les Commandes

1. Allez sur **Supabase Dashboard → Table Editor → orders**
2. ✅ Vérifiez que les commandes créées apparaissent
3. Vérifiez les champs :
   - `orderNumber`: ORD-20260112-002
   - `status`: CONFIRMED (si drag & drop fait)
   - `total`: 170

### 4.2 Vérifier les Menu Items

1. Allez sur **Supabase Dashboard → Table Editor → menu_items**
2. ✅ Vérifiez que les modifications de prix sont synchronisées
3. Exemple: Koshari price = 55 (si modifié en prod)

---

## ✅ CHECKLIST COMPLÈTE

| Test | URL/Endpoint | Résultat | ✅ |
|------|--------------|----------|-----|
| Variables Env | Vercel Settings | Toutes configurées | ☐ |
| Health API | `/api/auth/health` | Status OK | ☐ |
| Login API | `POST /api/auth/login` | Token retourné | ☐ |
| Auth API | `/api/auth/me` | Profil OK | ☐ |
| Menu API | `/api/menu/items` | Liste OK | ☐ |
| Create Order API | `POST /api/orders` | Commande créée | ☐ |
| Get Orders API | `/api/orders` | Liste OK | ☐ |
| Analytics API | `/api/analytics/dashboard-stats` | KPIs OK | ☐ |
| Login Frontend | `/login` | Redirect Dashboard | ☐ |
| Dashboard | `/dashboard` | KPIs affichés | ☐ |
| Menu Page | `/dashboard/menu` | CRUD fonctionne | ☐ |
| Kanban | `/dashboard/orders` | Drag&Drop OK | ☐ |
| Analytics | `/dashboard/analytics` | Graphes OK | ☐ |
| Menu Public | `/nile-bites` | Affichage OK | ☐ |
| Checkout | `/nile-bites` | WhatsApp OK | ☐ |
| Supabase Sync | Table Editor | Données synchro | ☐ |

---

## 🐛 TROUBLESHOOTING

### Erreur 401 "Authentication Required"

**Cause:** Deployment Protection activée sur Vercel

**Solution:**
1. Vercel Dashboard → Projet → Settings → Deployment Protection
2. Désactiver temporairement OU
3. Utiliser un token d'accès Vercel

### Erreur "Database connection failed"

**Vérifier:**
```bash
# Tester la connexion depuis votre terminal
psql "TA_DATABASE_URL_DE_PRODUCTION"
```

**Si ça échoue:**
- Vérifier le mot de passe Supabase
- Vérifier que `DATABASE_URL` est correcte dans Vercel

### Erreur "Token invalide" (401)

**Vérifier:**
- `JWT_SECRET` dans Vercel doit être identique à `.env.local`
- Regénérer un token via login

### Erreur CORS

**Solution:**
1. Vercel Dashboard → Settings → Environment Variables
2. Ajouter: `NEXT_PUBLIC_API_URL = https://whatsorder-web-diiezos-projects.vercel.app`
3. Redéployer

### Logs de Debug Vercel

**Via Interface:**
- Vercel Dashboard → Projet → Deployments → Latest → Runtime Logs

**Via CLI:**
```bash
vercel logs --follow
```

---

## 📊 Résultat Final

Après avoir effectué tous les tests, indiquez :

**Score:** X/16 tests passés

**Exemples:**
- ✅ 16/16 → "Tous les tests passent !"
- ✅ 14/16 → "Tous les tests passent sauf Menu Public et Checkout"
- ❌ 8/16 → "Health OK, Login OK, mais erreurs sur les autres API"

---

## 📝 Notes Importantes

1. **Seed de la Base:** Si les tests échouent avec "Email ou mot de passe incorrect", la base n'est pas seedée. Exécutez :
   ```bash
   cd apps/web
   npx prisma db seed
   ```

2. **Prisma Generate:** Le script `postinstall` dans `package.json` devrait générer automatiquement Prisma Client lors du build.

3. **Variables d'Environnement:** Assurez-vous que toutes les variables sont configurées pour **Production** et non seulement pour **Development**.

4. **Deployment Protection:** Si activée, vous devrez la désactiver temporairement pour les tests ou utiliser un token d'accès.
