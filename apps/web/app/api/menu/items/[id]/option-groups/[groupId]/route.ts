// apps/web/app/api/menu/items/[id]/option-groups/[groupId]/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * GET /api/menu/items/[id]/option-groups/[groupId]
 * Récupérer un groupe d'options avec ses options
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  try {
    const optionGroup = await (prisma as any).optionGroup.findFirst({
      where: {
        id: params.groupId,
        menuItemId: params.id,
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!optionGroup) {
      throw new AppError('Groupe d\'options introuvable', 404);
    }

    return NextResponse.json({
      success: true,
      optionGroup,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/menu/items/[id]/option-groups/[groupId]
 * Modifier un groupe d'options
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  return withAuth(async (req) => {
    try {
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      const body = await req.json();
      const { 
        name, 
        nameAr, 
        includedCount, 
        minSelections, 
        maxSelections, 
        isRequired,
        isActive,
        sortOrder 
      } = body;

      // Vérifier que le groupe existe et appartient au restaurant
      const existingGroup = await (prisma as any).optionGroup.findFirst({
        where: {
          id: params.groupId,
          menuItemId: params.id,
          menuItem: {
            restaurantId: req.user!.restaurantId,
          },
        },
      });

      if (!existingGroup) {
        throw new AppError('Groupe d\'options introuvable', 404);
      }

      // Validation
      if (includedCount !== undefined && includedCount < 0) {
        throw new AppError('Le nombre inclus doit être >= 0', 400);
      }

      if (minSelections !== undefined && minSelections < 0) {
        throw new AppError('Le minimum de sélections doit être >= 0', 400);
      }

      const newMin = minSelections ?? existingGroup.minSelections;
      const newMax = maxSelections ?? existingGroup.maxSelections;

      if (newMax !== null && newMax < newMin) {
        throw new AppError('Le maximum doit être >= au minimum', 400);
      }

      // Mettre à jour le groupe
      const optionGroup = await (prisma as any).optionGroup.update({
        where: { id: params.groupId },
        data: {
          ...(name !== undefined && { name }),
          ...(nameAr !== undefined && { nameAr }),
          ...(includedCount !== undefined && { includedCount }),
          ...(minSelections !== undefined && { minSelections }),
          ...(maxSelections !== undefined && { maxSelections }),
          ...(isRequired !== undefined && { isRequired }),
          ...(isActive !== undefined && { isActive }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
        include: {
          options: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      return NextResponse.json({
        success: true,
        optionGroup,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * DELETE /api/menu/items/[id]/option-groups/[groupId]
 * Supprimer un groupe d'options (et ses options associées)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  return withAuth(async (req) => {
    try {
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      // Vérifier que le groupe existe et appartient au restaurant
      const existingGroup = await (prisma as any).optionGroup.findFirst({
        where: {
          id: params.groupId,
          menuItemId: params.id,
          menuItem: {
            restaurantId: req.user!.restaurantId,
          },
        },
      });

      if (!existingGroup) {
        throw new AppError('Groupe d\'options introuvable', 404);
      }

      // Supprimer le groupe (les options seront supprimées en cascade)
      await (prisma as any).optionGroup.delete({
        where: { id: params.groupId },
      });

      return NextResponse.json({
        success: true,
        message: 'Groupe d\'options supprimé',
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
