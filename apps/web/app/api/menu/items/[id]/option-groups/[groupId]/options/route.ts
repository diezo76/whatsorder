// apps/web/app/api/menu/items/[id]/option-groups/[groupId]/options/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * GET /api/menu/items/[id]/option-groups/[groupId]/options
 * Liste des options dans un groupe
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  try {
    const options = await (prisma.menuItemOption.findMany as any)({
      where: {
        menuItemId: params.id,
        optionGroupId: params.groupId,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      options,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/menu/items/[id]/option-groups/[groupId]/options
 * Ajouter une option dans un groupe
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  return withAuth(async (req) => {
    try {
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      const body = await req.json();
      const { name, nameAr, priceModifier = 0, sortOrder = 0 } = body;

      // Validation
      if (!name) {
        throw new AppError('Le nom de l\'option est requis', 400);
      }

      // Vérifier que le groupe existe et appartient au restaurant
      const optionGroup = await (prisma as any).optionGroup.findFirst({
        where: {
          id: params.groupId,
          menuItemId: params.id,
          menuItem: {
            restaurantId: req.user!.restaurantId,
          },
        },
      });

      if (!optionGroup) {
        throw new AppError('Groupe d\'options introuvable', 404);
      }

      // Créer l'option dans le groupe
      const option = await (prisma.menuItemOption.create as any)({
        data: {
          menuItemId: params.id,
          optionGroupId: params.groupId,
          name,
          nameAr: nameAr || null,
          type: 'ADDON',
          priceModifier,
          isRequired: false,
          isMultiple: true,
          sortOrder,
        },
      });

      return NextResponse.json({
        success: true,
        option,
      }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
