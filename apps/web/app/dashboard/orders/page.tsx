'use client';

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Loader2, AlertTriangle, CheckCircle, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { toast as sonnerToast } from 'sonner';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { api } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import KanbanColumn from '@/components/orders/KanbanColumn';
import OrderCard from '@/components/orders/OrderCard';
import OrderDetailsModal from '@/components/orders/OrderDetailsModal';
import OrdersListView from '@/components/orders/OrdersListView';
import type { Order } from '@/types/order';

interface Column {
  id: string;
  title: string;
  color: string;
}

// Colonnes du Kanban
const columns: Column[] = [
  { id: 'PENDING', title: '⏳ En Attente', color: 'gray' },
  { id: 'CONFIRMED', title: '✅ Confirmée', color: 'blue' },
  { id: 'PREPARING', title: '👨‍🍳 En Préparation', color: 'yellow' },
  { id: 'READY', title: '🎉 Prête', color: 'green' },
  { id: 'OUT_FOR_DELIVERY', title: '🚗 En Livraison', color: 'purple' },
  { id: 'DELIVERED', title: '✅ Livrée', color: 'green' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [animatingOrders, setAnimatingOrders] = useState<Set<string>>(new Set());
  const [newOrders, setNewOrders] = useState<Set<string>>(new Set());
  const [isBusy, setIsBusy] = useState(false);
  const [togglingBusy, setTogglingBusy] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [filters, setFilters] = useState({
    date: 'today',
    assignedTo: 'all',
    search: '',
  });
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orders-view-mode');
      if (saved === 'list' || saved === 'kanban') return saved;
    }
    return 'list';
  });

  // Auth hook pour obtenir restaurantId
  const { user } = useAuth();

  // Hook Socket.io (gardé pour compatibilité)
  const {
    isConnected: socketConnected,
    onOrderStatusChanged,
    onOrderAssigned,
    onOrderCancelled,
    onOrderUpdated,
    onNewOrder,
    offOrderStatusChanged,
    offOrderAssigned,
    offOrderCancelled,
    offOrderUpdated,
    offNewOrder,
  } = useSocket();

  const { isConnected } = useRealtimeOrders({
    restaurantId: user?.restaurantId || '',
    onNewOrder: (order) => {
      console.log('🆕 New order received:', order);
      sonnerToast.success(`Nouvelle commande : ${order.orderNumber}`);
      
      // Recharger les commandes
      loadOrders();
    },
    onOrderUpdate: (order) => {
      console.log('✏️ Order updated:', order);
      
      // Mettre à jour la commande dans la liste
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, ...order } : o))
      );
    },
  });

  // Ref pour éviter les updates multiples simultanés
  const updateTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Setup des sensors pour le drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de mouvement avant de commencer le drag
      },
    })
  );

  // Fonction pour jouer une notification sonore
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch((err) => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Notification sound not available');
    }
  };

  // Persister le mode de vue
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orders-view-mode', viewMode);
    }
  }, [viewMode]);

  // Charger le statut busy du restaurant
  useEffect(() => {
    const loadBusyStatus = async () => {
      try {
        const response = await api.get('/restaurant');
        if (response.data?.restaurant?.isBusy !== undefined) {
          setIsBusy(response.data.restaurant.isBusy);
        }
        if (response.data?.restaurant?.name) {
          setRestaurantName(response.data.restaurant.name);
        }
      } catch (error) {
        console.error('Error loading busy status:', error);
      }
    };
    loadBusyStatus();
  }, []);

  // Toggle le mode busy
  const toggleBusy = async () => {
    setTogglingBusy(true);
    try {
      const newBusy = !isBusy;
      await api.put('/restaurant', { isBusy: newBusy });
      setIsBusy(newBusy);
      toast.success(newBusy ? 'Restaurant marque comme occupe' : 'Restaurant ouvert aux commandes');
    } catch (error) {
      console.error('Error toggling busy:', error);
      toast.error('Erreur lors du changement de statut');
    } finally {
      setTogglingBusy(false);
    }
  };

  // Charger les commandes
  useEffect(() => {
    loadOrders();
  }, [filters]);

  // Event: changement de statut
  useEffect(() => {
    const handleOrderStatusChanged = (data: any) => {
      console.log('Order status changed:', {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        timestamp: data.timestamp || new Date().toISOString(),
      });

      // Debounce: annule le timeout précédent si existe
      const existingTimeout = updateTimeoutRef.current.get(data.orderId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Ajoute à la liste des animating
      setAnimatingOrders((prev) => new Set(prev).add(data.orderId));

      // Retire après 1 seconde
      const timeout = setTimeout(() => {
        setAnimatingOrders((prev) => {
          const next = new Set(prev);
          next.delete(data.orderId);
          return next;
        });
        updateTimeoutRef.current.delete(data.orderId);
      }, 1000);

      updateTimeoutRef.current.set(data.orderId, timeout);

      // Met à jour la commande dans le state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === data.orderId
            ? { ...order, status: data.newStatus }
            : order
        )
      );

      // Toast notification
      toast.success(`Commande ${data.orderNumber} : ${data.newStatus}`, {
        duration: 3000,
      });
    };

    onOrderStatusChanged(handleOrderStatusChanged);

    return () => {
      offOrderStatusChanged();
    };
  }, [onOrderStatusChanged, offOrderStatusChanged]);

  // Event: commande assignée
  useEffect(() => {
    const handleOrderAssigned = (data: any) => {
      console.log('Order assigned:', {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        assignedTo: data.assignedTo,
        timestamp: data.timestamp || new Date().toISOString(),
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === data.orderId
            ? { ...order, assignedTo: data.assignedTo }
            : order
        )
      );

      toast.success(`Commande ${data.orderNumber} assignée à ${data.assignedTo.name}`, {
        duration: 3000,
      });
    };

    onOrderAssigned(handleOrderAssigned);

    return () => {
      offOrderAssigned();
    };
  }, [onOrderAssigned, offOrderAssigned]);

  // Event: commande annulée
  useEffect(() => {
    const handleOrderCancelled = (data: any) => {
      console.log('Order cancelled:', {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        cancellationReason: data.cancellationReason,
        timestamp: data.timestamp || new Date().toISOString(),
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === data.orderId
            ? { ...order, status: 'CANCELLED' }
            : order
        )
      );

      toast.error(`Commande ${data.orderNumber} annulée`, {
        duration: 4000,
      });
    };

    onOrderCancelled(handleOrderCancelled);

    return () => {
      offOrderCancelled();
    };
  }, [onOrderCancelled, offOrderCancelled]);

  // Event: commande mise à jour
  useEffect(() => {
    const handleOrderUpdated = (data: any) => {
      console.log('Order updated:', {
        orderId: data.order?.id,
        timestamp: data.timestamp || new Date().toISOString(),
      });

      if (data.order) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === data.order.id ? data.order : order
          )
        );
      }
    };

    onOrderUpdated(handleOrderUpdated);

    return () => {
      offOrderUpdated();
    };
  }, [onOrderUpdated, offOrderUpdated]);

  // Event: nouvelle commande
  useEffect(() => {
    const handleNewOrder = (data: any) => {
      console.log('New order received:', {
        orderId: data.order?.id,
        orderNumber: data.order?.orderNumber,
        timestamp: data.timestamp || new Date().toISOString(),
      });

      if (data.order) {
        // Vérifie si la commande n'existe pas déjà
        setOrders((prev) => {
          const exists = prev.some((o) => o.id === data.order.id);
          if (exists) return prev;
          return [data.order, ...prev];
        });

        // Ajoute au badge "Nouveau"
        setNewOrders((prev) => new Set(prev).add(data.order.id));

        // Retire le badge après 30 secondes
        setTimeout(() => {
          setNewOrders((prev) => {
            const next = new Set(prev);
            next.delete(data.order.id);
            return next;
          });
        }, 30000);

        // Notification sonore + toast
        playNotificationSound();
        toast.success(`Nouvelle commande: ${data.order.orderNumber}`, {
          duration: 5000,
          icon: '🔔',
        });
      }
    };

    onNewOrder(handleNewOrder);

    return () => {
      offNewOrder();
    };
  }, [onNewOrder, offNewOrder]);

  // Nettoyage au unmount
  useEffect(() => {
    return () => {
      offOrderStatusChanged();
      offOrderAssigned();
      offOrderCancelled();
      offOrderUpdated();
      offNewOrder();
      // Nettoyer les timeouts
      updateTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      updateTimeoutRef.current.clear();
    };
  }, [
    offOrderStatusChanged,
    offOrderAssigned,
    offOrderCancelled,
    offOrderUpdated,
    offNewOrder,
  ]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date !== 'all') {
        params.append('date', filters.date);
      }
      if (filters.assignedTo !== 'all') {
        params.append('assignedToId', filters.assignedTo);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data.orders || []);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast.error('Erreur de chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les commandes par statut
  const getOrdersByStatus = (status: string): Order[] => {
    return orders.filter((order) => order.status === status);
  };

  // Gérer le changement de statut
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await api.put(`/orders/${orderId}`, { status: newStatus });

      // Mettre à jour localement avec la réponse du serveur
      if (response.data?.order) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? response.data.order : order
          )
        );
      } else {
        // Fallback si la structure de réponse est différente
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }

      toast.success('Statut mis à jour');
    } catch (error: any) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);
    }
  };

  // Handler pour le début du drag
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const order = orders.find((o) => o.id === active.id);
    setActiveOrder(order || null);
  };

  // Handler pour la fin du drag
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveOrder(null);

    if (!over) return;

    const orderId = active.id as string;
    const newStatus = over.id as string;

    // Trouve la commande
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === newStatus) return;

    // Mise à jour optimiste (UI)
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    // Appel API
    try {
      const response = await api.put(`/orders/${orderId}`, { status: newStatus });
      
      // Mettre à jour avec la réponse du serveur pour s'assurer de la cohérence
      if (response.data?.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? response.data.order : o))
        );
      }
      
      toast.success('Statut mis à jour');
    } catch (error: any) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);

      // Rollback en cas d'erreur
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: order.status } : o))
      );
    }
  };

  return (
    <div className="flex flex-col h-full -m-4 md:-m-6">
      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-[#e5e5e5]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-semibold text-[#0a0a0a] tracking-tight">Commandes</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#f5f5f5] text-[#737373]">
              {orders.length}
            </span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${socketConnected || isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-[#d4d4d4]'}`} />
              <span className="text-[11px] text-[#a3a3a3]">
                {socketConnected || isConnected ? 'Temps reel' : 'REST'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Busy toggle */}
            <button
              onClick={toggleBusy}
              disabled={togglingBusy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium border transition-all ${
                isBusy
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
              } ${togglingBusy ? 'opacity-50' : ''}`}
            >
              {isBusy ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isBusy ? 'Occupe' : 'Ouvert'}</span>
            </button>

            {/* View toggle */}
            <div className="flex items-center bg-[#f5f5f5] rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'kanban' ? 'bg-white text-[#0a0a0a] shadow-sm' : 'text-[#a3a3a3] hover:text-[#737373]'
                }`}
                title="Vue Kanban"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'list' ? 'bg-white text-[#0a0a0a] shadow-sm' : 'text-[#a3a3a3] hover:text-[#737373]'
                }`}
                title="Vue Liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={loadOrders}
              className="p-1.5 rounded-md hover:bg-[#f5f5f5] transition-colors text-[#737373] hover:text-[#0a0a0a]"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="border border-[#e5e5e5] rounded-md px-2.5 py-1.5 text-[12px] bg-white text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
          >
            <option value="today">Aujourd&apos;hui</option>
            <option value="yesterday">Hier</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="all">Toutes</option>
          </select>

          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
            className="border border-[#e5e5e5] rounded-md px-2.5 py-1.5 text-[12px] bg-white text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
          >
            <option value="all">Tous les staffs</option>
          </select>

          <input
            type="text"
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border border-[#e5e5e5] rounded-md px-2.5 py-1.5 text-[12px] bg-white text-[#0a0a0a] placeholder-[#a3a3a3] flex-1 w-full md:max-w-xs focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
          />
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-4 md:p-5 bg-[#fafafa]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-6 h-6 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === 'list' ? (
          <OrdersListView
            orders={orders}
            onOrderClick={(order) => setSelectedOrder(order)}
            newOrders={newOrders}
            animatingOrders={animatingOrders}
          />
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-3 min-w-max">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  orders={getOrdersByStatus(column.id)}
                  onOrderClick={(order) => setSelectedOrder(order)}
                  animatingOrders={animatingOrders}
                  newOrders={newOrders}
                />
              ))}
            </div>

            <DragOverlay>
              {activeOrder && (
                <div className="opacity-90 rotate-2 scale-105">
                  <OrderCard order={activeOrder} onClick={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          restaurantName={restaurantName}
        />
      )}
    </div>
  );
}
