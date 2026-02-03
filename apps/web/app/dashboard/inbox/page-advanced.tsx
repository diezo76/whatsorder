'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, MessageSquare, Plus, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import ConversationList, { Conversation } from '@/components/inbox/ConversationList';
import ChatArea, { Message } from '@/components/inbox/ChatArea';
import { InboxFilterBar } from '@/components/inbox/InboxFilterBar';
import { ConversationDetail } from '@/components/inbox/ConversationDetail';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useRealtimeConversations } from '@/hooks/useRealtimeConversations';
import { InboxFilters } from '@/types/inbox';

export default function InboxPageAdvanced() {
  // States principaux
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  
  // Filtres avancés
  const [filters, setFilters] = useState<InboxFilters>({
    status: 'OPEN',
    assignedTo: 'ALL',
    priority: 'ALL',
    dateRange: 'ALL',
    search: '',
    unreadOnly: false,
  });
  
  const [stats, setStats] = useState<any>(null);

  // Auth hook
  const { user } = useAuth();

  // Hook Realtime Supabase pour les conversations
  const { isConnected: conversationsConnected } = useRealtimeConversations({
    restaurantId: user?.restaurantId || '',
    onNewConversation: (conversation) => {
      console.log('🆕 New conversation received via Supabase Realtime');
      toast.success('Nouvelle conversation !');
      loadConversations();
    },
    onConversationUpdate: (conversation) => {
      console.log('✏️ Conversation updated via Supabase Realtime');
      setConversations((prev) =>
        prev
          .map((c) => (c.id === conversation.id ? { ...c, ...conversation } : c))
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          )
      );
    },
  });

  // Hook Realtime Supabase pour les messages
  const { isConnected: messagesConnected } = useRealtimeMessages({
    conversationId: selectedConversationId || '',
    onNewMessage: (realtimeMessage) => {
      console.log('🆕 New message received via Supabase Realtime');
      
      if (selectedConversationId && realtimeMessage.conversationId === selectedConversationId) {
        const mappedMessage: Message = {
          id: realtimeMessage.id,
          content: realtimeMessage.content || '',
          direction: realtimeMessage.sender === 'CUSTOMER' ? 'inbound' : 'outbound',
          type: realtimeMessage.type === 'IMAGE' || realtimeMessage.type === 'VIDEO' ? 'image' : 
                realtimeMessage.type === 'DOCUMENT' ? 'document' : 'text',
          conversationId: realtimeMessage.conversationId,
          createdAt: realtimeMessage.createdAt,
          status: (realtimeMessage.isRead ? 'read' : (realtimeMessage.status || 'delivered')) as 'sent' | 'delivered' | 'read' | 'failed',
          mediaUrl: realtimeMessage.attachments?.[0] || realtimeMessage.mediaUrl || null,
        };
        
        setMessages((prev) => [...prev, mappedMessage]);

        // Son notification pour messages entrants
        if (mappedMessage.direction === 'inbound') {
          try {
            const audio = new Audio('/sounds/message.mp3');
            audio.play().catch(() => console.log('🔇 Audio blocked'));
          } catch (error) {
            console.log('🔇 Audio not available:', error);
          }
        }

        // Scroll vers le bas
        setTimeout(() => {
          const chatContainer = document.getElementById('chat-messages');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);

        // Met à jour la conversation dans la liste
        setConversations((prev) =>
          prev
            .map((conv) =>
              conv.id === mappedMessage.conversationId
                ? {
                    ...conv,
                    lastMessage: {
                      id: mappedMessage.id,
                      content: mappedMessage.content,
                      createdAt: mappedMessage.createdAt,
                      direction: mappedMessage.direction,
                    },
                    lastMessageAt: mappedMessage.createdAt,
                    unreadCount:
                      mappedMessage.direction === 'inbound' && conv.id !== selectedConversationId
                        ? conv.unreadCount + 1
                        : conv.unreadCount,
                  }
                : conv
            )
            .sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
            )
        );
      }
    },
  });

  // Charger les conversations avec filtres avancés
  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'ALL' && value !== false) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/conversations?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success || data.conversations) {
        const conversationsData = data.conversations || data.conversations || [];
        const sorted = conversationsData.sort(
          (a: Conversation, b: Conversation) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        setConversations(sorted);
        setStats(data.stats || null);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Charger les messages
  const loadMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const response = await api.get<{
        messages: Message[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
      }>(`/conversations/${conversationId}/messages`);

      setMessages(response.data.messages.reverse());
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error('Erreur de chargement des messages');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Fetch initial
  useEffect(() => {
    if (user?.restaurantId) {
      loadConversations();
    }
  }, [user?.restaurantId, loadConversations]);

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId, loadMessages]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+K : Focus recherche
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.getElementById('inbox-search')?.focus();
      }
      
      // N : Nouvelle conversation (si pas dans un input)
      if (e.key === 'n' && !e.ctrlKey && !e.altKey && e.target === document.body) {
        // TODO: Ouvrir modal nouvelle conversation
        toast('Fonctionnalité à venir', { icon: 'ℹ️' });
      }
      
      // C : Fermer conversation sélectionnée
      if (e.key === 'c' && selectedConversationId && e.target === document.body) {
        handleCloseConversation(selectedConversationId);
      }
      
      // A : Assigner conversation
      if (e.key === 'a' && selectedConversationId && e.target === document.body) {
        // TODO: Ouvrir modal assignation
        toast('Utilisez le bouton "Assigner" dans le détail de la conversation', { icon: 'ℹ️' });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedConversationId]);

  const handleSelectConversation = useCallback(
    async (conversation: Conversation) => {
      setSelectedConversationId(conversation.id);

      // Marque comme lu via API si messages non lus
      if (conversation.unreadCount > 0) {
        try {
          await fetch(`/api/conversations/${conversation.id}/read`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });

          setConversations((prev) =>
            prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
          );
        } catch (error: any) {
          console.error('Error marking as read:', error);
        }
      }
    },
    []
  );

  const handleCloseConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CLOSED' }),
      });
      
      toast.success('Conversation fermée');
      loadConversations();
      if (selectedConversationId === id) {
        setSelectedConversationId(null);
      }
    } catch (error) {
      console.error('Failed to close conversation:', error);
      toast.error('Erreur lors de la fermeture');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold">Inbox WhatsApp</h1>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              conversationsConnected || messagesConnected
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                conversationsConnected || messagesConnected
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
              }`} />
              {(conversationsConnected || messagesConnected)
                ? 'Temps réel actif' 
                : 'Mode REST'}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              <Plus size={16} />
              Nouveau message
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="inbox-search"
            type="text"
            placeholder="Rechercher par nom, téléphone... (Ctrl+K)"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Filtres avancés */}
      <InboxFilterBar
        filters={filters}
        stats={stats}
        onChange={setFilters}
      />

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Liste des conversations */}
        <div className="w-96 border-r bg-white overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <MessageSquare size={48} className="mb-4 text-gray-300" />
              <p className="text-center">Aucune conversation</p>
              <p className="text-sm text-center mt-2">
                {filters.search || filters.status !== 'ALL' 
                  ? 'Aucune conversation ne correspond aux filtres'
                  : 'Les nouvelles conversations WhatsApp apparaîtront ici'}
              </p>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversationId}
              onSelect={handleSelectConversation}
              searchQuery={filters.search || ''}
              onSearchChange={(query) => setFilters({ ...filters, search: query })}
              filter={filters.unreadOnly ? 'unread' : 'all'}
              onFilterChange={(filter) => setFilters({ ...filters, unreadOnly: filter === 'unread' })}
            />
          )}
        </div>

        {/* Détail conversation - Utiliser ConversationDetail OU ChatArea */}
        <div className="flex-1 bg-gray-50">
          {selectedConversationId ? (
            <div className="h-full flex flex-col">
              {/* Option 1: Utiliser ConversationDetail (avec actions avancées) */}
              <div className="flex-1">
                <ConversationDetail
                  conversationId={selectedConversationId}
                  onClose={() => setSelectedConversationId(null)}
                />
              </div>
              
              {/* Option 2: Utiliser ChatArea (comportement actuel) - Décommenter pour utiliser */}
              {/* 
              <ChatArea
                conversation={selectedConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
                onToggleInfo={() => setShowCustomerInfo(!showCustomerInfo)}
                loading={messagesLoading}
                isConnected={messagesConnected}
              />
              */}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Sélectionnez une conversation</p>
                <p className="text-sm mt-2">
                  Choisissez une conversation dans la liste pour commencer
                </p>
                <div className="mt-8 space-y-2 text-left bg-white rounded-lg p-4 max-w-md mx-auto">
                  <p className="font-semibold text-sm">Raccourcis clavier :</p>
                  <div className="text-xs space-y-1 text-gray-600">
                    <p><kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+K</kbd> Rechercher</p>
                    <p><kbd className="px-2 py-1 bg-gray-100 rounded">N</kbd> Nouveau message</p>
                    <p><kbd className="px-2 py-1 bg-gray-100 rounded">C</kbd> Fermer conversation</p>
                    <p><kbd className="px-2 py-1 bg-gray-100 rounded">A</kbd> Assigner</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
