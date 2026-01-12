// apps/web/hooks/useRealtimeMessages.ts
'use client';

import { useEffect, useState } from 'react';
import { supabase, checkSupabaseConfig } from '@/lib/supabase/client';

export interface Message {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'document';
  conversationId: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  mediaUrl?: string | null;
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

  useEffect(() => {
    // Vérifier la configuration Supabase
    if (!checkSupabaseConfig()) {
      setIsConnected(false);
      return;
    }

    if (!conversationId) {
      setIsConnected(false);
      return;
    }

    // Créer un canal unique par conversation
    const channel = supabase.channel(`messages:${conversationId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: conversationId },
      },
    });

    // Écouter les nouveaux messages (INSERT)
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
          const newMessage = payload.new as Message;
          onNewMessage?.(newMessage);
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
          const updatedMessage = payload.new as Message;
          onMessageUpdate?.(updatedMessage);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Realtime status: ${status}`);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Cleanup
    return () => {
      console.log('🔌 Unsubscribing from messages channel');
      supabase.removeChannel(channel);
    };
  }, [conversationId, onNewMessage, onMessageUpdate]);

  return { isConnected };
}
