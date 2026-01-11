'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  DollarSign,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Conversation } from './ConversationList';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface CustomerInfoProps {
  conversation: Conversation;
  onClose: () => void;
}

interface InternalNote {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

// Composant InfoRow
const InfoRow = ({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      {href ? (
        <a
          href={href}
          className="text-sm font-medium text-blue-600 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
      )}
    </div>
  </div>
);

// Composant StatCard
const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <div className="bg-gray-50 rounded-lg p-3 text-center">
    <div className="flex justify-center mb-1 text-gray-400">{icon}</div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

// Composant NoteItem
const NoteItem = ({
  note,
  onDelete,
}: {
  note: InternalNote;
  onDelete: (noteId: string) => void;
}) => {
  const { user } = useAuth();
  const canDelete = note.userId === user?.id;

  // Fonction pour formater la date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  // Fonction pour obtenir les initiales
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-900 flex-1 whitespace-pre-wrap break-words">
          {note.content}
        </p>
        {canDelete && (
          <button
            onClick={() => onDelete(note.id)}
            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
            title="Supprimer la note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 flex-shrink-0">
          {note.user.avatar ? (
            <img
              src={note.user.avatar}
              alt={note.user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(note.user.name)
          )}
        </div>
        <span className="text-xs text-gray-500">{note.user.name}</span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
      </div>
    </div>
  );
};

export default function CustomerInfo({ conversation, onClose }: CustomerInfoProps) {
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [showAddNote, setShowAddNote] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [loadingNotes, setLoadingNotes] = useState<boolean>(false);

  // Fonction pour obtenir les initiales
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Charger les notes
  useEffect(() => {
    loadNotes();
  }, [conversation.id]);

  const loadNotes = async () => {
    setLoadingNotes(true);
    try {
      const response = await api.get<{ notes: InternalNote[]; total: number }>(
        `/conversations/${conversation.id}/notes`
      );
      setNotes(response.data.notes);
    } catch (error: any) {
      console.error('Error loading notes:', error);
      toast.error('Erreur lors du chargement des notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  // Fonction pour ajouter une note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setSaving(true);
    try {
      const response = await api.post<InternalNote>(
        `/conversations/${conversation.id}/notes`,
        { content: newNote.trim() }
      );

      setNotes((prev) => [response.data, ...prev]);
      setNewNote('');
      setShowAddNote(false);
      toast.success('Note ajoutée');
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast.error("Erreur lors de l'ajout de la note");
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour supprimer une note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Supprimer cette note ?')) return;

    try {
      await api.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success('Note supprimée');
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const displayName = conversation.customer.name || 'Client';
  const initials = getInitials(conversation.customer.name);

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Informations client</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          title="Fermer"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Section 1 : Profil Client */}
        <div className="p-6 border-b">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
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
          </div>

          {/* Nom */}
          <h3 className="text-xl font-semibold text-center mb-1 text-gray-900">
            {displayName}
          </h3>

          {/* Infos contact */}
          <div className="space-y-3 mt-4">
            <InfoRow
              icon={<Phone className="w-4 h-4" />}
              label="Téléphone"
              value={conversation.customer.phone}
              href={`tel:${conversation.customer.phone}`}
            />

            {conversation.customer.email && (
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={conversation.customer.email}
                href={`mailto:${conversation.customer.email}`}
              />
            )}

            {conversation.customer.address && (
              <InfoRow
                icon={<MapPin className="w-4 h-4" />}
                label="Adresse"
                value={conversation.customer.address}
              />
            )}

            <InfoRow
              icon={<Phone className="w-4 h-4" />}
              label="WhatsApp"
              value={conversation.whatsappPhone}
              href={`https://wa.me/${conversation.whatsappPhone.replace(/[^0-9]/g, '')}`}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <StatCard
              label="Commandes"
              value={conversation.customer.totalOrders || 0}
              icon={<ShoppingBag className="w-5 h-5" />}
            />
            <StatCard
              label="Total dépensé"
              value={`${conversation.customer.totalSpent || 0} EGP`}
              icon={<DollarSign className="w-5 h-5" />}
            />
          </div>

          {/* Date premier contact */}
          {conversation.createdAt && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              Premier contact :{' '}
              {new Date(conversation.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          )}
        </div>

        {/* Section 2 : Notes Internes */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-900">Notes internes</h4>
            <button
              onClick={() => {
                setShowAddNote(!showAddNote);
                if (showAddNote) {
                  setNewNote('');
                }
              }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              {showAddNote ? 'Annuler' : '+ Ajouter'}
            </button>
          </div>

          {/* Formulaire ajout note */}
          {showAddNote && (
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                disabled={saving}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || saving}
                className="mt-2 w-full bg-orange-600 text-white py-2 rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          )}

          {/* Liste notes */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {loadingNotes ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Aucune note</p>
            ) : (
              notes.map((note) => (
                <NoteItem key={note.id} note={note} onDelete={handleDeleteNote} />
              ))
            )}
          </div>
        </div>

        {/* Section 3 : Historique Commandes (placeholder pour plus tard) */}
        <div className="p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Historique commandes</h4>
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">À implémenter</p>
          </div>
        </div>
      </div>
    </div>
  );
}
