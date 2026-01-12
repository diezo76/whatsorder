// apps/web/app/api/analytics/orders-by-status/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors-app';
import { startOfDay, endOfDay, subDays } from 'date-fns';

/**
 * GET /api/analytics/orders-by-status?period=today|week
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get('period') || 'today';

      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (period === 'week') {
        startDate = startOfDay(subDays(now, 7));
        endDate = endOfDay(now);
      } else {
        startDate = startOfDay(now);
        endDate = endOfDay(now);
      }

      // Grouper par status
      const statusData = await prisma.order.groupBy({
        by: ['status'],
        where: {
          restaurantId: req.user!.restaurantId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: {
          id: true,
        },
      });

      const data = statusData.map((item) => ({
        status: item.status,
        count: item._count.id,
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
