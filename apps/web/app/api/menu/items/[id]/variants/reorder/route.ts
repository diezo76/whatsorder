import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { withAuth } from '@/lib/server/auth-app';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      const { id: menuItemId } = params;
      const body = await req.json();
      const { variantIds } = body;

      if (!variantIds || !Array.isArray(variantIds) || variantIds.length === 0) {
        throw new AppError('variantIds requis (tableau d\'IDs)', 400);
      }

      const menuItem = await prisma.menuItem.findFirst({
        where: { id: menuItemId, restaurantId: req.user!.restaurantId },
      });

      if (!menuItem) {
        throw new AppError('Article non trouvé', 404);
      }

      const variants = await prisma.menuItemVariant.findMany({
        where: { id: { in: variantIds }, menuItemId },
        select: { id: true },
      });

      if (variants.length !== variantIds.length) {
        throw new AppError('Certains variants n\'existent pas', 400);
      }

      const updates = variantIds.map((variantId: string, index: number) =>
        prisma.menuItemVariant.update({
          where: { id: variantId },
          data: { sortOrder: index },
        })
      );

      await prisma.$transaction(updates);

      return NextResponse.json({ success: true });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
