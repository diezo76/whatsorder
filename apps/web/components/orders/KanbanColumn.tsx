'use client';

import { Package } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableOrderCard from './SortableOrderCard';

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

interface KanbanColumnProps {
  column: Column;
  orders: Order[];
  onOrderClick: (order: Order) => void;
  animatingOrders?: Set<string>;
  newOrders?: Set<string>;
}

// Helper functions pour les couleurs
const getBorderColor = (color: string) => {
  const colors: Record<string, string> = {
    gray: 'border-gray-300',
    blue: 'border-blue-300',
    yellow: 'border-yellow-300',
    green: 'border-green-300',
    purple: 'border-purple-300',
    red: 'border-red-300',
  };
  return colors[color] || 'border-gray-300';
};

const getCountBadgeColor = (color: string) => {
  const colors: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    red: 'bg-red-100 text-red-700',
  };
  return colors[color] || 'bg-gray-100 text-gray-700';
};

// Empty State Component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
    <Package className="w-12 h-12 mb-2" />
    <p className="text-sm">Aucune commande</p>
  </div>
);


export default function KanbanColumn({
  column,
  orders,
  onOrderClick,
  animatingOrders = new Set(),
  newOrders = new Set(),
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-white rounded-lg shadow-sm border-2 
        ${getBorderColor(column.color)}
        ${isOver ? 'ring-2 ring-orange-400 ring-offset-2' : ''}
        hover:shadow-md transition-all
        w-80 flex-shrink-0
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">
            {column.title}
          </h3>
          <span
            className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${getCountBadgeColor(column.color)}
            `}
          >
            {orders.length}
          </span>
        </div>
      </div>

      {/* Body scrollable */}
      <div
        className="p-3 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto kanban-column"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f3f4f6',
        }}
      >
        <SortableContext
          items={orders.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {orders.length === 0 ? (
            <EmptyState />
          ) : (
            orders.map((order) => (
              <SortableOrderCard
                key={order.id}
                order={order}
                onClick={() => onOrderClick(order)}
                isAnimating={animatingOrders.has(order.id)}
                isNew={newOrders.has(order.id)}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .kanban-column::-webkit-scrollbar {
          width: 6px;
        }
        .kanban-column::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .kanban-column::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .kanban-column::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
