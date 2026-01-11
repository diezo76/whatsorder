'use client';

import { useState, useRef, useEffect } from 'react';
import { Info, Send, Loader2, MessageSquare, Archive, MoreVertical, Sparkles, AlertTriangle } from 'lucide-react';
import { Conversation } from './ConversationList';
import MessageBubble from './MessageBubble';
import OrderPreviewModal, { ParsedOrder } from './OrderPreviewModal';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

// Interface Message
export interface Message {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'document';
  conversationId: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  mediaUrl?: string | null;
}

// Réexport des types depuis OrderPreviewModal pour compatibilité
export type { ParsedOrder, ParsedMenuItem } from './OrderPreviewModal';

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onToggleInfo: () => void;
  loading: boolean;
  isConnected?: boolean;
}

// Fonction pour obtenir les initiales
const getInitials = (name: string | null): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function ChatArea({
  conversation,
  messages,
  onSendMessage,
  onToggleInfo,
  loading,
  isConnected = false,
}: ChatAreaProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [parsingAI, setParsingAI] = useState(false);
  const [showOrderPreview, setShowOrderPreview] = useState(false);
  const [parsedOrder, setParsedOrder] = useState<ParsedOrder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll vers le bas quand nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 128; // ~5 lignes (32px * 4)
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending || !conversation) return;

    setSending(true);
    try {
      await onSendMessage(inputValue.trim());
      setInputValue(''); // Vide l'input après succès
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Helper pour obtenir le label du type de livraison
  const getDeliveryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DELIVERY: 'Livraison',
      PICKUP: 'À emporter',
      DINE_IN: 'Sur place'
    };
    return labels[type] || type;
  };

  // Handle parse with AI
  const handleParseWithAI = async () => {
    if (!conversation || messages.length === 0) return;
    
    setParsingAI(true);
    
    try {
      // Prend le dernier message du client (ou les X derniers)
      const clientMessages = messages
        .filter(m => m.direction === 'inbound')
        .slice(-5) // Derniers 5 messages
        .map(m => m.content)
        .join('\n');
      
      if (!clientMessages) {
        toast.error('Aucun message client à parser');
        return;
      }
      
      // Appel API pour parser
      const response = await api.post('/ai/parse-order', {
        message: clientMessages,
        conversationId: conversation.id
      });
      
      const { parsed } = response.data;
      
      // Vérifie si clarification nécessaire
      if (parsed.needsClarification) {
        toast.error(
          `Commande incomplète: ${parsed.clarificationQuestions?.[0] || 'Informations manquantes'}`
        );
      }
      
      // Vérifie si des items ont été trouvés
      if (parsed.items.length === 0) {
        toast.error('Aucun plat identifié dans le message');
        return;
      }
      
      // Stocke le résultat parsé avec les infos complètes
      setParsedOrder({
        ...parsed,
        customerId: conversation.customer.id,
        conversationId: conversation.id
      });
      
      // Ouvre le modal de preview
      setShowOrderPreview(true);
      
      toast.success(`${parsed.items.length} article(s) identifié(s)`);
      
    } catch (error: any) {
      console.error('Error parsing with AI:', error);
      
      if (error.response?.status === 503) {
        toast.error('Service IA non disponible: Configuration OpenAI manquante');
      } else {
        toast.error(
          `Erreur lors du parsing IA: ${error.response?.data?.message || 'Une erreur est survenue'}`
        );
      }
    } finally {
      setParsingAI(false);
    }
  };

  // Handle create order
  const handleCreateOrder = async () => {
    if (!parsedOrder || !conversation) return;

    try {
      const response = await api.post('/ai/create-order', {
        parsedOrder: parsedOrder,
        customerId: conversation.customer.id,
        conversationId: conversation.id
      });
      
      const order = response.data.order;
      
      toast.success(`Commande ${order.orderNumber} créée !`);
      
      // Ferme le modal
      setShowOrderPreview(false);
      setParsedOrder(null);
      
      // Envoie un message de confirmation dans le chat
      await onSendMessage(
        `✅ Commande ${order.orderNumber} créée !\n\n` +
        `Total: ${order.total} EGP\n` +
        `Livraison: ${getDeliveryTypeLabel(order.deliveryType)}`
      );
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(
        `Erreur lors de la création de la commande: ${error.response?.data?.message || 'Une erreur est survenue'}`
      );
      throw error; // Re-throw pour que le modal gère le loading
    }
  };

  // Empty state si pas de conversation
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Sélectionnez une conversation
          </h3>
          <p className="text-gray-500">
            Choisissez une conversation dans la liste pour commencer à chatter
          </p>
        </div>
      </div>
    );
  }

  const displayName = conversation.customer.name || 'Client';
  const initials = getInitials(conversation.customer.name);

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header (sticky top) */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
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

          {/* Infos */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{displayName}</h3>
              {/* Indicateur de connexion */}
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={isConnected ? 'Connecté' : 'Déconnecté'}
              />
            </div>
            <p className="text-sm text-gray-500">{conversation.customer.phone}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Bouton Parser IA */}
          <button
            onClick={handleParseWithAI}
            disabled={parsingAI || messages.length === 0 || !conversation}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Parser avec IA"
          >
            {parsingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Parsing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Parser IA</span>
              </>
            )}
          </button>
          
          <button
            onClick={onToggleInfo}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Afficher les infos client"
          >
            <Info className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Archiver"
          >
            <Archive className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Plus d'options"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Badge de confiance si confiance basse */}
      {parsedOrder && parsedOrder.confidence < 0.7 && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-sm text-yellow-800 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            Confiance faible ({Math.round(parsedOrder.confidence * 100)}%) - Vérifiez les détails
          </span>
        </div>
      )}

      {/* Messages Area (scrollable) */}
      <div className="flex-1 overflow-y-auto p-4">
        <div ref={messagesEndRef} className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
              <MessageSquare className="w-12 h-12 mb-2 text-gray-400" />
              <p>Aucun message</p>
              <p className="text-sm mt-1">Commencez la conversation</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                showAvatar={true}
                customerAvatar={conversation.customer.avatar}
                customerName={conversation.customer.name}
              />
            ))
          )}
        </div>
      </div>

      {/* Input Area (sticky bottom) */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez votre message..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent max-h-32 overflow-y-auto"
            rows={1}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || sending}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            title="Envoyer"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      {/* Modal OrderPreview */}
      {parsedOrder && (
        <OrderPreviewModal
          isOpen={showOrderPreview}
          onClose={() => {
            setShowOrderPreview(false);
            setParsedOrder(null);
          }}
          parsedOrder={parsedOrder}
          onConfirm={handleCreateOrder}
        />
      )}
    </div>
  );
}
