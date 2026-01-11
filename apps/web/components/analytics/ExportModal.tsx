'use client';

import { useState } from 'react';
import { X, Download, FileText, BarChart3, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  exportOrdersCSV,
  exportTopItemsCSV,
  exportRevenueCSV,
  exportCompleteReport
} from '@/lib/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: string;
  stats: any;
  orders: any[];
  topItems: any[];
  revenueData: any[];
}

export default function ExportModal({
  isOpen,
  onClose,
  period,
  stats,
  orders,
  topItems,
  revenueData
}: ExportModalProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (type: string) => {
    try {
      setExporting(type);

      let result;
      switch (type) {
        case 'orders':
          result = await exportOrdersCSV(orders, period);
          break;
        case 'topItems':
          result = await exportTopItemsCSV(topItems, period);
          break;
        case 'revenue':
          result = await exportRevenueCSV(revenueData, period);
          break;
        case 'complete':
          result = await exportCompleteReport(stats, orders, topItems, revenueData, period);
          break;
        default:
          throw new Error('Type d\'export inconnu');
      }

      toast.success(`✅ Fichier exporté : ${result.fileName}`);
      onClose();

    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Erreur lors de l\'export');
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      id: 'complete',
      title: 'Rapport Complet',
      description: 'Toutes les données analytics (KPI, top items, revenus)',
      icon: <FileText className="w-6 h-6" />,
      color: 'orange'
    },
    {
      id: 'orders',
      title: 'Liste des Commandes',
      description: `${orders.length} commandes de la période sélectionnée`,
      icon: <Download className="w-6 h-6" />,
      color: 'blue'
    },
    {
      id: 'topItems',
      title: 'Top des Plats',
      description: `${topItems.length} plats les plus vendus`,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'green'
    },
    {
      id: 'revenue',
      title: 'Évolution des Revenus',
      description: `${revenueData.length} jours de données`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'purple'
    }
  ];

  const colorClasses: Record<string, string> = {
    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-50',
    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-50',
    green: 'bg-green-100 text-green-600 hover:bg-green-50',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-50'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Exporter les Données</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choisissez le type de données à exporter en CSV
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.id)}
                disabled={exporting !== null}
                className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                  exporting === option.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${colorClasses[option.color]}`}>
                    {exporting === option.id ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      option.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Format CSV</p>
                <p className="text-blue-700">
                  Les fichiers CSV peuvent être ouverts avec Excel, Google Sheets ou tout tableur.
                  L'encodage UTF-8 avec BOM garantit l'affichage correct des caractères arabes et français.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
