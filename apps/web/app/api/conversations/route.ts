// apps/web/app/api/conversations/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

/**
 * GET /api/conversations
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const conversations = await prisma.conversation.findMany({
        where: {
          restaurantId: req.user!.restaurantId,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              content: true,
              type: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        take: limit,
        skip: offset,
      });

      // Ajouter unreadCount (messages non lus)
      const conversationsWithUnread = await Promise.all(
        conversations.map(async (conv: { id: string; messages: { id: string; content: string; type: string; createdAt: Date }[] }) => {
          const unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              direction: 'inbound',
              status: { not: 'read' },
            },
          });

          return {
            ...conv,
            unreadCount,
            lastMessage: conv.messages[0] || null,
            messages: undefined,
          };
        })
      );

      return NextResponse.json({
        success: true,
        conversations: conversationsWithUnread,
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
            whatsappPhone: customer.phone,
            isActive: true,
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
          whatsappPhone: phone,
          isActive: true,
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
