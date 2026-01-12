'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Message {
  id: string;
  content: string;
  type: 'INCOMING' | 'OUTGOING';
  conversationId: string;
  createdAt: string;
  isRead: boolean;
  attachments: string[];
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
        console.log(`📡 Messages status: ${status}`);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]); // Seulement conversationId dans les dépendances

  return { isConnected };
}
