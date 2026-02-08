// apps/web/app/api/menu/items/[id]/option-groups/[groupId]/options/[optionId]/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/menu/items/[id]/option-groups/[groupId]/options/[optionId]
 * Modifier une option dans un groupe
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string; groupId: string; optionId: string } }
) {
  return withAuth(async (req) => {
    try {
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      const body = await req.json();
      const { name, nameAr, priceModifier, isActive, sortOrder } = body;

      // Vérifier que l'option existe et appartient au groupe et au restaurant
      const existingOption = await prisma.menuItemOption.findFirst({
        where: {
          id: params.optionId,
          menuItemId: params.id,
          menuItem: {
            restaurantId: req.user!.restaurantId,
          },
        },
      });

      if (!existingOption) {
        throw new AppError('Option introuvable', 404);
      }

      // Mettre à jour l'option
      const option = await prisma.menuItemOption.update({
        where: { id: params.optionId },
        data: {
          ...(name !== undefined && { name }),
          ...(nameAr !== undefined && { nameAr }),
          ...(priceModifier !== undefined && { priceModifier }),
          ...(isActive !== undefined && { isActive }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
      });

      return NextResponse.json({
        success: true,
        option,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * DELETE /api/menu/items/[id]/option-groups/[groupId]/options/[optionId]
 * Supprimer une option d'un groupe
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; groupId: string; optionId: string } }
) {
  return withAuth(async (req) => {
    try {
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      // Vérifier que l'option existe et appartient au groupe et au restaurant
      const existingOption = await prisma.menuItemOption.findFirst({
        where: {
          id: params.optionId,
          menuItemId: params.id,
          menuItem: {
            restaurantId: req.user!.restaurantId,
          },
        },
      });

      if (!existingOption) {
        throw new AppError('Option introuvable', 404);
      }

      // Supprimer l'option
      await prisma.menuItemOption.delete({
        where: { id: params.optionId },
      });

      return NextResponse.json({
        success: true,
        message: 'Option supprimée',
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
