// apps/web/app/api/restaurant/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

/**
 * GET /api/restaurant
 * Récupérer les paramètres du restaurant
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: req.user!.restaurantId },
      });

      if (!restaurant) {
        throw new AppError('Restaurant non trouvé', 404);
      }

      return NextResponse.json({
        success: true,
        restaurant,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * PUT /api/restaurant
 * Mettre à jour les paramètres
 */
export async function PUT(request: Request) {
  return withAuth(async (req) => {
    try {
      // Seuls OWNER et MANAGER peuvent modifier
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      const body = await req.json();
      const {
        name,
        description,
        phone,
        email,
        address,
        logo,
        coverImage,
        currency,
        whatsappNumber,
        whatsappApiToken,
        whatsappBusinessId,
      } = body;

      const restaurant = await prisma.restaurant.update({
        where: { id: req.user!.restaurantId },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(phone && { phone }),
          ...(email !== undefined && { email }),
          ...(address !== undefined && { address }),
          ...(logo !== undefined && { logo }),
          ...(coverImage !== undefined && { coverImage }),
          ...(currency && { currency }),
          ...(whatsappNumber !== undefined && { whatsappNumber }),
          ...(whatsappApiToken !== undefined && { whatsappApiToken }),
          ...(whatsappBusinessId !== undefined && { whatsappBusinessId }),
        },
      });

      return NextResponse.json({
        success: true,
        restaurant,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
