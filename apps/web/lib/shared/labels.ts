// lib/shared/labels.ts
// Source unique pour tous les labels de livraison, paiement et statut de commande

import type { DeliveryZone } from '@/types/restaurant';

// === Labels de type de livraison (français) ===
export const DELIVERY_TYPE_LABELS: Record<string, string> = {
  DELIVERY: 'Livraison',
  PICKUP: 'À emporter',
  DINE_IN: 'Sur place',
};

// === Labels de méthode de paiement (français) ===
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Espèces',
  CARD: 'Carte bancaire',
  STRIPE: 'Carte (Stripe)',
  PAYPAL: 'PayPal',
};

// === Labels de statut de commande (français) ===
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  READY: 'Prête',
  OUT_FOR_DELIVERY: 'En livraison',
  DELIVERED: 'Livrée',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

// === Couleurs des statuts de commande ===
export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

/**
 * Retourne le label de la zone de livraison à partir du nom et des zones configurées.
 */
export function getDeliveryZoneLabel(
  zoneName: string | undefined | null,
  zones: DeliveryZone[] | undefined | null
): string {
  if (!zoneName) return '';
  if (zones) {
    const zone = zones.find(z => z.name === zoneName);
    if (zone) return `${zone.name} (${zone.fee} EGP)`;
  }
  return zoneName;
}

/**
 * Retourne le label de livraison.
 */
export function getDeliveryTypeLabel(type: string): string {
  return DELIVERY_TYPE_LABELS[type] || type;
}

/**
 * Retourne le label de paiement.
 */
export function getPaymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method] || method;
}

/**
 * Retourne le label de statut.
 */
export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] || status;
}
