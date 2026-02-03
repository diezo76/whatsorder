// apps/web/app/api/menu/items/[id]/variants/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * GET /api/menu/items/[id]/variants
 * Liste des variants d'un item
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const variants = await prisma.menuItemVariant.findMany({
      where: { menuItemId: params.id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      variants,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/menu/items/[id]/variants
 * Créer un variant
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      // Vérifier les permissions (OWNER ou MANAGER)
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      const body = await req.json();
      const { name, nameAr, price, sku, trackInventory, stockQuantity, lowStockAlert, sortOrder } = body;

      // Validation
      if (!name || price === undefined) {
        throw new AppError('Le nom et le prix sont requis', 400);
      }

      // Vérifier que l'item existe et appartient au restaurant de l'utilisateur
      const menuItem = await prisma.menuItem.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!menuItem) {
        throw new AppError('Item du menu introuvable', 404);
      }

      // Créer le variant
      const variant = await prisma.menuItemVariant.create({
        data: {
          menuItemId: params.id,
          name,
          nameAr: nameAr || null,
          price,
          sku: sku || null,
          trackInventory: trackInventory || false,
          stockQuantity: trackInventory ? (stockQuantity || 0) : null,
          lowStockAlert: trackInventory ? (lowStockAlert || 5) : null,
          sortOrder: sortOrder || 0,
        },
      });

      // Activer hasVariants sur l'item
      await prisma.menuItem.update({
        where: { id: params.id },
        data: { hasVariants: true },
      });

      return NextResponse.json({
        success: true,
        variant,
      }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
