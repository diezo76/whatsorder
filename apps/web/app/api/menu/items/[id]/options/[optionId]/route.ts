// apps/web/app/api/menu/items/[id]/options/[optionId]/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/menu/items/[id]/options/[optionId]
 * Modifier une option
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string; optionId: string } }
) {
  return withAuth(async (req) => {
    try {
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      const body = await req.json();
      const { name, nameAr, type, priceModifier, isRequired, isMultiple, maxSelections, isActive, sortOrder } = body;

      // Vérifier que l'option existe et appartient au restaurant
      const option = await prisma.menuItemOption.findFirst({
        where: {
          id: params.optionId,
          menuItem: {
            restaurantId: req.user!.restaurantId,
          },
        },
      });

      if (!option) {
        throw new AppError('Option introuvable', 404);
      }

      // Validation des champs
      if (name !== undefined && (!name || typeof name !== 'string' || name.trim().length < 1)) {
        throw new AppError('Le nom de l\'option est requis', 400);
      }
      if (type !== undefined && !['ADDON', 'MODIFICATION', 'INSTRUCTION'].includes(type)) {
        throw new AppError('Type d\'option invalide (ADDON, MODIFICATION ou INSTRUCTION)', 400);
      }
      if (priceModifier !== undefined && (typeof priceModifier !== 'number' || priceModifier < 0)) {
        throw new AppError('Le prix doit être un nombre positif ou zéro', 400);
      }

      // Mettre à jour
      const updatedOption = await prisma.menuItemOption.update({
        where: { id: params.optionId },
        data: {
          name,
          nameAr: nameAr || null,
          type,
          priceModifier,
          isRequired,
          isMultiple,
          maxSelections: isMultiple ? maxSelections : null,
          isActive,
          sortOrder,
        },
      });

      return NextResponse.json({
        success: true,
        option: updatedOption,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * DELETE /api/menu/items/[id]/options/[optionId]
 * Supprimer une option
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; optionId: string } }
) {
  return withAuth(async (req) => {
    try {
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      // Vérifier que l'option existe
      const option = await prisma.menuItemOption.findFirst({
        where: {
          id: params.optionId,
          menuItem: {
            restaurantId: req.user!.restaurantId,
          },
        },
      });

      if (!option) {
        throw new AppError('Option introuvable', 404);
      }

      // Supprimer
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
