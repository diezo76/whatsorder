// apps/web/app/api/menu/categories/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

/**
 * GET /api/menu/categories
 * Liste toutes les catégories avec leurs items
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const includeItems = searchParams.get('includeItems') === 'true';

      const categories = await prisma.category.findMany({
        where: {
          restaurantId: req.user!.restaurantId,
        },
        include: includeItems ? {
          items: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: { items: true },
          },
        } : {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      return NextResponse.json({
        success: true,
        categories,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * POST /api/menu/categories
 * Créer une nouvelle catégorie
 */
export async function POST(request: Request) {
  return withAuth(async (req) => {
    try {
      // Vérifier les permissions (OWNER ou MANAGER uniquement)
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      const body = await req.json();
      const { name, nameAr, description, sortOrder } = body;

      // Validation
      if (!name || name.trim() === '') {
        throw new AppError('Le nom est requis', 400);
      }

      // Créer la catégorie
      const category = await prisma.category.create({
        data: {
          name: name.trim(),
          nameAr: nameAr?.trim() || null,
          description: description?.trim() || null,
          sortOrder: sortOrder || 0,
          restaurantId: req.user!.restaurantId,
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
      }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
