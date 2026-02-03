// apps/web/app/api/conversations/[id]/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';

/**
 * GET /api/conversations/:id
 */
export async function GET(
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
        include: {
          customer: true,
        },
      });

      if (!conversation) {
        throw new AppError('Conversation non trouvée', 404);
      }

      return NextResponse.json({
        success: true,
        conversation,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * PUT /api/conversations/:id
 * Mettre à jour le statut
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      const body = await req.json();
      const { isActive, status, priority } = body;

      // Construire l'objet de mise à jour avec seulement les champs fournis
      const updateData: any = {};
      
      if (isActive !== undefined) {
        updateData.isActive = isActive;
      }
      if (status !== undefined) {
        updateData.status = status;
      }
      if (priority !== undefined) {
        updateData.priority = priority;
      }

      // Vérifier que la conversation appartient au restaurant
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!existingConversation) {
        throw new AppError('Conversation non trouvée', 404);
      }

      const conversation = await prisma.conversation.update({
        where: { id: params.id },
        data: updateData,
        include: {
          customer: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        conversation,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
