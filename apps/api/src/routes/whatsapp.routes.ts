import { Router, Request, Response } from 'express';
import express from 'express';
import { prisma } from '../utils/prisma';
import { getWhatsAppConfig } from '../config/whatsapp';
import { verifyWhatsAppWebhookSignature } from '../middleware/whatsapp-webhook-verify';
import { webhookLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

/**
 * GET /api/webhooks/whatsapp
 * Webhook verification pour Meta (requis lors de la configuration)
 * 
 * Meta envoie une requête GET avec :
 * - hub.mode: "subscribe"
 * - hub.verify_token: le token que vous avez configuré
 * - hub.challenge: un challenge à retourner
 */
router.get('/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const config = getWhatsAppConfig();
  const verifyToken = config?.webhookVerifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'whataybo_webhook_token';

  // Vérifier le mode et le token
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    console.error('❌ WhatsApp webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

/**
 * POST /api/webhooks/whatsapp
 * Recevoir les webhooks de Meta WhatsApp
 * 
 * Types d'événements :
 * - messages: Nouveaux messages entrants
 * - message_status: Statut des messages envoyés (sent, delivered, read, failed)
 * 
 * Sécurité : Vérifie la signature HMAC SHA-256 pour s'assurer que la requête vient de Meta
 */
router.post(
  '/webhooks/whatsapp',
  webhookLimiter, // Rate limiting pour webhooks
  // Utiliser express.json avec verify pour vérifier la signature avant le parsing
  express.json({ verify: verifyWhatsAppWebhookSignature }),
  async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Répondre immédiatement à Meta (requis)
    res.status(200).send('OK');

    // Traiter les événements de manière asynchrone
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          const value = change.value;

          // Traiter les messages entrants
          if (value.messages) {
            await handleIncomingMessages(value);
          }

          // Traiter les statuts de messages
          if (value.statuses) {
            await handleMessageStatuses(value.statuses);
          }
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Error processing WhatsApp webhook:', error);
    // Ne pas renvoyer d'erreur à Meta (déjà répondu 200)
  }
});

/**
 * Traite les messages entrants
 */
async function handleIncomingMessages(value: any) {
  const messages = value.messages || [];
  const contacts = value.contacts || [];
  // Récupérer le phone_number_id depuis les métadonnées (comme dans Jasper's Market)
  const phoneNumberId = value.metadata?.phone_number_id;

  if (!phoneNumberId) {
    console.warn('⚠️ phone_number_id manquant dans les métadonnées du webhook');
  }

  for (const message of messages) {
    try {
      const phone = message.from; // Numéro du CLIENT qui envoie le message
      const whatsappId = message.id;
      const messageType = message.type;
      const timestamp = parseInt(message.timestamp) * 1000; // Convertir en millisecondes
      const contact = contacts.find((c: any) => c.wa_id === phone);

      // Récupérer le contenu selon le type
      let content = '';
      let mediaUrl = null;

      if (messageType === 'text') {
        content = message.text?.body || '';
      } else if (messageType === 'image') {
        content = message.image?.caption || '';
        mediaUrl = message.image?.id ? `https://graph.facebook.com/v18.0/${message.image.id}` : null;
      } else if (messageType === 'document') {
        content = message.document?.caption || message.document?.filename || '';
        mediaUrl = message.document?.id ? `https://graph.facebook.com/v18.0/${message.document.id}` : null;
      } else if (messageType === 'audio') {
        content = '[Audio message]';
        mediaUrl = message.audio?.id ? `https://graph.facebook.com/v18.0/${message.audio.id}` : null;
      } else {
        content = `[${messageType} message]`;
      }

      if (!content && !mediaUrl) {
        console.warn(`⚠️ Message ${whatsappId} sans contenu, ignoré`);
        continue;
      }

      // Trouver le restaurant via le phone_number_id (whatsappBusinessId)
      // C'est le numéro WhatsApp Business qui a reçu le message
      let restaurant = null;
      
      if (phoneNumberId) {
        restaurant = await prisma.restaurant.findFirst({
          where: {
            isActive: true,
            whatsappBusinessId: phoneNumberId, // Correspondance par WhatsApp Business ID
          },
        });
      }

      // Fallback: Si pas trouvé par phone_number_id, prendre le premier restaurant actif
      // (pour compatibilité avec les anciennes configurations)
      if (!restaurant) {
        console.warn(`⚠️ Restaurant non trouvé pour phone_number_id ${phoneNumberId}, utilisation du fallback`);
        restaurant = await prisma.restaurant.findFirst({
          where: {
            isActive: true,
          },
        });
      }

      if (!restaurant) {
        console.warn(`⚠️ Aucun restaurant actif trouvé pour traiter le message de ${phone}`);
        continue;
      }

      // Trouver ou créer le client dans le contexte du restaurant trouvé
      const customer = await findOrCreateCustomer(phone, contact?.profile?.name, restaurant.id);

      // Trouver ou créer la conversation
      let conversation = await prisma.conversation.findUnique({
        where: {
          restaurantId_whatsappPhone: {
            restaurantId: restaurant.id,
            whatsappPhone: phone,
          },
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            restaurantId: restaurant.id,
            customerId: customer.id,
            whatsappPhone: phone,
            isActive: true,
            lastMessageAt: new Date(timestamp),
          },
        });
      } else {
        // Mettre à jour lastMessageAt
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date(timestamp) },
        });
      }

      // Créer le message
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: content || '[Media]',
          direction: 'inbound',
          type: messageType,
          whatsappId,
          mediaUrl,
          status: 'delivered', // Message reçu = delivered
          isProcessed: false, // Sera traité par l'IA plus tard
        },
      });

      console.log(`✅ Message reçu de ${phone} dans la conversation ${conversation.id}`);
      console.log(`   Restaurant: ${restaurant.name} (${restaurant.id})`);
      console.log(`   Customer: ${customer.name || phone} (${customer.id})`);
      console.log(`   Content: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`);
    } catch (error: any) {
      console.error(`❌ Error processing incoming message:`, error);
    }
  }
}

/**
 * Traite les statuts de messages envoyés
 */
async function handleMessageStatuses(statuses: any[]) {
  for (const status of statuses) {
    try {
      const whatsappId = status.id;
      const messageStatus = status.status; // sent, delivered, read, failed

      // Mettre à jour le statut du message dans la base de données
      await prisma.message.updateMany({
        where: { whatsappId },
        data: { status: messageStatus },
      });

      console.log(`✅ Message ${whatsappId} status updated to ${messageStatus}`);
    } catch (error: any) {
      console.error(`❌ Error processing message status:`, error);
    }
  }
}

/**
 * Trouve ou crée un client depuis un numéro de téléphone
 * @param phone - Numéro de téléphone du client
 * @param name - Nom du client (optionnel)
 * @param restaurantId - ID du restaurant (obligatoire)
 */
async function findOrCreateCustomer(phone: string, name: string | undefined, restaurantId: string) {
  // Chercher le client dans le contexte du restaurant spécifique
  let customer = await prisma.customer.findFirst({
    where: { 
      phone,
      restaurantId, // Important: chercher dans le bon restaurant
    },
  });

  if (!customer) {
    // Créer le client dans le restaurant spécifié
    customer = await prisma.customer.create({
      data: {
        phone,
        name: name || null,
        restaurantId,
      },
    });
    console.log(`✅ Nouveau client créé: ${phone} pour le restaurant ${restaurantId}`);
  } else if (name && !customer.name) {
    // Mettre à jour le nom si fourni et manquant
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { name },
    });
  }

  return customer;
}

export default router;
