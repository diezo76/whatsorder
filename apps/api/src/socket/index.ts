import { Server, Socket } from 'socket.io';
import { verifyToken } from '@/utils/jwt';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '@/types/socket';
import { joinConversation, leaveConversation, joinRestaurant } from './handlers/conversation.handler';
import { handleTyping } from './handlers/message.handler';
import { prisma } from '@/utils/prisma';

/**
 * Configure tous les handlers Socket.io avec authentification JWT
 * @param io - Instance du serveur Socket.io
 */
export function setupSocketHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>): void {
  // Middleware d'authentification
  io.use(async (socket: Socket<ClientToServerEvents, ServerToClientEvents>, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Socket connection rejected: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }
    
    try {
      const decoded = verifyToken(token);
      
      // Récupérer le restaurantId depuis l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { restaurantId: true },
      });
      
      // Stocker les données utilisateur dans socket.data
      (socket.data as SocketData).user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        restaurantId: user?.restaurantId || undefined,
      };
      
      console.log(`Socket authenticated: ${decoded.email} (userId: ${decoded.userId})`);
      next();
    } catch (err) {
      console.log('Socket connection rejected: Invalid token', err);
      next(new Error('Authentication error: Invalid token'));
    }
  });
  
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    const user = (socket.data as SocketData).user;
    console.log(`Client connected: ${socket.id} (user: ${user?.email || 'unknown'})`);
    
    // Auto-join restaurant room si restaurantId disponible
    if (user?.restaurantId) {
      joinRestaurant(socket, user.restaurantId);
    }
    
    // Event: join conversation
    socket.on('join_conversation', (conversationId: string) => {
      if (!conversationId) {
        console.warn(`Invalid join_conversation: conversationId is required (socket: ${socket.id})`);
        return;
      }
      joinConversation(socket, conversationId);
    });
    
    // Event: leave conversation
    socket.on('leave_conversation', (conversationId: string) => {
      if (!conversationId) {
        console.warn(`Invalid leave_conversation: conversationId is required (socket: ${socket.id})`);
        return;
      }
      leaveConversation(socket, conversationId);
    });
    
    // Event: typing indicator
    socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
      if (!data || !data.conversationId) {
        console.warn(`Invalid typing event: conversationId is required (socket: ${socket.id})`);
        return;
      }
      handleTyping(socket, data);
    });
    
    // Event: mark as read
    socket.on('mark_read', (conversationId: string) => {
      if (!conversationId) {
        console.warn(`Invalid mark_read: conversationId is required (socket: ${socket.id})`);
        return;
      }
      
      // Émet à tous dans la room de la conversation
      io.to(`conversation_${conversationId}`).emit('messages_read', {
        conversationId,
      });
      
      console.log(`Messages marked as read in conversation: ${conversationId} (socket: ${socket.id})`);
    });
    
    // ==========================================
    // ORDER EVENTS
    // ==========================================
    
    // Event: Watch a specific order
    socket.on('watch_order', (orderId: string) => {
      if (!orderId) {
        console.warn(`Invalid watch_order: orderId is required (socket: ${socket.id})`);
        return;
      }
      socket.join(`order_${orderId}`);
      console.log(`Socket ${socket.id} watching order: ${orderId} (user: ${user?.email || 'unknown'})`);
    });
    
    // Event: Stop watching a specific order
    socket.on('unwatch_order', (orderId: string) => {
      if (!orderId) {
        console.warn(`Invalid unwatch_order: orderId is required (socket: ${socket.id})`);
        return;
      }
      socket.leave(`order_${orderId}`);
      console.log(`Socket ${socket.id} stopped watching order: ${orderId} (user: ${user?.email || 'unknown'})`);
    });
    
    // Note: Les users rejoignent automatiquement la room restaurant_${restaurantId}
    // via joinRestaurant() appelé lors de la connexion
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id} (user: ${user?.email || 'unknown'})`);
    });
  });
  
  // TODO: Rate limiting sur les events
  // TODO: Reconnection automatique
  // TODO: Message delivery receipts
}
