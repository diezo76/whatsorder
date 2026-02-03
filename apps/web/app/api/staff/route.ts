// apps/web/app/api/staff/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * GET /api/staff - Liste des membres du staff du restaurant
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const staff = await prisma.user.findMany({
        where: { 
          restaurantId: req.user!.restaurantId,
          isActive: true, // Seulement les membres actifs
        },
        select: { 
          id: true, 
          name: true, 
          email: true, 
          role: true,
          isActive: true,
          notifyOnNewMessage: true,
          notifyOnAssignment: true,
        },
        orderBy: [
          { role: 'asc' }, // OWNER en premier, puis MANAGER, puis STAFF
          { name: 'asc' },
        ],
      });

      return NextResponse.json({
        success: true,
        staff,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
