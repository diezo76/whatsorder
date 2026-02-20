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
      const { optionIds, groupId } = body;

      if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
        throw new AppError('optionIds requis (tableau d\'IDs)', 400);
      }

      const menuItem = await prisma.menuItem.findFirst({
        where: { id: menuItemId, restaurantId: req.user!.restaurantId },
      });

      if (!menuItem) {
        throw new AppError('Article non trouvé', 404);
      }

      const whereClause: any = { id: { in: optionIds }, menuItemId };
      if (groupId) {
        whereClause.optionGroupId = groupId;
      } else {
        whereClause.optionGroupId = null;
      }

      const options = await prisma.menuItemOption.findMany({
        where: whereClause,
        select: { id: true },
      });

      if (options.length !== optionIds.length) {
        throw new AppError('Certaines options n\'existent pas', 400);
      }

      const updates = optionIds.map((optionId: string, index: number) =>
        prisma.menuItemOption.update({
          where: { id: optionId },
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
