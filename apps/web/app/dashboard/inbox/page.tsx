'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import ConversationList, { Conversation } from '@/components/inbox/ConversationList';
import ChatArea, { Message } from '@/components/inbox/ChatArea';
import CustomerInfo from '@/components/inbox/CustomerInfo';
import { useSocket } from '@/hooks/useSocket';

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

  // Socket.io hook
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    onNewMessage,
    offNewMessage,
    onConversationUpdated,
    offConversationUpdated,
    markAsRead,
    emitTyping: _emitTyping, // TODO: Utiliser pour typing indicator
  } = useSocket();

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
    const fetchConversations = async () => {
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
    };

    fetchConversations();
  }, []);

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

    if (!isConnected) {
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
    isConnected,
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
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Colonne gauche : Liste des conversations */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedConversation?.id || null}
        onSelect={handleSelectConversation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Colonne centrale : Zone de chat */}
      <ChatArea
        conversation={selectedConversation}
        messages={messages}
        onSendMessage={handleSendMessage}
        onToggleInfo={() => setShowCustomerInfo(!showCustomerInfo)}
        loading={messagesLoading}
        isConnected={isConnected}
      />

      {/* Colonne droite : Infos client + notes (conditionnelle) */}
      {showCustomerInfo && selectedConversation && (
        <CustomerInfo conversation={selectedConversation} onClose={() => setShowCustomerInfo(false)} />
      )}
    </div>
  );
}
