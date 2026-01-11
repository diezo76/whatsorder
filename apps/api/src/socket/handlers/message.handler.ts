import { Server, Socket } from 'socket.io';
import { SocketData } from '@/types/socket';

/**
 * Gère l'indicateur de frappe (typing indicator)
 * @param socket - Instance du socket
 * @param data - Données : { conversationId, isTyping }
 */
export function handleTyping(socket: Socket, data: { conversationId: string; isTyping: boolean }): void {
  const user = (socket.data as SocketData).user;
  
  // Broadcast dans la room (sauf l'émetteur)
  socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
    conversationId: data.conversationId,
    isTyping: data.isTyping,
    userId: user?.userId,
  });
  
  console.log(`Typing indicator: ${data.isTyping ? 'started' : 'stopped'} in conversation ${data.conversationId} (user: ${user?.userId})`);
}

/**
 * Émet un événement lorsqu'un message est envoyé
 * Appelé depuis le controller après création d'un message
 * @param io - Instance du serveur Socket.io
 * @param message - Message créé
 * @param restaurantId - ID du restaurant (optionnel)
 */
export function handleMessageSent(
  io: Server,
  message: any,
  restaurantId?: string
): void {
  const conversationId = message.conversationId;
  
  // Émet dans la room de la conversation
  io.to(`conversation_${conversationId}`).emit('new_message', message);
  console.log(`New message emitted to conversation: ${conversationId}`);
  
  // Émet aussi dans la room du restaurant (pour notification sidebar)
  if (restaurantId) {
    io.to(`restaurant_${restaurantId}`).emit('conversation_updated', {
      conversationId,
      lastMessage: message,
    });
    console.log(`Conversation updated notification sent to restaurant: ${restaurantId}`);
  }
}
