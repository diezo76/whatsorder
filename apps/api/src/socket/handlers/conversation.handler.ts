import { Socket } from 'socket.io';

/**
 * Fait rejoindre le socket à la room de la conversation
 * @param socket - Instance du socket
 * @param conversationId - ID de la conversation
 */
export function joinConversation(socket: Socket, conversationId: string): void {
  socket.join(`conversation_${conversationId}`);
  console.log(`User joined conversation: ${conversationId} (socket: ${socket.id})`);
}

/**
 * Fait quitter la room de la conversation
 * @param socket - Instance du socket
 * @param conversationId - ID de la conversation
 */
export function leaveConversation(socket: Socket, conversationId: string): void {
  socket.leave(`conversation_${conversationId}`);
  console.log(`User left conversation: ${conversationId} (socket: ${socket.id})`);
}

/**
 * Fait rejoindre la room du restaurant
 * @param socket - Instance du socket
 * @param restaurantId - ID du restaurant
 */
export function joinRestaurant(socket: Socket, restaurantId: string): void {
  socket.join(`restaurant_${restaurantId}`);
  console.log(`User joined restaurant room: ${restaurantId} (socket: ${socket.id})`);
}
