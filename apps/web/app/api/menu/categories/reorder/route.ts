import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { withAuth } from '@/lib/server/auth-app';
import { handleError, AppError } from '@/lib/server/errors-app';

// Marquer la route comme dynamique
export const dynamic = 'force-dynamic';

/**
 * PUT /api/menu/categories/reorder
 * Réorganise l'ordre des catégories
 */
export async function PUT(request: Request) {
  return withAuth(async (req) => {
    try {
      const body = await req.json();
      const { categoryIds } = body;

      if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
        throw new AppError('categoryIds requis (tableau d\'IDs)', 400);
      }

      // Vérifier que toutes les catégories appartiennent au restaurant de l'utilisateur
      const categories = await prisma.category.findMany({
        where: {
          id: { in: categoryIds },
          restaurantId: req.user!.restaurantId,
        },
        select: { id: true },
      });

      if (categories.length !== categoryIds.length) {
        throw new AppError('Certaines catégories n\'existent pas ou n\'appartiennent pas à votre restaurant', 400);
      }

      // Mettre à jour l'ordre de chaque catégorie
      const updates = categoryIds.map((categoryId: string, index: number) => 
        prisma.category.update({
          where: { id: categoryId },
          data: { sortOrder: index },
        })
      );

      await prisma.$transaction(updates);

      // Récupérer les catégories mises à jour
      const updatedCategories = await prisma.category.findMany({
        where: {
          restaurantId: req.user!.restaurantId,
        },
        include: {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      return NextResponse.json({
        success: true,
        categories: updatedCategories,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
