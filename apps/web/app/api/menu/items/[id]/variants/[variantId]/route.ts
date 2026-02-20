// apps/web/app/api/menu/items/[id]/variants/[variantId]/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/menu/items/[id]/variants/[variantId]
 * Modifier un variant
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string; variantId: string } }
) {
  return withAuth(async (req) => {
    try {
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      const body = await req.json();
      const { name, nameAr, price, sku, trackInventory, stockQuantity, lowStockAlert, isActive, sortOrder } = body;

      // Vérifier que le variant existe et appartient au restaurant
      const variant = await prisma.menuItemVariant.findFirst({
        where: {
          id: params.variantId,
          menuItem: {
            restaurantId: req.user!.restaurantId,
          },
        },
      });

      if (!variant) {
        throw new AppError('Variant introuvable', 404);
      }

      // Validation des champs requis
      if (name !== undefined && (!name || typeof name !== 'string' || name.trim().length < 1)) {
        throw new AppError('Le nom du variant est requis', 400);
      }
      if (price !== undefined && (typeof price !== 'number' || price < 0)) {
        throw new AppError('Le prix doit être un nombre positif', 400);
      }

      // Mettre à jour
      const updatedVariant = await prisma.menuItemVariant.update({
        where: { id: params.variantId },
        data: {
          name,
          nameAr: nameAr || null,
          price,
          sku: sku || null,
          trackInventory,
          stockQuantity: trackInventory ? stockQuantity : null,
          lowStockAlert: trackInventory ? lowStockAlert : null,
          isActive,
          sortOrder,
        },
      });

      return NextResponse.json({
        success: true,
        variant: updatedVariant,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * DELETE /api/menu/items/[id]/variants/[variantId]
 * Supprimer un variant
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; variantId: string } }
) {
  return withAuth(async (req) => {
    try {
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      // Vérifier que le variant existe
      const variant = await prisma.menuItemVariant.findFirst({
        where: {
          id: params.variantId,
          menuItem: {
            restaurantId: req.user!.restaurantId,
          },
        },
      });

      if (!variant) {
        throw new AppError('Variant introuvable', 404);
      }

      // Supprimer
      await prisma.menuItemVariant.delete({
        where: { id: params.variantId },
      });

      // Vérifier s'il reste des variants pour cet item
      const remainingVariants = await prisma.menuItemVariant.count({
        where: { menuItemId: params.id },
      });

      // Si plus de variants, désactiver hasVariants
      if (remainingVariants === 0) {
        await prisma.menuItem.update({
          where: { id: params.id },
          data: { hasVariants: false },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Variant supprimé',
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
