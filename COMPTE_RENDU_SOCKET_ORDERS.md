# Compte Rendu - Mise à jour des Handlers Socket.io pour les Commandes

**Date** : 2024-01-11  
**Tâche** : Mise à jour des handlers Socket.io pour gérer les commandes en temps réel

## ✅ Fichiers modifiés

### 1. `apps/api/src/types/socket.ts`
**Ajouts** :
- **Interfaces TypeScript** pour les événements de commandes :
  - `OrderStatusChangedEvent` : orderId, oldStatus, newStatus, order
  - `OrderAssignedEvent` : orderId, assignedTo (peut être null)
  - `OrderCancelledEvent` : orderId, reason, order (optionnel)

- **ServerToClientEvents** (nouveaux événements) :
  - `order_status_changed: (data: OrderStatusChangedEvent) => void`
  - `order_assigned: (data: OrderAssignedEvent) => void`
  - `order_cancelled: (data: OrderCancelledEvent) => void`
  - `order_updated: (order: any) => void`
  - `new_order: (order: any) => void` (préparé pour plus tard)

- **ClientToServerEvents** (nouveaux événements) :
  - `watch_order: (orderId: string) => void`
  - `unwatch_order: (orderId: string) => void`

### 2. `apps/api/src/socket/index.ts`
**Ajouts** :
- **Handlers pour les commandes** dans le `connection` handler :
  - `watch_order` : permet à un socket de rejoindre la room `order_${orderId}`
  - `unwatch_order` : permet à un socket de quitter la room `order_${orderId}`
  - Validation des paramètres avec logs de warning
  - Logs de debug pour chaque événement

**Note** : Les users rejoignent automatiquement la room `restaurant_${restaurantId}` via `joinRestaurant()` appelé lors de la connexion.

### 3. `apps/api/src/utils/socket.ts`
**Ajout** :
- **Fonction helper `broadcastOrderUpdate()`** :
  - Paramètres : `restaurantId`, `event`, `data`
  - Émet l'événement dans la room `restaurant_${restaurantId}`
  - Logs détaillés pour le debug
  - Gestion du cas où l'instance `io` n'est pas disponible

### 4. `apps/api/src/controllers/order.controller.ts`
**Modifications** :

#### `updateOrderStatus()` :
- **Stockage du statut précédent** : récupère `previousStatus` avant la mise à jour
- **Émission Socket.io** :
  - `order_status_changed` dans `restaurant_${restaurantId}` avec oldStatus et newStatus
  - `order_updated` dans `order_${orderId}` pour les modals de détails
- **Logs** : console.log avec orderId, oldStatus, newStatus
- **TODO commentaires** :
  - Rate limiting sur les status changes
  - Permissions (OWNER/MANAGER seulement pour certains statuts)
  - Historique des changements de statut
  - Notification WhatsApp

#### `assignOrder()` :
- **Émission Socket.io** :
  - `order_assigned` dans `restaurant_${restaurantId}` avec orderId et assignedTo
  - `order_updated` dans `order_${orderId}` pour les modals de détails
- **Logs** : console.log avec orderId et assignedToId

#### `cancelOrder()` :
- **Émission Socket.io** :
  - `order_cancelled` dans `restaurant_${restaurantId}` avec orderId et reason
  - `order_updated` dans `order_${orderId}` pour les modals de détails
- **Logs** : console.log avec orderId et reason

**Corrections** :
- Remplacement de `validationResult.error.errors` par `validationResult.error.issues` (Zod)
- Import de `broadcastOrderUpdate` depuis `@/utils/socket`

## 🏗️ Architecture Socket.io

### Rooms utilisées :
1. **`restaurant_${restaurantId}`** :
   - Auto-join lors de la connexion
   - Utilisé pour le board Kanban
   - Reçoit : `order_status_changed`, `order_assigned`, `order_cancelled`

2. **`order_${orderId}`** :
   - Join via `watch_order` event
   - Utilisé pour les modals de détails
   - Reçoit : `order_updated`

### Flux d'événements :

```
updateOrderStatus() → 
  ├─ broadcastOrderUpdate('order_status_changed') → restaurant_${restaurantId}
  └─ io.to('order_${orderId}').emit('order_updated') → order_${orderId}

assignOrder() → 
  ├─ broadcastOrderUpdate('order_assigned') → restaurant_${restaurantId}
  └─ io.to('order_${orderId}').emit('order_updated') → order_${orderId}

cancelOrder() → 
  ├─ broadcastOrderUpdate('order_cancelled') → restaurant_${restaurantId}
  └─ io.to('order_${orderId}').emit('order_updated') → order_${orderId}
```

## 📝 Documentation des événements

### Server → Client

#### `order_status_changed`
Émis quand le statut d'une commande change.
```typescript
{
  orderId: string;
  oldStatus: string;
  newStatus: string;
  order: Order; // Commande complète avec relations
}
```

#### `order_assigned`
Émis quand une commande est assignée à un staff.
```typescript
{
  orderId: string;
  assignedTo: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
}
```

#### `order_cancelled`
Émis quand une commande est annulée.
```typescript
{
  orderId: string;
  reason: string;
  order?: Order; // Commande complète (optionnel)
}
```

#### `order_updated`
Émis pour toute mise à jour d'une commande (statut, assignation, etc.).
```typescript
Order // Commande complète avec relations
```

#### `new_order`
Préparé pour plus tard (création de commande).
```typescript
Order // Nouvelle commande complète
```

### Client → Server

#### `watch_order`
Permet de surveiller une commande spécifique.
```typescript
socket.emit('watch_order', orderId: string);
// Rejoint la room order_${orderId}
```

#### `unwatch_order`
Arrête de surveiller une commande spécifique.
```typescript
socket.emit('unwatch_order', orderId: string);
// Quitte la room order_${orderId}
```

## 🔍 Logs de debug

Tous les événements sont loggés avec :
- Socket ID
- User email (si disponible)
- Order ID / Order Number
- Détails spécifiques selon l'événement

Exemples :
```
[Socket] Broadcast order_status_changed to restaurant_abc123 { orderId: '...', oldStatus: 'PENDING', newStatus: 'CONFIRMED' }
[Order] Status changed: ORD-001 { orderId: '...', oldStatus: 'PENDING', newStatus: 'CONFIRMED' }
Socket abc123 watching order: xyz789 (user: admin@example.com)
```

## ✅ Vérifications

- ✅ Compilation TypeScript réussie (pas d'erreurs)
- ✅ Tous les types sont correctement définis
- ✅ Validation des paramètres dans les handlers
- ✅ Gestion des erreurs (io instance non disponible)
- ✅ Logs de debug pour chaque événement
- ✅ TODO commentaires pour les futures améliorations

## 🚀 Prochaines étapes

1. **Rate limiting** : Limiter la fréquence des changements de statut
2. **Permissions** : Vérifier les rôles pour certains statuts (OWNER/MANAGER)
3. **Historique** : Enregistrer l'historique des changements de statut
4. **Notification WhatsApp** : Implémenter l'envoi de notifications
5. **Tests** : Créer des tests pour les handlers Socket.io
6. **Monitoring** : Ajouter des métriques pour les événements Socket.io

## ⚠️ Notes importantes

- Les users rejoignent automatiquement la room restaurant lors de la connexion
- Les rooms `order_${orderId}` sont créées à la demande via `watch_order`
- La fonction `broadcastOrderUpdate()` centralise l'émission vers les rooms restaurant
- Les événements sont émis dans plusieurs rooms pour optimiser les mises à jour (board + modal)
- Les logs incluent des informations de debug pour faciliter le troubleshooting
