export type ConversationStatus = 'OPEN' | 'CLOSED' | 'RESOLVED' | 'SPAM';
export type ConversationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LOCATION' | 'ORDER_LINK' | 'TEMPLATE';
export type BroadcastStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';
export type MessageSender = 'CUSTOMER' | 'STAFF' | 'SYSTEM';

export interface ConversationWithDetails {
  id: string;
  customerPhone: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  isUnread: boolean;
  lastMessageAt: Date;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  messages: Array<{
    id: string;
    content: string;
    sender: MessageSender;
    type: MessageType;
    isRead: boolean;
    createdAt: Date;
  }>;
  tags: string[];
  internalNotes?: string;
  _count: {
    messages: number;
  };
}

export interface InboxFilters {
  status?: ConversationStatus | 'ALL';
  assignedTo?: string | 'UNASSIGNED' | 'ME' | 'ALL';
  priority?: ConversationPriority | 'ALL';
  dateRange?: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';
  search?: string;
  tags?: string[];
  unreadOnly?: boolean;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  contentAr?: string;
  variables: string[];
  usageCount: number;
}

export interface BroadcastWithStats {
  id: string;
  name: string;
  message: string;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  status: BroadcastStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  createdBy: {
    id: string;
    name: string;
  };
}
