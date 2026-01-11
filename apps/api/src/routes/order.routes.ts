import { Router } from 'express';
import { orderController } from '@/controllers/order.controller';
import { authMiddleware } from '@/middleware/auth.middleware';

const router = Router();

// Toutes les routes sont protégées par authMiddleware
router.use(authMiddleware);

// ==========================================
// ROUTES COMMANDES
// ==========================================

// GET /api/orders - Liste toutes les commandes du restaurant avec filtres
router.get('/', orderController.getOrders.bind(orderController));

// GET /api/orders/:id - Récupère une commande complète par ID
router.get('/:id', orderController.getOrder.bind(orderController));

// PATCH /api/orders/:id/status - Met à jour le statut d'une commande
router.patch('/:id/status', orderController.updateOrderStatus.bind(orderController));

// PATCH /api/orders/:id/assign - Assigne une commande à un staff
router.patch('/:id/assign', orderController.assignOrder.bind(orderController));

// PATCH /api/orders/:id/cancel - Annule une commande
router.patch('/:id/cancel', orderController.cancelOrder.bind(orderController));

export default router;
