// apps/web/hooks/useRealtimeConversations.ts
'use client';

import { useEffect, useState } from 'react';
import { supabase, checkSupabaseConfig } from '@/lib/supabase/client';

export interface Conversation {
  id: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  lastMessageAt: string;
  customerId: string;
  restaurantId: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  unreadCount?: number;
}

interface UseRealtimeConversationsProps {
  restaurantId: string;
  onConversationUpdate?: (conversation: Conversation) => void;
  onNewConversation?: (conversation: Conversation) => void;
}

export function useRealtimeConversations({
  restaurantId,
  onConversationUpdate,
  onNewConversation,
}: UseRealtimeConversationsProps) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Vérifier la configuration Supabase
    if (!checkSupabaseConfig()) {
      setIsConnected(false);
      return;
    }

    if (!restaurantId) {
      setIsConnected(false);
      return;
    }

    const channel = supabase.channel(`conversations:${restaurantId}`, {
      config: {
        broadcast: { self: true },
      },
    });

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `restaurantId=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('🆕 New conversation:', payload.new);
          onNewConversation?.(payload.new as Conversation);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `restaurantId=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('✏️ Conversation updated:', payload.new);
          onConversationUpdate?.(payload.new as Conversation);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Conversations status: ${status}`);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('🔌 Unsubscribing from conversations channel');
      supabase.removeChannel(channel);
    };
  }, [restaurantId, onConversationUpdate, onNewConversation]);

  return { isConnected };
}
