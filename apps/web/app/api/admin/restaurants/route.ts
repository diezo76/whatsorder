import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { withSuperAdmin } from '@/lib/server/auth-app';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return withSuperAdmin(async () => {
    try {
      const restaurants = await prisma.restaurant.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          phone: true,
          isApproved: true,
          isBusy: true,
          createdAt: true,
          users: {
            where: { role: 'OWNER' },
            select: {
              id: true,
              name: true,
              email: true,
            },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const pendingCount = restaurants.filter(r => !r.isApproved).length;

      return NextResponse.json({
        success: true,
        restaurants,
        stats: {
          total: restaurants.length,
          pending: pendingCount,
          approved: restaurants.length - pendingCount,
        },
      });
    } catch (error: any) {
      console.error('Admin list restaurants error:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur serveur' },
        { status: 500 }
      );
    }
  })(request);
}
