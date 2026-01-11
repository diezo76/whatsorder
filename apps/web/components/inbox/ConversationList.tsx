'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, MessageSquare, ArrowDown, ArrowUp, Archive } from 'lucide-react';

// Interfaces TypeScript
export interface Conversation {
  id: string;
  customer: {
    id: string;
    name: string | null;
    phone: string;
    email?: string | null;
    address?: string | null;
    avatar?: string | null;
    totalOrders?: number;
    totalSpent?: number;
    createdAt?: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    direction: 'inbound' | 'outbound';
  } | null;
  unreadCount: number;
  lastMessageAt: string;
  isActive: boolean;
  whatsappPhone: string;
  createdAt: string;
  updatedAt: string;
}

type FilterType = 'all' | 'unread' | 'archived';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

// Fonction pour formater le timestamp
const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'À l\'instant';
  } else if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} min`;
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours}h`;
  } else if (diffInDays === 1) {
    return 'Hier';
  } else if (diffInDays < 7) {
    return `Il y a ${diffInDays}j`;
  } else {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
};

// Composant ConversationItem
function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const displayName = conversation.customer.name || conversation.customer.phone;
  const initials = conversation.customer.name
    ? conversation.customer.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : conversation.customer.phone.slice(-2);

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 cursor-pointer transition-colors
        ${isSelected ? 'bg-orange-50 border-l-4 border-orange-600' : 'hover:bg-gray-50'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
            {conversation.customer.avatar ? (
              <img
                src={conversation.customer.avatar}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          {/* Badge unread count */}
          {conversation.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-slate-900 truncate">{displayName}</h3>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatTimestamp(conversation.lastMessageAt)}
            </span>
          </div>

          {conversation.lastMessage ? (
            <div className="flex items-center gap-2">
              {/* Indicateur direction */}
              {conversation.lastMessage.direction === 'inbound' ? (
                <ArrowDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
              ) : (
                <ArrowUp className="w-3 h-3 text-gray-400 flex-shrink-0" />
              )}
              <p className="text-sm text-gray-600 truncate flex-1">
                {conversation.lastMessage.content}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Aucun message</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant principal ConversationList
export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
}: ConversationListProps) {
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Debounce sur la recherche (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fonction de filtrage
  const getFilteredConversations = useMemo(() => {
    let filtered = conversations;

    // Filtre par type
    if (filter === 'unread') {
      filtered = filtered.filter((c) => c.unreadCount > 0);
    } else if (filter === 'archived') {
      filtered = filtered.filter((c) => !c.isActive);
    } else {
      filtered = filtered.filter((c) => c.isActive);
    }

    // Filtre par recherche
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.customer.name?.toLowerCase().includes(query) ||
          c.customer.phone.includes(query)
      );
    }

    return filtered;
  }, [conversations, filter, debouncedSearchQuery]);

  // Compteurs pour les filtres
  const counts = useMemo(() => {
    const all = conversations.filter((c) => c.isActive).length;
    const unread = conversations.filter((c) => c.unreadCount > 0 && c.isActive).length;
    const archived = conversations.filter((c) => !c.isActive).length;
    return { all, unread, archived };
  }, [conversations]);

  return (
    <div className="w-80 bg-white border-r flex flex-col h-full">
      {/* Header fixe */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Messages</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {conversations.length}
          </span>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Filtres (tabs horizontaux) */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => onFilterChange('all')}
            className={`
              px-3 py-2 text-sm font-medium transition-colors relative
              ${
                filter === 'all'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Tous
            {counts.all > 0 && (
              <span className="ml-1 text-xs text-gray-500">({counts.all})</span>
            )}
          </button>
          <button
            onClick={() => onFilterChange('unread')}
            className={`
              px-3 py-2 text-sm font-medium transition-colors relative
              ${
                filter === 'unread'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Non lus
            {counts.unread > 0 && (
              <span className="ml-1 text-xs text-gray-500">({counts.unread})</span>
            )}
          </button>
          <button
            onClick={() => onFilterChange('archived')}
            className={`
              px-3 py-2 text-sm font-medium transition-colors relative
              ${
                filter === 'archived'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Archive className="w-4 h-4 inline mr-1" />
            Archivés
            {counts.archived > 0 && (
              <span className="ml-1 text-xs text-gray-500">({counts.archived})</span>
            )}
          </button>
        </div>
      </div>

      {/* Liste scrollable des conversations */}
      <div className="flex-1 overflow-y-auto">
        {getFilteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-1">Aucune conversation trouvée</p>
            <p className="text-sm text-gray-400">
              {debouncedSearchQuery
                ? 'Essayez avec d\'autres mots-clés'
                : filter === 'archived'
                ? 'Aucune conversation archivée'
                : filter === 'unread'
                ? 'Toutes les conversations sont lues'
                : 'Aucune conversation'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {getFilteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedId === conversation.id}
                onClick={() => onSelect(conversation)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
