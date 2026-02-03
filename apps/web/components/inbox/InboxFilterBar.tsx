'use client';

import { ConversationStatus, ConversationPriority, InboxFilters } from '@/types/inbox';
import { Filter, X } from 'lucide-react';

interface InboxFilterBarProps {
  filters: InboxFilters;
  stats: {
    byStatus?: Record<string, number>;
    unread?: number;
    assignedToMe?: number;
  } | null;
  onChange: (filters: InboxFilters) => void;
}

export function InboxFilterBar({ filters, stats, onChange }: InboxFilterBarProps) {
  const statusOptions: Array<{ value: ConversationStatus | 'ALL'; label: string; count?: number }> = [
    { value: 'ALL', label: 'Tous' },
    { value: 'OPEN', label: 'Ouvertes', count: stats?.byStatus?.['OPEN'] },
    { value: 'CLOSED', label: 'Fermées', count: stats?.byStatus?.['CLOSED'] },
    { value: 'RESOLVED', label: 'Résolues', count: stats?.byStatus?.['RESOLVED'] },
    { value: 'SPAM', label: 'Spam', count: stats?.byStatus?.['SPAM'] },
  ];

  const priorityOptions: Array<{ value: ConversationPriority | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'Toutes' },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'HIGH', label: 'Haute' },
    { value: 'NORMAL', label: 'Normale' },
    { value: 'LOW', label: 'Basse' },
  ];

  const assignedOptions = [
    { value: 'ALL', label: 'Tous' },
    { value: 'ME', label: 'Moi', count: stats?.assignedToMe },
    { value: 'UNASSIGNED', label: 'Non assignées' },
  ];

  const dateRangeOptions = [
    { value: 'ALL', label: 'Toutes' },
    { value: 'TODAY', label: "Aujourd'hui" },
    { value: 'WEEK', label: '7 derniers jours' },
    { value: 'MONTH', label: '30 derniers jours' },
  ];

  return (
    <div className="border-b bg-white px-6 py-3">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Filtre Statut */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => onChange({ ...filters, status: e.target.value as ConversationStatus | 'ALL' })}
            className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} {opt.count !== undefined ? `(${opt.count})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Assignation */}
        <select
          value={filters.assignedTo || 'ALL'}
          onChange={(e) => onChange({ ...filters, assignedTo: e.target.value as any })}
          className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {assignedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} {opt.count !== undefined ? `(${opt.count})` : ''}
            </option>
          ))}
        </select>

        {/* Filtre Priorité */}
        <select
          value={filters.priority || 'ALL'}
          onChange={(e) => onChange({ ...filters, priority: e.target.value as ConversationPriority | 'ALL' })}
          className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {priorityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Filtre Date */}
        <select
          value={filters.dateRange || 'ALL'}
          onChange={(e) => onChange({ ...filters, dateRange: e.target.value as any })}
          className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {dateRangeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Toggle Non lus */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.unreadOnly || false}
            onChange={(e) => onChange({ ...filters, unreadOnly: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Non lus seulement {stats?.unread ? `(${stats.unread})` : ''}
          </span>
        </label>

        {/* Réinitialiser */}
        {(filters.status !== 'ALL' || filters.assignedTo !== 'ALL' || filters.priority !== 'ALL' || filters.unreadOnly) && (
          <button
            onClick={() => onChange({ status: 'OPEN', assignedTo: 'ALL', priority: 'ALL', dateRange: 'ALL', unreadOnly: false })}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            <X size={14} />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
