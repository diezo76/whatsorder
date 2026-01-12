import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const restaurantId = req.user!.restaurantId;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const item = await prisma.menuItem.findFirst({
      where: { id, restaurantId }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !item.isAvailable },
      include: { category: true }
    });

    return res.json({ success: true, item: updatedItem });
  } catch (error) {
    return handleError(res, error);
  }
}

export default withAuth(handler);
