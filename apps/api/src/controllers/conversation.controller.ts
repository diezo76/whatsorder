import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '@/utils/prisma';
import { AuthRequest } from '@/middleware/auth.middleware';
import { getIoInstance } from '@/utils/socket';
import { handleMessageSent } from '@/socket/handlers/message.handler';

// Schéma de validation Zod pour sendMessage
const sendMessageSchema = z.object({
  content: z.string().min(1, 'Le contenu du message est requis').max(4096, 'Le message ne peut pas dépasser 4096 caractères'),
  type: z.enum(['text', 'image', 'document']).default('text'),
  mediaUrl: z.string().url('URL média invalide').optional(),
});

export class ConversationController {
  /**
   * Liste toutes les conversations du restaurant avec filtres et pagination
   */
  async getConversations(req: AuthRequest, res: Response) {
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
      const { search, unreadOnly, page = '1', limit = '20' } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 20;
      const skip = (pageNum - 1) * limitNum;

      // Construire les filtres
      const where: any = {
        restaurantId,
      };

      // Filtre unreadOnly : conversations avec messages non lus
      if (unreadOnly === 'true') {
        where.messages = {
          some: {
            direction: 'inbound',
            status: { not: 'read' },
          },
        };
      }

      // Recherche dans customer.name, customer.phone, et contenu du dernier message
      if (search && typeof search === 'string') {
        const searchTerm = search.trim();
        where.OR = [
          { customer: { name: { contains: searchTerm, mode: 'insensitive' } } },
          { customer: { phone: { contains: searchTerm, mode: 'insensitive' } } },
          { whatsappPhone: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      // Compter le total
      const total = await prisma.conversation.count({ where });

      // Récupérer les conversations avec includes
      const conversations = await prisma.conversation.findMany({
        where,
        include: {
          customer: true,
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              messages: {
                where: {
                  direction: 'inbound',
                  status: { not: 'read' },
                },
              },
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limitNum,
      });

      // Formater la réponse
      const formattedConversations = conversations.map((conv: any) => ({
        id: conv.id,
        customer: conv.customer,
        lastMessage: conv.messages[0] || null,
        unreadCount: conv._count?.messages || 0,
        lastMessageAt: conv.lastMessageAt,
        isActive: conv.isActive,
        whatsappPhone: conv.whatsappPhone,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      }));

      res.json({
        conversations: formattedConversations,
        total,
        page: pageNum,
        limit: limitNum,
        hasMore: skip + limitNum < total,
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des conversations:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération des conversations' });
    }
  }

  /**
   * Récupère une conversation par ID avec toutes les infos du customer
   */
  async getConversation(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID de la conversation requis' });
      }

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          restaurantId: user.restaurantId,
        },
        include: {
          customer: true,
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      res.json(conversation);
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération de la conversation' });
    }
  }

  /**
   * Récupère tous les messages d'une conversation avec pagination
   */
  async getMessages(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id: conversationId } = req.params;
      const { page = '1', limit = '50' } = req.query;

      if (!conversationId) {
        return res.status(400).json({ error: 'ID de la conversation requis' });
      }

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;
      const skip = (pageNum - 1) * limitNum;

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que la conversation existe et appartient au restaurant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          restaurantId: user.restaurantId,
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      // Compter le total de messages
      const total = await prisma.message.count({
        where: { conversationId },
      });

      // Récupérer les messages avec pagination
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      });

      res.json({
        messages,
        total,
        page: pageNum,
        limit: limitNum,
        hasMore: skip + limitNum < total,
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des messages:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération des messages' });
    }
  }

  /**
   * Marque tous les messages d'une conversation comme lus
   */
  async markAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id: conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({ error: 'ID de la conversation requis' });
      }

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que la conversation existe et appartient au restaurant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          restaurantId: user.restaurantId,
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      // Marquer tous les messages inbound non lus comme lus
      const result = await prisma.message.updateMany({
        where: {
          conversationId,
          direction: 'inbound',
          status: { not: 'read' },
        },
        data: {
          status: 'read',
        },
      });

      // Émettre un événement Socket.io
      const io = getIoInstance();
      if (io) {
        io.emit('messages_read', {
          conversationId,
          count: result.count,
        });
      }

      res.json({
        message: 'Messages marqués comme lus',
        count: result.count,
      });
    } catch (error: any) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
      res.status(500).json({ error: error.message || 'Erreur lors du marquage des messages comme lus' });
    }
  }

  /**
   * Envoie un message dans une conversation
   */
  async sendMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id: conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({ error: 'ID de la conversation requis' });
      }

      // Validation avec Zod
      const validationResult = sendMessageSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Données invalides',
          details: validationResult.error.issues,
        });
      }

      const { content, type, mediaUrl } = validationResult.data;

      // Vérifier que mediaUrl est fourni si type !== 'text'
      if (type !== 'text' && !mediaUrl) {
        return res.status(400).json({ error: 'mediaUrl est requis pour les messages de type image ou document' });
      }

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que la conversation existe et appartient au restaurant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          restaurantId: user.restaurantId,
        },
        include: {
          customer: true,
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      // Vérifier que le customer existe
      if (!conversation.customer) {
        return res.status(404).json({ error: 'Client non trouvé' });
      }

      // Créer le message
      const message = await prisma.message.create({
        data: {
          conversationId,
          content,
          type: type || 'text',
          mediaUrl: mediaUrl || null,
          direction: 'outbound',
          status: 'sent',
        },
        include: {
          conversation: {
            include: {
              customer: true,
            },
          },
        },
      });

      // Mettre à jour lastMessageAt de la conversation
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      // Émettre un événement Socket.io via le handler
      const io = getIoInstance();
      if (io) {
        handleMessageSent(io, message, user.restaurantId);
      }

      // TODO: Send via WhatsApp API
      // if (restaurant.whatsappApiToken) {
      //   await sendWhatsAppMessage(customer.phone, content);
      // }

      // TODO: Rate limiting
      // Max 30 messages par minute par utilisateur
      // Éviter le spam

      res.status(201).json({
        success: true,
        message,
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de l\'envoi du message' });
    }
  }

  /**
   * Archive ou désarchive une conversation (toggle isActive)
   */
  async archiveConversation(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID de la conversation requis' });
      }

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que la conversation existe et appartient au restaurant
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          id,
          restaurantId: user.restaurantId,
        },
      });

      if (!existingConversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      // Toggle isActive
      const conversation = await prisma.conversation.update({
        where: { id },
        data: {
          isActive: !existingConversation.isActive,
        },
        include: {
          customer: true,
        },
      });

      res.json(conversation);
    } catch (error: any) {
      console.error('Erreur lors de l\'archivage de la conversation:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de l\'archivage de la conversation' });
    }
  }
}

export const conversationController = new ConversationController();
