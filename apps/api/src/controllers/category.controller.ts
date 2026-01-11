import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '@/utils/prisma';
import { AuthRequest } from '@/middleware/auth.middleware';
import { generateSlug } from '@/utils/slug';

// Schéma de validation Zod pour createCategory
const createCategorySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url('URL d\'image invalide').optional().or(z.literal('')),
});

// Schéma de validation Zod pour updateCategory (tous les champs optionnels)
const updateCategorySchema = createCategorySchema.partial();

// Schéma de validation Zod pour reorderCategories
const reorderCategoriesSchema = z.array(
  z.object({
    id: z.string().uuid('ID de catégorie invalide'),
    sortOrder: z.number().int('sortOrder doit être un entier'),
  })
);

export class CategoryController {
  /**
   * Liste toutes les catégories du restaurant
   */
  async getCategories(req: AuthRequest, res: Response) {
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
      const includeItems = req.query.includeItems === 'true';

      // Construire les options de requête
      const include: any = {
        _count: {
          select: {
            items: true,
          },
        },
      };

      if (includeItems) {
        include.items = {
          where: {
            isActive: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        };
      }

      const categories = await prisma.category.findMany({
        where: {
          restaurantId,
        },
        include,
        orderBy: {
          sortOrder: 'asc',
        },
      });

      res.json(categories);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des catégories:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération des catégories' });
    }
  }

  /**
   * Récupère une catégorie par ID
   */
  async getCategory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID de la catégorie requis' });
      }

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      const category = await prisma.category.findFirst({
        where: {
          id,
          restaurantId: user.restaurantId,
        },
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      if (!category) {
        return res.status(404).json({ error: 'Catégorie non trouvée' });
      }

      res.json(category);
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la catégorie:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération de la catégorie' });
    }
  }

  /**
   * Crée une nouvelle catégorie
   */
  async createCategory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      // Validation avec Zod
      const validationResult = createCategorySchema.safeParse(req.body);

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

      // Générer le slug depuis le name
      const slug = generateSlug(data.name);

      // Vérifier l'unicité du slug dans le restaurant
      const existingCategory = await prisma.category.findUnique({
        where: {
          restaurantId_slug: {
            restaurantId: user.restaurantId,
            slug,
          },
        },
      });

      let finalSlug = slug;
      if (existingCategory) {
        // Ajouter un suffixe numérique si le slug existe déjà
        let counter = 1;
        do {
          finalSlug = `${slug}-${counter}`;
          counter++;
        } while (
          await prisma.category.findUnique({
            where: {
              restaurantId_slug: {
                restaurantId: user.restaurantId,
                slug: finalSlug,
              },
            },
          })
        );
      }

      // Calculer le sortOrder automatiquement (max(sortOrder) + 1)
      const maxSortOrder = await prisma.category.findFirst({
        where: {
          restaurantId: user.restaurantId,
        },
        orderBy: {
          sortOrder: 'desc',
        },
        select: {
          sortOrder: true,
        },
      });

      const sortOrder = (maxSortOrder?.sortOrder ?? -1) + 1;

      // Créer la catégorie
      const category = await prisma.category.create({
        data: {
          name: data.name,
          nameAr: data.nameAr,
          slug: finalSlug,
          description: data.description,
          image: data.image || null,
          sortOrder,
          restaurantId: user.restaurantId,
        },
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      res.status(201).json(category);
    } catch (error: any) {
      console.error('Erreur lors de la création de la catégorie:', error);
      
      // Gestion des erreurs Prisma spécifiques
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Une catégorie avec ce slug existe déjà' });
      }

      res.status(500).json({ error: error.message || 'Erreur lors de la création de la catégorie' });
    }
  }

  /**
   * Met à jour une catégorie existante
   */
  async updateCategory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID de la catégorie requis' });
      }

      // Validation avec Zod (tous les champs optionnels)
      const validationResult = updateCategorySchema.safeParse(req.body);

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

      // Vérifier que la catégorie existe et appartient au restaurant
      const existingCategory = await prisma.category.findFirst({
        where: {
          id,
          restaurantId: user.restaurantId,
        },
      });

      if (!existingCategory) {
        return res.status(404).json({ error: 'Catégorie non trouvée' });
      }

      // Si le name est modifié, regénérer le slug
      let updateData: any = { ...data };
      if (data.name && data.name !== existingCategory.name) {
        const newSlug = generateSlug(data.name);
        
        // Vérifier l'unicité du nouveau slug dans le restaurant
        const existingCategoryWithSlug = await prisma.category.findUnique({
          where: {
            restaurantId_slug: {
              restaurantId: user.restaurantId,
              slug: newSlug,
            },
          },
        });

        let finalSlug = newSlug;
        if (existingCategoryWithSlug && existingCategoryWithSlug.id !== id) {
          // Ajouter un suffixe numérique si le slug existe déjà
          let counter = 1;
          do {
            finalSlug = `${newSlug}-${counter}`;
            counter++;
          } while (
            await prisma.category.findUnique({
              where: {
                restaurantId_slug: {
                  restaurantId: user.restaurantId,
                  slug: finalSlug,
                },
              },
            })
          );
        }

        updateData.slug = finalSlug;
      }

      // Mettre à jour la catégorie
      const category = await prisma.category.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      res.json(category);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      
      // Gestion des erreurs Prisma spécifiques
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Une catégorie avec ce slug existe déjà' });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Catégorie non trouvée' });
      }

      res.status(500).json({ error: error.message || 'Erreur lors de la mise à jour de la catégorie' });
    }
  }

  /**
   * Supprime une catégorie (soft delete)
   */
  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID de la catégorie requis' });
      }

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que la catégorie existe et appartient au restaurant
      const existingCategory = await prisma.category.findFirst({
        where: {
          id,
          restaurantId: user.restaurantId,
        },
        include: {
          _count: {
            select: {
              items: {
                where: {
                  isActive: true,
                },
              },
            },
          },
        },
      });

      if (!existingCategory) {
        return res.status(404).json({ error: 'Catégorie non trouvée' });
      }

      // Vérifier qu'il n'y a pas d'items actifs dans cette catégorie
      if (existingCategory._count.items > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete category with active items',
          message: 'Impossible de supprimer une catégorie contenant des items actifs',
        });
      }

      // Soft delete : mettre isActive à false
      await prisma.category.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({ message: 'Catégorie supprimée avec succès' });
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la suppression de la catégorie' });
    }
  }

  /**
   * Réordonne les catégories (met à jour le sortOrder)
   */
  async reorderCategories(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      // Validation avec Zod
      const validationResult = reorderCategoriesSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Données invalides',
          details: validationResult.error.issues,
        });
      }

      const categoriesData = validationResult.data;

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que toutes les catégories appartiennent au restaurant
      const categoryIds = categoriesData.map(c => c.id);
      const categories = await prisma.category.findMany({
        where: {
          id: { in: categoryIds },
          restaurantId: user.restaurantId,
        },
      });

      if (categories.length !== categoryIds.length) {
        return res.status(403).json({ 
          error: 'Certaines catégories n\'appartiennent pas à votre restaurant' 
        });
      }

      // Utiliser une transaction Prisma pour garantir l'atomicité
      const updatedCategories = await prisma.$transaction(
        categoriesData.map(({ id, sortOrder }) =>
          prisma.category.update({
            where: { id },
            data: { sortOrder },
            include: {
              _count: {
                select: {
                  items: true,
                },
              },
            },
          })
        )
      );

      res.json(updatedCategories);
    } catch (error: any) {
      console.error('Erreur lors du réordonnancement des catégories:', error);
      res.status(500).json({ error: error.message || 'Erreur lors du réordonnancement des catégories' });
    }
  }
}

export const categoryController = new CategoryController();
