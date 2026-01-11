'use client';

import { useState } from 'react';
import {
  X,
  Check,
  Edit2,
  Loader2,
  UtensilsCrossed,
  MapPin,
  StickyNote,
  AlertTriangle,
  Truck,
  ShoppingBag,
} from 'lucide-react';

// ==========================================
// INTERFACES
// ==========================================

export interface ParsedMenuItem {
  name: string;
  quantity: number;
  variant?: string;
  modifiers?: string[];
  notes?: string;
  matchedMenuItemId?: string;
  menuItem?: {
    id: string;
    name: string;
    nameAr?: string;
    price: number;
    image?: string;
  };
}

export interface ParsedOrder {
  items: ParsedMenuItem[];
  deliveryType?: 'DELIVERY' | 'PICKUP' | 'DINE_IN';
  deliveryAddress?: string;
  customerNotes?: string;
  confidence: number;
  needsClarification: boolean;
  clarificationQuestions?: string[];
  customerId: string;
  conversationId: string;
}

interface OrderPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedOrder: ParsedOrder;
  onConfirm: () => Promise<void>;
  onEdit?: () => void;
}

// ==========================================
// HELPERS
// ==========================================

const calculateTotal = (parsedOrder: ParsedOrder) => {
  const subtotal = parsedOrder.items.reduce(
    (sum, item) => sum + (item.menuItem?.price || 0) * item.quantity,
    0
  );
  const deliveryFee = parsedOrder.deliveryType === 'DELIVERY' ? 20 : 0;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
};

const getDeliveryTypeLabel = (type?: string) => {
  switch (type) {
    case 'DELIVERY':
      return '🚚 Livraison';
    case 'PICKUP':
      return '🏃 À emporter';
    case 'DINE_IN':
      return '🍽️ Sur place';
    default:
      return 'Non spécifié';
  }
};

const getConfidenceBadge = (confidence: number) => {
  if (confidence >= 0.8) {
    return {
      label: 'Confiance élevée ✓',
      className: 'bg-green-100 text-green-800 border-green-300',
    };
  } else if (confidence >= 0.5) {
    return {
      label: 'Vérification recommandée ⚠️',
      className: 'bg-orange-100 text-orange-800 border-orange-300',
    };
  } else {
    return {
      label: 'Confiance faible ⚠️',
      className: 'bg-red-100 text-red-800 border-red-300',
    };
  }
};

// ==========================================
// COMPOSANT
// ==========================================

export default function OrderPreviewModal({
  isOpen,
  onClose,
  parsedOrder,
  onConfirm,
  onEdit,
}: OrderPreviewModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const { subtotal, deliveryFee, total } = calculateTotal(parsedOrder);
  const confidenceBadge = getConfidenceBadge(parsedOrder.confidence);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error confirming order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-white">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900">Aperçu de la commande</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${confidenceBadge.className}`}
            >
              {confidenceBadge.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section : Articles Identifiés */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5" />
              Articles Identifiés ({parsedOrder.items.length})
            </h3>

            {parsedOrder.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Aucun article identifié</p>
              </div>
            ) : (
              <div className="space-y-4">
                {parsedOrder.items.map((item, index) => {
                  const itemSubtotal = (item.menuItem?.price || 0) * item.quantity;
                  const isMatched = !!item.matchedMenuItemId;

                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Image ou placeholder */}
                        <div className="flex-shrink-0">
                          {item.menuItem?.image ? (
                            <img
                              src={item.menuItem.image}
                              alt={item.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                              <UtensilsCrossed className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Détails */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                {item.menuItem?.nameAr && (
                                  <span className="text-sm text-gray-500">
                                    ({item.menuItem.nameAr})
                                  </span>
                                )}
                                <span className="text-sm font-medium text-gray-600">
                                  × {item.quantity}
                                </span>
                              </div>

                              {/* Variante */}
                              {item.variant && (
                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-2 mb-2">
                                  {item.variant}
                                </span>
                              )}

                              {/* Modifiers */}
                              {item.modifiers && item.modifiers.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {item.modifiers.map((modifier, modIndex) => (
                                    <span
                                      key={modIndex}
                                      className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                    >
                                      {modifier}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Notes item */}
                              {item.notes && (
                                <p className="text-sm text-gray-500 italic mt-1">{item.notes}</p>
                              )}
                            </div>

                            {/* Prix et actions */}
                            <div className="flex items-start gap-3 flex-shrink-0">
                              <div className="text-right">
                                {item.menuItem?.price ? (
                                  <>
                                    <div className="text-sm text-gray-500">
                                      {item.menuItem.price} EGP
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                      {itemSubtotal} EGP
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-400">Prix non disponible</div>
                                )}
                              </div>

                              {onEdit && (
                                <button
                                  onClick={onEdit}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Modifier"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-600" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Badge de match */}
                          <div className="flex items-center gap-2 mt-2">
                            {isMatched ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                <Check className="w-3 h-3" />
                                Identifié
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                Non trouvé
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section : Livraison */}
          {parsedOrder.deliveryType && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Livraison
              </h3>

              <div className="space-y-3">
                {/* Type de livraison */}
                <div className="flex items-center gap-3">
                  <span className="text-base font-medium text-gray-700">
                    {getDeliveryTypeLabel(parsedOrder.deliveryType)}
                  </span>
                </div>

                {/* Adresse */}
                {parsedOrder.deliveryType === 'DELIVERY' && (
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      {parsedOrder.deliveryAddress ? (
                        <p className="text-sm text-gray-700">{parsedOrder.deliveryAddress}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Aucune adresse spécifiée
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Frais de livraison */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-600">Frais de livraison</span>
                  <span className="font-medium text-gray-900">{deliveryFee} EGP</span>
                </div>
              </div>
            </div>
          )}

          {/* Section : Notes Client */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <StickyNote className="w-5 h-5" />
              Notes Client
            </h3>
            {parsedOrder.customerNotes ? (
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {parsedOrder.customerNotes}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">Aucune note particulière</p>
            )}
          </div>

          {/* Section : Questions de Clarification */}
          {parsedOrder.needsClarification && parsedOrder.clarificationQuestions && parsedOrder.clarificationQuestions.length > 0 && (
            <div className="border-t pt-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Questions à poser au client ⚠️
                </h3>
                <ul className="space-y-2">
                  {parsedOrder.clarificationQuestions.map((question, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-orange-800">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer sticky */}
        <div className="border-t p-6 bg-gray-50">
          {/* Totaux */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Frais de livraison</span>
              <span>{deliveryFee.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span className="text-orange-600">{total.toFixed(2)} EGP</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Annuler
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors font-medium text-orange-700 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={loading || parsedOrder.needsClarification || parsedOrder.items.length === 0}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Créer la Commande
                </>
              )}
            </button>
          </div>

          {/* Message si clarification nécessaire */}
          {parsedOrder.needsClarification && (
            <p className="text-sm text-orange-600 mt-3 text-center">
              ⚠️ Veuillez clarifier les informations avant de créer la commande
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
