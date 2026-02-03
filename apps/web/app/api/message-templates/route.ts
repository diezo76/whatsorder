// apps/web/app/api/message-templates/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * GET /api/message-templates - Liste des templates
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get('category') || undefined;

      const templates = await prisma.messageTemplate.findMany({
        where: {
          restaurantId: req.user!.restaurantId,
          isActive: true,
          ...(category && { category }),
        },
        orderBy: [
          { usageCount: 'desc' },
          { name: 'asc' },
        ],
      });

      return NextResponse.json({
        success: true,
        templates,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * POST /api/message-templates - Créer un template
 */
export async function POST(request: Request) {
  return withAuth(async (req) => {
    try {
      // Permissions : OWNER et MANAGER uniquement
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        return NextResponse.json(
          { success: false, error: 'Non autorisé' },
          { status: 403 }
        );
      }

      const { name, category, content, contentAr, variables } = await req.json();

      // Validation
      if (!name || !category || !content) {
        throw new AppError('Le nom, la catégorie et le contenu sont requis', 400);
      }

      const template = await prisma.messageTemplate.create({
        data: {
          restaurantId: req.user!.restaurantId,
          name,
          category,
          content,
          contentAr,
          variables: variables || [],
        },
      });

      return NextResponse.json({
        success: true,
        template,
      }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
