import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '@/utils/prisma';
import { AuthRequest } from '@/middleware/auth.middleware';
import { generateSlug } from '@/utils/slug';

// Schéma de validation Zod pour createMenuItem
// Utilise .nullish() pour accepter null, undefined ou la valeur
// Préprocesse les chaînes vides pour les convertir en undefined
const createMenuItemSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  nameAr: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
  categoryId: z.string().uuid('ID de catégorie invalide'),
  price: z.number().positive('Le prix doit être positif'),
  compareAtPrice: z.preprocess(
    (val) => (val === null ? undefined : val),
    z.number().positive().optional()
  ),
  description: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
  descriptionAr: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
  image: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('URL d\'image invalide').optional()
  ),
  images: z.array(z.string()).optional(),
  variants: z.any().optional().nullable(), // JSON
  modifiers: z.any().optional().nullable(), // JSON
  tags: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  calories: z.preprocess(
    (val) => (val === null ? undefined : val),
    z.number().int().positive().optional()
  ),
  preparationTime: z.preprocess(
    (val) => (val === null ? undefined : val),
    z.number().int().positive().optional()
  ),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// Schéma de validation Zod pour updateMenuItem (tous les champs optionnels sauf ceux requis)
const updateMenuItemSchema = createMenuItemSchema.partial();

export class MenuController {
  /**
   * Liste tous les items du restaurant avec filtres optionnels
   */
  async getMenuItems(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      const restaurantId = user.restaurantId;
      const { categoryId, isActive, search } = req.query;

      // Construire les filtres
      const where: any = {
        restaurantId,
      };

      if (categoryId && typeof categoryId === 'string') {
        where.categoryId = categoryId;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      // Recherche dans name, nameAr, description
      if (search && typeof search === 'string') {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { nameAr: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const items = await prisma.menuItem.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              slug: true,
            },
          },
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      res.json(items);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des items:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération des items' });
    }
  }

  /**
   * Récupère un item par ID
   */
  async getMenuItem(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID de l\'item requis' });
      }

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      const item = await prisma.menuItem.findFirst({
        where: {
          id,
          restaurantId: user.restaurantId,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              slug: true,
            },
          },
        },
      });

      if (!item) {
        return res.status(404).json({ error: 'Item non trouvé' });
      }

      res.json(item);
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'item:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération de l\'item' });
    }
  }

  /**
   * Crée un nouvel item
   */
  async createMenuItem(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      // Validation avec Zod
      const validationResult = createMenuItemSchema.safeParse(req.body);

      if (!validationResult.success) {
        console.error('Erreur de validation:', validationResult.error.issues);
        console.error('Données reçues:', JSON.stringify(req.body, null, 2));
        return res.status(400).json({
          error: 'Données invalides',
          details: validationResult.error.issues,
        });
      }

      const data = validationResult.data;

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que la catégorie existe et appartient au restaurant
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          restaurantId: user.restaurantId,
        },
      });

      if (!category) {
        return res.status(404).json({ error: 'Catégorie non trouvée' });
      }

      // Générer le slug depuis le name
      const slug = generateSlug(data.name);

      // Vérifier l'unicité du slug dans la catégorie
      const existingItem = await prisma.menuItem.findUnique({
        where: {
          categoryId_slug: {
            categoryId: data.categoryId,
            slug,
          },
        },
      });

      let finalSlug = slug;
      if (existingItem) {
        // Ajouter un suffixe numérique si le slug existe déjà
        let counter = 1;
        do {
          finalSlug = `${slug}-${counter}`;
          counter++;
        } while (
          await prisma.menuItem.findUnique({
            where: {
              categoryId_slug: {
                categoryId: data.categoryId,
                slug: finalSlug,
              },
            },
          })
        );
      }

      // Créer l'item
      const item = await prisma.menuItem.create({
        data: {
          name: data.name,
          nameAr: data.nameAr || null,
          slug: finalSlug,
          description: data.description || null,
          descriptionAr: data.descriptionAr || null,
          price: data.price,
          compareAtPrice: data.compareAtPrice || null,
          image: data.image || null,
          images: data.images || [],
          variants: data.variants || null,
          modifiers: data.modifiers || null,
          tags: data.tags || [],
          allergens: data.allergens || [],
          calories: data.calories || null,
          preparationTime: data.preparationTime || null,
          isAvailable: data.isAvailable ?? true,
          isFeatured: data.isFeatured ?? false,
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder ?? 0,
          categoryId: data.categoryId,
          restaurantId: user.restaurantId,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              slug: true,
            },
          },
        },
      });

      res.status(201).json(item);
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'item:', error);
      
      // Gestion des erreurs Prisma spécifiques
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Un item avec ce slug existe déjà dans cette catégorie' });
      }

      res.status(500).json({ error: error.message || 'Erreur lors de la création de l\'item' });
    }
  }

  /**
   * Met à jour un item existant
   */
  async updateMenuItem(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID de l\'item requis' });
      }

      // Validation avec Zod (tous les champs optionnels)
      const validationResult = updateMenuItemSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Données invalides',
          details: validationResult.error.issues,
        });
      }

      const data = validationResult.data;

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que l'item existe et appartient au restaurant
      const existingItem = await prisma.menuItem.findFirst({
        where: {
          id,
          restaurantId: user.restaurantId,
        },
      });

      if (!existingItem) {
        return res.status(404).json({ error: 'Item non trouvé' });
      }

      // Si le name est modifié, regénérer le slug
      let updateData: any = { ...data };
      if (data.name && data.name !== existingItem.name) {
        const newSlug = generateSlug(data.name);
        
        // Vérifier l'unicité du nouveau slug dans la catégorie
        const categoryId = data.categoryId || existingItem.categoryId;
        const existingItemWithSlug = await prisma.menuItem.findUnique({
          where: {
            categoryId_slug: {
              categoryId,
              slug: newSlug,
            },
          },
        });

        let finalSlug = newSlug;
        if (existingItemWithSlug && existingItemWithSlug.id !== id) {
          // Ajouter un suffixe numérique si le slug existe déjà
          let counter = 1;
          do {
            finalSlug = `${newSlug}-${counter}`;
            counter++;
          } while (
            await prisma.menuItem.findUnique({
              where: {
                categoryId_slug: {
                  categoryId,
                  slug: finalSlug,
                },
              },
            })
          );
        }

        updateData.slug = finalSlug;
      }

      // Si categoryId est modifié, vérifier que la nouvelle catégorie existe et appartient au restaurant
      if (data.categoryId && data.categoryId !== existingItem.categoryId) {
        const category = await prisma.category.findFirst({
          where: {
            id: data.categoryId,
            restaurantId: user.restaurantId,
          },
        });

        if (!category) {
          return res.status(404).json({ error: 'Catégorie non trouvée' });
        }
      }

      // Mettre à jour l'item
      const item = await prisma.menuItem.update({
        where: { id },
        data: updateData,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              slug: true,
            },
          },
        },
      });

      res.json(item);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'item:', error);
      
      // Gestion des erreurs Prisma spécifiques
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Un item avec ce slug existe déjà dans cette catégorie' });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Item non trouvé' });
      }

      res.status(500).json({ error: error.message || 'Erreur lors de la mise à jour de l\'item' });
    }
  }

  /**
   * Supprime un item (soft delete)
   */
  async deleteMenuItem(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID de l\'item requis' });
      }

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que l'item existe et appartient au restaurant
      const existingItem = await prisma.menuItem.findFirst({
        where: {
          id,
          restaurantId: user.restaurantId,
        },
      });

      if (!existingItem) {
        return res.status(404).json({ error: 'Item non trouvé' });
      }

      // Soft delete : mettre isActive à false
      await prisma.menuItem.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({ message: 'Item supprimé avec succès' });
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'item:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la suppression de l\'item' });
    }
  }

  /**
   * Toggle la disponibilité d'un item (isAvailable)
   */
  async toggleItemAvailability(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID de l\'item requis' });
      }

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que l'item existe et appartient au restaurant
      const existingItem = await prisma.menuItem.findFirst({
        where: {
          id,
          restaurantId: user.restaurantId,
        },
      });

      if (!existingItem) {
        return res.status(404).json({ error: 'Item non trouvé' });
      }

      // Toggle isAvailable
      const item = await prisma.menuItem.update({
        where: { id },
        data: {
          isAvailable: !existingItem.isAvailable,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              slug: true,
            },
          },
        },
      });

      res.json(item);
    } catch (error: any) {
      console.error('Erreur lors du toggle de disponibilité:', error);
      res.status(500).json({ error: error.message || 'Erreur lors du toggle de disponibilité' });
    }
  }
}

export const menuController = new MenuController();
