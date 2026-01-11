import { Response } from 'express';
import { prisma } from '@/utils/prisma';
import { AuthRequest } from '@/middleware/auth.middleware';

/**
 * GET /api/analytics/dashboard-stats
 * Retourne les KPI principaux du dashboard
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Récupérer l'utilisateur pour obtenir son restaurantId
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { restaurantId: true },
    });

    if (!user || !user.restaurantId) {
      return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
    }

    const restaurantId = user.restaurantId;
    const { period = 'today' } = req.query; // today, week, month, custom

    // Calculer les dates
    const { startDate, endDate, previousStartDate, previousEndDate } = 
      calculateDateRanges(period as string, req.query.startDate as string, req.query.endDate as string);

    // Période actuelle
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startDate, lte: endDate },
        status: { notIn: ['CANCELLED'] }
      },
      include: {
        items: true,
        customer: true
      }
    });

    // Période précédente (pour comparaison)
    const previousOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: previousStartDate, lte: previousEndDate },
        status: { notIn: ['CANCELLED'] }
      }
    });

    // Calculer les KPIs
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    const previousRevenue = previousOrders.reduce((sum: number, order: any) => sum + order.total, 0);
    const revenueChange = calculatePercentageChange(totalRevenue, previousRevenue);

    const totalOrders = orders.length;
    const previousTotalOrders = previousOrders.length;
    const ordersChange = calculatePercentageChange(totalOrders, previousTotalOrders);

    // Nouveaux clients (first order dans la période)
    const newCustomers = await prisma.customer.count({
      where: {
        restaurantId,
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // Conversations dans la période
    const conversations = await prisma.conversation.count({
      where: {
        restaurantId,
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // Taux de conversion (commandes / conversations)
    const conversionRate = conversations > 0 
      ? ((totalOrders / conversations) * 100).toFixed(1)
      : '0';

    // Panier moyen
    const averageOrderValue = totalOrders > 0
      ? (totalRevenue / totalOrders).toFixed(2)
      : '0';

    // Temps moyen de traitement (PENDING → DELIVERED)
    const completedOrders = orders.filter((o: any) => 
      o.status === 'DELIVERED' && o.completedAt
    );
    const avgProcessingTime = completedOrders.length > 0
      ? completedOrders.reduce((sum: number, order: any) => {
          const duration = order.completedAt!.getTime() - order.createdAt.getTime();
          return sum + duration;
        }, 0) / completedOrders.length
      : 0;
    const avgProcessingMinutes = Math.round(avgProcessingTime / 1000 / 60);

    res.json({
      success: true,
      period,
      stats: {
        revenue: {
          value: totalRevenue,
          change: revenueChange,
          previous: previousRevenue
        },
        orders: {
          value: totalOrders,
          change: ordersChange,
          previous: previousTotalOrders
        },
        newCustomers: {
          value: newCustomers
        },
        conversionRate: {
          value: parseFloat(conversionRate)
        },
        averageOrderValue: {
          value: parseFloat(averageOrderValue)
        },
        avgProcessingTime: {
          value: avgProcessingMinutes // en minutes
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    });
  }
};

/**
 * GET /api/analytics/revenue-chart
 * Retourne les données pour le graphe de revenus
 */
export const getRevenueChart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Récupérer l'utilisateur pour obtenir son restaurantId
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { restaurantId: true },
    });

    if (!user || !user.restaurantId) {
      return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
    }

    const restaurantId = user.restaurantId;
    const { period = '7days' } = req.query; // 7days, 30days, custom

    const days = period === '30days' ? 30 : 7;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const orders = await prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: { gte: date, lt: nextDate },
          status: { notIn: ['CANCELLED'] }
        }
      });

      const revenue = orders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = orders.length;

      data.push({
        date: date.toISOString().split('T')[0],
        revenue,
        orders: orderCount
      });
    }

    res.json({ success: true, data });

  } catch (error) {
    console.error('Error fetching revenue chart:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue data' });
  }
};

/**
 * GET /api/analytics/top-items
 * Retourne les items les plus vendus
 */
export const getTopItems = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Récupérer l'utilisateur pour obtenir son restaurantId
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { restaurantId: true },
    });

    if (!user || !user.restaurantId) {
      return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
    }

    const restaurantId = user.restaurantId;
    const { period = 'month', limit = '10' } = req.query;

    const { startDate, endDate } = calculateDateRanges(period as string);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          restaurantId,
          createdAt: { gte: startDate, lte: endDate },
          status: { notIn: ['CANCELLED'] }
        }
      },
      include: {
        menuItem: true
      }
    });

    // Grouper par item
    const itemStats = new Map<string, any>();

    orderItems.forEach((item: any) => {
      const key = item.menuItemId;
      if (!itemStats.has(key)) {
        itemStats.set(key, {
          id: item.menuItemId,
          name: item.name,
          image: item.menuItem?.image,
          quantity: 0,
          revenue: 0
        });
      }
      const stats = itemStats.get(key)!;
      stats.quantity += item.quantity;
      stats.revenue += item.subtotal;
    });

    // Trier par quantité
    const topItems = Array.from(itemStats.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, parseInt(limit as string));

    res.json({ success: true, items: topItems });

  } catch (error) {
    console.error('Error fetching top items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top items' });
  }
};

/**
 * GET /api/analytics/orders-by-status
 * Retourne la répartition des commandes par statut
 */
export const getOrdersByStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Récupérer l'utilisateur pour obtenir son restaurantId
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { restaurantId: true },
    });

    if (!user || !user.restaurantId) {
      return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
    }

    const restaurantId = user.restaurantId;
    const { period = 'today' } = req.query;

    const { startDate, endDate } = calculateDateRanges(period as string);

    const orders = await prisma.order.groupBy({
      by: ['status'],
      where: {
        restaurantId,
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: true
    });

    const statusData = orders.map((item: any) => ({
      status: item.status,
      count: item._count
    }));

    res.json({ success: true, data: statusData });

  } catch (error) {
    console.error('Error fetching orders by status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch status data' });
  }
};

/**
 * GET /api/analytics/delivery-types
 * Répartition par type de livraison
 */
export const getDeliveryTypes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Récupérer l'utilisateur pour obtenir son restaurantId
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { restaurantId: true },
    });

    if (!user || !user.restaurantId) {
      return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
    }

    const restaurantId = user.restaurantId;
    const { period = 'month' } = req.query;

    const { startDate, endDate } = calculateDateRanges(period as string);

    const orders = await prisma.order.groupBy({
      by: ['deliveryType'],
      where: {
        restaurantId,
        createdAt: { gte: startDate, lte: endDate },
        status: { notIn: ['CANCELLED'] }
      },
      _count: true,
      _sum: {
        total: true
      }
    });

    const data = orders.map((item: any) => ({
      type: item.deliveryType,
      count: item._count,
      revenue: item._sum.total || 0
    }));

    res.json({ success: true, data });

  } catch (error) {
    console.error('Error fetching delivery types:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch delivery data' });
  }
};

// Helper functions
function calculateDateRanges(period: string, customStart?: string, customEnd?: string) {
  const now = new Date();
  let startDate: Date, endDate: Date, previousStartDate: Date, previousEndDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      previousEndDate = new Date(previousStartDate);
      previousEndDate.setHours(23, 59, 59, 999);
      break;

    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 7);
      previousEndDate = new Date(startDate);
      break;

    case 'month':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 30);
      previousEndDate = new Date(startDate);
      break;

    case 'custom':
      startDate = customStart ? new Date(customStart) : new Date();
      endDate = customEnd ? new Date(customEnd) : new Date();
      const duration = endDate.getTime() - startDate.getTime();
      previousEndDate = new Date(startDate);
      previousStartDate = new Date(previousEndDate.getTime() - duration);
      break;

    default:
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      previousEndDate = new Date(previousStartDate);
      previousEndDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate, previousStartDate, previousEndDate };
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
}
