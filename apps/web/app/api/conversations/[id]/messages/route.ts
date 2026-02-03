// apps/web/app/api/conversations/[id]/messages/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';

/**
 * GET /api/conversations/:id/messages
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      // Vérifier que la conversation appartient au restaurant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!conversation) {
        throw new AppError('Conversation non trouvée', 404);
      }

      const messages = await prisma.message.findMany({
        where: {
          conversationId: params.id,
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          conversationId: true,
          content: true,
          type: true,
          sender: true,
          direction: true,
          status: true,
          mediaUrl: true,
          createdAt: true,
          isRead: true,
        },
      });

      // Log pour débogage
      console.log('📨 API Messages retournés:', {
        count: messages.length,
        sample: messages.length > 0 ? messages[0] : null,
      });

      return NextResponse.json({
        success: true,
        messages,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * POST /api/conversations/:id/messages
 * Envoyer un message
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req) => {
    try {
      const body = await req.json();
      const { content, type, mediaUrl } = body;

      if (!content || content.trim() === '') {
        throw new AppError('Le contenu est requis', 400);
      }

      if (!['text', 'image', 'document'].includes(type || 'text')) {
        throw new AppError('Type invalide', 400);
      }

      // Vérifier que la conversation existe
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: params.id,
          restaurantId: req.user!.restaurantId,
        },
      });

      if (!conversation) {
        throw new AppError('Conversation non trouvée', 404);
      }

      // Créer le message
      // Mapper le type frontend vers le type Prisma
      const messageType = type === 'text' ? 'TEXT' : 
                         type === 'image' ? 'IMAGE' : 
                         type === 'document' ? 'DOCUMENT' : 'TEXT';
      
      const message = await prisma.message.create({
        data: {
          conversationId: params.id,
          content: content.trim(),
          type: messageType,
          sender: 'STAFF', // Messages envoyés depuis l'inbox sont toujours STAFF
          direction: 'outbound',
          status: 'sent',
          mediaUrl: mediaUrl || null,
        },
        select: {
          id: true,
          conversationId: true,
          content: true,
          type: true,
          sender: true,
          direction: true,
          status: true,
          mediaUrl: true,
          createdAt: true,
          isRead: true,
        },
      });

      // Mettre à jour lastMessageAt de la conversation
      await prisma.conversation.update({
        where: { id: params.id },
        data: { lastMessageAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        message,
      }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
