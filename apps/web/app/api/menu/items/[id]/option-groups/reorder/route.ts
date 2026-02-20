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
      const { groupIds } = body;

      if (!groupIds || !Array.isArray(groupIds) || groupIds.length === 0) {
        throw new AppError('groupIds requis (tableau d\'IDs)', 400);
      }

      const menuItem = await prisma.menuItem.findFirst({
        where: { id: menuItemId, restaurantId: req.user!.restaurantId },
      });

      if (!menuItem) {
        throw new AppError('Article non trouvé', 404);
      }

      const groups = await prisma.optionGroup.findMany({
        where: { id: { in: groupIds }, menuItemId },
        select: { id: true },
      });

      if (groups.length !== groupIds.length) {
        throw new AppError('Certains groupes n\'existent pas', 400);
      }

      const updates = groupIds.map((groupId: string, index: number) =>
        prisma.optionGroup.update({
          where: { id: groupId },
          data: { sortOrder: index },
        })
      );

      await prisma.$transaction(updates);

      const updatedGroups = await prisma.optionGroup.findMany({
        where: { menuItemId },
        include: { options: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { sortOrder: 'asc' },
      });

      return NextResponse.json({ success: true, optionGroups: updatedGroups });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
