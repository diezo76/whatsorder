'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import OrderCard from './OrderCard';
import type { Order } from '@/types/order';

interface SortableOrderCardProps {
  order: Order;
  onClick: () => void;
  isAnimating?: boolean;
  isNew?: boolean;
}

export default function SortableOrderCard({
  order,
  onClick,
  isAnimating = false,
  isNew = false,
}: SortableOrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${
        isAnimating ? 'ring-2 ring-orange-400 animate-pulse' : ''
      } relative`}
    >
      <OrderCard order={order} onClick={onClick} isNew={isNew} />
    </div>
  );
}
