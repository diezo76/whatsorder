import { Request, Response } from 'express';
import { prisma } from '@/utils/prisma';

export class PublicController {
  /**
   * Récupère un restaurant par son slug avec ses utilisateurs (sans mot de passe)
   */
  async getRestaurantBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({ error: 'Restaurant slug is required' });
      }

      const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
              role: true,
              isActive: true,
              lastLoginAt: true,
              createdAt: true,
              updatedAt: true,
              // Exclure password et phone explicitement (phone peut ne pas exister dans certaines versions)
            },
          },
        },
      });

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      res.json(restaurant);
    } catch (error: any) {
      console.error('Error fetching restaurant:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', JSON.stringify(error, null, 2));
      res.status(500).json({ 
        error: error.message || 'Failed to fetch restaurant',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Récupère le menu public d'un restaurant (catégories actives + items actifs/disponibles)
   */
  async getRestaurantMenu(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({ error: 'Restaurant slug is required' });
      }

      // Vérifier que le restaurant existe
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        select: { id: true, isActive: true },
      });

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      if (!restaurant.isActive) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Récupérer toutes les catégories actives du restaurant
      const categories = await prisma.category.findMany({
        where: {
          restaurantId: restaurant.id,
          isActive: true,
        },
        include: {
          items: {
            where: {
              isActive: true,
              isAvailable: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });

      // Formater la réponse avec les catégories et leurs items triés
      const menu = categories.map((category) => ({
        id: category.id,
        name: category.name,
        nameAr: category.nameAr,
        slug: category.slug,
        description: category.description,
        image: category.image,
        sortOrder: category.sortOrder,
        items: category.items.map((item) => ({
          id: item.id,
          name: item.name,
          nameAr: item.nameAr,
          slug: item.slug,
          description: item.description,
          descriptionAr: item.descriptionAr,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          image: item.image,
          images: item.images,
          variants: item.variants,
          modifiers: item.modifiers,
          isAvailable: item.isAvailable,
          isFeatured: item.isFeatured,
          calories: item.calories,
          preparationTime: item.preparationTime,
          tags: item.tags,
          allergens: item.allergens,
          sortOrder: item.sortOrder,
        })),
      }));

      res.json({
        restaurantId: restaurant.id,
        categories: menu,
      });
    } catch (error: any) {
      console.error('Error fetching restaurant menu:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch restaurant menu' });
    }
  }
}

export const publicController = new PublicController();
