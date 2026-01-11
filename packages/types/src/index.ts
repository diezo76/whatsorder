// Types partagés entre frontend et backend

export type UserRole = 'OWNER' | 'STAFF' | 'CUSTOMER';
export type StaffRole = 'MANAGER' | 'STAFF' | 'DELIVERY';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'ONLINE' | 'CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type MessageDirection = 'INBOUND' | 'OUTBOUND';
export type MessageType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CONTACT' | 'TEMPLATE';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
export type ExecutionStatus = 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
