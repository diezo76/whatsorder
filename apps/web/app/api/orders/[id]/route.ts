// apps/web/app/api/orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';

type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * GET /api/orders/:id
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      const order = await prisma.order.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
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

      if (!order) {
        throw new AppError('Commande non trouvée', 404);
      }

      return NextResponse.json({
        success: true,
        order,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * PUT /api/orders/:id
 * Mettre à jour le statut ou d'autres champs
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      let body;
      try {
        body = await req.json();
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        throw new AppError('Corps de requête invalide', 400);
      }

      const { status, deliveryAddress, customerNotes } = body;

      // Log pour débogage
      console.log('📦 Order update request:', { orderId: params.id, status, body });

      // Vérifier que la commande existe
      const existing = await prisma.order.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!existing) {
        throw new AppError('Commande non trouvée', 404);
      }

      // Validation du statut
      const validStatuses: OrderStatus[] = [
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'READY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
      ];

      if (status && !validStatuses.includes(status)) {
        console.error('Invalid status:', status, 'Valid statuses:', validStatuses);
        throw new AppError(`Statut invalide: ${status}. Valeurs acceptées: ${validStatuses.join(', ')}`, 400);
      }

      // Mettre à jour
      const updateData: any = {};
      if (status) updateData.status = status;
      if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress;
      if (customerNotes !== undefined) updateData.customerNotes = customerNotes;

      // Si DELIVERED ou COMPLETED, enregistrer completedAt
      if (status === 'DELIVERED' || status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }

      const order = await prisma.order.update({
        where: { id: params.id },
        data: updateData,
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
        order,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
