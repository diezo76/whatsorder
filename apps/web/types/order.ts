// types/order.ts
// Source unique de vérité pour tous les types liés aux commandes

// === Types enum partagés ===
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type DeliveryType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';

export type PaymentMethod = 'CASH' | 'CARD' | 'STRIPE' | 'PAYPAL';

// === Customisation d'un item ===
export interface OrderItemCustomization {
  variant?: string | null;
  modifiers?: string[];
  notes?: string | null;
}

// === Item de commande ===
export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  name?: string;
  notes?: string;
  customization?: OrderItemCustomization;
  menuItem: {
    id: string;
    name: string;
    nameAr?: string;
    price: number;
    image?: string;
  };
  variant?: {
    id: string;
    name: string;
    nameAr?: string;
    price: number;
  } | null;
  selectedOptions?: Array<{
    id: string;
    optionId: string;
    priceModifier: number;
    option?: {
      id: string;
      name: string;
      nameAr?: string;
      priceModifier: number;
    };
  }>;
}

// === Client ===
export interface OrderCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

// === Staff assigné ===
export interface OrderAssignee {
  id: string;
  name: string;
  avatar?: string;
}

// === Commande complète ===
export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customer: OrderCustomer;
  items: OrderItem[];
  total: number;
  subtotal: number;
  discount?: number;
  deliveryType: string;
  deliveryAddress?: string;
  deliveryFee?: number;
  deliveryZone?: string;
  customerNotes?: string;
  scheduledTime?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: OrderAssignee | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
}

// === Input pour créer une commande (API publique) ===
export interface OrderItemInput {
  menuItemId: string;
  quantity: number;
  unitPrice?: number;
  customization?: OrderItemCustomization;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  deliveryZone?: string;
  scheduledTime?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}
