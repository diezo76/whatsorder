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
      const { isActive } = body;

      const conversation = await prisma.conversation.update({
        where: { id: params.id },
        data: {
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          customer: true,
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
