import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors';

const updateItemSchema = z.object({
  name: z.string().min(2).optional(),
  nameAr: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional(),
  image: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  calories: z.number().positive().optional(),
  preparationTime: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional()
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  const restaurantId = req.user!.restaurantId;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  // GET - Détails d'un item
  if (req.method === 'GET') {
    try {
      const item = await prisma.menuItem.findFirst({
        where: { id, restaurantId },
        include: { category: true }
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }

      return res.json({ success: true, item });
    } catch (error) {
      return handleError(res, error);
    }
  }

  // PUT - Modifier un item
  if (req.method === 'PUT') {
    try {
      const validatedData = updateItemSchema.parse(req.body);

      // Vérifier que l'item existe
      const existingItem = await prisma.menuItem.findFirst({
        where: { id, restaurantId }
      });

      if (!existingItem) {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }

      // Régénérer le slug si le nom change
      const updateData: any = { ...validatedData };
      if (validatedData.name) {
        updateData.slug = validatedData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');
      }

      const item = await prisma.menuItem.update({
        where: { id },
        data: updateData,
        include: { category: true }
      });

      return res.json({ success: true, item });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues
        });
      }
      return handleError(res, error);
    }
  }

  // DELETE - Supprimer un item (soft delete)
  if (req.method === 'DELETE') {
    try {
      const item = await prisma.menuItem.findFirst({
        where: { id, restaurantId }
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }

      await prisma.menuItem.update({
        where: { id },
        data: { isActive: false }
      });

      return res.json({
        success: true,
        message: 'Item deleted successfully'
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
