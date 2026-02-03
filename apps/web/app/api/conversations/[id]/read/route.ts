// apps/web/app/api/conversations/[id]/read/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/conversations/[id]/read - Marquer comme lu
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!conversation) {
        throw new AppError('Conversation non trouvée', 404);
      }

      // Marquer la conversation et tous les messages comme lus
      await prisma.$transaction([
        prisma.conversation.update({
          where: { id: params.id },
          data: { isUnread: false },
        }),
        prisma.message.updateMany({
          where: {
            conversationId: params.id,
            isRead: false,
            sender: 'CUSTOMER', // Seulement les messages clients
          },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: 'Marqué comme lu',
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
