// types/restaurant.ts
// Source unique de vérité pour tous les types liés au Restaurant

// === Zone de livraison ===
export interface DeliveryZone {
  name: string;
  fee: number;
  radius?: number;
}

// === Restaurant complet (tel que retourné par Prisma / API dashboard) ===
export interface Restaurant {
  id: string;
  name: string;
  nameAr?: string | null;
  slug: string;
  description?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  currency?: string;
  timezone?: string;
  language?: string;
  openingHours?: Record<string, { open: string; close: string; closed?: boolean }> | null;
  deliveryZones?: DeliveryZone[] | null;
  whatsappNumber?: string | null;
  whatsappApiKey?: string | null;
  whatsappApiToken?: string | null;
  whatsappBusinessId?: string | null;
  enableAiParsing?: boolean;
  stripeAccountId?: string | null;
  stripeAccountStatus?: string | null;
  stripeOnboardingComplete?: boolean;
  paypalMerchantId?: string | null;
  paypalEmail?: string | null;
  paypalOnboardingComplete?: boolean;
  enableCashPayment?: boolean;
  enableCardPayment?: boolean;
  enableStripePayment?: boolean;
  enablePaypalPayment?: boolean;
  isBusy?: boolean;
  busyTitle?: string | null;
  busyMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// === Sous-types pour les composants qui n'ont besoin que de certains champs ===

/** Pour le checkout (confirmation) — minimum requis */
export type RestaurantCheckout = Pick<Restaurant, 'id' | 'slug' | 'name' | 'whatsappNumber'>;

/** Pour le panier / drawer — checkout + options de paiement */
export type RestaurantCart = Pick<Restaurant,
  'id' | 'slug' | 'name' | 'phone' | 'whatsappNumber' |
  'enableCashPayment' | 'enableCardPayment' | 'enableStripePayment' | 'enablePaypalPayment' |
  'deliveryZones' | 'openingHours'
>;

/** Pour le header public */
export type RestaurantHeader = Pick<Restaurant,
  'name' | 'description' | 'logo' | 'coverImage' | 'phone' | 'address' | 'openingHours'
>;

/** Pour la landing page (liste des restaurants) */
export type RestaurantListing = Pick<Restaurant,
  'id' | 'name' | 'nameAr' | 'slug' | 'description' | 'logo' | 'coverImage' | 'openingHours'
>;
