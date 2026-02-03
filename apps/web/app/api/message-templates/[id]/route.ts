// apps/web/app/api/message-templates/[id]/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * GET /api/message-templates/[id] - Récupérer un template
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      const template = await prisma.messageTemplate.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!template) {
        throw new AppError('Template non trouvé', 404);
      }

      return NextResponse.json({
        success: true,
        template,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * PUT /api/message-templates/[id] - Mettre à jour un template
 */
export async function PUT(
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

      const { name, category, content, contentAr, variables, isActive } = await req.json();

      const template = await prisma.messageTemplate.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!template) {
        throw new AppError('Template non trouvé', 404);
      }

      const updated = await prisma.messageTemplate.update({
        where: { id: params.id },
        data: {
          ...(name && { name }),
          ...(category && { category }),
          ...(content && { content }),
          ...(contentAr !== undefined && { contentAr }),
          ...(variables !== undefined && { variables }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      return NextResponse.json({
        success: true,
        template: updated,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * DELETE /api/message-templates/[id] - Supprimer un template
 */
export async function DELETE(
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

      const template = await prisma.messageTemplate.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!template) {
        throw new AppError('Template non trouvé', 404);
      }

      // Soft delete : désactiver au lieu de supprimer
      await prisma.messageTemplate.update({
        where: { id: params.id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: 'Template désactivé',
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
