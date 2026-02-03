// apps/web/app/api/conversations/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/conversations/[id]/status - Changer le statut
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      const { status, priority, tags, internalNotes } = await req.json();

      // Vérifier que la conversation existe et appartient au restaurant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!conversation) {
        throw new AppError('Conversation non trouvée', 404);
      }

      // Mise à jour
      const updateData: any = {};
      
      if (status) {
        updateData.status = status;
        
        // Si fermé, enregistrer qui et quand
        if (status === 'CLOSED' || status === 'RESOLVED') {
          updateData.closedAt = new Date();
          updateData.closedById = req.user!.userId;
        }
        
        // Si réouvert, réinitialiser
        if (status === 'OPEN' && conversation.status !== 'OPEN') {
          updateData.closedAt = null;
          updateData.closedById = null;
        }
      }
      
      if (priority !== undefined) updateData.priority = priority;
      if (tags !== undefined) updateData.tags = tags;
      if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

      const updated = await prisma.conversation.update({
        where: { id: params.id },
        data: updateData,
        include: {
          customer: true,
          assignedTo: true,
        },
      });

      // 🔔 TODO: Notification Realtime si changement de statut

      return NextResponse.json({
        success: true,
        conversation: updated,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
