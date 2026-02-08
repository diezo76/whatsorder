'use client';

import {
  User,
  Phone,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
} from 'lucide-react';
import type { Order } from '@/types/order';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  isNew?: boolean;
}

// Fonction helper pour formater le temps
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

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

// Fonction helper pour obtenir les initiales
const getInitials = (name: string) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Composant DeliveryTypeBadge
const DeliveryTypeBadge = ({ type }: { type: string }) => {
  const config: Record<
    string,
    { icon: any; label: string; color: string }
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
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${color}`}
    >
      <Icon className="w-3 h-3" />
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
};

export default function OrderCard({ order, onClick, isNew = false }: OrderCardProps) {
  // Vérifier si la commande est urgente (PENDING depuis plus de 30 min)
  const isUrgent =
    order.status === 'PENDING' &&
    new Date().getTime() - new Date(order.createdAt).getTime() >
      30 * 60 * 1000;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border p-3 cursor-pointer 
        hover:shadow-md hover:border-orange-300 transition-all relative
        ${isUrgent ? 'border-red-300' : 'border-gray-200'}
      `}
    >
      {/* Badge "Nouveau" */}
      {isNew && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce z-10">
          Nouveau
        </span>
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-900">{order.orderNumber}</p>
          <p className="text-xs text-gray-500">{formatTime(order.createdAt)}</p>
        </div>

        {/* Badge type livraison */}
        <DeliveryTypeBadge type={order.deliveryType} />
      </div>

      {/* Client */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            {order.customer.name || 'Client'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <p className="text-xs text-gray-600">{order.customer.phone}</p>
        </div>
      </div>

      {/* Items */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <ShoppingBag className="w-4 h-4" />
          <span>
            {order.items.length} item{order.items.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Preview des items (max 2) */}
        <div className="mt-2 space-y-1">
          {order.items.slice(0, 2).map((item, index) => (
            <p key={`${item.id}-${index}`} className="text-xs text-gray-600">
              {item.quantity}× {item.menuItem.name}
            </p>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-gray-500">
              +{order.items.length - 2} autre
              {order.items.length - 2 > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Total */}
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-bold text-gray-900">
            {order.total.toFixed(2)} EGP
          </p>
        </div>

        {/* Staff assigné */}
        {order.assignedTo && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-semibold"
              title={order.assignedTo.name}
            >
              {getInitials(order.assignedTo.name)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
