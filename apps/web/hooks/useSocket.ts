'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

// Types TypeScript
export interface SocketMessage {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'document';
  conversationId: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  mediaUrl?: string | null;
}

export interface TypingData {
  conversationId: string;
  isTyping: boolean;
  userId?: string;
}

export interface ConversationUpdatedData {
  conversationId: string;
  lastMessage?: SocketMessage;
}

export interface MessagesReadData {
  conversationId: string;
  count?: number;
}

// Types pour les événements de commandes
export interface OrderStatusChangedData {
  orderId: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
  order: any;
  timestamp: string;
}

export interface OrderAssignedData {
  orderId: string;
  orderNumber: string;
  assignedTo: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
}

export interface OrderCancelledData {
  orderId: string;
  orderNumber: string;
  cancellationReason?: string;
  timestamp: string;
}

export interface OrderUpdatedData {
  order: any;
  timestamp: string;
}

export interface NewOrderData {
  order: any;
  timestamp: string;
}

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Récupérer le token depuis localStorage
  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

  // Connection/déconnexion
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Déconnecter si pas authentifié
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn('No token found for Socket.io connection');
      return;
    }

    // Crée la connexion
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Events de connection
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      setIsConnected(false);
    });

    // Cleanup
    return () => {
      console.log('Cleaning up Socket.io connection');
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user, getToken]);

  // Fonction pour rejoindre une conversation
  const joinConversation = useCallback((conversationId: string) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Socket not connected, cannot join conversation');
      return;
    }
    socketRef.current.emit('join_conversation', conversationId);
    console.log('Joined conversation:', conversationId);
  }, [isConnected]);

  // Fonction pour quitter une conversation
  const leaveConversation = useCallback((conversationId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('leave_conversation', conversationId);
    console.log('Left conversation:', conversationId);
  }, []);

  // Fonction pour émettre typing indicator
  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (!socketRef.current || !isConnected) return;
    socketRef.current.emit('typing', { conversationId, isTyping });
  }, [isConnected]);

  // Fonction pour marquer comme lu
  const markAsRead = useCallback((conversationId: string) => {
    if (!socketRef.current || !isConnected) return;
    socketRef.current.emit('mark_read', conversationId);
  }, [isConnected]);

  // Fonction pour écouter les nouveaux messages
  const onNewMessage = useCallback((callback: (message: SocketMessage) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on('new_message', callback);
  }, []);

  // Fonction pour nettoyer le listener new_message
  const offNewMessage = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.off('new_message');
  }, []);

  // Fonction pour écouter l'indicateur de frappe
  const onUserTyping = useCallback((callback: (data: TypingData) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on('user_typing', callback);
  }, []);

  // Fonction pour nettoyer le listener user_typing
  const offUserTyping = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.off('user_typing');
  }, []);

  // Fonction pour écouter les messages marqués comme lus
  const onMessagesRead = useCallback((callback: (data: MessagesReadData) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on('messages_read', callback);
  }, []);

  // Fonction pour nettoyer le listener messages_read
  const offMessagesRead = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.off('messages_read');
  }, []);

  // Fonction pour écouter les mises à jour de conversation
  const onConversationUpdated = useCallback((callback: (data: ConversationUpdatedData) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on('conversation_updated', callback);
  }, []);

  // Fonction pour nettoyer le listener conversation_updated
  const offConversationUpdated = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.off('conversation_updated');
  }, []);

  // Fonction pour écouter les notes ajoutées
  const onNoteAdded = useCallback((callback: (note: any) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on('note_added', callback);
  }, []);

  // Fonction pour nettoyer le listener note_added
  const offNoteAdded = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.off('note_added');
  }, []);

  // Fonction pour écouter le changement de statut d'une commande
  const onOrderStatusChanged = useCallback((callback: (data: OrderStatusChangedData) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on('order_status_changed', callback);
  }, []);

  // Fonction pour nettoyer le listener order_status_changed
  const offOrderStatusChanged = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.off('order_status_changed');
  }, []);

  // Fonction pour écouter l'assignation d'une commande
  const onOrderAssigned = useCallback((callback: (data: OrderAssignedData) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on('order_assigned', callback);
  }, []);

  // Fonction pour nettoyer le listener order_assigned
  const offOrderAssigned = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.off('order_assigned');
  }, []);

  // Fonction pour écouter l'annulation d'une commande
  const onOrderCancelled = useCallback((callback: (data: OrderCancelledData) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on('order_cancelled', callback);
  }, []);

  // Fonction pour nettoyer le listener order_cancelled
  const offOrderCancelled = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.off('order_cancelled');
  }, []);

  // Fonction pour écouter la mise à jour d'une commande
  const onOrderUpdated = useCallback((callback: (data: OrderUpdatedData) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on('order_updated', callback);
  }, []);

  // Fonction pour nettoyer le listener order_updated
  const offOrderUpdated = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.off('order_updated');
  }, []);

  // Fonction pour écouter une nouvelle commande
  const onNewOrder = useCallback((callback: (data: NewOrderData) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on('new_order', callback);
  }, []);

  // Fonction pour nettoyer le listener new_order
  const offNewOrder = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.off('new_order');
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinConversation,
    leaveConversation,
    emitTyping,
    markAsRead,
    onNewMessage,
    offNewMessage,
    onUserTyping,
    offUserTyping,
    onMessagesRead,
    offMessagesRead,
    onConversationUpdated,
    offConversationUpdated,
    onNoteAdded,
    offNoteAdded,
    onOrderStatusChanged,
    offOrderStatusChanged,
    onOrderAssigned,
    offOrderAssigned,
    onOrderCancelled,
    offOrderCancelled,
    onOrderUpdated,
    offOrderUpdated,
    onNewOrder,
    offNewOrder,
  };
}

export default useSocket;
