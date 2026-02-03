// apps/web/app/api/conversations/[id]/assign/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/conversations/[id]/assign - Assigner à un staff
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      const { assignedToId } = await req.json();

      // Permissions : OWNER et MANAGER peuvent assigner n'importe qui
      // STAFF peut seulement s'auto-assigner
      if (req.user!.role === 'STAFF' && assignedToId !== req.user!.userId) {
        return NextResponse.json(
          { success: false, error: 'Vous ne pouvez assigner que vos propres conversations' },
          { status: 403 }
        );
      }

      // Vérifier que la conversation existe
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!conversation) {
        throw new AppError('Conversation non trouvée', 404);
      }

      // Si assignedToId fourni, vérifier que le staff existe et appartient au restaurant
      if (assignedToId) {
        const staff = await prisma.user.findFirst({
          where: {
            id: assignedToId,
            restaurantId: req.user!.restaurantId,
          },
        });

        if (!staff) {
          throw new AppError('Membre du staff non trouvé', 404);
        }
      }

      // Mise à jour
      const updated = await prisma.conversation.update({
        where: { id: params.id },
        data: {
          assignedToId: assignedToId || null,
          assignedAt: assignedToId ? new Date() : null,
        },
        include: {
          customer: true,
          assignedTo: true,
        },
      });

      // 🔔 Notification au staff assigné (si notifyOnAssignment = true)
      if (assignedToId && assignedToId !== req.user!.userId) {
        const assignedStaff = await prisma.user.findUnique({
          where: { id: assignedToId },
          select: { notifyOnAssignment: true },
        });

        if (assignedStaff?.notifyOnAssignment) {
          // TODO: Envoyer notification (email, push, etc.)
          console.log(`📧 Notification: Conversation ${params.id} assignée à ${assignedToId}`);
        }
      }

      return NextResponse.json({
        success: true,
        conversation: updated,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
