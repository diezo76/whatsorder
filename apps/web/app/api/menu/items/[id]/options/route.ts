// apps/web/app/api/menu/items/[id]/options/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * GET /api/menu/items/[id]/options
 * Liste des options d'un item
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const options = await prisma.menuItemOption.findMany({
      where: { menuItemId: params.id },
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
 * POST /api/menu/items/[id]/options
 * Créer une option
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
      const { name, nameAr, type, priceModifier, isRequired, isMultiple, maxSelections, sortOrder } = body;

      // Validation
      if (!name || !type) {
        throw new AppError('Le nom et le type sont requis', 400);
      }

      // Vérifier que l'item existe
      const menuItem = await prisma.menuItem.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!menuItem) {
        throw new AppError('Item du menu introuvable', 404);
      }

      // Créer l'option
      const option = await prisma.menuItemOption.create({
        data: {
          menuItemId: params.id,
          name,
          nameAr: nameAr || null,
          type,
          priceModifier: priceModifier || 0,
          isRequired: isRequired || false,
          isMultiple: isMultiple || false,
          maxSelections: isMultiple ? maxSelections : null,
          sortOrder: sortOrder || 0,
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
