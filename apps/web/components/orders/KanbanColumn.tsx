'use client';

import { Package } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableOrderCard from './SortableOrderCard';
import type { Order } from '@/types/order';

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

const getColumnStyle = (color: string, isOver: boolean) => {
  const styles: Record<string, { header: string; border: string; count: string }> = {
    gray: { header: 'text-[#737373]', border: 'border-[#e5e5e5]', count: 'bg-[#f5f5f5] text-[#737373]' },
    blue: { header: 'text-blue-600', border: 'border-blue-100', count: 'bg-blue-50 text-blue-600' },
    yellow: { header: 'text-amber-600', border: 'border-amber-100', count: 'bg-amber-50 text-amber-600' },
    green: { header: 'text-emerald-600', border: 'border-emerald-100', count: 'bg-emerald-50 text-emerald-600' },
    purple: { header: 'text-purple-600', border: 'border-purple-100', count: 'bg-purple-50 text-purple-600' },
    red: { header: 'text-red-600', border: 'border-red-100', count: 'bg-red-50 text-red-600' },
  };
  return styles[color] || styles.gray;
};

export default function KanbanColumn({
  column,
  orders,
  onOrderClick,
  animatingOrders = new Set(),
  newOrders = new Set(),
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const style = getColumnStyle(column.color, isOver);

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-[#fafafa] rounded-xl border transition-all duration-200
        ${isOver ? 'border-[#3b82f6] bg-blue-50/30 ring-1 ring-[#3b82f6]/20' : 'border-[#e5e5e5]'}
        w-72 md:w-80 flex-shrink-0
      `}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e5e5e5]">
        <div className="flex items-center justify-between">
          <h3 className={`text-[13px] font-semibold ${style.header}`}>
            {column.title}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${style.count}`}>
            {orders.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div
        className="p-2.5 space-y-2.5 max-h-[calc(100vh-260px)] overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d4 transparent' }}
      >
        <SortableContext
          items={orders.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#d4d4d4]">
              <Package className="w-8 h-8 mb-2" />
              <p className="text-[12px]">Aucune commande</p>
            </div>
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
    </div>
  );
}
