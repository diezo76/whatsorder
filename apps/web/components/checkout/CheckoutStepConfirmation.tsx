'use client';

import { useState } from 'react';
import { User, Truck, ShoppingBag, UtensilsCrossed, MessageCircle, Info, CreditCard, Wallet, Banknote, Loader2, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { CartItem, useCartStore } from '@/store/cartStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { DeliveryType } from './CheckoutStepDelivery';
import { PaymentMethod } from './CheckoutStepPayment';
import { calculateDeliveryFee, formatPrice as sharedFormatPrice } from '@/lib/shared/pricing';
import type { DeliveryZone, RestaurantCheckout } from '@/types/restaurant';

interface ConfirmationFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  deliveryZone?: string;
  scheduledTime?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

interface CheckoutStepConfirmationProps {
  formData: ConfirmationFormData;
  cartItems: CartItem[];
  cartTotal: number;
  restaurant: RestaurantCheckout;
  onConfirm: () => void;
  onPrev?: () => void;
  restaurantDeliveryZones?: DeliveryZone[];
}

// Fonction pour obtenir l'icône selon le type de livraison
const getDeliveryIcon = (type: DeliveryType) => {
  switch (type) {
    case 'DELIVERY': return Truck;
    case 'PICKUP': return ShoppingBag;
    case 'DINE_IN': return UtensilsCrossed;
    default: return Truck;
  }
};

// Fonction pour obtenir l'icône du mode de paiement
const getPaymentIcon = (method: PaymentMethod) => {
  switch (method) {
    case 'CASH': return Banknote;
    case 'CARD':
    case 'STRIPE': return CreditCard;
    case 'PAYPAL': return Wallet;
    default: return CreditCard;
  }
};

// Utilise formatPrice et calculateDeliveryFee centralisés
const formatPrice = (price: number): string => sharedFormatPrice(price);

// Fonction pour générer le message WhatsApp (pas traduit - envoyé au restaurant)
const generateWhatsAppMessage = (
  restaurant: RestaurantCheckout,
  formData: ConfirmationFormData,
  cartItems: CartItem[],
  cartTotal: number,
  orderNumber?: string,
  restaurantZones?: DeliveryZone[]
): string => {
  const deliveryFee = calculateDeliveryFee(formData.deliveryType, formData.deliveryZone, restaurantZones);
  const total = cartTotal + deliveryFee;

  const getDeliveryLabel = (type: DeliveryType): string => {
    switch (type) {
      case 'DELIVERY': return 'Livraison à domicile';
      case 'PICKUP': return 'À emporter';
      case 'DINE_IN': return 'Sur place';
      default: return type;
    }
  };

  const getZoneLabelFr = (zone?: string): string => {
    if (!zone) return '';
    // Avec les zones dynamiques, le nom est déjà le label
    if (restaurantZones && restaurantZones.length > 0) {
      const found = restaurantZones.find(z => z.name === zone);
      if (found) return found.name;
    }
    // Fallback hardcodé
    switch (zone) {
      case 'NASR_CITY': return 'Nasr City';
      case 'NEW_CAIRO': return 'Nouveau Caire';
      default: return zone;
    }
  };

  const getPaymentLabelFr = (method: PaymentMethod): string => {
    switch (method) {
      case 'CASH': return 'Espèces (à la livraison)';
      case 'CARD': return 'Carte (à la livraison)';
      case 'STRIPE': return 'Carte bancaire (en ligne)';
      case 'PAYPAL': return 'PayPal';
      default: return method;
    }
  };

  const itemsText = cartItems
    .map((item) => {
      const itemName = item.variantName 
        ? `${item.menuItemName} (${item.variantName})`
        : item.menuItemName;
      const itemTotal = item.totalPrice || (item.basePrice * item.quantity);
      let text = `• ${item.quantity}x ${itemName} - ${formatPrice(itemTotal)}`;
      
      // Détailler les options par groupe
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        const optionsByGroup: Record<string, string[]> = {};
        for (const opt of item.selectedOptions) {
          const groupName = opt.groupName || 'Options';
          if (!optionsByGroup[groupName]) optionsByGroup[groupName] = [];
          const priceInfo = opt.isIncluded 
            ? (opt.priceModifier > 0 ? ` (Inclus +${opt.priceModifier} EGP)` : ' (Inclus)')
            : (opt.priceModifier > 0 ? ` (+${opt.priceModifier} EGP)` : '');
          optionsByGroup[groupName].push(`${opt.optionName}${priceInfo}`);
        }
        for (const [group, options] of Object.entries(optionsByGroup)) {
          text += `\n  ${group}: ${options.join(', ')}`;
        }
      }
      
      return text;
    })
    .join('\n');

  const deliveryTypeLabel = getDeliveryLabel(formData.deliveryType);
  let deliveryInfo = deliveryTypeLabel;
  if (formData.deliveryType === 'DELIVERY') {
    const zoneLabel = getZoneLabelFr(formData.deliveryZone);
    if (zoneLabel) {
      deliveryInfo += ` (${zoneLabel} - ${deliveryFee} EGP)`;
    }
    if (formData.deliveryAddress) {
      deliveryInfo += `\nAdresse: ${formData.deliveryAddress}`;
    }
  }

  let message = `Nouvelle Commande - ${restaurant.name}\n\n`;
  if (orderNumber) {
    message += `Numéro de commande: ${orderNumber}\n\n`;
  }
  message += `Client Nom: ${formData.customerName} Tél: ${formData.customerPhone}\n`;
  if (formData.customerEmail) {
    message += `Email: ${formData.customerEmail}\n`;
  }
  message += `\nLivraison Type: ${deliveryInfo}\n`;
  // Inclure l'horaire pour tous les types de commande
  if (formData.scheduledTime) {
    message += `Heure souhaitee: ${formData.scheduledTime}\n`;
  } else {
    message += `Heure souhaitee: Des que possible\n`;
  }
  message += `\nPaiement: ${getPaymentLabelFr(formData.paymentMethod)}\n`;
  message += `\nCommande ${itemsText}\n`;
  message += `\nTotal: ${formatPrice(total)} EGP\n`;
  if (formData.notes) {
    message += `\nNotes: ${formData.notes}`;
  }

  return message;
};

export default function CheckoutStepConfirmation({
  formData,
  cartItems,
  cartTotal,
  restaurant,
  onConfirm,
  onPrev,
  restaurantDeliveryZones,
}: CheckoutStepConfirmationProps) {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const deliveryFee = calculateDeliveryFee(formData.deliveryType, formData.deliveryZone, restaurantDeliveryZones);
  const total = cartTotal + deliveryFee;
  const DeliveryIcon = getDeliveryIcon(formData.deliveryType);
  const PaymentIcon = getPaymentIcon(formData.paymentMethod);
  
  const clearCart = useCartStore((state) => state.clearCart);

  // Détection mobile
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Vérifier si le paiement est en ligne
  const isOnlinePayment = formData.paymentMethod === 'STRIPE' || formData.paymentMethod === 'PAYPAL';

  // Fonction pour normaliser le numéro WhatsApp
  const normalizeWhatsAppNumber = (number: string): string => {
    let cleaned = number.replace(/\s|-|\(|\)/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('00')) return '+' + cleaned.substring(2);
    if (cleaned.startsWith('20')) return '+' + cleaned;
    if (cleaned.startsWith('0')) return '+20' + cleaned.substring(1);
    return '+20' + cleaned;
  };

  // Fonctions de label traduites
  const getDeliveryLabel = (type: DeliveryType): string => {
    switch (type) {
      case 'DELIVERY': return t.checkout.homeDelivery;
      case 'PICKUP': return t.checkout.takeaway;
      case 'DINE_IN': return t.checkout.dineIn;
      default: return type;
    }
  };

  const getZoneLabel = (zone?: string): string => {
    if (!zone) return '';
    // Avec les zones dynamiques, le nom est déjà le label
    if (restaurantDeliveryZones && restaurantDeliveryZones.length > 0) {
      const found = restaurantDeliveryZones.find(z => z.name === zone);
      if (found) return found.name;
    }
    // Fallback hardcodé
    switch (zone) {
      case 'NASR_CITY': return t.checkout.nasrCity;
      case 'NEW_CAIRO': return t.checkout.newCairo;
      default: return zone;
    }
  };

  const getPaymentLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'CASH': return t.checkout.cashOnDelivery;
      case 'CARD': return t.checkout.cardOnDelivery;
      case 'STRIPE': return t.checkout.creditCardOnline;
      case 'PAYPAL': return t.checkout.paypal;
      default: return method;
    }
  };

  // Créer la commande dans la base de données
  const createOrder = async () => {
    const orderData = {
      items: cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.totalPrice ? (item.totalPrice / item.quantity) : item.basePrice,
        customization: {
          variant: item.variantName || null,
          modifiers: item.selectedOptions?.map(opt => opt.optionName) || [],
          notes: null,
        },
      })),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || '',
      deliveryType: formData.deliveryType,
      deliveryAddress: formData.deliveryAddress || '',
      deliveryZone: formData.deliveryZone || '',
      scheduledTime: formData.scheduledTime || '',
      notes: formData.notes || '',
      paymentMethod: formData.paymentMethod,
    };

    const endpoint = `/api/public/restaurants/${restaurant.slug}/orders`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `Error ${response.status}`;
        
        if (errorMessage.includes('non trouvé') || errorMessage.includes('n\'appartient pas') || errorMessage.includes('supprimé')) {
          clearCart();
          toast.error(t.cart.emptyCart, { duration: 6000 });
          setTimeout(() => onConfirm(), 1500);
          return null;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Gestion du paiement en espèces/carte à la livraison (WhatsApp)
  const handleCashPayment = async () => {
    if (!restaurant.slug) {
      toast.error(t.checkout.configMissing);
      return;
    }
    
    if (!restaurant.whatsappNumber) {
      toast.error(t.checkout.configMissing, { duration: 6000 });
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error(t.cart.emptyCart);
      return;
    }

    setIsProcessing(true);
    toast.loading(t.checkout.creatingOrder, { id: 'creating-order' });

    try {
      const result = await createOrder();
      if (!result) {
        toast.error(t.checkout.configMissing, { id: 'creating-order' });
        setIsProcessing(false);
        return;
      }

      const orderNumber = result.order?.orderNumber;
      if (!orderNumber) {
        throw new Error('Order number missing');
      }

      const whatsappInfo = result.whatsapp;
      const whatsappUrl = whatsappInfo?.waMeUrl;

      if (whatsappUrl) {
        toast.success(t.checkout.orderSuccess.replace('{orderNumber}', orderNumber), { id: 'creating-order', duration: 3000 });
        
        // Redirection immédiate vers WhatsApp
        window.location.href = whatsappUrl;
        
        // Fallback : affiche le bloc vert si la redirection est bloquée par le navigateur
        setWhatsappUrl(whatsappUrl);
        setIsProcessing(false);
        
        return;
      } else {
        toast.error(t.checkout.configMissing, { 
          id: 'creating-order',
          duration: 6000 
        });
        setIsProcessing(false);
      }
    } catch (error: any) {
      toast.error(error.message || t.checkout.configMissing, { id: 'creating-order' });
      setIsProcessing(false);
    }
  };

  // Gestion du paiement Stripe
  const handleStripePayment = async () => {
    if (!restaurant.slug || cartItems.length === 0) {
      toast.error(t.checkout.configMissing);
      return;
    }

    setIsProcessing(true);
    toast.loading(t.checkout.preparingStripe, { id: 'creating-order' });

    try {
      const result = await createOrder();
      if (!result) return;

      const orderNumber = result.order?.orderNumber;
      const orderId = result.order?.id;

      toast.success(t.checkout.orderCreatedRedirect.replace('{orderNumber}', orderNumber), { id: 'creating-order' });

      const paymentResponse = await fetch('/api/payments/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderNumber,
          amount: Math.round(total * 100),
          customerEmail: formData.customerEmail,
          customerName: formData.customerName,
          restaurantSlug: restaurant.slug,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment session creation error');
      }

      const { url } = await paymentResponse.json();
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.message || t.checkout.configMissing, { id: 'creating-order' });
      setIsProcessing(false);
    }
  };

  // Gestion du paiement PayPal
  const handlePayPalPayment = async () => {
    if (!restaurant.slug || cartItems.length === 0) {
      toast.error(t.checkout.configMissing);
      return;
    }

    setIsProcessing(true);
    toast.loading(t.checkout.preparingPayPal, { id: 'creating-order' });

    try {
      const result = await createOrder();
      if (!result) return;

      const orderNumber = result.order?.orderNumber;
      const orderId = result.order?.id;

      toast.success(t.checkout.orderCreatedRedirectPayPal.replace('{orderNumber}', orderNumber), { id: 'creating-order' });

      const paymentResponse = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderNumber,
          amount: total,
          restaurantSlug: restaurant.slug,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('PayPal order creation error');
      }

      const { approvalUrl } = await paymentResponse.json();
      window.location.href = approvalUrl;
    } catch (error: any) {
      toast.error(error.message || t.checkout.configMissing, { id: 'creating-order' });
      setIsProcessing(false);
    }
  };

  // Gestionnaire principal du clic
  const handleConfirmClick = () => {
    switch (formData.paymentMethod) {
      case 'CASH':
      case 'CARD':
        handleCashPayment();
        break;
      case 'STRIPE':
        handleStripePayment();
        break;
      case 'PAYPAL':
        handlePayPalPayment();
        break;
      default:
        handleCashPayment();
    }
  };

  // Texte et style du bouton selon le mode de paiement
  const getButtonConfig = () => {
    if (isProcessing) {
      return {
        text: t.checkout.processing,
        icon: Loader2,
        className: 'bg-gray-400 cursor-not-allowed',
        iconClassName: 'animate-spin',
      };
    }

    switch (formData.paymentMethod) {
      case 'STRIPE':
        return {
          text: t.checkout.payByCard.replace('{amount}', formatPrice(total)),
          icon: CreditCard,
          className: 'bg-indigo-600 hover:bg-indigo-700',
          iconClassName: '',
        };
      case 'PAYPAL':
        return {
          text: t.checkout.payWithPayPal.replace('{amount}', formatPrice(total)),
          icon: Wallet,
          className: 'bg-blue-600 hover:bg-blue-700',
          iconClassName: '',
        };
      default:
        return {
          text: t.checkout.confirmAndSendWhatsApp,
          icon: MessageCircle,
          className: 'bg-green-600 hover:bg-green-700',
          iconClassName: '',
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const ButtonIcon = buttonConfig.icon;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">{t.checkout.orderConfirmation}</h3>

      {/* Card Infos Client */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">{t.checkout.clientInfo}</h4>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">{t.checkout.name}:</span> {formData.customerName}</p>
              <p><span className="font-medium">{t.checkout.phone}:</span> {formData.customerPhone}</p>
              {formData.customerEmail && (
                <p><span className="font-medium">{t.checkout.email}:</span> {formData.customerEmail}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Livraison */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <DeliveryIcon className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">{t.checkout.deliveryMethod}</h4>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">{t.checkout.type}:</span> {getDeliveryLabel(formData.deliveryType)}</p>
              {formData.deliveryType === 'DELIVERY' && formData.deliveryZone && (
                <p>
                  <MapPin className="w-3.5 h-3.5 inline-block mr-1 mb-0.5" />
                  <span className="font-medium">{t.checkout.zone}:</span> {getZoneLabel(formData.deliveryZone)} ({deliveryFee} EGP)
                </p>
              )}
              {formData.deliveryType === 'DELIVERY' && formData.deliveryAddress && (
                <p><span className="font-medium">{t.checkout.address}:</span> {formData.deliveryAddress}</p>
              )}
              <p>
                <Clock className="w-3.5 h-3.5 inline-block mr-1 mb-0.5" />
                <span className="font-medium">{t.checkout.time}:</span>{' '}
                {formData.scheduledTime ? formData.scheduledTime : t.checkout.asap}
              </p>
              {formData.notes && (
                <p><span className="font-medium">{t.checkout.notes}:</span> {formData.notes}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Paiement */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <PaymentIcon className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">{t.checkout.paymentMethod}</h4>
            <p className="text-sm text-gray-700">{getPaymentLabel(formData.paymentMethod)}</p>
          </div>
        </div>
      </div>

      {/* Résumé Commande */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">{t.checkout.orderSummary}</h4>
        
        <div className="divide-y divide-gray-200 mb-4">
          {cartItems.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {item.quantity}× {item.menuItemName}
                  {item.variantName && ` (${item.variantName})`}
                </p>
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t.checkout.options}: {item.selectedOptions.map(opt => opt.optionName).join(', ')}
                  </p>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 ml-4">
                {formatPrice(item.totalPrice || item.basePrice * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-300 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-700">
            <span>{t.checkout.subtotal}</span>
            <span className="font-medium">{formatPrice(cartTotal)}</span>
          </div>

          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>{t.checkout.deliveryFees} ({getZoneLabel(formData.deliveryZone)})</span>
              <span className="font-medium">{formatPrice(deliveryFee)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
            <span>{t.checkout.total}</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Message informatif */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          {isOnlinePayment
            ? t.checkout.redirectToPayment
            : (
              <>
                <p>{t.checkout.whatsappRedirectInfo}</p>
                {formData.deliveryType === 'DELIVERY' && (
                  <p className="mt-2 font-medium">
                    {t.checkout.deliveryTimeInfo}
                  </p>
                )}
                {formData.deliveryType === 'DINE_IN' && (
                  <p className="mt-2 font-medium">
                    {t.checkout.dineInNameReminder}
                  </p>
                )}
              </>
            )}
        </div>
      </div>

      {/* Rappel localisation WhatsApp avant validation - livraison uniquement */}
      {formData.deliveryType === 'DELIVERY' && !whatsappUrl && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800 font-medium">
            {t.checkout.whatsappLocationReminder}
          </p>
        </div>
      )}

      {/* Bouton de confirmation */}
      <div className="space-y-3">
        {/* Si WhatsApp URL est disponible après création de commande */}
        {whatsappUrl && (
          <div className="space-y-3">
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900 mb-2 text-center">
                {t.checkout.orderCreatedSuccess}
              </p>
              <p className="text-xs text-green-700 mb-4 text-center">
                {t.checkout.clickWhatsAppLink}
              </p>

              {/* Rappel localisation WhatsApp pour livraison */}
              {formData.deliveryType === 'DELIVERY' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3 mb-4">
                  <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">{t.checkout.important} :</span> {t.checkout.whatsappLocationReminder}
                  </p>
                </div>
              )}
              
              <a
                href={whatsappUrl}
                className="block w-full py-4 px-6 rounded-lg text-lg font-bold transition-all text-center text-white bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-lg hover:shadow-xl no-underline"
                style={{ textDecoration: 'none' }}
              >
                <span className="flex items-center justify-center gap-3">
                  <MessageCircle className="w-6 h-6" />
                  <span>{t.checkout.openWhatsApp}</span>
                </span>
              </a>
              
              
              
              <button
                type="button"
                onClick={() => {
                  if (whatsappUrl) {
                    navigator.clipboard.writeText(whatsappUrl).then(() => {
                      toast.success(t.checkout.linkCopied, { duration: 2000 });
                    }).catch(() => {
                      const textArea = document.createElement('textarea');
                      textArea.value = whatsappUrl;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      toast.success(t.checkout.linkCopied, { duration: 2000 });
                    });
                  }
                }}
                className="w-full mt-2 px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                {t.checkout.copyLink}
              </button>
            </div>
            <button
              onClick={() => {
                setWhatsappUrl(null);
                setIsProcessing(false);
              }}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm"
            >
              {t.checkout.createAnotherOrder}
            </button>
          </div>
        )}
        
        {/* Bouton principal */}
        {!whatsappUrl && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleConfirmClick();
            }}
            disabled={isProcessing || !restaurant.slug || cartItems.length === 0}
            className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center gap-2 text-white ${buttonConfig.className}`}
            aria-label={buttonConfig.text}
          >
            <ButtonIcon className={`w-6 h-6 ${buttonConfig.iconClassName}`} />
            <span>{buttonConfig.text}</span>
          </button>
        )}
        
        {onPrev && (
          <button
            onClick={onPrev}
            disabled={isProcessing}
            className="w-full px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {t.checkout.back}
          </button>
        )}
      </div>
    </div>
  );
}
