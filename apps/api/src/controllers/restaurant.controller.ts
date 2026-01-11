import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '@/utils/prisma';
import { AuthRequest } from '@/middleware/auth.middleware';

// Schéma de validation Zod pour updateRestaurant
const updateRestaurantSchema = z.object({
  // Infos de base
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  description: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
  logo: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('URL du logo invalide').optional()
  ),
  coverImage: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('URL de l\'image de couverture invalide').optional()
  ),
  
  // Contact
  phone: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
  email: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().email('Email invalide').optional()
  ),
  address: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
  
  // Configuration
  currency: z.string().length(3, 'La devise doit contenir 3 caractères (ex: EGP, USD)').optional(),
  timezone: z.string().optional(),
  language: z.string().length(2, 'La langue doit contenir 2 caractères (ex: ar, en, fr)').optional(),
  
  // Horaires (JSON)
  openingHours: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === '') return undefined;
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return undefined;
        }
      }
      return val;
    },
    z.object({
      monday: z.object({
        open: z.string().optional(),
        close: z.string().optional(),
        closed: z.boolean().optional(),
      }).optional(),
      tuesday: z.object({
        open: z.string().optional(),
        close: z.string().optional(),
        closed: z.boolean().optional(),
      }).optional(),
      wednesday: z.object({
        open: z.string().optional(),
        close: z.string().optional(),
        closed: z.boolean().optional(),
      }).optional(),
      thursday: z.object({
        open: z.string().optional(),
        close: z.string().optional(),
        closed: z.boolean().optional(),
      }).optional(),
      friday: z.object({
        open: z.string().optional(),
        close: z.string().optional(),
        closed: z.boolean().optional(),
      }).optional(),
      saturday: z.object({
        open: z.string().optional(),
        close: z.string().optional(),
        closed: z.boolean().optional(),
      }).optional(),
      sunday: z.object({
        open: z.string().optional(),
        close: z.string().optional(),
        closed: z.boolean().optional(),
      }).optional(),
    }).optional()
  ),
  
  // Zones de livraison (JSON)
  deliveryZones: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === '') return undefined;
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return undefined;
        }
      }
      return val;
    },
    z.array(
      z.object({
        name: z.string(),
        fee: z.number().positive('Le frais de livraison doit être positif'),
        radius: z.number().positive().optional(),
      })
    ).optional()
  ),
  
  // WhatsApp
  whatsappNumber: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().regex(/^\+[1-9]\d{1,14}$/, 'Format WhatsApp invalide (ex: +201276921081)').optional()
  ),
  whatsappApiToken: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
  whatsappBusinessId: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
});

export class RestaurantController {
  /**
   * Récupère le restaurant de l'utilisateur connecté
   */
  async getRestaurant(req: AuthRequest, res: Response) {
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
        return res.status(404).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Récupérer le restaurant
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: user.restaurantId },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              categories: true,
              orders: true,
              customers: true,
            },
          },
        },
      });

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant non trouvé' });
      }

      res.json(restaurant);
    } catch (error: any) {
      console.error('Erreur lors de la récupération du restaurant:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération du restaurant' });
    }
  }

  /**
   * Met à jour les informations du restaurant
   */
  async updateRestaurant(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      // Vérifier que l'utilisateur a le droit (OWNER ou MANAGER)
      if (req.user.role !== 'OWNER' && req.user.role !== 'MANAGER') {
        return res.status(403).json({ error: 'Vous n\'avez pas les permissions nécessaires pour modifier le restaurant' });
      }

      // Validation avec Zod
      const validationResult = updateRestaurantSchema.safeParse(req.body);

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
        return res.status(404).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que le restaurant existe
      const existingRestaurant = await prisma.restaurant.findUnique({
        where: { id: user.restaurantId },
      });

      if (!existingRestaurant) {
        return res.status(404).json({ error: 'Restaurant non trouvé' });
      }

      // Préparer les données de mise à jour
      const updateData: any = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.logo !== undefined) updateData.logo = data.logo || null;
      if (data.coverImage !== undefined) updateData.coverImage = data.coverImage || null;
      if (data.phone !== undefined) updateData.phone = data.phone || null;
      if (data.email !== undefined) updateData.email = data.email || null;
      if (data.address !== undefined) updateData.address = data.address || null;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.timezone !== undefined) updateData.timezone = data.timezone;
      if (data.language !== undefined) updateData.language = data.language;
      if (data.openingHours !== undefined) updateData.openingHours = data.openingHours || null;
      if (data.deliveryZones !== undefined) updateData.deliveryZones = data.deliveryZones || null;
      if (data.whatsappNumber !== undefined) updateData.whatsappNumber = data.whatsappNumber || null;
      if (data.whatsappApiToken !== undefined) updateData.whatsappApiToken = data.whatsappApiToken || null;
      if (data.whatsappBusinessId !== undefined) updateData.whatsappBusinessId = data.whatsappBusinessId || null;

      // Mettre à jour le restaurant
      const restaurant = await prisma.restaurant.update({
        where: { id: user.restaurantId },
        data: updateData,
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              categories: true,
              orders: true,
              customers: true,
            },
          },
        },
      });

      res.json(restaurant);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du restaurant:', error);
      
      // Gestion des erreurs Prisma spécifiques
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Une contrainte unique a été violée' });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Restaurant non trouvé' });
      }

      res.status(500).json({ error: error.message || 'Erreur lors de la mise à jour du restaurant' });
    }
  }
}

export const restaurantController = new RestaurantController();
