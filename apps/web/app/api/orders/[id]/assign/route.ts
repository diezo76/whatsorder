// apps/web/app/api/orders/[id]/assign/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';

/**
 * PUT /api/orders/:id/assign
 * Assigner la commande à un staff
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      const body = await req.json();
      const { userId } = body;

      if (!userId) {
        throw new AppError('userId est requis', 400);
      }

      // Vérifier que la commande existe
      const order = await prisma.order.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!order) {
        throw new AppError('Commande non trouvée', 404);
      }

      // Vérifier que l'utilisateur existe et appartient au restaurant
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!user) {
        throw new AppError('Utilisateur non trouvé', 404);
      }

      // Assigner
      const updated = await prisma.order.update({
        where: { id: params.id },
        data: { assignedToId: userId },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          customer: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        order: updated,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
