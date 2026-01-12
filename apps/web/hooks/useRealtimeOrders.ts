'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

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
  
  // Utiliser useRef pour éviter les reconnexions en boucle
  const onNewOrderRef = useRef(onNewOrder);
  const onOrderUpdateRef = useRef(onOrderUpdate);

  // Mettre à jour les refs quand les callbacks changent
  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
    onOrderUpdateRef.current = onOrderUpdate;
  }, [onNewOrder, onOrderUpdate]);

  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase.channel(`orders:${restaurantId}`);

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
          onNewOrderRef.current?.(payload.new as Order);
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
          onOrderUpdateRef.current?.(payload.new as Order);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Orders status: ${status}`);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]); // Seulement restaurantId dans les dépendances

  return { isConnected };
}
