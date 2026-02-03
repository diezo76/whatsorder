'use client';

import { useState } from 'react';
import { X, Users, Calendar } from 'lucide-react';

interface CreateBroadcastModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateBroadcastModal({ onClose, onSuccess }: CreateBroadcastModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    messageAr: '',
    scheduledAt: '',
    targetAudience: {
      minOrders: 0,
      status: 'active',
    },
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          message: formData.message,
          messageAr: formData.messageAr || undefined,
          targetAudience: formData.targetAudience,
          scheduledAt: formData.scheduledAt || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to create broadcast:', error);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Nouveau Broadcast</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nom du broadcast *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ex: Promo Weekend"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Message *
            </label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tapez votre message..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message AR (optionnel) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Message (Arabe) - Optionnel
            </label>
            <textarea
              value={formData.messageAr}
              onChange={(e) => setFormData({ ...formData, messageAr: e.target.value })}
              placeholder="الرسالة بالعربية..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ciblage */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Users size={16} className="inline mr-2" />
              Ciblage
            </label>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Nombre minimum de commandes
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.targetAudience.minOrders}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetAudience: {
                        ...formData.targetAudience,
                        minOrders: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Planification */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar size={16} className="inline mr-2" />
              Planifier l'envoi (optionnel)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Laisser vide pour envoyer immédiatement
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le broadcast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
