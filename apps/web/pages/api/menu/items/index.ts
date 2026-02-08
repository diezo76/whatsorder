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
const createItemSchema = z.object({
  name: z.string().min(2),
  nameAr: preprocessEmptyStrings(z.string().optional()),
  categoryId: z.string().uuid(),
  description: preprocessEmptyStrings(z.string().optional()),
  descriptionAr: preprocessEmptyStrings(z.string().optional()),
  // Le prix peut être 0 ou null si l'item a des variants (les prix sont sur les variants)
  price: z.number().nonnegative().optional().nullable(),
  image: optionalUrl,
  isAvailable: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
  hasVariants: z.boolean().optional().default(false),
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
      console.log('📥 [API] Données reçues pour création d\'item:', JSON.stringify(req.body, null, 2));
      const validatedData = createItemSchema.parse(req.body);
      console.log('✅ [API] Données validées:', JSON.stringify(validatedData, null, 2));

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

      // Préparer les données pour Prisma (seulement les champs qui existent dans le modèle)
      const cleanData: any = {
        name: validatedData.name.trim(),
        slug,
        categoryId: validatedData.categoryId,
        price: validatedData.price,
        restaurantId,
        isAvailable: validatedData.isAvailable ?? true,
        isActive: validatedData.isActive ?? true,
        sortOrder: validatedData.sortOrder ?? 0,
        hasVariants: validatedData.hasVariants ?? false,
      };

      // Ajouter les champs optionnels seulement s'ils ont une valeur
      if (validatedData.nameAr !== undefined && typeof validatedData.nameAr === 'string' && validatedData.nameAr.trim()) {
        cleanData.nameAr = validatedData.nameAr.trim();
      }
      if (validatedData.description !== undefined && typeof validatedData.description === 'string' && validatedData.description.trim()) {
        cleanData.description = validatedData.description.trim();
      }
      if (validatedData.descriptionAr !== undefined && typeof validatedData.descriptionAr === 'string' && validatedData.descriptionAr.trim()) {
        cleanData.descriptionAr = validatedData.descriptionAr.trim();
      }
      if (validatedData.image !== undefined && typeof validatedData.image === 'string' && validatedData.image.trim()) {
        cleanData.image = validatedData.image.trim();
      }

      // Créer l'item
      const item = await prisma.menuItem.create({
        data: cleanData,
        include: {
          category: true
        }
      });

      console.log('✅ [API] Item créé avec succès:', item.id);
      return res.status(201).json({ success: true, item });
    } catch (error: any) {
      console.error('❌ [API] Erreur lors de la création d\'item:', error);
      console.error('❌ [API] Stack:', error.stack);
      console.error('❌ [API] Message:', error.message);
      
      if (error instanceof z.ZodError) {
        console.error('❌ [API] Erreurs de validation Zod:', error.issues);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues,
          message: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        });
      }
      
      // Gérer les erreurs Prisma spécifiques
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          error: 'Un item avec ce nom existe déjà dans cette catégorie'
        });
      }
      
      return handleError(res, error);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
