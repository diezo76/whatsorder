// apps/web/hooks/useRealtimeOrders.ts
'use client';

import { useEffect, useState } from 'react';
import { supabase, checkSupabaseConfig } from '@/lib/supabase/client';

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  deliveryType: string;
  customerId: string;
  restaurantId: string;
  createdAt: string;
}

interface UseRealtimeOrdersProps {
  restaurantId: string;
  onNewOrder?: (order: Order) => void;
  onOrderUpdate?: (order: Order) => void;
}

export function useRealtimeOrders({
  restaurantId,
  onNewOrder,
  onOrderUpdate,
}: UseRealtimeOrdersProps) {
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

    const channel = supabase.channel(`orders:${restaurantId}`, {
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
          table: 'orders',
          filter: `restaurantId=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('🆕 New order:', payload.new);
          onNewOrder?.(payload.new as Order);

          // Notification sonore
          if (typeof window !== 'undefined') {
            try {
              const audio = new Audio('/sounds/new-order.mp3');
              audio.play().catch(() => {
                console.log('🔇 Audio autoplay blocked');
              });
            } catch (error) {
              console.log('🔇 Audio not available:', error);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `restaurantId=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('✏️ Order updated:', payload.new);
          onOrderUpdate?.(payload.new as Order);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'orders',
          filter: `restaurantId=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('🗑️ Order deleted:', payload.old);
          // Optionnel: gérer la suppression
        }
      )
      .subscribe((status) => {
        console.log(`📡 Orders status: ${status}`);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('🔌 Unsubscribing from orders channel');
      supabase.removeChannel(channel);
    };
  }, [restaurantId, onNewOrder, onOrderUpdate]);

  return { isConnected };
}
