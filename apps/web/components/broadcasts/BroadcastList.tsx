'use client';

import { BroadcastWithStats } from '@/types/inbox';
import { Send, Users, CheckCircle, Clock, XCircle } from 'lucide-react';

interface BroadcastListProps {
  broadcasts: BroadcastWithStats[];
  onSend: (id: string) => void;
  onRefresh: () => void;
}

export function BroadcastList({ broadcasts, onSend, onRefresh }: BroadcastListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800';
      case 'SENDING':
        return 'bg-blue-100 text-blue-800';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle size={16} />;
      case 'SCHEDULED':
        return <Clock size={16} />;
      case 'FAILED':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {broadcasts.map((broadcast) => (
        <div
          key={broadcast.id}
          className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">{broadcast.name}</h3>
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    broadcast.status
                  )}`}
                >
                  {getStatusIcon(broadcast.status)}
                  {broadcast.status}
                </span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{broadcast.message}</p>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{broadcast.recipientCount} destinataires</span>
                </div>
                {broadcast.sentCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Send size={16} />
                    <span>{broadcast.sentCount} envoyés</span>
                  </div>
                )}
                {broadcast.deliveredCount > 0 && (
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>{broadcast.deliveredCount} livrés</span>
                  </div>
                )}
                {broadcast.readCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span>{broadcast.readCount} lus</span>
                  </div>
                )}
              </div>

              {broadcast.scheduledAt && (
                <p className="text-xs text-gray-400 mt-2">
                  Planifié pour le {new Date(broadcast.scheduledAt).toLocaleString('fr-FR')}
                </p>
              )}

              {broadcast.sentAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Envoyé le {new Date(broadcast.sentAt).toLocaleString('fr-FR')}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              {broadcast.status === 'DRAFT' && (
                <button
                  onClick={() => onSend(broadcast.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Send size={16} />
                  Envoyer
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
