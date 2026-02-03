import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueChart,
  getTopItems,
  getOrdersByStatus,
  getDeliveryTypes
} from '../controllers/analytics.controller';
import { apiLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// Rate limiting pour analytics (calculs coûteux)
router.use(apiLimiter);

// Note: authMiddleware est appliqué dans index.ts

// KPI Dashboard
router.get('/dashboard-stats', getDashboardStats);

// Graphes
router.get('/revenue-chart', getRevenueChart);
router.get('/top-items', getTopItems);
router.get('/orders-by-status', getOrdersByStatus);
router.get('/delivery-types', getDeliveryTypes);

export default router;
