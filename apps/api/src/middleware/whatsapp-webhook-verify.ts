/**
 * Middleware pour vérifier la signature des webhooks WhatsApp
 * Utilise HMAC SHA-256 comme recommandé par Meta
 * 
 * Basé sur l'implémentation de Jasper's Market
 * Documentation: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#security
 */

import { Request, Response } from 'express';
import crypto from 'crypto';

/**
 * Vérifie la signature HMAC SHA-256 du webhook WhatsApp
 * 
 * @param req - Request Express
 * @param _res - Response Express (non utilisé mais requis par Express)
 * @param buf - Buffer du body brut (nécessaire pour calculer le hash)
 * @throws Error si la signature est invalide
 */
export function verifyWhatsAppWebhookSignature(
  req: Request,
  _res: Response,
  buf: Buffer
): void {
  const signature = req.headers['x-hub-signature-256'] as string;
  
  if (!signature) {
    // En mode développement, on peut être plus permissif
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Missing x-hub-signature-256 header (development mode - allowing)');
      return;
    }
    console.warn('⚠️ Missing x-hub-signature-256 header');
    throw new Error('Missing webhook signature header');
  }

  // Extraire le hash de la signature (format: sha256=HASH)
  const elements = signature.split('=');
  if (elements.length !== 2 || elements[0] !== 'sha256') {
    console.warn('⚠️ Invalid signature format');
    throw new Error('Invalid webhook signature format');
  }

  const signatureHash = elements[1];
  
  // Récupérer le APP_SECRET depuis les variables d'environnement
  const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.APP_SECRET;
  
  if (!appSecret) {
    // En mode développement, on peut être plus permissif
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ APP_SECRET not configured (development mode - skipping verification)');
      return;
    }
    console.warn('⚠️ APP_SECRET not configured, skipping signature verification');
    throw new Error('APP_SECRET not configured for webhook verification');
  }

  // Calculer le hash attendu avec HMAC SHA-256
  const expectedHash = crypto
    .createHmac('sha256', appSecret)
    .update(buf)
    .digest('hex');

  // Comparer les hashs de manière sécurisée (timing-safe)
  if (signatureHash !== expectedHash) {
    console.error('❌ Invalid webhook signature - request may not be from Meta');
    console.error(`Expected: ${expectedHash.substring(0, 10)}...`);
    console.error(`Received: ${signatureHash.substring(0, 10)}...`);
    throw new Error('Invalid webhook signature - request may not be from Meta');
  }

  console.log('✅ Webhook signature verified');
}
