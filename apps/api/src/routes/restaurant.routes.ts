import { Router } from 'express';
import { restaurantController } from '../controllers/restaurant.controller';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();

// GET /api/restaurant - Récupère le restaurant de l'utilisateur connecté
router.get('/', restaurantController.getRestaurant.bind(restaurantController));

// PUT /api/restaurant - Met à jour le restaurant (OWNER ou MANAGER uniquement)
router.put(
  '/',
  requireRole('OWNER', 'MANAGER'),
  restaurantController.updateRestaurant.bind(restaurantController)
);

export default router;
