// apps/web/app/api/analytics/delivery-types/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors-app';
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from 'date-fns';

// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/delivery-types?period=week|month
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get('period') || 'month';

      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (period === 'week') {
        startDate = startOfDay(subDays(now, 7));
        endDate = endOfDay(now);
      } else {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }

      // Grouper par deliveryType
      const data = await prisma.order.groupBy({
        by: ['deliveryType'],
        where: {
          restaurantId: req.user!.restaurantId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: { notIn: ['CANCELLED'] },
        },
        _count: {
          id: true,
        },
        _sum: {
          total: true,
        },
      });

      const result = data.map((item: { deliveryType: string; _count: { id: number }; _sum: { total: number | null } }) => ({
        type: item.deliveryType,
        count: item._count.id,
        revenue: item._sum.total || 0,
      }));

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
