// apps/web/app/api/analytics/top-items/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors-app';
import { subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/top-items?period=week|month&limit=10
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get('period') || 'month';
      const limit = parseInt(searchParams.get('limit') || '10');

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

      // Récupérer les items de commandes
      const orderItems = await prisma.orderItem.findMany({
        where: {
          order: {
            restaurantId: req.user!.restaurantId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: { notIn: ['CANCELLED'] },
          },
        },
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              image: true,
              price: true,
            },
          },
        },
      });

      // Grouper par menuItemId
      const itemsMap: {
        [key: string]: {
          id: string;
          name: string;
          nameAr: string | null;
          image: string | null;
          quantity: number;
          revenue: number;
        };
      } = {};

      orderItems.forEach((item: { menuItemId: string; quantity: number; subtotal: number; menuItem: { id: string; name: string; nameAr: string | null; image: string | null } | null }) => {
        if (!item.menuItem) return;

        const id = item.menuItemId;
        if (!itemsMap[id]) {
          itemsMap[id] = {
            id: item.menuItem.id,
            name: item.menuItem.name,
            nameAr: item.menuItem.nameAr,
            image: item.menuItem.image,
            quantity: 0,
            revenue: 0,
          };
        }

        itemsMap[id].quantity += item.quantity;
        itemsMap[id].revenue += item.subtotal;
      });

      // Trier par quantité et limiter
      const items = Object.values(itemsMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, limit);

      return NextResponse.json({
        success: true,
        items,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
