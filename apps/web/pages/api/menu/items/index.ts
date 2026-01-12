import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors';

const createItemSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  categoryId: z.string().uuid(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  image: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  calories: z.number().positive().optional(),
  preparationTime: z.number().positive().optional(),
  isAvailable: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false)
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const restaurantId = req.user!.restaurantId;

  // GET - Liste des items
  if (req.method === 'GET') {
    try {
      const { categoryId, search, isActive } = req.query;

      const where: any = { restaurantId };

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      if (search && typeof search === 'string') {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { nameAr: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const items = await prisma.menuItem.findMany({
        where,
        include: {
          category: true
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
      });

      return res.json({ success: true, items });
    } catch (error) {
      return handleError(res, error);
    }
  }

  // POST - Créer un item
  if (req.method === 'POST') {
    try {
      const validatedData = createItemSchema.parse(req.body);

      // Vérifier que la catégorie existe
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          restaurantId
        }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      // Générer le slug
      const slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');

      // Créer l'item
      const item = await prisma.menuItem.create({
        data: {
          ...validatedData,
          slug,
          restaurantId
        },
        include: {
          category: true
        }
      });

      return res.status(201).json({ success: true, item });
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

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
