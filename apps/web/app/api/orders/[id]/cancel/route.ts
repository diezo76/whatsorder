// apps/web/app/api/orders/[id]/cancel/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

/**
 * PUT /api/orders/:id/cancel
 * Annuler une commande
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
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

      // Vérifier qu'elle n'est pas déjà livrée ou complétée
      if (['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
        throw new AppError(
          'Impossible d\'annuler une commande déjà livrée ou annulée',
          400
        );
      }

      // Annuler
      const updated = await prisma.order.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          customer: true,
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
