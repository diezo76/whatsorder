/**
 * Configuration WhatsApp Business Cloud API
 * Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

export interface WhatsAppConfig {
  apiUrl: string;
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  appSecret?: string; // Pour la vérification de signature webhook
  version: string;
}

/**
 * Récupère la configuration WhatsApp depuis les variables d'environnement
 * Supporte la configuration globale ou par restaurant
 */
export function getWhatsAppConfig(restaurantConfig?: {
  whatsappApiToken?: string | null;
  whatsappBusinessId?: string | null;
}): WhatsAppConfig | null {
  // Priorité : configuration du restaurant > variables d'environnement globales
  const phoneNumberId = restaurantConfig?.whatsappBusinessId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = restaurantConfig?.whatsappApiToken || process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    return null;
  }

  return {
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com',
    phoneNumberId,
    accessToken,
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'whataybo_webhook_token',
    appSecret: process.env.WHATSAPP_APP_SECRET || process.env.APP_SECRET,
    version: process.env.WHATSAPP_API_VERSION || 'v18.0',
  };
}

/**
 * Vérifie si WhatsApp est configuré
 */
export function isWhatsAppEnabled(restaurantConfig?: {
  whatsappApiToken?: string | null;
  whatsappBusinessId?: string | null;
}): boolean {
  return getWhatsAppConfig(restaurantConfig) !== null;
}

/**
 * Affiche un warning si WhatsApp n'est pas configuré
 */
export function checkWhatsAppConfig(): void {
  const config = getWhatsAppConfig();
  if (!config) {
    console.warn('⚠️  WhatsApp API non configurée');
    console.warn('   Pour activer WhatsApp, configurez :');
    console.warn('   - WHATSAPP_PHONE_NUMBER_ID (ou dans restaurant.whatsappBusinessId)');
    console.warn('   - WHATSAPP_ACCESS_TOKEN (ou dans restaurant.whatsappApiToken)');
    console.warn('   - Optionnel: WHATSAPP_API_URL, WHATSAPP_WEBHOOK_VERIFY_TOKEN');
    console.warn('   - Sécurité: WHATSAPP_APP_SECRET (pour vérification signature webhook)');
  } else {
    console.log('✅ WhatsApp API configurée');
    if (!config.appSecret && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  WHATSAPP_APP_SECRET non configuré - les webhooks ne seront pas vérifiés en production');
    }
  }
}

// Vérifier la configuration au démarrage
if (process.env.NODE_ENV !== 'test') {
  checkWhatsAppConfig();
}
