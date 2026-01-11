import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '@/utils/prisma';
import { AuthRequest } from '@/middleware/auth.middleware';
import { getIoInstance, broadcastOrderUpdate } from '@/utils/socket';
import { Prisma } from '@prisma/client';
import { sendOrderNotification } from '@/services/whatsapp.service';

// Enum OrderStatus (identique à celui de Prisma)
enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Schémas de validation Zod
const updateStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
  ]),
});

const assignOrderSchema = z.object({
  assignedToId: z.string().uuid('ID utilisateur invalide'),
});

const cancelOrderSchema = z.object({
  cancellationReason: z.string().min(1, 'La raison d\'annulation est requise').max(500, 'La raison ne peut pas dépasser 500 caractères'),
});

export class OrderController {
  /**
   * Liste toutes les commandes du restaurant avec filtres et pagination
   */
  async getOrders(req: AuthRequest, res: Response) {
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
      const { status, assignedToId, date, search, page = '1', limit = '50' } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;
      const skip = (pageNum - 1) * limitNum;

      // Construire les filtres
      const where: any = {
        restaurantId,
      };

      // Filtre par statut
      if (status && typeof status === 'string') {
        where.status = status;
      }

      // Filtre par staff assigné
      if (assignedToId && typeof assignedToId === 'string') {
        where.assignedToId = assignedToId;
      }

      // Filtre par date
      if (date && typeof date === 'string') {
        const now = new Date();
        switch (date) {
          case 'today':
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            where.createdAt = {
              gte: todayStart,
            };
            break;
          case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStart = new Date(yesterday);
            yesterdayStart.setHours(0, 0, 0, 0);
            const yesterdayEnd = new Date(yesterday);
            yesterdayEnd.setHours(23, 59, 59, 999);
            where.createdAt = {
              gte: yesterdayStart,
              lte: yesterdayEnd,
            };
            break;
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            where.createdAt = { gte: weekAgo };
            break;
          case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            where.createdAt = { gte: monthAgo };
            break;
        }
      }

      // Recherche
      if (search && typeof search === 'string') {
        // Rechercher d'abord les customers correspondants
        const matchingCustomers = await prisma.customer.findMany({
          where: {
            restaurantId,
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          },
          select: { id: true },
        });

        const customerIds = matchingCustomers.map((c: any) => c.id);

        // Ajouter les conditions de recherche
        where.OR = [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          ...(customerIds.length > 0 ? [{ customerId: { in: customerIds } }] : []),
        ];
      }

      // Récupérer les commandes avec pagination
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            customer: true,
            items: {
              include: {
                menuItem: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.order.count({ where }),
      ]);

      return res.json({
        orders,
        total,
        page: pageNum,
        limit: limitNum,
        hasMore: skip + limitNum < total,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de la récupération des commandes' });
    }
  }

  /**
   * Récupère une commande complète par ID
   */
  async getOrder(req: AuthRequest, res: Response) {
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

      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: true,
          items: {
            include: {
              menuItem: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          internalNotes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }

      // Vérifier que la commande appartient au restaurant
      if (order.restaurantId !== user.restaurantId) {
        return res.status(403).json({ error: 'Cette commande n\'appartient pas à votre restaurant' });
      }

      return res.json({ order });
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de la récupération de la commande' });
    }
  }

  /**
   * Met à jour le statut d'une commande
   */
  async updateOrderStatus(req: AuthRequest, res: Response) {
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

      const { id: orderId } = req.params;

      // Valider le body
      const validationResult = updateStatusSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Données invalides',
          details: validationResult.error.issues,
        });
      }

      const { status } = validationResult.data;

      // Vérifier que le statut est valide
      const validStatuses = Object.values(OrderStatus);
      if (!validStatuses.includes(status as OrderStatus)) {
        return res.status(400).json({ error: 'Statut invalide' });
      }

      // Vérifier que la commande existe et appartient au restaurant
      // Stocker le statut précédent pour le broadcast
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { restaurantId: true, status: true },
      });

      if (!existingOrder) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }

      if (existingOrder.restaurantId !== user.restaurantId) {
        return res.status(403).json({ error: 'Cette commande n\'appartient pas à votre restaurant' });
      }

      const previousStatus = existingOrder.status;

      // Préparer les données de mise à jour
      const updateData: any = { status };

      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      } else if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      }

      // Mettre à jour la commande
      const order = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          customer: true,
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          items: {
            include: {
              menuItem: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Émettre les événements Socket.io
      const io = getIoInstance();
      if (io) {
        // Émet dans la room restaurant (pour le board Kanban)
        broadcastOrderUpdate(user.restaurantId, 'order_status_changed', {
          orderId: order.id,
          oldStatus: previousStatus,
          newStatus: order.status,
          order: order,
        });

        // Émet dans la room de la commande spécifique (pour le modal détails)
        io.to(`order_${order.id}`).emit('order_updated', order);

        console.log(`[Order] Status changed: ${order.orderNumber}`, {
          orderId: order.id,
          oldStatus: previousStatus,
          newStatus: order.status,
        });
      }

      // Envoyer notification WhatsApp au client
      try {
        await sendOrderNotification(order, status);
      } catch (error) {
        console.error('[Order] Error sending WhatsApp notification:', error);
        // Ne pas bloquer si la notification échoue
      }

      // TODO: Rate limiting sur les status changes (éviter spam)
      // TODO: Permissions (seuls OWNER/MANAGER peuvent changer certains statuts)
      // TODO: Historique des changements de statut

      return res.json({ order, success: true });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du statut' });
    }
  }

  /**
   * Assigne une commande à un staff
   */
  async assignOrder(req: AuthRequest, res: Response) {
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

      const { id: orderId } = req.params;

      // Valider le body
      const validationResult = assignOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Données invalides',
          details: validationResult.error.issues,
        });
      }

      const { assignedToId } = validationResult.data;

      // Vérifier que la commande existe et appartient au restaurant
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { restaurantId: true },
      });

      if (!existingOrder) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }

      if (existingOrder.restaurantId !== user.restaurantId) {
        return res.status(403).json({ error: 'Cette commande n\'appartient pas à votre restaurant' });
      }

      // Vérifier que le user existe et appartient au restaurant
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, restaurantId: true },
      });

      if (!assignedUser) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      if (assignedUser.restaurantId !== user.restaurantId) {
        return res.status(403).json({ error: 'Cet utilisateur n\'appartient pas à votre restaurant' });
      }

      // Mettre à jour la commande
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          assignedToId,
          assignedAt: new Date(),
        },
        include: {
          customer: true,
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          items: {
            include: {
              menuItem: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Émettre les événements Socket.io
      const io = getIoInstance();
      if (io) {
        // Émet dans la room restaurant (pour le board Kanban)
        broadcastOrderUpdate(user.restaurantId, 'order_assigned', {
          orderId: order.id,
          assignedTo: order.assignedTo ? {
            id: order.assignedTo.id,
            name: order.assignedTo.name,
            avatar: order.assignedTo.avatar || undefined,
          } : null,
        });

        // Émet dans la room de la commande spécifique (pour le modal détails)
        io.to(`order_${order.id}`).emit('order_updated', order);

        console.log(`[Order] Assigned: ${order.orderNumber}`, {
          orderId: order.id,
          assignedToId: assignedToId,
        });
      }

      return res.json({ order, success: true });
    } catch (error) {
      console.error('Erreur lors de l\'assignation de la commande:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de l\'assignation de la commande' });
    }
  }

  /**
   * Annule une commande
   */
  async cancelOrder(req: AuthRequest, res: Response) {
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

      const { id: orderId } = req.params;

      // Valider le body
      const validationResult = cancelOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Données invalides',
          details: validationResult.error.issues,
        });
      }

      const { cancellationReason } = validationResult.data;

      // Vérifier que la commande existe et appartient au restaurant
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { restaurantId: true, status: true },
      });

      if (!existingOrder) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }

      if (existingOrder.restaurantId !== user.restaurantId) {
        return res.status(403).json({ error: 'Cette commande n\'appartient pas à votre restaurant' });
      }

      // Vérifier que la commande n'est pas déjà annulée ou complétée
      if (existingOrder.status === 'CANCELLED') {
        return res.status(400).json({ error: 'Cette commande est déjà annulée' });
      }

      if (existingOrder.status === 'COMPLETED') {
        return res.status(400).json({ error: 'Impossible d\'annuler une commande complétée' });
      }

      // Mettre à jour la commande
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason,
        },
        include: {
          customer: true,
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          items: {
            include: {
              menuItem: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Émettre les événements Socket.io
      const io = getIoInstance();
      if (io) {
        // Émet dans la room restaurant (pour le board Kanban)
        broadcastOrderUpdate(user.restaurantId, 'order_cancelled', {
          orderId: order.id,
          reason: cancellationReason,
          order: order,
        });

        // Émet dans la room de la commande spécifique (pour le modal détails)
        io.to(`order_${order.id}`).emit('order_updated', order);

        console.log(`[Order] Cancelled: ${order.orderNumber}`, {
          orderId: order.id,
          reason: cancellationReason,
        });
      }

      // Envoyer notification WhatsApp au client
      try {
        await sendOrderNotification(order, 'CANCELLED');
      } catch (error) {
        console.error('[Order] Error sending WhatsApp notification:', error);
        // Ne pas bloquer si la notification échoue
      }

      return res.json({ order, success: true });
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la commande:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de l\'annulation de la commande' });
    }
  }
}

export const orderController = new OrderController();
