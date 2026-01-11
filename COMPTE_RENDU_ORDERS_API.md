# Compte Rendu - Création des Routes API pour la Gestion des Commandes

**Date** : 2024-01-11  
**Tâche** : Création des routes API pour la gestion des commandes dans `apps/api/src/`

## ✅ Fichiers créés

### 1. `apps/api/src/controllers/order.controller.ts`
Contrôleur complet avec 5 méthodes principales :

#### `getOrders(req, res)`
- Liste toutes les commandes du restaurant avec filtres avancés
- **Query params supportés** :
  - `status` : filtre par statut (PENDING, CONFIRMED, etc.)
  - `assignedToId` : filtre par staff assigné
  - `date` : filtre par période (today, yesterday, week, month)
  - `search` : recherche dans orderNumber, customer.name, customer.phone
  - `page` : numéro de page (défaut: 1)
  - `limit` : nombre d'éléments par page (défaut: 50)
- **Includes** : customer, items (avec menuItem), assignedTo (user)
- **Tri** : createdAt DESC
- **Pagination** : retourne `orders`, `total`, `page`, `limit`, `hasMore`

#### `getOrder(req, res)`
- Récupère une commande complète par ID
- **Includes** :
  - customer (toutes les infos)
  - items avec menuItem
  - assignedTo (user)
  - internalNotes avec user
- **Sécurité** : vérifie que la commande appartient au restaurant

#### `updateOrderStatus(req, res)`
- Met à jour le statut d'une commande
- **Body** : `{ status }`
- **Validation** : vérifie que le statut est valide (enum OrderStatus)
- **Logique automatique** :
  - Met à jour `completedAt` si status = COMPLETED
  - Met à jour `cancelledAt` si status = CANCELLED
- **Socket.io** : émet l'événement `order_updated`
- **TODO** : Envoie notification WhatsApp au client (commenté)

#### `assignOrder(req, res)`
- Assigne une commande à un staff
- **Body** : `{ assignedToId }`
- **Vérifications** :
  - Le user existe
  - Le user appartient au restaurant
- **Mise à jour** : met à jour `assignedAt`
- **Socket.io** : émet les événements `order_assigned` et `order_updated`

#### `cancelOrder(req, res)`
- Annule une commande
- **Body** : `{ cancellationReason }`
- **Logique** :
  - Met status = CANCELLED
  - Enregistre `cancelledAt` et `cancellationReason`
  - Vérifie que la commande n'est pas déjà annulée ou complétée
- **Socket.io** : émet les événements `order_cancelled` et `order_updated`

### 2. `apps/api/src/routes/order.routes.ts`
Routes Express protégées par `authMiddleware` :
- `GET /api/orders` → `getOrders`
- `GET /api/orders/:id` → `getOrder`
- `PATCH /api/orders/:id/status` → `updateOrderStatus`
- `PATCH /api/orders/:id/assign` → `assignOrder`
- `PATCH /api/orders/:id/cancel` → `cancelOrder`

## ✅ Fichiers modifiés

### 1. `apps/api/src/types/socket.ts`
Ajout des événements Socket.io pour les commandes :
- `order_updated: (order: any) => void`
- `order_assigned: (order: any) => void`
- `order_cancelled: (order: any) => void`

### 2. `apps/api/src/index.ts`
- Import de `orderRoutes`
- Montage de la route : `app.use('/api/orders', authMiddleware, orderRoutes)`
- Mise à jour de la documentation des endpoints dans la route `/`
- Ajout du log de démarrage pour les endpoints orders

## 🔧 Détails techniques

### Validation Zod
Trois schémas de validation créés :
- `updateStatusSchema` : valide le statut (enum avec 8 valeurs)
- `assignOrderSchema` : valide assignedToId (UUID)
- `cancelOrderSchema` : valide cancellationReason (string 1-500 caractères)

### Gestion d'erreurs
- **400** : validation échouée, statut invalide
- **401** : non authentifié
- **403** : commande n'appartient pas au restaurant, utilisateur n'appartient pas au restaurant
- **404** : commande non trouvée, utilisateur non trouvé
- **500** : erreur serveur

### Recherche dans getOrders
La recherche par customer.name et customer.phone utilise une approche en deux étapes :
1. Recherche des customers correspondants
2. Filtrage des commandes par customerId

Cette approche est nécessaire car Prisma ne supporte pas directement les relations imbriquées dans `OR`.

### Socket.io
Tous les événements sont émis vers la room `restaurant_${restaurantId}` pour permettre la synchronisation en temps réel entre tous les clients connectés du restaurant.

### Sécurité
- Toutes les routes sont protégées par `authMiddleware`
- Vérification systématique que l'utilisateur appartient à un restaurant
- Vérification que les commandes appartiennent au restaurant de l'utilisateur
- Vérification que les utilisateurs assignés appartiennent au même restaurant

## 📝 Format des réponses

### getOrders
```json
{
  "orders": [...],
  "total": 45,
  "page": 1,
  "limit": 50,
  "hasMore": true
}
```

### getOrder, updateOrderStatus, assignOrder, cancelOrder
```json
{
  "order": {...},
  "success": true
}
```

## 🚀 Prochaines étapes

1. **Notification WhatsApp** : Implémenter `sendWhatsAppNotification()` dans `updateOrderStatus`
2. **Tests** : Créer des tests unitaires et d'intégration pour chaque endpoint
3. **Optimisation** : Ajouter des index de base de données si nécessaire pour les recherches fréquentes
4. **Documentation** : Ajouter la documentation Swagger/OpenAPI pour ces endpoints

## ⚠️ Notes importantes

- Le `restaurantId` n'est pas dans le JWT, il est récupéré depuis la base de données à chaque requête
- Les événements Socket.io sont émis uniquement si l'instance `io` est disponible
- La recherche par date utilise des calculs de dates JavaScript (attention aux fuseaux horaires)
- Les commandes sont triées par `createdAt DESC` par défaut
