'use client';

import {
  User,
  Phone,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { Order } from '@/types/order';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  isNew?: boolean;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const getInitials = (name: string) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const DeliveryTypeBadge = ({ type }: { type: string }) => {
  const config: Record<string, { icon: any; label: string; color: string }> = {
    DELIVERY: { icon: Truck, label: 'Livraison', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    PICKUP: { icon: ShoppingBag, label: 'A emporter', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    DINE_IN: { icon: UtensilsCrossed, label: 'Sur place', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  };
  const { icon: Icon, label, color } = config[type] || config.DELIVERY;
  return (
    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${color}`}>
      <Icon className="w-2.5 h-2.5" />
      <span>{label}</span>
    </div>
  );
};

export default function OrderCard({ order, onClick, isNew = false }: OrderCardProps) {
  const isUrgent =
    order.status === 'PENDING' &&
    new Date().getTime() - new Date(order.createdAt).getTime() > 20 * 60 * 1000;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border p-3 cursor-pointer
        transition-all duration-200 relative
        hover:shadow-md hover:-translate-y-0.5
        ${isUrgent ? 'border-red-200 bg-red-50/30' : 'border-[#e5e5e5] hover:border-[#d4d4d4]'}
      `}
    >
      {isNew && (
        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-[#3b82f6] text-white text-[8px] font-bold rounded-full ring-2 ring-white animate-pulse z-10">
          !
        </span>
      )}

      {isUrgent && (
        <div className="flex items-center gap-1 px-2 py-1 mb-2 rounded-md bg-red-50 border border-red-100">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span className="text-[10px] font-medium text-red-600">Urgent - En attente depuis {formatTime(order.createdAt)}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <p className="text-[13px] font-semibold text-[#0a0a0a]">{order.orderNumber}</p>
          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#a3a3a3]">
            <Clock className="w-3 h-3" />
            {formatTime(order.createdAt)}
          </div>
        </div>
        <DeliveryTypeBadge type={order.deliveryType} />
      </div>

      {/* Client */}
      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#f5f5f5] text-[10px] font-semibold text-[#737373]">
          {getInitials(order.customer.name || 'C')}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#0a0a0a] truncate">
            {order.customer.name || 'Client'}
          </p>
          <p className="text-[11px] text-[#a3a3a3] truncate">{order.customer.phone}</p>
        </div>
      </div>

      {/* Items preview */}
      <div className="mb-2.5 py-2 border-t border-b border-[#f5f5f5]">
        <div className="space-y-1">
          {order.items.slice(0, 2).map((item, index) => (
            <p key={`${item.id}-${index}`} className="text-[11px] text-[#737373]">
              <span className="text-[#0a0a0a] font-medium">{item.quantity}x</span> {item.menuItem.name}
            </p>
          ))}
          {order.items.length > 2 && (
            <p className="text-[11px] text-[#a3a3a3]">
              +{order.items.length - 2} autre{order.items.length - 2 > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-[#0a0a0a]">
          {order.total.toFixed(2)} EGP
        </p>
        {order.assignedTo && (
          <div
            className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#a855f7] text-white text-[9px] font-semibold"
            title={order.assignedTo.name}
          >
            {getInitials(order.assignedTo.name)}
          </div>
        )}
      </div>
    </div>
  );
}
