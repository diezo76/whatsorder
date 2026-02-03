'use client';

import { useState, useEffect } from 'react';
import { Plus, Send, Users, CheckCircle } from 'lucide-react';
import { BroadcastWithStats } from '@/types/inbox';
import { BroadcastList } from '@/components/broadcasts/BroadcastList';
import { CreateBroadcastModal } from '@/components/broadcasts/CreateBroadcastModal';

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastWithStats[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBroadcasts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/broadcasts');
      const data = await response.json();
      
      if (data.success) {
        setBroadcasts(data.broadcasts);
      }
    } catch (error) {
      console.error('Failed to load broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const handleSendBroadcast = async (id: string) => {
    if (!confirm('Envoyer ce broadcast maintenant ?')) return;

    try {
      const response = await fetch(`/api/broadcasts/${id}/send`, {
        method: 'POST',
      });
      
      if (response.ok) {
        alert('Broadcast envoyé avec succès !');
        loadBroadcasts();
      }
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      alert('Erreur lors de l\'envoi');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Broadcast</h1>
          <p className="text-gray-600 mt-1">
            Envoyez des messages groupés à vos clients
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={20} />
          Nouveau Broadcast
        </button>
      </div>

      {/* Liste des broadcasts */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : broadcasts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Send size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-4">Aucun broadcast pour le moment</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={16} />
            Créer votre premier broadcast
          </button>
        </div>
      ) : (
        <BroadcastList
          broadcasts={broadcasts}
          onSend={handleSendBroadcast}
          onRefresh={loadBroadcasts}
        />
      )}

      {/* Modal création */}
      {showCreateModal && (
        <CreateBroadcastModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadBroadcasts();
          }}
        />
      )}
    </div>
  );
}
