'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, MessageSquare, Plus } from 'lucide-react';
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

  // Fonction pour charger les conversations (définie avant les hooks qui l'utilisent)
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
    onNewMessage: (realtimeMessage) => {
      console.log('🆕 New message received via Supabase Realtime');
      
      // Si c'est pour la conversation active, ajoute à messages
      if (selectedConversation && realtimeMessage.conversationId === selectedConversation.id) {
        // Mapper le message du hook vers le format attendu par ChatArea
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

        // Met à jour la conversation dans la liste (lastMessage)
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
                      mappedMessage.direction === 'inbound' && conv.id !== selectedConversation?.id
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
    onMessageUpdate: (realtimeMessage) => {
      console.log('✏️ Message updated via Supabase Realtime (read status)');
      // Mapper le message du hook vers le format attendu par ChatArea
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
      setMessages((prev) =>
        prev.map((m) => (m.id === mappedMessage.id ? mappedMessage : m))
      );
    },
  });

  // Fetch initial des conversations
  useEffect(() => {
    if (user?.restaurantId) {
      loadConversations();
    }
  }, [user?.restaurantId, loadConversations]);

  // Fonction pour mapper les messages de la DB vers le format ChatArea
  const mapMessageToChatFormat = (dbMessage: any): Message => {
    console.log('🔄 Mapping message RAW:', JSON.stringify(dbMessage, null, 2));
    
    // Vérifier que le message a les champs requis
    if (!dbMessage.id) {
      console.error('❌ Message sans ID:', dbMessage);
      throw new Error('Message invalide: pas d\'ID');
    }
    
    // Mapper sender (CUSTOMER/STAFF/SYSTEM) vers direction (inbound/outbound)
    let directionFromSender = 'outbound';
    if (dbMessage.sender === 'CUSTOMER') {
      directionFromSender = 'inbound';
    } else if (dbMessage.sender === 'STAFF' || dbMessage.sender === 'SYSTEM') {
      directionFromSender = 'outbound';
    }
    
    // Utiliser direction si disponible (pour compatibilité), sinon mapper depuis sender
    const finalDirection = dbMessage.direction || directionFromSender;
    
    // Normaliser direction
    const normalizedDirection = finalDirection === 'inbound' || finalDirection === 'INBOUND' ? 'inbound' : 'outbound';
    
    // Mapper type (TEXT/IMAGE/VIDEO/etc.) vers type (text/image/document)
    let type: 'text' | 'image' | 'document' = 'text';
    const messageType = dbMessage.type?.toUpperCase() || 'TEXT';
    if (messageType === 'IMAGE' || messageType === 'VIDEO') {
      type = 'image';
    } else if (messageType === 'DOCUMENT') {
      type = 'document';
    }
    
    // Mapper status (peut être null)
    const status = (dbMessage.status || 'sent').toLowerCase();
    
    // Vérifier que le contenu existe
    const content = dbMessage.content || '';
    if (!content || content.trim() === '') {
      console.warn('⚠️ Message sans contenu:', {
        id: dbMessage.id,
        type: dbMessage.type,
        sender: dbMessage.sender,
        content: dbMessage.content,
      });
    }
    
    // Convertir createdAt en string si c'est un Date
    let createdAtStr = dbMessage.createdAt;
    if (createdAtStr instanceof Date) {
      createdAtStr = createdAtStr.toISOString();
    } else if (typeof createdAtStr === 'string') {
      // Déjà une string, on la garde
    } else {
      createdAtStr = new Date().toISOString();
      console.warn('⚠️ createdAt invalide, utilisation de maintenant:', dbMessage.createdAt);
    }
    
    const mapped: Message = {
      id: String(dbMessage.id),
      content: String(content),
      direction: normalizedDirection,
      type,
      conversationId: String(dbMessage.conversationId),
      createdAt: createdAtStr,
      status: (status === 'read' ? 'read' : status === 'delivered' ? 'delivered' : status === 'failed' ? 'failed' : 'sent') as 'sent' | 'delivered' | 'read' | 'failed',
      mediaUrl: dbMessage.mediaUrl ? String(dbMessage.mediaUrl) : null,
    };
    
    console.log('✅ Message mappé:', JSON.stringify(mapped, null, 2));
    return mapped;
  };

  // Fonction pour sélectionner une conversation
  const handleSelectConversation = useCallback(
    async (conversation: Conversation) => {
      setSelectedConversation(conversation);

      // Marque comme lu via API si messages non lus
      if (conversation.unreadCount > 0) {
        try {
          await api.put(`/conversations/${conversation.id}/read`);

          // Met à jour localement
          setConversations((prev) =>
            prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
          );
        } catch (error: any) {
          console.error('Error marking as read:', error);
          // Ne pas bloquer la sélection de conversation si l'erreur survient
        }
      }
    },
    []
  );

  // Fonction pour charger les messages
  const loadMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const response = await api.get<{
        messages: any[];
        total?: number;
        page?: number;
        limit?: number;
        hasMore?: boolean;
        success?: boolean;
      }>(`/conversations/${conversationId}/messages`);

      // Mapper les messages de la DB vers le format ChatArea
      const rawMessages = response.data.messages || [];
      console.log('📨 Messages bruts reçus:', rawMessages.length, rawMessages);
      
      const mappedMessages = rawMessages.map(mapMessageToChatFormat);
      console.log('📨 Messages mappés:', mappedMessages.length, mappedMessages);
      
      // Les messages sont déjà triés par createdAt ASC, on les garde dans cet ordre
      setMessages(mappedMessages);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error('Erreur de chargement des messages');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

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

    // Marque comme lu via API REST
    if (selectedConversation.unreadCount > 0) {
      api.put(`/conversations/${selectedConversation.id}/read`).catch((err) => {
        console.warn('Erreur marquage lu (non bloquant):', err);
      });
    }

    // Marque aussi via Socket.io si disponible
    if (socketConnected) {
      markAsRead(selectedConversation.id);
    }

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

      // Mapper le message retourné par l'API vers le format ChatArea
      const dbMessage = response.data.message;
      const mappedMessage = mapMessageToChatFormat(dbMessage);
      
      console.log('📤 Message envoyé, ajout à l\'état local:', mappedMessage);

      // Ajouter immédiatement à l'état local pour un feedback instantané
      setMessages((prev) => {
        // Vérifier qu'il n'est pas déjà présent (éviter les doublons)
        if (prev.some(m => m.id === mappedMessage.id)) {
          return prev;
        }
        return [...prev, mappedMessage];
      });

      // Mettre à jour la conversation dans la liste (lastMessage)
      setConversations((prev) =>
        prev
          .map((conv) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  lastMessage: {
                    id: mappedMessage.id,
                    content: mappedMessage.content,
                    createdAt: mappedMessage.createdAt,
                    direction: mappedMessage.direction,
                  },
                  lastMessageAt: mappedMessage.createdAt,
                }
              : conv
          )
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          )
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error("Erreur lors de l'envoi");
      throw error;
    }
  };

  // Fonction pour fermer une conversation
  const handleCloseConversation = useCallback(async (id: string) => {
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
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Failed to close conversation:', error);
      toast.error('Erreur lors de la fermeture');
    }
  }, [selectedConversation, loadConversations]);

  // Debug: Log l'état des connexions
  useEffect(() => {
    console.log('🔌 État des connexions:', {
      socketConnected,
      conversationsConnected,
      messagesConnected,
      total: socketConnected || conversationsConnected || messagesConnected,
    });
  }, [socketConnected, conversationsConnected, messagesConnected]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+K : Focus recherche
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.getElementById('inbox-search')?.focus();
      }
      
      // C : Fermer conversation sélectionnée
      if (e.key === 'c' && selectedConversation && e.target === document.body && !e.ctrlKey) {
        handleCloseConversation(selectedConversation.id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedConversation, handleCloseConversation]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header avec recherche */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold">Inbox WhatsApp</h1>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              (socketConnected || conversationsConnected || messagesConnected) 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                (socketConnected || conversationsConnected || messagesConnected) 
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
              }`} />
              {(socketConnected || conversationsConnected || messagesConnected) 
                ? '🟢 Temps réel actif' 
                : '🔵 Mode REST (API fonctionnelle)'}
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="inbox-search"
            type="text"
            placeholder="Rechercher par nom, téléphone... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>


      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Colonne gauche : Liste des conversations */}
        <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-80 flex-shrink-0 border-r bg-white overflow-y-auto`}>
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
          {selectedConversation ? (
            <>
              {/* Bouton retour sur mobile */}
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden flex items-center gap-2 p-3 bg-white border-b text-slate-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour</span>
              </button>
              <ChatArea
                conversation={selectedConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
                onToggleInfo={() => setShowCustomerInfo(!showCustomerInfo)}
                loading={messagesLoading}
                isConnected={socketConnected || messagesConnected}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Sélectionnez une conversation</p>
                <p className="text-sm mt-2">Choisissez une conversation dans la liste pour commencer</p>
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite : Infos client + notes (conditionnelle) - Desktop only */}
        {showCustomerInfo && selectedConversation && (
          <div className="hidden md:block">
            <CustomerInfo conversation={selectedConversation} onClose={() => setShowCustomerInfo(false)} />
          </div>
        )}
      </div>
    </div>
  );
}