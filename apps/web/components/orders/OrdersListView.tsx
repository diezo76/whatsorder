'use client';

import { Truck, ShoppingBag, UtensilsCrossed, Package } from 'lucide-react';
import { getOrderStatusLabel, ORDER_STATUS_COLORS } from '@/lib/shared/labels';
import type { Order } from '@/types/order';

interface OrdersListViewProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
  newOrders?: Set<string>;
  animatingOrders?: Set<string>;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "À l'instant";
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const DeliveryTypeBadge = ({ type }: { type: string }) => {
  const config: Record<
    string,
    { icon: typeof Truck; label: string; color: string }
  > = {
    DELIVERY: {
      icon: Truck,
      label: 'Livraison',
      color: 'bg-blue-100 text-blue-700',
    },
    PICKUP: {
      icon: ShoppingBag,
      label: 'À emporter',
      color: 'bg-green-100 text-green-700',
    },
    DINE_IN: {
      icon: UtensilsCrossed,
      label: 'Sur place',
      color: 'bg-purple-100 text-purple-700',
    },
  };

  const { icon: Icon, label, color } = config[type] || config.DELIVERY;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

export default function OrdersListView({
  orders,
  onOrderClick,
  newOrders = new Set(),
  animatingOrders = new Set(),
}: OrdersListViewProps) {
  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sortedOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Package className="w-12 h-12 mb-2" />
        <p className="text-sm">Aucune commande</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {sortedOrders.map((order) => {
          const isUrgent =
            order.status === 'PENDING' &&
            new Date().getTime() - new Date(order.createdAt).getTime() >
              30 * 60 * 1000;
          const isNew = newOrders.has(order.id);
          const isAnimating = animatingOrders.has(order.id);
          const statusColor =
            ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800';

          return (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => onOrderClick(order)}
                className={`
                  w-full text-left px-4 py-3 flex items-center gap-2 sm:gap-3 flex-wrap
                  hover:bg-gray-50 transition-colors cursor-pointer
                  ${isUrgent ? 'border-l-4 border-l-red-400' : ''}
                  ${isAnimating ? 'bg-orange-50' : ''}
                `}
              >
                <span className="font-semibold text-gray-900 shrink-0">
                  {order.orderNumber}
                  {isNew && (
                    <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] leading-none">
                      Nouveau
                    </span>
                  )}
                </span>
                <span className="text-gray-600 truncate shrink-0">
                  {order.customer.name || 'Client'}
                </span>
                <span className="text-xs text-gray-500 shrink-0 hidden sm:inline">
                  {formatTime(order.createdAt)}
                </span>
                <DeliveryTypeBadge type={order.deliveryType} />
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${statusColor}`}
                >
                  {getOrderStatusLabel(order.status)}
                </span>
                <span className="text-sm text-gray-600 shrink-0">
                  {order.items.length} item{order.items.length > 1 ? 's' : ''}
                </span>
                <span className="font-semibold text-gray-900 ml-auto shrink-0">
                  {order.total.toFixed(2)} EGP
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
