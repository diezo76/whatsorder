'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LOCATION' | 'ORDER_LINK' | 'TEMPLATE';
  sender: 'CUSTOMER' | 'STAFF' | 'SYSTEM';
  conversationId: string;
  createdAt: string;
  isRead: boolean;
  attachments?: string[];
  direction?: string;
  status?: string;
  mediaUrl?: string;
}

interface UseRealtimeMessagesProps {
  conversationId: string;
  onNewMessage?: (message: Message) => void;
  onMessageUpdate?: (message: Message) => void;
}

export function useRealtimeMessages({
  conversationId,
  onNewMessage,
  onMessageUpdate,
}: UseRealtimeMessagesProps) {
  const [isConnected, setIsConnected] = useState(false);
  
  // Utiliser useRef pour éviter les reconnexions en boucle
  const onNewMessageRef = useRef(onNewMessage);
  const onMessageUpdateRef = useRef(onMessageUpdate);

  // Mettre à jour les refs quand les callbacks changent
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onMessageUpdateRef.current = onMessageUpdate;
  }, [onNewMessage, onMessageUpdate]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase.channel(`messages:${conversationId}`);

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          console.log('🆕 New message:', payload.new);
          onNewMessageRef.current?.(payload.new as Message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          console.log('✏️ Message updated:', payload.new);
          onMessageUpdateRef.current?.(payload.new as Message);
        }
      )
      .subscribe((status) => {
        const statusStr = String(status);
        if (statusStr === 'SUBSCRIBED') {
          console.log(`✅ Messages Realtime: Connecté`);
          setIsConnected(true);
        } else if (statusStr === 'CHANNEL_ERROR' || statusStr === 'TIMED_OUT') {
          console.warn(`⚠️ Messages Realtime: ${statusStr} (L'API REST fonctionnera toujours)`);
          setIsConnected(false);
        } else {
          setIsConnected(statusStr === 'SUBSCRIBED');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]); // Seulement conversationId dans les dépendances

  return { isConnected };
}
