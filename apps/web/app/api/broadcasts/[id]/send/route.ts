// apps/web/app/api/broadcasts/[id]/send/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * POST /api/broadcasts/[id]/send - Envoyer le broadcast
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        return NextResponse.json(
          { success: false, error: 'Non autorisé' },
          { status: 403 }
        );
      }

      const broadcast = await prisma.broadcast.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
        include: {
          recipients: true,
        },
      });

      if (!broadcast) {
        throw new AppError('Broadcast non trouvé', 404);
      }

      // Mettre à jour le statut
      await prisma.broadcast.update({
        where: { id: params.id },
        data: {
          status: 'SENDING',
          sentAt: new Date(),
        },
      });

      // 🚀 TODO: Intégration WhatsApp Business API pour envoi réel
      // Pour l'instant, simulation
      let sentCount = 0;
      for (const recipient of broadcast.recipients) {
        try {
          // Simuler l'envoi WhatsApp
          console.log(`📤 Envoi à ${recipient.customerPhone}: ${broadcast.message}`);
          
          await prisma.broadcastRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
            },
          });
          
          sentCount++;
        } catch (error) {
          await prisma.broadcastRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'failed',
              errorMessage: (error as Error).message,
            },
          });
        }
      }

      // Mise à jour finale
      await prisma.broadcast.update({
        where: { id: params.id },
        data: {
          status: 'SENT',
          sentCount,
        },
      });

      return NextResponse.json({
        success: true,
        broadcast: {
          id: broadcast.id,
          sentCount,
          recipientCount: broadcast.recipients.length,
        },
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
