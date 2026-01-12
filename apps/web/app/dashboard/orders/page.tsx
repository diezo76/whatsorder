'use client';

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
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

// Types
interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  menuItem: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  items: OrderItem[];
  total: number;
  subtotal: number;
  discount?: number;
  deliveryType: string;
  deliveryAddress?: string;
  deliveryFee?: number;
  customerNotes?: string;
  createdAt: string;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

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
  const [filters, setFilters] = useState({
    date: 'today',
    assignedTo: 'all',
    search: '',
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
    <div className="flex flex-col h-full">
      {/* Header avec filtres */}
      <div className="p-4 md:p-6 bg-white border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-bold">Commandes</h1>

          <div className="flex items-center gap-3">
            {/* Indicateur connexion Realtime */}
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  socketConnected || isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="text-gray-600">
                {socketConnected || isConnected ? 'Temps réel actif' : 'Déconnecté'}
              </span>
            </div>

            {/* Badge total commandes */}
            <div className="text-sm text-gray-600">
              {orders.length} commande{orders.length > 1 ? 's' : ''}
            </div>

            {/* Bouton rafraîchir */}
            <button
              onClick={loadOrders}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
              title="Rafraîchir"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filtre date */}
          <select
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Aujourd'hui</option>
            <option value="yesterday">Hier</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="all">Toutes</option>
          </select>

          {/* Filtre staff */}
          <select
            value={filters.assignedTo}
            onChange={(e) =>
              setFilters({ ...filters, assignedTo: e.target.value })
            }
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les staffs</option>
            {/* TODO: Charger la liste des users du restaurant */}
          </select>

          {/* Recherche */}
          <input
            type="text"
            placeholder="Rechercher (N° commande, client...)"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="border rounded-lg px-3 py-2 text-sm flex-1 w-full md:max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Board Kanban */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6 bg-gray-50">
        {/* Indicateur de connexion Realtime */}
        <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg border">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Temps réel actif' : 'Déconnecté'}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 min-w-max">
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

            {/* Overlay pour visualiser le drag */}
            <DragOverlay>
              {activeOrder && (
                <div className="opacity-80 rotate-3">
                  <OrderCard order={activeOrder} onClick={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Modal OrderDetails */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
