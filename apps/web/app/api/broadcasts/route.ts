// apps/web/app/api/broadcasts/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * GET /api/broadcasts - Liste des broadcasts
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const broadcasts = await prisma.broadcast.findMany({
        where: { restaurantId: req.user!.restaurantId },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              recipients: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        broadcasts,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * POST /api/broadcasts - Créer un broadcast
 */
export async function POST(request: Request) {
  return withAuth(async (req) => {
    try {
      // Permissions : OWNER et MANAGER uniquement
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        return NextResponse.json(
          { success: false, error: 'Non autorisé' },
          { status: 403 }
        );
      }

      const { name, message, messageAr, targetAudience, scheduledAt } = await req.json();

      // Validation
      if (!name || !message || !targetAudience) {
        throw new AppError('Le nom, le message et le ciblage sont requis', 400);
      }

      // Récupérer les clients correspondant au ciblage
      const filters: any = { restaurantId: req.user!.restaurantId };
      
      // Exemples de filtres (à adapter selon targetAudience)
      if (targetAudience.minOrders) {
        // Filtrer les clients avec au moins X commandes
        filters.orders = {
          some: {},
        };
      }
      
      const customers = await prisma.customer.findMany({
        where: filters,
        select: {
          id: true,
          phone: true,
        },
      });

      // Créer le broadcast
      const broadcast = await prisma.broadcast.create({
        data: {
          restaurantId: req.user!.restaurantId,
          name,
          message,
          messageAr,
          targetAudience,
          recipientCount: customers.length,
          status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          createdById: req.user!.userId,
        },
      });

      // Créer les destinataires
      if (customers.length > 0) {
        await prisma.broadcastRecipient.createMany({
          data: customers.map(c => ({
            broadcastId: broadcast.id,
            customerId: c.id,
            customerPhone: c.phone,
          })),
        });
      }

      return NextResponse.json({
        success: true,
        broadcast: {
          ...broadcast,
          recipientCount: customers.length,
        },
      }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
