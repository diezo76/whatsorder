'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import OrderCard from './OrderCard';

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
