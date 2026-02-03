# 🚀 Guide d'Amélioration WhatsApp - Basé sur Jasper's Market

**Date** : 11 janvier 2026  
**Source** : Analyse de l'application d'exemple [Jasper's Market](https://github.com/fbsamples/whatsapp-business-jaspers-market)

---

## 📊 Comparaison des Implémentations

### ✅ Ce que nous avons déjà (Whataybo)

| Fonctionnalité | Statut | Notes |
|----------------|--------|-------|
| Webhook GET (vérification) | ✅ Implémenté | `/api/webhooks/whatsapp` |
| Webhook POST (messages) | ✅ Implémenté | Traitement des messages entrants |
| Envoi de messages texte | ✅ Implémenté | `sendWhatsAppMessage()` |
| Gestion des statuts | ✅ Implémenté | `handleMessageStatuses()` |
| Base de données | ✅ Implémenté | Conversations, Messages, Customers |
| Configuration par restaurant | ✅ Implémenté | `whatsappApiToken`, `whatsappBusinessId` |

### 🆕 Ce que nous pouvons améliorer (inspiré de Jasper's Market)

| Fonctionnalité | Jasper's Market | Whataybo | Priorité |
|----------------|-----------------|----------|----------|
| Vérification signature webhook | ✅ HMAC SHA-256 | ❌ Manquant | 🔴 Haute |
| SDK Facebook Business | ✅ Utilisé | ❌ Fetch natif | 🟡 Moyenne |
| Messages interactifs (boutons) | ✅ Implémenté | ❌ Manquant | 🟡 Moyenne |
| Templates WhatsApp | ✅ Implémenté | ❌ Manquant | 🟡 Moyenne |
| Indicateur de frappe | ✅ Implémenté | ❌ Manquant | 🟢 Basse |
| Marquage comme lu | ✅ Implémenté | ❌ Manquant | 🟢 Basse |
| Redis pour suivi | ✅ Utilisé | ❌ Manquant | 🟡 Moyenne |

---

## 🔴 Amélioration Prioritaire 1 : Vérification de Signature Webhook

### Problème Actuel

Notre webhook accepte toutes les requêtes sans vérifier qu'elles viennent vraiment de Meta. C'est un **risque de sécurité**.

### Solution (Jasper's Market)

```javascript
// Jasper's Market utilise HMAC SHA-256 pour vérifier la signature
function verifyRequestSignature(req, res, buf) {
  let signature = req.headers["x-hub-signature-256"];
  
  if (!signature) {
    console.warn(`Couldn't find "x-hub-signature-256" in headers.`);
  } else {
    let elements = signature.split("=");
    let signatureHash = elements[1];
    let expectedHash = crypto
      .createHmac("sha256", config.appSecret)
      .update(buf)
      .digest("hex");
    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}
```

### Implémentation pour Whataybo

**Fichier** : `apps/api/src/middleware/whatsapp-webhook-verify.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getWhatsAppConfig } from '../config/whatsapp';

/**
 * Middleware pour vérifier la signature des webhooks WhatsApp
 * Utilise HMAC SHA-256 comme recommandé par Meta
 */
export function verifyWhatsAppWebhookSignature(
  req: Request,
  res: Response,
  buf: Buffer
) {
  const signature = req.headers['x-hub-signature-256'] as string;
  
  if (!signature) {
    console.warn('⚠️ Missing x-hub-signature-256 header');
    return;
  }

  // Extraire le hash de la signature (format: sha256=HASH)
  const elements = signature.split('=');
  if (elements.length !== 2 || elements[0] !== 'sha256') {
    console.warn('⚠️ Invalid signature format');
    return;
  }

  const signatureHash = elements[1];
  
  // Récupérer le APP_SECRET depuis la config
  // Note: Pour l'instant, on utilise une variable d'env globale
  // TODO: Ajouter APP_SECRET dans la config par restaurant
  const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.APP_SECRET;
  
  if (!appSecret) {
    console.warn('⚠️ APP_SECRET not configured, skipping signature verification');
    return;
  }

  // Calculer le hash attendu
  const expectedHash = crypto
    .createHmac('sha256', appSecret)
    .update(buf)
    .digest('hex');

  // Comparer les hashs
  if (signatureHash !== expectedHash) {
    throw new Error('Invalid webhook signature - request may not be from Meta');
  }

  console.log('✅ Webhook signature verified');
}
```

**Mise à jour de la route** : `apps/api/src/routes/whatsapp.routes.ts`

```typescript
import { verifyWhatsAppWebhookSignature } from '../middleware/whatsapp-webhook-verify';
import express from 'express';

const router = Router();

// Ajouter la vérification de signature au parsing JSON
router.post('/webhooks/whatsapp', 
  express.json({ verify: verifyWhatsAppWebhookSignature }),
  async (req, res) => {
    // ... reste du code
  }
);
```

---

## 🟡 Amélioration 2 : Utilisation du SDK Facebook Business

### Avantage du SDK

- ✅ Gestion automatique des erreurs
- ✅ Typage TypeScript
- ✅ Méthodes helper pour les appels API
- ✅ Meilleure gestion des tokens

### Installation

```bash
cd apps/api
pnpm add facebook-nodejs-business-sdk
```

### Exemple d'utilisation (Jasper's Market)

```javascript
const { FacebookAdsApi } = require('facebook-nodejs-business-sdk');

const api = new FacebookAdsApi(config.accessToken);

// Appel API avec le SDK
const response = await api.call(
  'POST',
  [`${phoneNumberId}`, 'messages'],
  requestBody
);
```

### Adaptation pour Whataybo

**Fichier** : `apps/api/src/services/whatsapp-graph-api.ts`

```typescript
import { FacebookAdsApi } from 'facebook-nodejs-business-sdk';
import { getWhatsAppConfig } from '../config/whatsapp';

export class WhatsAppGraphAPI {
  private api: FacebookAdsApi;

  constructor(restaurantConfig?: {
    whatsappApiToken?: string | null;
    whatsappBusinessId?: string | null;
  }) {
    const config = getWhatsAppConfig(restaurantConfig);
    if (!config) {
      throw new Error('WhatsApp not configured');
    }
    this.api = new FacebookAdsApi(config.accessToken);
  }

  async sendMessage(
    phoneNumberId: string,
    recipientPhone: string,
    message: string
  ) {
    const requestBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'text',
      text: {
        body: message,
      },
    };

    return this.api.call('POST', [`${phoneNumberId}`, 'messages'], requestBody);
  }

  async markAsRead(phoneNumberId: string, messageId: string) {
    const requestBody = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    };

    return this.api.call('POST', [`${phoneNumberId}`, 'messages'], requestBody);
  }

  async sendTypingIndicator(phoneNumberId: string, recipientPhone: string) {
    const requestBody = {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'text',
      text: {
        body: '', // Vide pour l'indicateur de frappe
      },
      typing_indicator: {
        type: 'text',
      },
    };

    return this.api.call('POST', [`${phoneNumberId}`, 'messages'], requestBody);
  }
}
```

---

## 🟡 Amélioration 3 : Messages Interactifs (Boutons)

### Exemple Jasper's Market

```javascript
static async messageWithInteractiveReply(
  messageId, 
  senderPhoneNumberId, 
  recipientPhoneNumber, 
  messageText, 
  replyCTAs
) {
  const requestBody = {
    messaging_product: "whatsapp",
    to: recipientPhoneNumber,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: messageText
      },
      action: {
        buttons: replyCTAs.map(cta => ({
          type: "reply",
          reply: {
            id: cta.id,
            title: cta.title
          }
        }))
      }
    }
  };
  return this.#makeApiCall(messageId, senderPhoneNumberId, requestBody);
}
```

### Implémentation pour Whataybo

**Fichier** : `apps/api/src/services/whatsapp-interactive.ts`

```typescript
export interface InteractiveButton {
  id: string;
  title: string;
}

export async function sendInteractiveMessage(
  phoneNumberId: string,
  recipientPhone: string,
  messageText: string,
  buttons: InteractiveButton[]
) {
  const requestBody = {
    messaging_product: 'whatsapp',
    to: recipientPhone,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: messageText,
      },
      action: {
        buttons: buttons.map(btn => ({
          type: 'reply',
          reply: {
            id: btn.id,
            title: btn.title,
          },
        })),
      },
    },
  };

  // Utiliser le service WhatsApp existant ou le nouveau GraphAPI
  // ...
}

// Exemple d'utilisation pour une commande
export function createOrderConfirmationButtons(orderId: string) {
  return [
    { id: `confirm_${orderId}`, title: '✅ Confirmer' },
    { id: `modify_${orderId}`, title: '✏️ Modifier' },
    { id: `cancel_${orderId}`, title: '❌ Annuler' },
  ];
}
```

---

## 🟡 Amélioration 4 : Templates WhatsApp

### Exemple Jasper's Market

```javascript
static async messageWithUtilityTemplate(
  messageId,
  senderPhoneNumberId,
  recipientPhoneNumber,
  options
) {
  const { templateName, locale, imageLink } = options;
  const requestBody = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhoneNumber,
    type: "template",
    template: {
      "name": templateName,
      "language": {
        "code": locale
      },
      "components": [
        {
          "type": "header",
          "parameters": [
            {
              "type": "image",
              "image": {
                "link": imageLink
              }
            }
          ]
        },
      ]
    }
  };
  return this.#makeApiCall(messageId, senderPhoneNumberId, requestBody);
}
```

### Cas d'usage pour Whataybo

1. **Template de confirmation de commande** avec image du restaurant
2. **Template de notification de livraison** avec code de suivi
3. **Template de promotion** avec code promo

---

## 🟢 Amélioration 5 : Indicateur de Frappe et Marquage comme Lu

### Exemple Jasper's Market

```javascript
// Dans graph-api.js, avant d'envoyer un message :
const typingBody = {
  messaging_product: "whatsapp",
  status: "read",
  message_id: messageId,
  "typing_indicator": {
    "type": "text"
  }
};

await api.call('POST', [`${senderPhoneNumberId}`, 'messages'], typingBody);
```

### Implémentation pour Whataybo

**Fichier** : `apps/api/src/services/whatsapp-ux.ts`

```typescript
/**
 * Marque un message comme lu
 */
export async function markMessageAsRead(
  phoneNumberId: string,
  messageId: string
) {
  // Implémentation avec GraphAPI
}

/**
 * Envoie un indicateur de frappe
 */
export async function sendTypingIndicator(
  phoneNumberId: string,
  recipientPhone: string
) {
  // Implémentation avec GraphAPI
}

/**
 * Marque comme lu et envoie l'indicateur de frappe avant de répondre
 */
export async function prepareResponse(
  phoneNumberId: string,
  messageId: string,
  recipientPhone: string
) {
  await markMessageAsRead(phoneNumberId, messageId);
  await sendTypingIndicator(phoneNumberId, recipientPhone);
}
```

---

## 📋 Plan d'Implémentation Recommandé

### Phase 1 : Sécurité (Priorité Haute) 🔴

1. ✅ Implémenter la vérification de signature webhook
2. ✅ Ajouter `APP_SECRET` dans la configuration
3. ✅ Tester la vérification avec des requêtes réelles

**Estimation** : 2-3 heures

### Phase 2 : SDK et Infrastructure (Priorité Moyenne) 🟡

1. ✅ Installer `facebook-nodejs-business-sdk`
2. ✅ Créer `WhatsAppGraphAPI` service
3. ✅ Migrer `sendWhatsAppMessage` vers le SDK
4. ✅ Ajouter gestion d'erreurs améliorée

**Estimation** : 4-6 heures

### Phase 3 : Fonctionnalités UX (Priorité Moyenne) 🟡

1. ✅ Implémenter messages interactifs (boutons)
2. ✅ Implémenter marquage comme lu
3. ✅ Implémenter indicateur de frappe
4. ✅ Intégrer dans le controller de conversation

**Estimation** : 6-8 heures

### Phase 4 : Templates (Priorité Moyenne) 🟡

1. ✅ Créer templates WhatsApp dans Meta Business Manager
2. ✅ Implémenter service de templates
3. ✅ Utiliser pour notifications de commande
4. ✅ Utiliser pour promotions

**Estimation** : 8-10 heures

---

## 🔧 Variables d'Environnement à Ajouter

```bash
# WhatsApp Configuration
WHATSAPP_APP_SECRET=your_app_secret_here  # Nouveau - pour vérification signature
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
```

---

## 📚 Ressources

- [Jasper's Market GitHub](https://github.com/fbsamples/whatsapp-business-jaspers-market)
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Facebook Business SDK](https://github.com/facebook/facebook-nodejs-business-sdk)
- [Webhook Security Best Practices](https://developers.facebook.com/docs/graph-api/webhooks/getting-started#security)

---

**Dernière mise à jour** : 11 janvier 2026
