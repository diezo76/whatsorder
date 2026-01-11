import { Router } from 'express';
import { publicController } from '@/controllers/public.controller';

const router = Router();

// Routes publiques (non protégées)
router.get('/restaurants/:slug', publicController.getRestaurantBySlug.bind(publicController));
router.get('/restaurants/:slug/menu', publicController.getRestaurantMenu.bind(publicController));

export default router;
