import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors';

// Préprocesseur pour nettoyer les chaînes vides
const preprocessEmptyStrings = (schema: z.ZodTypeAny) => {
  return z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() === '') {
      return undefined;
    }
    return val;
  }, schema);
};

// Préprocesseur spécial pour les URLs (convertit les chaînes vides en undefined avant validation)
const optionalUrl = z.preprocess((val) => {
  if (typeof val === 'string' && val.trim() === '') {
    return undefined;
  }
  return val;
}, z.string().url().optional());

// Schéma de validation basé sur le modèle Prisma MenuItem
const updateItemSchema = z.object({
  name: z.string().min(2).optional(),
  nameAr: preprocessEmptyStrings(z.string().optional()),
  categoryId: z.string().uuid().optional(),
  description: preprocessEmptyStrings(z.string().optional()),
  descriptionAr: preprocessEmptyStrings(z.string().optional()),
  // Le prix peut être 0 ou null si l'item a des variants (les prix sont sur les variants)
  price: z.number().nonnegative().optional().nullable(),
  image: optionalUrl,
  isAvailable: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  hasVariants: z.boolean().optional(),
  // Champs ignorés (pour compatibilité frontend mais non stockés en DB)
  compareAtPrice: z.any().optional(),
  images: z.any().optional(),
  tags: z.any().optional(),
  allergens: z.any().optional(),
  calories: z.any().optional(),
  preparationTime: z.any().optional(),
  isFeatured: z.any().optional(),
  variants: z.any().optional(),
  modifiers: z.any().optional()
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

      // Préparer les données pour Prisma (seulement les champs qui existent dans le modèle)
      const updateData: any = {};

      if (validatedData.name !== undefined) {
        updateData.name = validatedData.name.trim();
        updateData.slug = validatedData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');
      }
      if (validatedData.categoryId !== undefined) {
        updateData.categoryId = validatedData.categoryId;
      }
      if (validatedData.price !== undefined) {
        updateData.price = validatedData.price;
      }
      if (validatedData.isAvailable !== undefined) {
        updateData.isAvailable = validatedData.isAvailable;
      }
      if (validatedData.isActive !== undefined) {
        updateData.isActive = validatedData.isActive;
      }
      if (validatedData.sortOrder !== undefined) {
        updateData.sortOrder = validatedData.sortOrder;
      }
      if (validatedData.hasVariants !== undefined) {
        updateData.hasVariants = validatedData.hasVariants;
      }

      // Gérer les champs optionnels qui peuvent être null
      if (validatedData.nameAr !== undefined) {
        updateData.nameAr = typeof validatedData.nameAr === 'string' && validatedData.nameAr.trim() ? validatedData.nameAr.trim() : null;
      }
      if (validatedData.description !== undefined) {
        updateData.description = typeof validatedData.description === 'string' && validatedData.description.trim() ? validatedData.description.trim() : null;
      }
      if (validatedData.descriptionAr !== undefined) {
        updateData.descriptionAr = typeof validatedData.descriptionAr === 'string' && validatedData.descriptionAr.trim() ? validatedData.descriptionAr.trim() : null;
      }
      if (validatedData.image !== undefined) {
        updateData.image = typeof validatedData.image === 'string' && validatedData.image.trim() ? validatedData.image.trim() : null;
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
