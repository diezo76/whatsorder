import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '@/types/socket';

// Instance Socket.io globale (sera initialisée dans index.ts)
let ioInstance: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export function setIoInstance(io: Server<ClientToServerEvents, ServerToClientEvents>): void {
  ioInstance = io;
}

export function getIoInstance(): Server<ClientToServerEvents, ServerToClientEvents> | null {
  return ioInstance;
}

/**
 * Helper pour broadcaster les événements de commandes
 * @param restaurantId - ID du restaurant
 * @param event - Nom de l'événement
 * @param data - Données à émettre
 */
export function broadcastOrderUpdate(
  restaurantId: string,
  event: keyof ServerToClientEvents,
  data: any
): void {
  const io = getIoInstance();
  if (io) {
    io.to(`restaurant_${restaurantId}`).emit(event, data);
    console.log(`[Socket] Broadcast ${event} to restaurant_${restaurantId}`, {
      event,
      restaurantId,
      data: event === 'order_status_changed' ? { orderId: data.orderId, oldStatus: data.oldStatus, newStatus: data.newStatus } : data,
    });
  } else {
    console.warn('[Socket] Cannot broadcast: io instance not available');
  }
}
