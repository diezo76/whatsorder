/**
 * Types TypeScript pour les événements Socket.io
 */

// Interfaces pour les événements de commandes
export interface OrderStatusChangedEvent {
  orderId: string;
  oldStatus: string;
  newStatus: string;
  order: any;
}

export interface OrderAssignedEvent {
  orderId: string;
  assignedTo: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
}

export interface OrderCancelledEvent {
  orderId: string;
  reason: string;
  order?: any;
}

export interface ServerToClientEvents {
  // Messages (déjà existants)
  new_message: (message: any) => void;
  user_typing: (data: { conversationId: string; isTyping: boolean; userId?: string }) => void;
  messages_read: (data: { conversationId: string; count?: number }) => void;
  conversation_updated: (data: { conversationId: string; lastMessage?: any }) => void;
  new_conversation: (conversation: any) => void;
  note_added: (note: any) => void;
  note_updated: (note: any) => void;
  note_deleted: (data: { id: string; conversationId: string }) => void;
  
  // Orders (nouveaux)
  order_status_changed: (data: OrderStatusChangedEvent) => void;
  order_assigned: (data: OrderAssignedEvent) => void;
  order_cancelled: (data: OrderCancelledEvent) => void;
  order_updated: (order: any) => void;
  new_order: (order: any) => void;
}

export interface ClientToServerEvents {
  // Messages (déjà existants)
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  typing: (data: { conversationId: string; isTyping: boolean }) => void;
  mark_read: (conversationId: string) => void;
  
  // Orders (nouveaux)
  watch_order: (orderId: string) => void;
  unwatch_order: (orderId: string) => void;
}

export interface SocketData {
  user?: {
    userId: string;
    email: string;
    role: string;
    restaurantId?: string;
  };
}
