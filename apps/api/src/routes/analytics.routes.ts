import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueChart,
  getTopItems,
  getOrdersByStatus,
  getDeliveryTypes
} from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes sont protégées
router.use(authMiddleware);

// KPI Dashboard
router.get('/dashboard-stats', getDashboardStats);

// Graphes
router.get('/revenue-chart', getRevenueChart);
router.get('/top-items', getTopItems);
router.get('/orders-by-status', getOrdersByStatus);
router.get('/delivery-types', getDeliveryTypes);

export default router;
