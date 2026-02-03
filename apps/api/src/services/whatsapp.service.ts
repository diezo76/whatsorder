import { OrderStatus } from '@prisma/client';
import { getWhatsAppConfig, isWhatsAppEnabled } from '../config/whatsapp';

/**
 * Interface pour les options de notification
 */
export interface NotificationOptions {
  phone: string;
  message: string;
  orderId: string;
}

/**
 * Interface pour la réponse de l'API WhatsApp
 */
interface WhatsAppApiResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

/**
 * Interface pour les erreurs de l'API WhatsApp
 */
interface WhatsAppApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

/**
 * Génère le message WhatsApp selon le statut de la commande
 * @param order - Commande avec relations (customer, restaurant, etc.)
 * @param status - Nouveau statut de la commande
 * @returns Message formaté pour WhatsApp
 */
export function generateStatusMessage(order: any, status: OrderStatus): string {
  const orderNumber = order.orderNumber;
  // TODO: récupérer depuis order.restaurant.name
  const restaurantName = order.restaurant?.name || 'Nile Bites';

  const messages: Record<OrderStatus, string> = {
    PENDING: `
🍽️ *${restaurantName}*

Merci pour votre commande !

📝 Commande: ${orderNumber}
⏳ Statut: En attente de confirmation

Nous traiterons votre commande dans les plus brefs délais.
    `.trim(),

    CONFIRMED: `
✅ *Commande Confirmée*

📝 ${orderNumber}
🍽️ ${restaurantName}

Votre commande a été confirmée et sera bientôt préparée.

Temps estimé: 30-40 minutes
    `.trim(),

    PREPARING: `
👨‍🍳 *En Préparation*

📝 ${orderNumber}

Nos chefs préparent votre commande avec soin !
    `.trim(),

    READY: `
✅ *Commande Prête !*

📝 ${orderNumber}

${order.deliveryType === 'DELIVERY'
  ? 'Votre commande sera livrée dans quelques minutes !'
  : 'Votre commande est prête à être récupérée !'}
    `.trim(),

    OUT_FOR_DELIVERY: `
🚗 *En Route !*

📝 ${orderNumber}

Votre commande est en route vers vous !
Arrivée estimée: 15-20 minutes
    `.trim(),

    DELIVERED: `
✅ *Livré !*

📝 ${orderNumber}

Votre commande a été livrée.
Bon appétit ! 😋

Merci d'avoir choisi ${restaurantName} !
    `.trim(),

    COMPLETED: `
✅ *Commande Terminée*

📝 ${orderNumber}

Merci pour votre commande !
Nous espérons vous revoir bientôt ! 🙏
    `.trim(),

    CANCELLED: `
❌ *Commande Annulée*

📝 ${orderNumber}

${order.cancellationReason
  ? `Raison: ${order.cancellationReason}`
  : 'Votre commande a été annulée.'}

Pour toute question, contactez-nous.
    `.trim(),
  };

  return messages[status] || `Mise à jour de commande ${orderNumber}`;
}

/**
 * Formate un numéro de téléphone pour WhatsApp (format international)
 * @param phone - Numéro de téléphone (peut contenir +, espaces, tirets, etc.)
 * @returns Numéro formaté (ex: 201234567890)
 */
export function formatPhoneNumber(phone: string): string {
  // Supprime tous les caractères non numériques sauf +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Si commence par +, supprime le +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // Si commence par 00, supprime les 00
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  
  return cleaned;
}

/**
 * Envoie un message WhatsApp via l'API Business Cloud API
 * @param phone - Numéro de téléphone du destinataire (format international sans +)
 * @param message - Message texte à envoyer
 * @param restaurantConfig - Configuration WhatsApp du restaurant (optionnel)
 * @returns Promise qui se résout avec l'ID du message envoyé
 * @throws Error si l'envoi échoue ou si WhatsApp n'est pas configuré
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  restaurantConfig?: {
    whatsappApiToken?: string | null;
    whatsappBusinessId?: string | null;
  }
): Promise<string> {
  // Vérifier que WhatsApp est configuré
  const config = getWhatsAppConfig(restaurantConfig);
  if (!config) {
    throw new Error(
      'WhatsApp API non configurée. Configurez WHATSAPP_PHONE_NUMBER_ID et WHATSAPP_ACCESS_TOKEN, ' +
      'ou ajoutez whatsappApiToken et whatsappBusinessId au restaurant.'
    );
  }

  // Formater le numéro de téléphone
  const formattedPhone = formatPhoneNumber(phone);
  
  if (!formattedPhone || formattedPhone.length < 10) {
    throw new Error(`Numéro de téléphone invalide: ${phone}`);
  }

  // Construire l'URL de l'API
  const apiUrl = `${config.apiUrl}/${config.version}/${config.phoneNumberId}/messages`;

  try {
    // Envoyer la requête à l'API WhatsApp
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: {
          body: message,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as WhatsAppApiError;
      throw new Error(
        `WhatsApp API error (${error.error.code}): ${error.error.message}`
      );
    }

    const result = data as WhatsAppApiResponse;
    const messageId = result.messages?.[0]?.id;

    if (!messageId) {
      throw new Error('WhatsApp API n\'a pas retourné d\'ID de message');
    }

    console.log(`✅ WhatsApp message sent successfully to ${formattedPhone} (ID: ${messageId})`);
    return messageId;
  } catch (error: any) {
    console.error(`❌ Error sending WhatsApp message to ${formattedPhone}:`, error);
    
    // Re-throw avec un message plus clair
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(`Erreur lors de l'envoi du message WhatsApp: ${error.message || String(error)}`);
  }
}

/**
 * Envoie une notification WhatsApp au client selon le statut de la commande
 * @param order - Commande complète avec relations (customer, restaurant, etc.)
 * @param status - Nouveau statut de la commande
 * @returns Promise qui se résout une fois la notification envoyée (ou loggée)
 */
export async function sendOrderNotification(
  order: any,
  status: OrderStatus
): Promise<string | null> {
  try {
    const customerPhone = order.customer?.phone;
    const orderNumber = order.orderNumber;
    const orderId = order.id;
    const restaurant = order.restaurant;

    if (!customerPhone) {
      console.warn(`[WhatsApp] No phone number for order ${orderNumber}`);
      return null;
    }

    // Génère le message selon le statut
    const message = generateStatusMessage(order, status);

    // Format du téléphone
    const formattedPhone = formatPhoneNumber(customerPhone);

    // Logs détaillés pour debug
    const timestamp = new Date().toISOString();
    console.log('📱 [WhatsApp Notification]');
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Order ID: ${orderId}`);
    console.log(`Order Number: ${orderNumber}`);
    console.log(`To: ${formattedPhone} (original: ${customerPhone})`);
    console.log(`Status: ${status}`);
    console.log(`Message:`);
    console.log(message);
    console.log('---');

    // Vérifier si le restaurant a configuré WhatsApp API
    const restaurantConfig = restaurant ? {
      whatsappApiToken: restaurant.whatsappApiToken,
      whatsappBusinessId: restaurant.whatsappBusinessId,
    } : undefined;

    if (!isWhatsAppEnabled(restaurantConfig)) {
      console.log(`⚠️ WhatsApp API not configured for restaurant ${order.restaurantId}`);
      console.log(`   Configurez whatsappApiToken et whatsappBusinessId dans les paramètres du restaurant`);
      return null;
    }

    // Envoyer le message WhatsApp
    try {
      const messageId = await sendWhatsAppMessage(formattedPhone, message, restaurantConfig);
      console.log(`✅ WhatsApp notification sent successfully to ${formattedPhone} (Message ID: ${messageId})`);
      return messageId;
    } catch (error: any) {
      console.error(`❌ Failed to send WhatsApp notification to ${formattedPhone}:`, error.message);
      // Ne pas faire échouer la requête si la notification échoue
      // L'erreur est loggée mais n'est pas propagée
      return null;
    }
  } catch (error) {
    console.error('[WhatsApp] Error generating notification:', error);
    // Ne pas faire échouer la requête si la notification échoue
    return null;
  }
}
