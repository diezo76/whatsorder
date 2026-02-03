'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Conversation {
  id: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  lastMessageAt: string;
  customerId: string;
  restaurantId: string;
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
  
  // Utiliser useRef pour éviter les reconnexions en boucle
  const onConversationUpdateRef = useRef(onConversationUpdate);
  const onNewConversationRef = useRef(onNewConversation);

  // Mettre à jour les refs quand les callbacks changent
  useEffect(() => {
    onConversationUpdateRef.current = onConversationUpdate;
    onNewConversationRef.current = onNewConversation;
  }, [onConversationUpdate, onNewConversation]);

  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase.channel(`conversations:${restaurantId}`);

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
          onNewConversationRef.current?.(payload.new as Conversation);
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
          onConversationUpdateRef.current?.(payload.new as Conversation);
        }
      )
      .subscribe((status) => {
        const statusStr = String(status);
        if (statusStr === 'SUBSCRIBED') {
          console.log(`✅ Conversations Realtime: Connecté`);
          setIsConnected(true);
        } else if (statusStr === 'CHANNEL_ERROR' || statusStr === 'TIMED_OUT') {
          console.warn(`⚠️ Conversations Realtime: ${statusStr} (L'API REST fonctionnera toujours)`);
          setIsConnected(false);
        } else {
          setIsConnected(statusStr === 'SUBSCRIBED');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]); // Seulement restaurantId dans les dépendances

  return { isConnected };
}
