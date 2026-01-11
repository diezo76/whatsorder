'use client';

import { Check, CheckCheck, XCircle, FileText } from 'lucide-react';
import { Message } from './ChatArea';

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  customerAvatar?: string | null;
  customerName?: string | null;
}

// Composant pour le statut du message
const MessageStatus = ({ status }: { status: string }) => {
  switch (status) {
    case 'sent':
      return <Check className="w-3 h-3" />;
    case 'delivered':
      return <CheckCheck className="w-3 h-3" />;
    case 'read':
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    case 'failed':
      return <XCircle className="w-3 h-3 text-red-500" />;
    default:
      return null;
  }
};

// Fonction pour formater le timestamp
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    // Aujourd'hui : affiche heure
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (diffInHours < 48) {
    // Hier
    return 'Hier ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    // Date complète
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
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

// Fonction pour rendre les URLs cliquables
const renderTextWithLinks = (text: string): React.ReactNode => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-300"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export default function MessageBubble({
  message,
  showAvatar = true,
  customerAvatar,
  customerName,
}: MessageBubbleProps) {
  const isOutbound = message.direction === 'outbound';

  return (
    <div className={`flex gap-2 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar (si inbound et showAvatar) */}
      {!isOutbound && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {customerAvatar ? (
            <img
              src={customerAvatar}
              alt={customerName || 'Client'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(customerName)
          )}
        </div>
      )}

      {/* Message content */}
      <div className={`max-w-[70%] md:max-w-[70%] sm:max-w-[80%] ${isOutbound ? 'order-first' : ''}`}>
        {/* Bubble */}
        <div
          className={`
            rounded-lg px-4 py-2 shadow-sm
            ${isOutbound
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-900'
            }
          `}
        >
          {/* Contenu selon le type */}
          {message.type === 'text' && (
            <p className="whitespace-pre-wrap break-words text-sm">
              {renderTextWithLinks(message.content)}
            </p>
          )}

          {message.type === 'image' && message.mediaUrl && (
            <div className="space-y-2">
              <img
                src={message.mediaUrl}
                alt="Image"
                className="max-w-xs rounded cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.mediaUrl!, '_blank')}
              />
              {message.content && (
                <p className="whitespace-pre-wrap break-words text-sm">
                  {renderTextWithLinks(message.content)}
                </p>
              )}
            </div>
          )}

          {message.type === 'document' && message.mediaUrl && (
            <div className="space-y-2">
              <a
                href={message.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${
                  isOutbound ? 'text-white' : 'text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm break-all">
                  {message.content || 'Document'}
                </span>
              </a>
            </div>
          )}
        </div>

        {/* Footer : timestamp + statut */}
        <div
          className={`flex items-center gap-1 mt-1 text-xs ${
            isOutbound
              ? 'justify-end text-gray-500'
              : 'justify-start text-gray-500'
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isOutbound && <MessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  );
}
