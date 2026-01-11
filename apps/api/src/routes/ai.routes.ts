import express from 'express';
import { parseOrderFromMessage, createOrderFromParsed } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Toutes les routes sont protégées par authMiddleware
router.use(authMiddleware);

// ==========================================
// ROUTES AI PARSING
// ==========================================

/**
 * POST /api/ai/parse-order
 * Parse un message WhatsApp pour extraire les informations de commande
 * 
 * Body:
 * {
 *   "message": "Je voudrais 2 koshari large",
 *   "conversationId": "uuid-optional"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "parsed": {
 *     "items": [...],
 *     "deliveryType": "DELIVERY",
 *     "confidence": 0.95,
 *     ...
 *   }
 * }
 */
router.post('/parse-order', parseOrderFromMessage);

/**
 * POST /api/ai/create-order
 * Crée une commande depuis un résultat parsé
 * 
 * Body:
 * {
 *   "parsed": {...},
 *   "conversationId": "uuid-optional",
 *   "customerId": "uuid-optional"
 * }
 * 
 * TODO: Implémenter la création complète de commande
 */
router.post('/create-order', createOrderFromParsed);

export default router;
