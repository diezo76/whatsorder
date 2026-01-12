// apps/web/app/api/analytics/dashboard-stats/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors-app';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

/**
 * GET /api/analytics/dashboard-stats?period=today|week|month
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get('period') || 'today';

      const now = new Date();
      let currentStart: Date;
      let currentEnd: Date;
      let previousStart: Date;
      let previousEnd: Date;

      // Définir les périodes
      switch (period) {
        case 'today':
          currentStart = startOfDay(now);
          currentEnd = endOfDay(now);
          previousStart = startOfDay(subDays(now, 1));
          previousEnd = endOfDay(subDays(now, 1));
          break;
        case 'week':
          currentStart = startOfWeek(now, { weekStartsOn: 1 });
          currentEnd = endOfWeek(now, { weekStartsOn: 1 });
          previousStart = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
          previousEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });
          break;
        case 'month':
          currentStart = startOfMonth(now);
          currentEnd = endOfMonth(now);
          previousStart = startOfMonth(subDays(now, 30));
          previousEnd = endOfMonth(subDays(now, 30));
          break;
        default:
          currentStart = startOfDay(now);
          currentEnd = endOfDay(now);
          previousStart = startOfDay(subDays(now, 1));
          previousEnd = endOfDay(subDays(now, 1));
      }

      // Requêtes parallèles
      const [currentOrders, previousOrders, newCustomers, completedOrders] = await Promise.all([
        // Commandes période actuelle
        prisma.order.findMany({
          where: {
            restaurantId: req.user!.restaurantId,
            createdAt: {
              gte: currentStart,
              lte: currentEnd,
            },
            status: { notIn: ['CANCELLED'] },
          },
          select: {
            total: true,
            status: true,
            createdAt: true,
            completedAt: true,
          },
        }),

        // Commandes période précédente
        prisma.order.findMany({
          where: {
            restaurantId: req.user!.restaurantId,
            createdAt: {
              gte: previousStart,
              lte: previousEnd,
            },
            status: { notIn: ['CANCELLED'] },
          },
          select: {
            total: true,
          },
        }),

        // Nouveaux clients période actuelle
        prisma.customer.count({
          where: {
            restaurantId: req.user!.restaurantId,
            createdAt: {
              gte: currentStart,
              lte: currentEnd,
            },
          },
        }),

        // Commandes complétées pour temps moyen
        prisma.order.findMany({
          where: {
            restaurantId: req.user!.restaurantId,
            status: 'DELIVERED',
            completedAt: {
              gte: currentStart,
              lte: currentEnd,
            },
          },
          select: {
            createdAt: true,
            completedAt: true,
          },
        }),
      ]);

      // Calcul des KPIs
      const currentRevenue = currentOrders.reduce((sum: number, o) => sum + o.total, 0);
      const previousRevenue = previousOrders.reduce((sum: number, o) => sum + o.total, 0);
      const revenueChange = previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

      const currentOrdersCount = currentOrders.length;
      const previousOrdersCount = previousOrders.length;
      const ordersChange = previousOrdersCount > 0
        ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100
        : 0;

      // Taux de conversion (commandes confirmées / total)
      const confirmedCount = currentOrders.filter((o: { status: string }) =>
        ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(o.status)
      ).length;
      const conversionRate = currentOrdersCount > 0
        ? (confirmedCount / currentOrdersCount) * 100
        : 0;

      // Panier moyen
      const averageOrderValue = currentOrdersCount > 0
        ? currentRevenue / currentOrdersCount
        : 0;

      // Temps moyen de traitement (en minutes)
      let avgProcessingTime = 0;
      if (completedOrders.length > 0) {
        const totalMinutes = completedOrders.reduce((sum: number, order) => {
          if (order.completedAt && order.createdAt) {
            const diff = order.completedAt.getTime() - order.createdAt.getTime();
            return sum + diff / (1000 * 60);
          }
          return sum;
        }, 0);
        avgProcessingTime = totalMinutes / completedOrders.length;
      }

      return NextResponse.json({
        success: true,
        period,
        stats: {
          revenue: {
            value: currentRevenue,
            change: revenueChange,
            previous: previousRevenue,
          },
          orders: {
            value: currentOrdersCount,
            change: ordersChange,
            previous: previousOrdersCount,
          },
          newCustomers: {
            value: newCustomers,
          },
          conversionRate: {
            value: conversionRate,
          },
          averageOrderValue: {
            value: averageOrderValue,
          },
          avgProcessingTime: {
            value: avgProcessingTime,
          },
        },
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
