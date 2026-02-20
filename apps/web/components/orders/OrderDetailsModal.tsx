'use client';

import { useState } from 'react';
import {
  X,
  User,
  Truck,
  ShoppingBag,
  UtensilsCrossed,
  FileDown,
  Printer,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { generateOrderPDF } from '@/lib/generateOrderPDF';
import type { Order, OrderItem } from '@/types/order';
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/shared/labels';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  onAssign?: (orderId: string, userId: string) => Promise<void>; // Pour usage futur
  restaurantName?: string;
}

// Composant helper InfoRow
const InfoRow = ({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) => (
  <div className="text-sm">
    <span className="text-gray-500">{label}: </span>
    {href ? (
      <a
        href={href}
        className="text-blue-600 hover:underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        {value}
      </a>
    ) : (
      <span className="text-gray-900 font-medium">{value}</span>
    )}
  </div>
);

// Composant StatusBadge
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; label: string }> = {
    PENDING: {
      color: 'bg-gray-100 text-gray-700',
      label: '⏳ En Attente',
    },
    CONFIRMED: {
      color: 'bg-blue-100 text-blue-700',
      label: '✅ Confirmée',
    },
    PREPARING: {
      color: 'bg-yellow-100 text-yellow-700',
      label: '👨‍🍳 Préparation',
    },
    READY: {
      color: 'bg-green-100 text-green-700',
      label: '🎉 Prête',
    },
    OUT_FOR_DELIVERY: {
      color: 'bg-purple-100 text-purple-700',
      label: '🚗 En Route',
    },
    DELIVERED: {
      color: 'bg-green-100 text-green-700',
      label: '✅ Livrée',
    },
    COMPLETED: {
      color: 'bg-green-100 text-green-700',
      label: '✅ Terminée',
    },
    CANCELLED: {
      color: 'bg-red-100 text-red-700',
      label: '❌ Annulée',
    },
  };

  const { color, label } = config[status] || config.PENDING;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {label}
    </span>
  );
};

// Fonctions utilitaires - utilise labels centralisés
const getDeliveryTypeLabel = (type: string) => {
  return DELIVERY_TYPE_LABELS[type] || type;
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function OrderDetailsModal({
  order,
  onClose,
  onStatusChange,
  onAssign: _onAssign, // Préfixé avec _ pour indiquer qu'il n'est pas utilisé pour l'instant
  restaurantName,
}: OrderDetailsModalProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (order.status === newStatus) return;

    if (
      confirm(
        `Changer le statut de "${order.orderNumber}" vers "${newStatus}" ?`
      )
    ) {
      setIsChangingStatus(true);
      try {
        await onStatusChange(order.id, newStatus);
        toast.success('Statut mis à jour');
        onClose();
      } catch (error) {
        toast.error('Erreur lors de la mise à jour');
      } finally {
        setIsChangingStatus(false);
      }
    }
  };

  const handleCancel = async () => {
    if (order.status === 'CANCELLED') return;

    const reason = prompt('Raison de l\'annulation (optionnel):');
    if (reason !== null) {
      try {
        await api.patch(`/orders/${order.id}/cancel`, {
          cancellationReason: reason || 'Annulation',
        });
        toast.success('Commande annulée');
        onClose();
      } catch (error: any) {
        console.error('Error cancelling order:', error);
        toast.error('Erreur lors de l\'annulation');
      }
    }
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {order.orderNumber}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Créée {formatDateTime(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Badge statut */}
            <StatusBadge status={order.status} />

            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body scrollable */}
        <div className="overflow-y-auto flex-1">
          {/* Section Infos Client et Livraison */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b">
            {/* Colonne gauche : Client */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                <User className="w-5 h-5" />
                Informations client
              </h3>

              <div className="space-y-2">
                <InfoRow
                  label="Nom"
                  value={order.customer.name || 'Non renseigné'}
                />
                <InfoRow
                  label="Téléphone"
                  value={order.customer.phone}
                  href={`tel:${order.customer.phone}`}
                />
                {order.customer.email && (
                  <InfoRow
                    label="Email"
                    value={order.customer.email}
                    href={`mailto:${order.customer.email}`}
                  />
                )}
                {order.assignedTo && (
                  <InfoRow
                    label="Assigné à"
                    value={order.assignedTo.name}
                  />
                )}
              </div>
            </div>

            {/* Colonne droite : Livraison */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                <Truck className="w-5 h-5" />
                Livraison
              </h3>

              <div className="space-y-2">
                <InfoRow
                  label="Type"
                  value={getDeliveryTypeLabel(order.deliveryType)}
                />
                {order.deliveryAddress && (
                  <InfoRow label="Adresse" value={order.deliveryAddress} />
                )}
                <InfoRow
                  label="Frais"
                  value={`${(order.deliveryFee || 0).toFixed(2)} EGP`}
                />
                {order.customerNotes && (
                  <InfoRow label="Notes client" value={order.customerNotes} />
                )}
                {order.paymentMethod && (
                  <InfoRow
                    label="Paiement"
                    value={PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section Items */}
          <div className="p-6 border-b">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <ShoppingBag className="w-5 h-5" />
              Articles commandés ({order.items.length})
            </h3>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  {/* Image */}
                  {item.menuItem.image ? (
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <UtensilsCrossed className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {item.menuItem.name}
                      {(item.customization as any)?.variant && (
                        <span className="text-sm text-orange-600 ml-1">
                          ({(item.customization as any).variant})
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {(item.unitPrice ?? item.menuItem?.price ?? 0).toFixed(2)} EGP
                    </p>
                    {(item.customization as any)?.modifiers && (item.customization as any).modifiers.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Options: {(item.customization as any).modifiers.join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Sous-total */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">
                      {item.subtotal.toFixed(2)} EGP
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{order.subtotal.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frais de livraison</span>
                <span className="font-medium">
                  {(order.deliveryFee || 0).toFixed(2)} EGP
                </span>
              </div>
              {(order.discount || 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Remise</span>
                  <span>-{(order.discount || 0).toFixed(2)} EGP</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{order.total.toFixed(2)} EGP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Changement de statut rapide */}
          <div className="flex items-center gap-2 flex-1">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Statut:
            </label>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isChangingStatus}
              className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="PENDING">⏳ En Attente</option>
              <option value="CONFIRMED">✅ Confirmée</option>
              <option value="PREPARING">👨‍🍳 En Préparation</option>
              <option value="READY">🎉 Prête</option>
              <option value="OUT_FOR_DELIVERY">🚗 En Livraison</option>
              <option value="DELIVERED">✅ Livrée</option>
              <option value="COMPLETED">✅ Terminée</option>
              <option value="CANCELLED">❌ Annulée</option>
            </select>
          </div>

          {/* Actions secondaires */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                try {
                  generateOrderPDF(order, restaurantName);
                  toast.success('PDF telecharge');
                } catch (error) {
                  console.error('Error generating PDF:', error);
                  toast.error('Erreur lors de la generation du PDF');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Ticket PDF</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            {order.status !== 'CANCELLED' && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
