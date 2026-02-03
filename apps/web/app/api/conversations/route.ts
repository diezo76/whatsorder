// apps/web/app/api/conversations/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';
import { Prisma } from '@prisma/client';

// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';

/**
 * GET /api/conversations - Liste avec filtres avancés
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      
      // Paramètres de filtrage
      const status = searchParams.get('status') || 'ALL';
      const assignedTo = searchParams.get('assignedTo') || 'ALL';
      const priority = searchParams.get('priority') || 'ALL';
      const dateRange = searchParams.get('dateRange') || 'ALL';
      const search = searchParams.get('search') || '';
      const unreadOnly = searchParams.get('unreadOnly') === 'true';
      const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');
      
      // Construction des filtres Prisma
      const where: Prisma.ConversationWhereInput = {
        restaurantId: req.user!.restaurantId,
      };

      // Filtre par statut
      if (status !== 'ALL') {
        where.status = status as any;
      }

      // Filtre par assignation
      if (assignedTo === 'ME') {
        where.assignedToId = req.user!.userId;
      } else if (assignedTo === 'UNASSIGNED') {
        where.assignedToId = null;
      } else if (assignedTo !== 'ALL') {
        where.assignedToId = assignedTo;
      }

      // Filtre par priorité
      if (priority !== 'ALL') {
        where.priority = priority as any;
      }

      // Filtre par date
      if (dateRange !== 'ALL') {
        const now = new Date();
        let startDate: Date;
        
        switch (dateRange) {
          case 'TODAY':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'WEEK':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'MONTH':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = new Date(0);
        }
        
        where.lastMessageAt = { gte: startDate };
      }

      // Filtre non lu
      if (unreadOnly) {
        where.isUnread = true;
      }

      // Filtre par recherche (téléphone ou nom client)
      if (search) {
        where.OR = [
          { customerPhone: { contains: search } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }

      // Filtre par tags
      if (tags.length > 0) {
        where.tags = { hasSome: tags };
      }

      // Récupération des conversations
      const conversationsRaw = await prisma.conversation.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              content: true,
              sender: true,
              type: true,
              isRead: true,
              createdAt: true,
              direction: true, // Garder pour compatibilité
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: [
          { isUnread: 'desc' },
          { priority: 'desc' },
          { lastMessageAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      });

      // Calculer unreadCount pour chaque conversation (messages clients non lus)
      const conversationsWithUnread = await Promise.all(
        conversationsRaw.map(async (conv) => {
          const unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              sender: 'CUSTOMER',
              isRead: false,
            },
          });

          // Mapper vers le format attendu par la page inbox
          const lastMessage = conv.messages[0] ? {
            id: conv.messages[0].id,
            content: conv.messages[0].content,
            createdAt: conv.messages[0].createdAt.toISOString(),
            direction: conv.messages[0].direction || (conv.messages[0].sender === 'CUSTOMER' ? 'inbound' : 'outbound') as 'inbound' | 'outbound',
          } : null;

          return {
            id: conv.id,
            customer: conv.customer ? {
              id: conv.customer.id,
              name: conv.customer.name,
              phone: conv.customer.phone,
            } : {
              id: '',
              name: null,
              phone: conv.customerPhone,
            },
            lastMessage,
            unreadCount,
            lastMessageAt: conv.lastMessageAt.toISOString(),
            isActive: true, // Par défaut, peut être basé sur status si nécessaire
            whatsappPhone: conv.customerPhone, // Pour compatibilité avec l'ancien format
            customerPhone: conv.customerPhone, // Nouveau champ
            status: conv.status,
            priority: conv.priority,
            assignedToId: conv.assignedToId,
            assignedTo: conv.assignedTo,
            tags: conv.tags,
            createdAt: conv.createdAt.toISOString(),
            updatedAt: conv.updatedAt.toISOString(),
          };
        })
      );

      // Statistiques pour les filtres
      const stats = await prisma.conversation.groupBy({
        by: ['status'],
        where: { restaurantId: req.user!.restaurantId },
        _count: true,
      });

      const unreadCount = await prisma.conversation.count({
        where: {
          restaurantId: req.user!.restaurantId,
          isUnread: true,
        },
      });

      const assignedToMeCount = await prisma.conversation.count({
        where: {
          restaurantId: req.user!.restaurantId,
          assignedToId: req.user!.userId,
          status: 'OPEN',
        },
      });

      // Retourner le format attendu par la page inbox (compatibilité)
      return NextResponse.json({
        conversations: conversationsWithUnread,
        total: conversationsWithUnread.length,
        page: Math.floor(offset / limit) + 1,
        limit,
        hasMore: conversationsWithUnread.length === limit,
        // Format supplémentaire pour les nouvelles fonctionnalités
        success: true,
        stats: {
          byStatus: stats.reduce((acc, s) => {
            acc[s.status] = s._count;
            return acc;
          }, {} as Record<string, number>),
          unread: unreadCount,
          assignedToMe: assignedToMeCount,
        },
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * POST /api/conversations
 * Créer une nouvelle conversation
 */
export async function POST(request: Request) {
  return withAuth(async (req) => {
    try {
      const body = await req.json();
      const { customerId, phone, customerName } = body;

      // Si customerId existe, vérifier qu'il appartient au restaurant
      if (customerId) {
        const customer = await prisma.customer.findFirst({
          where: {
            id: customerId,
            restaurantId: req.user!.restaurantId,
          },
        });

        if (!customer) {
          throw new AppError('Client non trouvé', 404);
        }

        // Vérifier si une conversation existe déjà
        let conversation = await prisma.conversation.findFirst({
          where: {
            customerId,
            restaurantId: req.user!.restaurantId,
          },
        });

        if (conversation) {
          return NextResponse.json({
            success: true,
            conversation,
          });
        }

        // Créer la conversation
        conversation = await prisma.conversation.create({
          data: {
            restaurantId: req.user!.restaurantId,
            customerId,
            customerPhone: customer.phone,
            status: 'OPEN',
            priority: 'NORMAL',
          },
          include: {
            customer: true,
          },
        });

        return NextResponse.json({
          success: true,
          conversation,
        }, { status: 201 });
      }

      // Si pas de customerId, créer le client d'abord
      if (!phone || !customerName) {
        throw new AppError('phone et customerName sont requis', 400);
      }

      // Créer le client
      const customer = await prisma.customer.create({
        data: {
          phone,
          name: customerName,
          restaurantId: req.user!.restaurantId,
        },
      });

      // Créer la conversation
      const conversation = await prisma.conversation.create({
        data: {
          restaurantId: req.user!.restaurantId,
          customerId: customer.id,
          customerPhone: phone,
          status: 'OPEN',
          priority: 'NORMAL',
        },
        include: {
          customer: true,
        },
      });

      return NextResponse.json({
        success: true,
        conversation,
      }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
