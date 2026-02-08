// apps/web/app/api/menu/items/[id]/option-groups/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * GET /api/menu/items/[id]/option-groups
 * Liste des groupes d'options d'un item avec leurs options
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const optionGroups = await (prisma as any).optionGroup.findMany({
      where: { menuItemId: params.id },
      include: {
        options: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      optionGroups,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/menu/items/[id]/option-groups
 * Créer un groupe d'options
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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
        includedCount = 1, 
        minSelections = 1, 
        maxSelections, 
        isRequired = true,
        sortOrder = 0 
      } = body;

      // Validation
      if (!name) {
        throw new AppError('Le nom du groupe est requis', 400);
      }

      if (includedCount < 0) {
        throw new AppError('Le nombre inclus doit être >= 0', 400);
      }

      if (minSelections < 0) {
        throw new AppError('Le minimum de sélections doit être >= 0', 400);
      }

      if (maxSelections !== null && maxSelections !== undefined && maxSelections < minSelections) {
        throw new AppError('Le maximum doit être >= au minimum', 400);
      }

      // Vérifier que l'item existe et appartient au restaurant
      const menuItem = await prisma.menuItem.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!menuItem) {
        throw new AppError('Item du menu introuvable', 404);
      }

      // Créer le groupe d'options
      const optionGroup = await (prisma as any).optionGroup.create({
        data: {
          menuItemId: params.id,
          name,
          nameAr: nameAr || null,
          includedCount,
          minSelections,
          maxSelections: maxSelections || null,
          isRequired,
          sortOrder,
        },
        include: {
          options: true,
        },
      });

      return NextResponse.json({
        success: true,
        optionGroup,
      }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
