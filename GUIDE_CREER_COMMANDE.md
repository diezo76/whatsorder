# 📦 Guide : Créer une Commande via API

## 🎯 Objectif

Créer une nouvelle commande via l'endpoint API `/api/orders`.

---

## 📋 Prérequis

1. **Token JWT valide** : Vous devez être authentifié
2. **Customer ID** : ID d'un client existant
3. **Menu Item ID** : ID d'un item du menu existant

---

## 🔑 Étape 1 : Obtenir un Token

### Option A : Via l'interface de connexion

1. Connectez-vous sur http://localhost:3000/login
2. Ouvrez la console du navigateur (F12)
3. Récupérez le token depuis `localStorage.getItem('token')`

### Option B : Via l'API de login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "votre@email.com",
    "password": "votre_mot_de_passe"
  }'
```

Copiez le `token` de la réponse.

---

## 👤 Étape 2 : Obtenir un Customer ID

### Option A : Via Script (Recommandé)

```bash
./scripts/get-ids.sh
```

### Option B : Via Prisma Studio

```bash
cd apps/web
pnpm db:studio
```

Ouvrez http://localhost:5555 et allez dans la table `customers`. Copiez un `id`.

### Option C : Via Supabase Dashboard

1. Allez sur https://supabase.com/dashboard/project/rvndgopsysdyycelmfuu/editor
2. Ouvrez la table `customers`
3. Copiez un `id`

### Option D : Via SQL Direct

```bash
# Si vous avez psql installé
psql "$DATABASE_URL" -t -c "SELECT id FROM customers LIMIT 1;"
```

---

## 🍽️ Étape 3 : Obtenir un Menu Item ID

### Option A : Via Script (Recommandé)

```bash
./scripts/get-ids.sh
```

### Option B : Via Prisma Studio

```bash
cd apps/web
pnpm db:studio
```

Ouvrez http://localhost:5555 et allez dans la table `menu_items`. Copiez un `id`.

### Option C : Via Supabase Dashboard

1. Allez sur https://supabase.com/dashboard/project/rvndgopsysdyycelmfuu/editor
2. Ouvrez la table `menu_items`
3. Copiez un `id` d'un item actif (`isActive = true`)

### Option D : Via SQL Direct

```bash
# Si vous avez psql installé
psql "$DATABASE_URL" -t -c "SELECT id FROM menu_items WHERE \"isActive\" = true LIMIT 1;"
```

---

## 🚀 Étape 4 : Créer la Commande

### Méthode 1 : Script Automatique (Recommandé)

```bash
export TOKEN="votre_token_jwt"
export CUSTOMER_ID="uuid-customer"
export MENU_ITEM_ID="uuid-item"

./scripts/create-order.sh
```

### Méthode 2 : Commande cURL Directe

```bash
export TOKEN="votre_token_jwt"
export CUSTOMER_ID="uuid-customer"
export MENU_ITEM_ID="uuid-item"

curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"items\": [{
      \"menuItemId\": \"$MENU_ITEM_ID\",
      \"quantity\": 1
    }],
    \"deliveryType\": \"DELIVERY\"
  }"
```

### Méthode 3 : Avec Plusieurs Items

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"items\": [
      {
        \"menuItemId\": \"$MENU_ITEM_ID_1\",
        \"quantity\": 2,
        \"notes\": \"Sans oignons\"
      },
      {
        \"menuItemId\": \"$MENU_ITEM_ID_2\",
        \"quantity\": 1
      }
    ],
    \"deliveryType\": \"DELIVERY\",
    \"deliveryAddress\": \"123 Rue Example, Ville\",
    \"customerNotes\": \"Sonner 3 fois\"
  }"
```

---

## 📝 Format de la Requête

### Body JSON

```json
{
  "customerId": "uuid-customer",      // Requis
  "items": [                          // Requis (au moins 1 item)
    {
      "menuItemId": "uuid-item",      // Requis
      "quantity": 1,                  // Requis
      "notes": "Sans oignons"         // Optionnel
    }
  ],
  "deliveryType": "DELIVERY",         // Requis: DELIVERY | PICKUP | DINE_IN
  "deliveryAddress": "123 Rue...",    // Optionnel (requis si DELIVERY)
  "customerNotes": "Notes..."         // Optionnel
}
```

---

## ✅ Réponse Succès (201)

```json
{
  "success": true,
  "order": {
    "id": "uuid-order",
    "orderNumber": "ORD-20260112-001",
    "status": "PENDING",
    "deliveryType": "DELIVERY",
    "subtotal": 50.0,
    "deliveryFee": 20.0,
    "total": 70.0,
    "customer": {
      "id": "uuid-customer",
      "name": "Ahmed Mohamed",
      "phone": "+201234567890"
    },
    "items": [
      {
        "id": "uuid-order-item",
        "quantity": 1,
        "unitPrice": 50.0,
        "subtotal": 50.0,
        "menuItem": {
          "id": "uuid-item",
          "name": "Hummus",
          "price": 50.0
        }
      }
    ],
    "createdAt": "2026-01-12T10:30:00.000Z"
  }
}
```

---

## ❌ Erreurs Possibles

### 401 Unauthorized
```
Token invalide ou expiré
```
**Solution** : Obtenez un nouveau token via `/api/auth/login`

### 400 Bad Request
```json
{
  "error": "customerId et items sont requis"
}
```
**Solution** : Vérifiez que `customerId` et `items` sont présents dans le body

### 400 Bad Request
```json
{
  "error": "Certains items sont invalides"
}
```
**Solution** : Vérifiez que les `menuItemId` existent et appartiennent au restaurant de l'utilisateur

---

## 🔍 Vérification

Après création, vérifiez la commande :

```bash
# Lister toutes les commandes
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/orders

# Obtenir une commande spécifique
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/orders/ORDER_ID
```

---

## 📚 Exemple Complet

```bash
#!/bin/bash

# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@restaurant.com","password":"password123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# 2. Obtenir un customer (depuis la base de données)
# Option A: Via Prisma Studio (ouvrir http://localhost:5555)
# Option B: Via SQL
CUSTOMER_ID=$(psql "$DATABASE_URL" -t -c "SELECT id FROM customers LIMIT 1;" | tr -d ' ')

if [ -z "$CUSTOMER_ID" ]; then
  echo "❌ Aucun customer trouvé. Créez-en un d'abord."
  exit 1
fi

echo "Customer ID: $CUSTOMER_ID"

# 3. Obtenir un menu item (depuis la base de données)
MENU_ITEM_ID=$(psql "$DATABASE_URL" -t -c "SELECT id FROM menu_items WHERE \"isActive\" = true LIMIT 1;" | tr -d ' ')

if [ -z "$MENU_ITEM_ID" ]; then
  echo "❌ Aucun menu item trouvé. Créez-en un d'abord."
  exit 1
fi

echo "Menu Item ID: $MENU_ITEM_ID"

# 4. Créer la commande
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"items\": [{
      \"menuItemId\": \"$MENU_ITEM_ID\",
      \"quantity\": 1
    }],
    \"deliveryType\": \"DELIVERY\"
  }" | jq '.'
```

---

## 🎉 C'est Fait !

Votre commande devrait maintenant apparaître dans :
- Le dashboard : http://localhost:3000/dashboard/orders
- L'API : `GET /api/orders`
- Supabase Realtime (si activé) : Les autres clients verront la nouvelle commande en temps réel
