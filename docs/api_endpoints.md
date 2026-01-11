# 🔌 API Endpoints - Documentation Complète

## 📋 Base URL

- **Development** : `http://localhost:4000/api`
- **Production** : `https://api.whatsorder.com/api`

---

## 🔐 Authentication

Tous les endpoints protégés nécessitent un header :

```
Authorization: Bearer <jwt_token>
```

### Endpoints Auth

#### POST `/auth/register`
Créer un nouveau compte.

**Request** :
```json
{
  "email": "owner@restaurant.com",
  "password": "securePassword123",
  "firstName": "Ahmed",
  "lastName": "Mohamed"
}
```

**Response** (201) :
```json
{
  "user": {
    "id": "uuid",
    "email": "owner@restaurant.com",
    "firstName": "Ahmed",
    "role": "OWNER"
  },
  "token": "jwt_token_here"
}
```

**Errors** :
- `400` : Email déjà utilisé
- `400` : Validation error

---

#### POST `/auth/login`
Se connecter.

**Request** :
```json
{
  "email": "owner@restaurant.com",
  "password": "securePassword123"
}
```

**Response** (200) :
```json
{
  "user": { ... },
  "token": "jwt_token_here"
}
```

**Errors** :
- `401` : Credentials invalides

---

#### POST `/auth/refresh`
Rafraîchir le token.

**Request** :
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response** (200) :
```json
{
  "token": "new_jwt_token"
}
```

---

#### POST `/auth/forgot-password`
Demander reset password.

**Request** :
```json
{
  "email": "owner@restaurant.com"
}
```

**Response** (200) :
```json
{
  "message": "Email sent"
}
```

---

## 🏪 Restaurants

### GET `/restaurants`
Liste des restaurants de l'utilisateur.

**Auth** : Required (OWNER)

**Response** (200) :
```json
{
  "restaurants": [
    {
      "id": "uuid",
      "name": "Restaurant El Fattah",
      "slug": "restaurant-el-fattah",
      "logo": "https://cloudinary.com/...",
      "isActive": true
    }
  ]
}
```

---

### POST `/restaurants`
Créer un restaurant.

**Auth** : Required (OWNER)

**Request** :
```json
{
  "name": "Restaurant El Fattah",
  "description": "Meilleur restaurant du Caire",
  "phone": "+201234567890",
  "address": "123 Tahrir Square",
  "city": "Cairo"
}
```

**Response** (201) :
```json
{
  "restaurant": {
    "id": "uuid",
    "name": "Restaurant El Fattah",
    "slug": "restaurant-el-fattah",
    ...
  }
}
```

---

### GET `/restaurants/:id`
Détails d'un restaurant.

**Auth** : Required (OWNER ou STAFF du restaurant)

**Response** (200) :
```json
{
  "restaurant": {
    "id": "uuid",
    "name": "Restaurant El Fattah",
    "slug": "restaurant-el-fattah",
    "settings": { ... },
    ...
  }
}
```

---

### PUT `/restaurants/:id`
Mettre à jour un restaurant.

**Auth** : Required (OWNER)

**Request** :
```json
{
  "name": "Nouveau nom",
  "phone": "+201234567890"
}
```

**Response** (200) :
```json
{
  "restaurant": { ... }
}
```

---

### POST `/restaurants/:id/logo`
Upload logo restaurant.

**Auth** : Required (OWNER)

**Request** : `multipart/form-data` avec fichier image

**Response** (200) :
```json
{
  "logo": "https://cloudinary.com/..."
}
```

---

## 🍽️ Menu

### GET `/restaurants/:restaurantId/menu`
Menu complet (public).

**Auth** : Not required

**Response** (200) :
```json
{
  "restaurant": {
    "name": "Restaurant El Fattah",
    "slug": "restaurant-el-fattah"
  },
  "categories": [
    {
      "id": "uuid",
      "name": "Entrées",
      "nameAr": "المقبلات",
      "items": [
        {
          "id": "uuid",
          "name": "Hummus",
          "price": 25,
          "image": "https://...",
          "variants": [
            {
              "id": "uuid",
              "name": "Petite",
              "priceModifier": 0
            }
          ]
        }
      ]
    }
  ]
}
```

---

### GET `/restaurants/:restaurantId/menu/categories`
Liste catégories (admin).

**Auth** : Required (OWNER ou STAFF)

**Response** (200) :
```json
{
  "categories": [ ... ]
}
```

---

### POST `/restaurants/:restaurantId/menu/categories`
Créer une catégorie.

**Auth** : Required (OWNER)

**Request** :
```json
{
  "name": "Entrées",
  "nameAr": "المقبلات",
  "description": "Nos meilleures entrées",
  "displayOrder": 0
}
```

**Response** (201) :
```json
{
  "category": { ... }
}
```

---

### PUT `/restaurants/:restaurantId/menu/categories/:categoryId`
Mettre à jour une catégorie.

**Auth** : Required (OWNER)

---

### DELETE `/restaurants/:restaurantId/menu/categories/:categoryId`
Supprimer une catégorie (soft delete).

**Auth** : Required (OWNER)

---

### GET `/restaurants/:restaurantId/menu/items`
Liste items menu (admin).

**Auth** : Required (OWNER ou STAFF)

**Query Params** :
- `categoryId` : Filtrer par catégorie
- `isAvailable` : true/false

**Response** (200) :
```json
{
  "items": [ ... ]
}
```

---

### POST `/restaurants/:restaurantId/menu/items`
Créer un item menu.

**Auth** : Required (OWNER)

**Request** :
```json
{
  "categoryId": "uuid",
  "name": "Hummus",
  "nameAr": "حمص",
  "description": "Hummus crémeux",
  "price": 25,
  "image": "https://...",
  "isAvailable": true,
  "variants": [
    {
      "name": "Petite",
      "priceModifier": 0,
      "isDefault": true
    }
  ]
}
```

**Response** (201) :
```json
{
  "item": { ... }
}
```

---

### PUT `/restaurants/:restaurantId/menu/items/:itemId`
Mettre à jour un item.

**Auth** : Required (OWNER)

---

### DELETE `/restaurants/:restaurantId/menu/items/:itemId`
Supprimer un item (soft delete).

**Auth** : Required (OWNER)

---

## 🛒 Orders

### GET `/restaurants/:restaurantId/orders`
Liste commandes.

**Auth** : Required (OWNER ou STAFF)

**Query Params** :
- `status` : Filtrer par statut
- `startDate` : Date début (ISO)
- `endDate` : Date fin (ISO)
- `page` : Numéro page (default: 1)
- `limit` : Items par page (default: 20)

**Response** (200) :
```json
{
  "orders": [
    {
      "id": "uuid",
      "orderNumber": "REST-2026-001",
      "status": "PENDING",
      "total": 150,
      "items": [ ... ],
      "customer": { ... },
      "createdAt": "2026-01-11T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### GET `/restaurants/:restaurantId/orders/:orderId`
Détails d'une commande.

**Auth** : Required (OWNER ou STAFF)

**Response** (200) :
```json
{
  "order": {
    "id": "uuid",
    "orderNumber": "REST-2026-001",
    "status": "PENDING",
    "items": [ ... ],
    "statusHistory": [ ... ],
    ...
  }
}
```

---

### POST `/restaurants/:restaurantId/orders`
Créer une commande (depuis panier client).

**Auth** : Not required (peut être anonyme)

**Request** :
```json
{
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "variantId": "uuid",
      "notes": "Sans oignons"
    }
  ],
  "deliveryAddress": "123 Tahrir Square",
  "deliveryPhone": "+201234567890",
  "deliveryNotes": "Sonner 3 fois",
  "paymentMethod": "CASH"
}
```

**Response** (201) :
```json
{
  "order": {
    "id": "uuid",
    "orderNumber": "REST-2026-001",
    "status": "PENDING",
    "total": 150,
    ...
  },
  "whatsappMessage": {
    "messageId": "wamid.xxx",
    "status": "SENT"
  }
}
```

---

### PUT `/restaurants/:restaurantId/orders/:orderId/status`
Changer le statut d'une commande.

**Auth** : Required (OWNER ou STAFF)

**Request** :
```json
{
  "status": "CONFIRMED",
  "notes": "Commande confirmée"
}
```

**Response** (200) :
```json
{
  "order": { ... }
}
```

---

### PUT `/restaurants/:restaurantId/orders/:orderId/assign`
Assigner une commande à un staff.

**Auth** : Required (OWNER ou MANAGER)

**Request** :
```json
{
  "staffId": "uuid"
}
```

---

## 💬 WhatsApp

### GET `/restaurants/:restaurantId/whatsapp/conversations`
Liste conversations WhatsApp.

**Auth** : Required (OWNER ou STAFF)

**Query Params** :
- `isRead` : true/false
- `page` : Numéro page
- `limit` : Items par page

**Response** (200) :
```json
{
  "conversations": [
    {
      "id": "uuid",
      "phoneNumber": "+201234567890",
      "name": "Ahmed Mohamed",
      "isRead": false,
      "lastMessage": {
        "text": "Je veux commander",
        "createdAt": "2026-01-11T..."
      },
      "lastMessageAt": "2026-01-11T..."
    }
  ]
}
```

---

### GET `/restaurants/:restaurantId/whatsapp/conversations/:conversationId/messages`
Messages d'une conversation.

**Auth** : Required (OWNER ou STAFF)

**Response** (200) :
```json
{
  "messages": [
    {
      "id": "uuid",
      "direction": "INBOUND",
      "text": "Je veux commander",
      "createdAt": "2026-01-11T...",
      "status": "READ"
    }
  ]
}
```

---

### POST `/restaurants/:restaurantId/whatsapp/conversations/:conversationId/messages`
Envoyer un message WhatsApp.

**Auth** : Required (OWNER ou STAFF)

**Request** :
```json
{
  "text": "Votre commande est en préparation !"
}
```

**Response** (201) :
```json
{
  "message": {
    "id": "uuid",
    "messageId": "wamid.xxx",
    "status": "SENT"
  }
}
```

---

### POST `/webhooks/whatsapp`
Webhook WhatsApp (Meta).

**Auth** : Not required (vérifié via signature)

**Request** : Format Meta WhatsApp

**Response** (200) : `OK`

---

## 📊 Analytics

### GET `/restaurants/:restaurantId/analytics/overview`
Vue d'ensemble analytics.

**Auth** : Required (OWNER)

**Query Params** :
- `startDate` : Date début (ISO)
- `endDate` : Date fin (ISO)

**Response** (200) :
```json
{
  "period": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-11"
  },
  "orders": {
    "total": 150,
    "pending": 5,
    "completed": 140,
    "cancelled": 5
  },
  "revenue": {
    "total": 25000,
    "average": 166.67,
    "currency": "EGP"
  },
  "topItems": [
    {
      "menuItemId": "uuid",
      "name": "Hummus",
      "quantity": 45,
      "revenue": 1125
    }
  ]
}
```

---

### GET `/restaurants/:restaurantId/analytics/revenue`
Revenus par période.

**Auth** : Required (OWNER)

**Query Params** :
- `period` : `day` | `week` | `month`
- `startDate` : Date début
- `endDate` : Date fin

**Response** (200) :
```json
{
  "data": [
    {
      "date": "2026-01-11",
      "revenue": 2500,
      "orders": 15
    }
  ]
}
```

---

## 🔄 Workflows

### GET `/restaurants/:restaurantId/workflows`
Liste workflows.

**Auth** : Required (OWNER)

**Response** (200) :
```json
{
  "workflows": [
    {
      "id": "uuid",
      "name": "Notification nouvelle commande",
      "isActive": true,
      "config": { ... }
    }
  ]
}
```

---

### POST `/restaurants/:restaurantId/workflows`
Créer un workflow.

**Auth** : Required (OWNER)

**Request** :
```json
{
  "name": "Notification nouvelle commande",
  "description": "Envoyer message WhatsApp à chaque nouvelle commande",
  "config": {
    "nodes": [ ... ],
    "edges": [ ... ]
  }
}
```

---

### PUT `/restaurants/:restaurantId/workflows/:workflowId`
Mettre à jour un workflow.

**Auth** : Required (OWNER)

---

### DELETE `/restaurants/:restaurantId/workflows/:workflowId`
Supprimer un workflow.

**Auth** : Required (OWNER)

---

## ⚠️ Codes d'Erreur

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Token invalide ou expiré"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Vous n'avez pas les permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Ressource introuvable"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Une erreur est survenue"
}
```

---

## 🚦 Rate Limiting

- **Auth endpoints** : 5 requêtes/minute
- **API endpoints** : 100 requêtes/minute (par IP)
- **Webhooks** : Pas de limite

---

## 📝 Notes

- Tous les timestamps sont en ISO 8601
- Toutes les sommes sont en EGP (Égypte)
- Pagination : Par défaut 20 items par page, max 100
