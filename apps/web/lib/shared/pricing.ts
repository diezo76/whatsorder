// lib/shared/pricing.ts
// Source unique pour le calcul des frais de livraison et prix

import { DeliveryZone } from '@/types/restaurant';

/**
 * Calcule les frais de livraison en fonction de la zone sélectionnée.
 * @returns Le montant des frais en EGP, ou 0 si pas de livraison / zone non trouvée.
 */
export function calculateDeliveryFee(
  deliveryType: string,
  deliveryZone: string | undefined | null,
  zones: DeliveryZone[] | undefined | null
): number {
  if (deliveryType !== 'DELIVERY' || !deliveryZone || !zones) return 0;
  const zone = zones.find(z => z.name === deliveryZone);
  return zone?.fee ?? 0;
}

/**
 * Formate un prix pour affichage.
 * @param price Le prix en nombre
 * @param currency La devise (défaut: 'EGP')
 * @returns Le prix formaté, ex: "50.00 EGP"
 */
export function formatPrice(price: number, currency: string = 'EGP'): string {
  return `${price.toFixed(2)} ${currency}`;
}

/**
 * Formate un numéro de téléphone pour WhatsApp.
 * Supprime les espaces, tirets, et ajoute le préfixe pays si nécessaire.
 */
export function formatPhoneNumber(phone: string): string {
  // Supprimer tout sauf les chiffres et le +
  let cleaned = phone.replace(/[^\d+]/g, '');
  // Si commence par 0, remplacer par +20 (Égypte)
  if (cleaned.startsWith('0')) {
    cleaned = '+20' + cleaned.substring(1);
  }
  // Si pas de +, ajouter +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

/**
 * Génère l'URL WhatsApp avec le protocole direct (ouvre l'app).
 * Utilise le protocole whatsapp:// pour éviter la page web intermédiaire.
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  return `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
}

/**
 * Génère un numéro de commande au format ORD-YYYYMMDD-XXX
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${dateStr}-${random}`;
}

/**
 * Vérifie si un restaurant est actuellement ouvert en se basant sur ses horaires.
 * Supporte les clés de jours en anglais et en français.
 */
export function isRestaurantOpen(
  openingHours?: Record<string, { open: string; close: string; closed?: boolean }> | string | null
): boolean {
  if (!openingHours || typeof openingHours === 'string') {
    return false;
  }

  const daysEn = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();
  const currentDayEn = daysEn[now.getDay()];

  const frToEn: Record<string, string> = {
    lundi: 'monday',
    mardi: 'tuesday',
    mercredi: 'wednesday',
    jeudi: 'thursday',
    vendredi: 'friday',
    samedi: 'saturday',
    dimanche: 'sunday',
  };

  let todayHours = openingHours[currentDayEn];
  if (!todayHours) {
    const dayFr = Object.keys(frToEn).find((fr) => frToEn[fr] === currentDayEn);
    if (dayFr) {
      todayHours = openingHours[dayFr];
    }
  }

  if (!todayHours || todayHours.closed) {
    return false;
  }

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);
  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;

  // Gérer le cas où la fermeture est après minuit
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime < closeTime;
  }

  return currentTime >= openTime && currentTime <= closeTime;
}
