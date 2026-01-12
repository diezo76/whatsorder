// apps/web/app/api/onboarding/check/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onboarding/check
 * Vérifie si l'utilisateur a déjà complété l'onboarding
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: req.user!.restaurantId },
        include: {
          categories: {
            take: 1,
          },
        },
      });

      if (!restaurant) {
        return NextResponse.json({
          success: true,
          needsOnboarding: true,
          reason: 'restaurant_not_found',
        });
      }

      // Vérifier si le restaurant a les informations minimales
      const hasBasicInfo = restaurant.name && restaurant.name !== 'Restaurant' && restaurant.phone && restaurant.phone !== '0000000000';
      
      // Vérifier si le restaurant a au moins une catégorie
      const hasMenu = restaurant.categories.length > 0;

      const needsOnboarding = !hasBasicInfo || !hasMenu;

      return NextResponse.json({
        success: true,
        needsOnboarding,
        hasBasicInfo,
        hasMenu,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
        },
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
