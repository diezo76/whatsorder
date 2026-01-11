import { OrderStatus } from '@prisma/client';

/**
 * Interface pour les options de notification
 */
export interface NotificationOptions {
  phone: string;
  message: string;
  orderId: string;
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
 * TODO: Implémenter l'envoi via WhatsApp Business Cloud API
 * @param _phone - Numéro de téléphone du destinataire
 * @param _message - Message à envoyer
 * @throws Error si l'envoi échoue
 * 
 * Cette fonction sera utilisée dans sendOrderNotification une fois l'API configurée
 */
export async function sendWhatsAppMessage(_phone: string, _message: string): Promise<void> {
  // const whatsappUrl = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  // const token = process.env.WHATSAPP_API_TOKEN;
  //
  // if (!token || !whatsappUrl) {
  //   throw new Error('WhatsApp API credentials not configured');
  // }
  //
  // const response = await fetch(whatsappUrl, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     messaging_product: 'whatsapp',
  //     to: phone,
  //     type: 'text',
  //     text: { body: message },
  //   }),
  // });
  //
  // if (!response.ok) {
  //   const error = await response.json();
  //   throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  // }

  throw new Error('WhatsApp API not implemented yet');
}

/**
 * Envoie une notification WhatsApp au client selon le statut de la commande
 * @param order - Commande complète avec relations (customer, restaurant, etc.)
 * @param status - Nouveau statut de la commande
 * @returns Promise qui se résout une fois la notification envoyée (ou loggée)
 * 
 * TODO: Implémenter l'envoi réel via WhatsApp Business API
 */
export async function sendOrderNotification(
  order: any,
  status: OrderStatus
): Promise<void> {
  try {
    const customerPhone = order.customer?.phone;
    const orderNumber = order.orderNumber;
    const orderId = order.id;

    if (!customerPhone) {
      console.warn(`[WhatsApp] No phone number for order ${orderNumber}`);
      return;
    }

    // Génère le message selon le statut
    const message = generateStatusMessage(order, status);

    // Format du téléphone (supprime les caractères non numériques sauf +)
    const formattedPhone = customerPhone.replace(/[^\d+]/g, '');

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

    // TODO: Implémenter l'envoi réel
    // Vérifier si le restaurant a configuré WhatsApp API
    // if (order.restaurant?.whatsappApiToken) {
    //   await sendWhatsAppMessage(formattedPhone, message);
    //   console.log(`✅ WhatsApp notification sent successfully to ${formattedPhone}`);
    // } else {
    //   console.log(`⚠️ WhatsApp API not configured for restaurant ${order.restaurantId}`);
    // }

    // Pour l'instant, on retourne une promesse résolue
    return Promise.resolve();
  } catch (error) {
    console.error('[WhatsApp] Error generating notification:', error);
    // Ne pas faire échouer la requête si la notification échoue
    return Promise.resolve();
  }
}
