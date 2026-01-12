'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import ConversationList, { Conversation } from '@/components/inbox/ConversationList';
import ChatArea, { Message } from '@/components/inbox/ChatArea';
import CustomerInfo from '@/components/inbox/CustomerInfo';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useRealtimeConversations } from '@/hooks/useRealtimeConversations';

type FilterType = 'all' | 'unread' | 'archived';

export default function InboxPage() {
  // States principaux
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Auth hook pour obtenir restaurantId
  const { user } = useAuth();

  // Socket.io hook (gardé pour compatibilité)
  const {
    isConnected: socketConnected,
    joinConversation,
    leaveConversation,
    onNewMessage,
    offNewMessage,
    onConversationUpdated,
    offConversationUpdated,
    markAsRead,
    emitTyping: _emitTyping, // TODO: Utiliser pour typing indicator
  } = useSocket();

  // Hook Realtime Supabase pour les conversations
  const { isConnected: conversationsConnected } = useRealtimeConversations({
    restaurantId: user?.restaurantId || '',
    onNewConversation: (conversation) => {
      console.log('🆕 New conversation received via Supabase Realtime');
      toast.success('Nouvelle conversation !');
      // Recharger les conversations
      loadConversations();
    },
    onConversationUpdate: (conversation) => {
      console.log('✏️ Conversation updated via Supabase Realtime');
      // Mettre à jour la conversation dans la liste
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
    conversationId: selectedConversation?.id || '',
    onNewMessage: (message) => {
      console.log('🆕 New message received via Supabase Realtime');
      
      // Si c'est pour la conversation active, ajoute à messages
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages((prev) => [...prev, message]);

        // Son notification pour messages entrants
        if (message.direction === 'inbound') {
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
      }

      // Met à jour la conversation dans la liste (lastMessage)
      setConversations((prev) =>
        prev
          .map((conv) =>
            conv.id === message.conversationId
              ? {
                  ...conv,
                  lastMessage: {
                    id: message.id,
                    content: message.content,
                    createdAt: message.createdAt,
                    direction: message.direction,
                  },
                  lastMessageAt: message.createdAt,
                  unreadCount:
                    message.direction === 'inbound' && conv.id !== selectedConversation?.id
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
    },
    onMessageUpdate: (message) => {
      console.log('✏️ Message updated via Supabase Realtime (read status)');
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? message : m))
      );
    },
  });

  // Fonction pour charger les conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await api.get<{
        conversations: Conversation[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
      }>('/conversations');

      // Trier par lastMessageAt DESC (plus récentes en premier)
      const sorted = response.data.conversations.sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      setConversations(sorted);
    } catch (error: any) {
      console.error('Erreur lors du chargement des conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    }
  }, []);

  // Fonction pour charger les messages
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

      // Reverse car API retourne DESC (plus récents d'abord)
      setMessages(response.data.messages.reverse());
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error('Erreur de chargement des messages');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Fetch initial des conversations
  useEffect(() => {
    if (user?.restaurantId) {
      loadConversations();
    }
  }, [user?.restaurantId, loadConversations]);

  // Fonction pour sélectionner une conversation
  const handleSelectConversation = useCallback(
    async (conversation: Conversation) => {
      setSelectedConversation(conversation);

      // Marque comme lu via API si messages non lus
      if (conversation.unreadCount > 0) {
        try {
          await api.patch(`/conversations/${conversation.id}/mark-read`);

          // Met à jour localement
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

  // Rejoindre/quitter la conversation via Socket.io et charger les messages
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    if (!socketConnected && !messagesConnected) {
      // Charge les messages même si pas connecté
      loadMessages(selectedConversation.id);
      return;
    }

    // Rejoint la conversation
    joinConversation(selectedConversation.id);

    // Charge les messages
    loadMessages(selectedConversation.id);

    // Marque comme lu via Socket.io
    markAsRead(selectedConversation.id);

    return () => {
      leaveConversation(selectedConversation.id);
    };
  }, [
    selectedConversation,
    socketConnected,
    messagesConnected,
    joinConversation,
    leaveConversation,
    markAsRead,
    loadMessages,
  ]);

  // Écouter les nouveaux messages (temps réel)
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      console.log('New message received:', message);

      // Si c'est pour la conversation active, ajoute à messages
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages((prev) => [...prev, message]);
      }

      // Met à jour la conversation dans la liste (lastMessage)
      setConversations((prev) =>
        prev
          .map((conv) =>
            conv.id === message.conversationId
              ? {
                  ...conv,
                  lastMessage: {
                    id: message.id,
                    content: message.content,
                    createdAt: message.createdAt,
                    direction: message.direction,
                  },
                  lastMessageAt: message.createdAt,
                  unreadCount:
                    message.direction === 'inbound' && conv.id !== selectedConversation?.id
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
    };

    onNewMessage(handleNewMessage);

    return () => {
      offNewMessage();
    };
  }, [selectedConversation, onNewMessage, offNewMessage]);

  // Écouter conversation_updated (pour refresh sidebar)
  useEffect(() => {
    const handleConversationUpdated = (data: {
      conversationId: string;
      lastMessage?: Message;
    }) => {
      console.log('Conversation updated:', data);

      // Met à jour localement la conversation
      setConversations((prev) =>
        prev
          .map((conv) =>
            conv.id === data.conversationId
              ? {
                  ...conv,
                  lastMessage: data.lastMessage
                    ? {
                        id: data.lastMessage.id,
                        content: data.lastMessage.content,
                        createdAt: data.lastMessage.createdAt,
                        direction: data.lastMessage.direction,
                      }
                    : conv.lastMessage,
                  lastMessageAt: data.lastMessage?.createdAt || conv.lastMessageAt,
                }
              : conv
          )
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          )
      );
    };

    onConversationUpdated(handleConversationUpdated);

    return () => {
      offConversationUpdated();
    };
  }, [onConversationUpdated, offConversationUpdated]);

  // Fonction pour envoyer un message
  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    try {
      const response = await api.post(`/conversations/${selectedConversation.id}/messages`, {
        content,
        type: 'text',
      });

      // Le message sera ajouté via Socket.io event 'new_message'
      // Pas besoin de l'ajouter manuellement ici
      // Mais on peut l'ajouter immédiatement pour un feedback instantané
      setMessages((prev) => [...prev, response.data.message]);

      return response.data.message;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error("Erreur lors de l'envoi");
      throw error;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-gray-50 overflow-hidden">
      {/* Mobile: Liste OU Chat (pas les deux) */}
      {/* Desktop: Les deux côte à côte */}
      
      {/* Colonne gauche : Liste des conversations */}
      <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-80 flex-shrink-0`}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id || null}
          onSelect={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
        />
      </div>

      {/* Colonne centrale : Zone de chat */}
      <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {/* Bouton retour sur mobile */}
        {selectedConversation && (
          <button
            onClick={() => setSelectedConversation(null)}
            className="md:hidden flex items-center gap-2 p-3 bg-white border-b text-slate-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Retour</span>
          </button>
        )}
        <ChatArea
          conversation={selectedConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onToggleInfo={() => setShowCustomerInfo(!showCustomerInfo)}
          loading={messagesLoading}
          isConnected={socketConnected || messagesConnected}
        />
      </div>

      {/* Colonne droite : Infos client + notes (conditionnelle) - Desktop only */}
      {showCustomerInfo && selectedConversation && (
        <div className="hidden md:block">
          <CustomerInfo conversation={selectedConversation} onClose={() => setShowCustomerInfo(false)} />
        </div>
      )}
    </div>
  );
}
