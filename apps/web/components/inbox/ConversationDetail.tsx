'use client';

import { useState, useEffect } from 'react';
import { X, UserPlus, Tag, FileText, Send } from 'lucide-react';
import { ConversationWithDetails } from '@/types/inbox';
import { AssignStaffModal } from './AssignStaffModal';
import { MessageTemplateSelector } from './MessageTemplateSelector';

interface ConversationDetailProps {
  conversationId: string;
  onClose: () => void;
  children?: React.ReactNode; // Pour passer ChatArea ou autre composant de messages
}

export function ConversationDetail({ conversationId, onClose, ...props }: ConversationDetailProps) {
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  const loadConversation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setConversation(data.conversation);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/conversations/${conversationId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      loadConversation();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAssign = async (assignedToId: string | null) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/conversations/${conversationId}/assign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ assignedToId }),
      });
      setShowAssignModal(false);
      loadConversation();
    } catch (error) {
      console.error('Failed to assign:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Conversation non trouvée
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {conversation.customer?.name || conversation.customerPhone}
            </h2>
            <p className="text-sm text-gray-500">{conversation.customerPhone}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
          >
            <UserPlus size={16} />
            {conversation.assignedTo ? conversation.assignedTo.name : 'Assigner'}
          </button>
          
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
          >
            <FileText size={16} />
            Templates
          </button>

          <select
            value={conversation.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="OPEN">Ouverte</option>
            <option value="CLOSED">Fermée</option>
            <option value="RESOLVED">Résolue</option>
            <option value="SPAM">Spam</option>
          </select>
        </div>
      </div>

      {/* Messages Area - Utiliser ChatArea si fourni en prop */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {props.children || (
          <div className="text-center text-gray-500 py-12">
            Zone de messages - Utilisez ChatArea en passant les messages en props
          </div>
        )}
      </div>

      {/* Modals */}
      {showAssignModal && (
        <AssignStaffModal
          conversationId={conversationId}
          currentAssignedTo={conversation.assignedToId}
          onAssign={handleAssign}
          onClose={() => setShowAssignModal(false)}
        />
      )}

      {showTemplateModal && (
        <MessageTemplateSelector
          conversationId={conversationId}
          onSelect={(template) => {
            console.log('Template selected:', template);
            setShowTemplateModal(false);
          }}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  );
}
