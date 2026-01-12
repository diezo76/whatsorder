// apps/web/app/api/analytics/revenue-chart/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors-app';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

/**
 * GET /api/analytics/revenue-chart?period=7days|30days
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get('period') || '7days';

      const now = new Date();
      const days = period === '30days' ? 30 : 7;
      const startDate = startOfDay(subDays(now, days - 1));
      const endDate = endOfDay(now);

      // Récupérer toutes les commandes
      const orders = await prisma.order.findMany({
        where: {
          restaurantId: req.user!.restaurantId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: { notIn: ['CANCELLED'] },
        },
        select: {
          createdAt: true,
          total: true,
        },
      });

      // Grouper par jour
      const dataByDay: { [key: string]: { revenue: number; orders: number } } = {};

      for (let i = 0; i < days; i++) {
        const date = format(subDays(now, days - 1 - i), 'yyyy-MM-dd');
        dataByDay[date] = { revenue: 0, orders: 0 };
      }

      orders.forEach((order) => {
        const date = format(order.createdAt, 'yyyy-MM-dd');
        if (dataByDay[date]) {
          dataByDay[date].revenue += order.total;
          dataByDay[date].orders += 1;
        }
      });

      // Convertir en tableau
      const data = Object.entries(dataByDay).map(([date, values]) => ({
        date,
        revenue: values.revenue,
        orders: values.orders,
      }));

      return NextResponse.json({
        success: true,
        data,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
