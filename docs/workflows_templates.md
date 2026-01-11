# 🔄 Workflows Templates - Guide Complet

## 📋 Vue d'Ensemble

Les workflows permettent d'automatiser des actions basées sur des événements (triggers).

**Format** : JSON avec structure React Flow (nodes + edges)

---

## 🎯 Triggers Disponibles

### 1. `new_order`
Déclenché quand une nouvelle commande est créée.

**Données disponibles** :
```json
{
  "orderId": "uuid",
  "orderNumber": "REST-2026-001",
  "restaurantId": "uuid",
  "total": 150,
  "customerPhone": "+201234567890",
  "items": [ ... ]
}
```

---

### 2. `order_confirmed`
Déclenché quand une commande passe au statut `CONFIRMED`.

**Données disponibles** :
```json
{
  "orderId": "uuid",
  "orderNumber": "REST-2026-001",
  "restaurantId": "uuid",
  "total": 150,
  "customerPhone": "+201234567890"
}
```

---

### 3. `order_ready`
Déclenché quand une commande passe au statut `READY`.

**Données disponibles** : Même format que `order_confirmed`

---

### 4. `order_delivered`
Déclenché quand une commande passe au statut `DELIVERED`.

**Données disponibles** : Même format que `order_confirmed`

---

### 5. `order_cancelled`
Déclenché quand une commande est annulée.

**Données disponibles** : Même format que `order_confirmed`

---

## ⚙️ Actions Disponibles

### 1. `send_whatsapp_message`
Envoyer un message WhatsApp.

**Configuration** :
```json
{
  "type": "send_whatsapp_message",
  "data": {
    "to": "{{customerPhone}}", // Variable depuis trigger
    "message": "Votre commande {{orderNumber}} a été confirmée !"
  }
}
```

**Variables disponibles** :
- `{{orderNumber}}` : Numéro commande
- `{{total}}` : Total commande
- `{{customerPhone}}` : Téléphone client
- `{{restaurantName}}` : Nom restaurant

---

### 2. `send_email`
Envoyer un email.

**Configuration** :
```json
{
  "type": "send_email",
  "data": {
    "to": "customer@example.com",
    "subject": "Commande confirmée",
    "template": "order_confirmed",
    "variables": {
      "orderNumber": "{{orderNumber}}",
      "total": "{{total}}"
    }
  }
}
```

---

### 3. `create_notification`
Créer une notification dans le dashboard.

**Configuration** :
```json
{
  "type": "create_notification",
  "data": {
    "title": "Nouvelle commande",
    "message": "Commande {{orderNumber}} reçue",
    "type": "info", // info, success, warning, error
    "restaurantId": "{{restaurantId}}"
  }
}
```

---

### 4. `update_order_status`
Changer automatiquement le statut d'une commande.

**Configuration** :
```json
{
  "type": "update_order_status",
  "data": {
    "orderId": "{{orderId}}",
    "status": "CONFIRMED",
    "notes": "Auto-confirmée par workflow"
  }
}
```

---

### 5. `delay`
Attendre un certain temps avant de continuer.

**Configuration** :
```json
{
  "type": "delay",
  "data": {
    "duration": 30000 // Millisecondes (30 secondes)
  }
}
```

---

### 6. `condition`
Exécuter des actions conditionnelles.

**Configuration** :
```json
{
  "type": "condition",
  "data": {
    "condition": "{{total}} > 100",
    "ifTrue": [ // Actions si condition vraie
      {
        "type": "send_whatsapp_message",
        "data": { ... }
      }
    ],
    "ifFalse": [ // Actions si condition fausse
      {
        "type": "send_whatsapp_message",
        "data": { ... }
      }
    ]
  }
}
```

---

## 📝 Templates Pré-configurés

### Template 1 : Notification Nouvelle Commande

**Use Case** : Envoyer un message WhatsApp au client quand une commande est reçue.

**Configuration** :
```json
{
  "name": "Notification nouvelle commande",
  "description": "Message automatique de confirmation",
  "trigger": "new_order",
  "nodes": [
    {
      "id": "trigger-1",
      "type": "trigger",
      "data": {
        "triggerType": "new_order"
      },
      "position": { "x": 0, "y": 0 }
    },
    {
      "id": "action-1",
      "type": "action",
      "data": {
        "actionType": "send_whatsapp_message",
        "config": {
          "to": "{{customerPhone}}",
          "message": "شكراً لك! تم استلام طلبك رقم {{orderNumber}} بقيمة {{total}} جنيه. سنبدأ التحضير قريباً."
        }
      },
      "position": { "x": 200, "y": 0 }
    },
    {
      "id": "action-2",
      "type": "action",
      "data": {
        "actionType": "create_notification",
        "config": {
          "title": "Nouvelle commande",
          "message": "Commande {{orderNumber}} reçue",
          "type": "info"
        }
      },
      "position": { "x": 200, "y": 100 }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "trigger-1",
      "target": "action-1"
    },
    {
      "id": "e2",
      "source": "trigger-1",
      "target": "action-2"
    }
  ]
}
```

---

### Template 2 : Commande Prête avec Délai

**Use Case** : Notifier le client quand la commande est prête, avec un délai de 5 minutes après confirmation.

**Configuration** :
```json
{
  "name": "Notification commande prête",
  "description": "Message après 5 minutes de préparation",
  "trigger": "order_confirmed",
  "nodes": [
    {
      "id": "trigger-1",
      "type": "trigger",
      "data": {
        "triggerType": "order_confirmed"
      },
      "position": { "x": 0, "y": 0 }
    },
    {
      "id": "delay-1",
      "type": "action",
      "data": {
        "actionType": "delay",
        "config": {
          "duration": 300000 // 5 minutes
        }
      },
      "position": { "x": 200, "y": 0 }
    },
    {
      "id": "action-1",
      "type": "action",
      "data": {
        "actionType": "update_order_status",
        "config": {
          "orderId": "{{orderId}}",
          "status": "READY"
        }
      },
      "position": { "x": 400, "y": 0 }
    },
    {
      "id": "action-2",
      "type": "action",
      "data": {
        "actionType": "send_whatsapp_message",
        "config": {
          "to": "{{customerPhone}}",
          "message": "طلبك جاهز! رقم الطلب {{orderNumber}}"
        }
      },
      "position": { "x": 600, "y": 0 }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "trigger-1",
      "target": "delay-1"
    },
    {
      "id": "e2",
      "source": "delay-1",
      "target": "action-1"
    },
    {
      "id": "e3",
      "source": "action-1",
      "target": "action-2"
    }
  ]
}
```

---

### Template 3 : Commande Annulée avec Condition

**Use Case** : Envoyer un message différent selon le montant de la commande annulée.

**Configuration** :
```json
{
  "name": "Gestion annulation",
  "description": "Message personnalisé selon montant",
  "trigger": "order_cancelled",
  "nodes": [
    {
      "id": "trigger-1",
      "type": "trigger",
      "data": {
        "triggerType": "order_cancelled"
      },
      "position": { "x": 0, "y": 0 }
    },
    {
      "id": "condition-1",
      "type": "condition",
      "data": {
        "condition": "{{total}} > 100",
        "ifTrue": [
          {
            "actionType": "send_whatsapp_message",
            "config": {
              "to": "{{customerPhone}}",
              "message": "نأسف لإلغاء طلبك. نرجو التواصل معنا على {{restaurantPhone}} لمناقشة الأمر."
            }
          }
        ],
        "ifFalse": [
          {
            "actionType": "send_whatsapp_message",
            "config": {
              "to": "{{customerPhone}}",
              "message": "تم إلغاء طلبك رقم {{orderNumber}}."
            }
          }
        ]
      },
      "position": { "x": 200, "y": 0 }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "trigger-1",
      "target": "condition-1"
    }
  ]
}
```

---

## 🔧 Format Technique Complet

### Structure JSON

```json
{
  "id": "uuid", // Généré automatiquement
  "restaurantId": "uuid",
  "name": "Nom du workflow",
  "description": "Description",
  "isActive": true,
  "config": {
    "nodes": [
      {
        "id": "node-id",
        "type": "trigger" | "action" | "condition",
        "data": {
          // Données spécifiques au type
        },
        "position": {
          "x": 0,
          "y": 0
        }
      }
    ],
    "edges": [
      {
        "id": "edge-id",
        "source": "node-id-1",
        "target": "node-id-2"
      }
    ]
  },
  "createdAt": "2026-01-11T...",
  "updatedAt": "2026-01-11T..."
}
```

---

## 📊 Variables Disponibles

### Variables Globales
- `{{restaurantName}}` : Nom du restaurant
- `{{restaurantPhone}}` : Téléphone restaurant
- `{{restaurantAddress}}` : Adresse restaurant

### Variables Order (triggers order_*)
- `{{orderId}}` : ID commande
- `{{orderNumber}}` : Numéro commande (REST-2026-001)
- `{{total}}` : Total commande
- `{{subtotal}}` : Sous-total
- `{{deliveryFee}}` : Frais livraison
- `{{customerPhone}}` : Téléphone client
- `{{deliveryAddress}}` : Adresse livraison
- `{{items}}` : Liste items (JSON)

---

## 🚀 Exécution

### Comment ça marche

1. **Trigger déclenché** : Événement se produit (ex: nouvelle commande)
2. **Workflow activé** : Système trouve workflows actifs avec ce trigger
3. **Exécution** : Workflow exécuté séquentiellement selon les edges
4. **Logging** : Chaque exécution est loggée dans `WorkflowExecution`

### Gestion d'Erreurs

Si une action échoue :
- Workflow continue avec actions suivantes
- Erreur loggée dans `WorkflowExecution.errorMessage`
- Statut workflow : `FAILED`

---

## 💡 Best Practices

1. **Tester d'abord** : Désactiver workflow, tester manuellement
2. **Messages clairs** : Messages WhatsApp courts et clairs
3. **Délais raisonnables** : Ne pas spammer le client
4. **Conditions** : Utiliser conditions pour éviter actions inutiles
5. **Monitoring** : Vérifier logs d'exécution régulièrement

---

## 🔍 Debugging

### Voir les exécutions

```typescript
// Dans le dashboard
GET /restaurants/:id/workflows/:workflowId/executions
```

### Logs

Chaque exécution contient :
- `triggerType` : Type de trigger
- `triggerData` : Données reçues
- `status` : RUNNING, COMPLETED, FAILED
- `errorMessage` : Si échec
- `startedAt` / `completedAt` : Timestamps

---

## 📝 Notes

- Les workflows sont exécutés de manière asynchrone (queue)
- Plusieurs workflows peuvent être déclenchés par le même événement
- L'ordre d'exécution n'est pas garanti entre workflows différents
