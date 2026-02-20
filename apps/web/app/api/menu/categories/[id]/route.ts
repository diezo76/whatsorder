// apps/web/app/api/menu/categories/[id]/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';

/**
 * GET /api/menu/categories/:id
 * Récupérer une catégorie par ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      const category = await prisma.category.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
        include: {
          items: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: { items: true },
          },
        },
      });

      if (!category) {
        throw new AppError('Catégorie non trouvée', 404);
      }

      return NextResponse.json({
        success: true,
        category,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * PUT /api/menu/categories/:id
 * Modifier une catégorie
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      // Vérifier les permissions
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      const body = await req.json();
      const { name, nameAr, description, sortOrder } = body;

      // Vérifier que la catégorie existe
      const existing = await prisma.category.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!existing) {
        throw new AppError('Catégorie non trouvée', 404);
      }

      // Mettre à jour (+ regenerer le slug si le nom change)
      const updatedName = name ? name.trim() : undefined;
      const newSlug = updatedName
        ? updatedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : undefined;

      const category = await prisma.category.update({
        where: { id: params.id },
        data: {
          ...(updatedName && { name: updatedName }),
          ...(newSlug && { slug: newSlug }),
          ...(nameAr !== undefined && { nameAr: nameAr?.trim() || null }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
        include: {
          _count: {
            select: { items: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        category,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * DELETE /api/menu/categories/:id
 * Supprimer une catégorie (si aucun item)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      // Vérifier les permissions
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      // Vérifier que la catégorie existe
      const category = await prisma.category.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
        include: {
          _count: {
            select: { items: true },
          },
        },
      });

      if (!category) {
        throw new AppError('Catégorie non trouvée', 404);
      }

      // Vérifier qu'il n'y a pas d'items
      if (category._count.items > 0) {
        throw new AppError(
          `Impossible de supprimer cette catégorie car elle contient ${category._count.items} article(s)`,
          400
        );
      }

      // Supprimer
      await prisma.category.delete({
        where: { id: params.id },
      });

      return NextResponse.json({
        success: true,
        message: 'Catégorie supprimée',
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
