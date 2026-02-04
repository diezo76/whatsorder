'use client';

import { useState } from 'react';
import { User, Truck, ShoppingBag, UtensilsCrossed, MessageCircle, Info, CreditCard, Wallet, Banknote, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CartItem, useCartStore } from '@/store/cartStore';
import { DeliveryType } from './CheckoutStepDelivery';
import { PaymentMethod } from './CheckoutStepPayment';

interface Restaurant {
  id?: string;
  slug?: string;
  name: string;
  whatsappNumber?: string; // Optionnel car peut ne pas être défini
}

interface ConfirmationFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

interface CheckoutStepConfirmationProps {
  formData: ConfirmationFormData;
  cartItems: CartItem[];
  cartTotal: number;
  restaurant: Restaurant;
  onConfirm: () => void;
  onPrev?: () => void;
}

// Fonction pour obtenir l'icône selon le type de livraison
const getDeliveryIcon = (type: DeliveryType) => {
  switch (type) {
    case 'DELIVERY':
      return Truck;
    case 'PICKUP':
      return ShoppingBag;
    case 'DINE_IN':
      return UtensilsCrossed;
    default:
      return Truck;
  }
};

// Fonction pour obtenir le libellé du type de livraison
const getDeliveryLabel = (type: DeliveryType): string => {
  switch (type) {
    case 'DELIVERY':
      return 'Livraison à domicile';
    case 'PICKUP':
      return 'À emporter';
    case 'DINE_IN':
      return 'Sur place';
    default:
      return type;
  }
};

// Fonction pour obtenir le libellé du mode de paiement
const getPaymentLabel = (method: PaymentMethod): string => {
  switch (method) {
    case 'CASH':
      return '💵 Espèces (à la livraison)';
    case 'CARD':
      return '💳 Carte (à la livraison)';
    case 'STRIPE':
      return '🔒 Carte bancaire (en ligne)';
    case 'PAYPAL':
      return '🅿️ PayPal';
    default:
      return method;
  }
};

// Fonction pour obtenir l'icône du mode de paiement
const getPaymentIcon = (method: PaymentMethod) => {
  switch (method) {
    case 'CASH':
      return Banknote;
    case 'CARD':
    case 'STRIPE':
      return CreditCard;
    case 'PAYPAL':
      return Wallet;
    default:
      return CreditCard;
  }
};

// Fonction pour formater le prix
const formatPrice = (price: number): string => {
  return `${price.toFixed(2)} EGP`;
};

// Fonction pour calculer les frais de livraison
const getDeliveryFee = (deliveryType: DeliveryType): number => {
  return deliveryType === 'DELIVERY' ? 20 : 0;
};

// Fonction pour générer le message WhatsApp
const generateWhatsAppMessage = (
  restaurant: Restaurant,
  formData: ConfirmationFormData,
  cartItems: CartItem[],
  cartTotal: number,
  orderNumber?: string
): string => {
  const deliveryFee = getDeliveryFee(formData.deliveryType);
  const total = cartTotal + deliveryFee;

  const itemsText = cartItems
    .map((item) => {
      const itemName = item.variantName 
        ? `${item.menuItemName} (${item.variantName})`
        : item.menuItemName;
      const optionsText = item.selectedOptions && item.selectedOptions.length > 0
        ? ` [${item.selectedOptions.map(opt => opt.optionName).join(', ')}]`
        : '';
      const itemTotal = item.totalPrice || (item.basePrice * item.quantity);
      return `• ${item.quantity}× ${itemName}${optionsText} - ${formatPrice(itemTotal)} EGP`;
    })
    .join(' • ');

  const deliveryTypeLabel = getDeliveryLabel(formData.deliveryType);
  const deliveryInfo = formData.deliveryType === 'DELIVERY' && formData.deliveryAddress
    ? `${deliveryTypeLabel}\n📍 Adresse: ${formData.deliveryAddress}`
    : deliveryTypeLabel;

  let message = `🍽️ Nouvelle Commande - ${restaurant.name}\n\n`;
  
  if (orderNumber) {
    message += `📝 Numéro de commande: ${orderNumber}\n\n`;
  }
  
  message += `👤 Client Nom: ${formData.customerName} Tél: ${formData.customerPhone}\n`;
  
  if (formData.customerEmail) {
    message += `Email: ${formData.customerEmail}\n`;
  }
  
  message += `\n🚚 Livraison Type: ${deliveryInfo}\n`;
  message += `\n💳 Paiement: ${getPaymentLabel(formData.paymentMethod)}\n`;
  message += `\n📦 Commande ${itemsText}\n`;
  message += `\n💰 Total: ${formatPrice(total)} EGP\n`;
  
  if (formData.notes) {
    message += `\n📝 Notes: ${formData.notes}`;
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
}: CheckoutStepConfirmationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const deliveryFee = getDeliveryFee(formData.deliveryType);
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

  // Créer la commande dans la base de données
  const createOrder = async () => {
    const orderData = {
      items: cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.basePrice,
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
      notes: formData.notes || '',
      paymentMethod: formData.paymentMethod,
    };

    const endpoint = `/api/public/restaurants/${restaurant.slug}/orders`;
    console.log('📤 Envoi de la commande:', {
      endpoint,
      restaurantSlug: restaurant.slug,
      itemsCount: orderData.items.length,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      console.log('📥 Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        const errorMessage = errorData.error || `Erreur ${response.status}`;
        
        console.error('❌ Erreur API:', {
          status: response.status,
          errorMessage,
          errorData,
        });
        
        if (errorMessage.includes('non trouvé') || errorMessage.includes('n\'appartient pas') || errorMessage.includes('supprimé')) {
          clearCart();
          toast.error('🛒 Votre panier contenait des articles obsolètes et a été vidé.', { duration: 6000 });
          setTimeout(() => onConfirm(), 1500);
          return null;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Commande créée avec succès:', {
        orderNumber: result.order?.orderNumber,
        orderId: result.order?.id,
        result,
      });

      return result;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'appel API createOrder:', error);
      throw error;
    }
  };

  // Gestion du paiement en espèces/carte à la livraison (WhatsApp)
  const handleCashPayment = async () => {
    // Validation détaillée avec messages d'erreur spécifiques
    if (!restaurant.slug) {
      console.error('❌ Restaurant slug manquant');
      toast.error('Erreur: Restaurant non identifié. Veuillez réessayer.');
      return;
    }
    
    if (!restaurant.whatsappNumber) {
      console.error('❌ Numéro WhatsApp du restaurant manquant:', {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
      });
      toast.error('⚠️ Le restaurant n\'a pas configuré son numéro WhatsApp. Veuillez contacter le restaurant directement.', { duration: 6000 });
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setIsProcessing(true);
    toast.loading('Création de la commande...', { id: 'creating-order' });

    try {
      const result = await createOrder();
      if (!result) {
        console.error('❌ createOrder() a retourné null ou undefined');
        toast.error('Erreur lors de la création de la commande', { id: 'creating-order' });
        setIsProcessing(false);
        return;
      }

      const orderNumber = result.order?.orderNumber;
      if (!orderNumber) {
        console.error('❌ Numéro de commande manquant dans la réponse:', result);
        throw new Error('Numéro de commande non reçu');
      }

      // Vérifier si le message a été envoyé via l'API WhatsApp Business
      const whatsappInfo = result.whatsapp;
      
      if (whatsappInfo?.messageSent) {
        // Message envoyé avec succès via l'API WhatsApp Business
        toast.success(`✅ Commande ${orderNumber} créée et message envoyé !`, { id: 'creating-order', duration: 5000 });
        setIsProcessing(false);
        
        // Afficher un message de confirmation
        setTimeout(() => {
          onConfirm();
        }, 2000);
        return;
      }

      // Si le message n'a pas été envoyé via l'API, utiliser wa.me
      if (whatsappInfo?.waMeUrl) {
        const whatsappUrl = whatsappInfo.waMeUrl;
        
        console.log('📱 Utilisation de wa.me car WhatsApp API non disponible:', {
          orderNumber,
          apiEnabled: whatsappInfo.apiEnabled,
          error: whatsappInfo.error,
        });

        // Afficher un avertissement si l'API n'est pas disponible
        if (!whatsappInfo.apiEnabled) {
          toast('⚠️ Le message sera envoyé manuellement via WhatsApp', { 
            id: 'creating-order',
            duration: 4000,
            icon: '⚠️',
            style: {
              background: '#fff3cd',
              color: '#856404',
              border: '1px solid #ffc107',
            },
          });
        } else if (whatsappInfo.error) {
          toast(`⚠️ Envoi automatique échoué: ${whatsappInfo.error}. Utilisation de WhatsApp manuel.`, { 
            id: 'creating-order',
            duration: 5000,
            icon: '⚠️',
            style: {
              background: '#fff3cd',
              color: '#856404',
              border: '1px solid #ffc107',
            },
          });
        }

        // Toujours afficher le lien WhatsApp cliquable (plus fiable que redirection automatique)
        console.log('📱 Affichage du lien WhatsApp cliquable:', { whatsappUrl });
        setWhatsappUrl(whatsappUrl);
        setIsProcessing(false);
        
        // Essayer une redirection automatique après un court délai (mais ne pas compter dessus)
        setTimeout(() => {
          try {
            console.log('📱 Tentative de redirection automatique vers WhatsApp');
            // Utiliser window.open qui fonctionne mieux que window.location.href
            const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            if (!opened || opened.closed || typeof opened.closed === 'undefined') {
              // Si window.open a été bloqué, le lien direct sera utilisé
              console.log('📱 window.open bloqué, utilisation du lien direct cliquable');
            } else {
              console.log('✅ WhatsApp ouvert avec succès');
            }
          } catch (error) {
            console.error('❌ Redirection automatique échouée, lien direct disponible:', error);
          }
        }, 500);
        
        // IMPORTANT: Ne PAS appeler onConfirm() ici et NE PAS continuer l'exécution
        // Le modal restera ouvert avec le lien cliquable
        return; // Arrêter l'exécution ici
      } else {
        // Pas d'URL WhatsApp disponible
        toast.error('❌ Impossible d\'envoyer le message WhatsApp. Veuillez contacter le restaurant directement.', { 
          id: 'creating-order',
          duration: 6000 
        });
        setIsProcessing(false);
        setTimeout(() => {
          onConfirm();
        }, 2000);
      }
      // Si la redirection échoue, l'utilisateur reste sur la page et peut réessayer
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la commande:', error);
      console.error('❌ Stack trace:', error.stack);
      toast.error(error.message || 'Erreur lors de la création de la commande', { id: 'creating-order' });
      setIsProcessing(false);
    }
  };

  // Gestion du paiement Stripe
  const handleStripePayment = async () => {
    if (!restaurant.slug || cartItems.length === 0) {
      toast.error('Configuration manquante');
      return;
    }

    setIsProcessing(true);
    toast.loading('Préparation du paiement...', { id: 'creating-order' });

    try {
      // Créer d'abord la commande
      const result = await createOrder();
      if (!result) return;

      const orderNumber = result.order?.orderNumber;
      const orderId = result.order?.id;

      toast.success(`Commande ${orderNumber} créée ! Redirection vers le paiement...`, { id: 'creating-order' });

      // Créer une session de paiement Stripe
      const paymentResponse = await fetch('/api/payments/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderNumber,
          amount: Math.round(total * 100), // En centimes
          customerEmail: formData.customerEmail,
          customerName: formData.customerName,
          restaurantSlug: restaurant.slug,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      const { url } = await paymentResponse.json();
      
      // Rediriger vers Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Erreur Stripe:', error);
      toast.error(error.message || 'Erreur lors de la préparation du paiement', { id: 'creating-order' });
      setIsProcessing(false);
    }
  };

  // Gestion du paiement PayPal
  const handlePayPalPayment = async () => {
    if (!restaurant.slug || cartItems.length === 0) {
      toast.error('Configuration manquante');
      return;
    }

    setIsProcessing(true);
    toast.loading('Préparation du paiement PayPal...', { id: 'creating-order' });

    try {
      // Créer d'abord la commande
      const result = await createOrder();
      if (!result) return;

      const orderNumber = result.order?.orderNumber;
      const orderId = result.order?.id;

      toast.success(`Commande ${orderNumber} créée ! Redirection vers PayPal...`, { id: 'creating-order' });

      // Créer une commande PayPal
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
        throw new Error('Erreur lors de la création de la commande PayPal');
      }

      const { approvalUrl } = await paymentResponse.json();
      
      // Rediriger vers PayPal
      window.location.href = approvalUrl;
    } catch (error: any) {
      console.error('Erreur PayPal:', error);
      toast.error(error.message || 'Erreur lors de la préparation du paiement PayPal', { id: 'creating-order' });
      setIsProcessing(false);
    }
  };

  // Gestionnaire principal du clic
  const handleConfirmClick = () => {
    console.log('🖱️ Bouton cliqué:', {
      paymentMethod: formData.paymentMethod,
      isProcessing,
      restaurantSlug: restaurant.slug,
      cartItemsLength: cartItems.length,
      restaurantWhatsApp: restaurant.whatsappNumber,
    });

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
        text: 'Traitement en cours...',
        icon: Loader2,
        className: 'bg-gray-400 cursor-not-allowed',
        iconClassName: 'animate-spin',
      };
    }

    switch (formData.paymentMethod) {
      case 'STRIPE':
        return {
          text: `Payer ${formatPrice(total)} par carte`,
          icon: CreditCard,
          className: 'bg-indigo-600 hover:bg-indigo-700',
          iconClassName: '',
        };
      case 'PAYPAL':
        return {
          text: `Payer ${formatPrice(total)} avec PayPal`,
          icon: Wallet,
          className: 'bg-blue-600 hover:bg-blue-700',
          iconClassName: '',
        };
      default:
        return {
          text: 'Confirmer et envoyer sur WhatsApp',
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
      <h3 className="text-lg font-semibold text-gray-900">Confirmation de commande</h3>

      {/* Card Infos Client */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">Informations client</h4>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">Nom:</span> {formData.customerName}</p>
              <p><span className="font-medium">Téléphone:</span> {formData.customerPhone}</p>
              {formData.customerEmail && (
                <p><span className="font-medium">Email:</span> {formData.customerEmail}</p>
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
            <h4 className="font-semibold text-gray-900 mb-2">Mode de livraison</h4>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">Type:</span> {getDeliveryLabel(formData.deliveryType)}</p>
              {formData.deliveryType === 'DELIVERY' && formData.deliveryAddress && (
                <p><span className="font-medium">📍 Adresse:</span> {formData.deliveryAddress}</p>
              )}
              {formData.notes && (
                <p><span className="font-medium">📝 Notes:</span> {formData.notes}</p>
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
            <h4 className="font-semibold text-gray-900 mb-2">Mode de paiement</h4>
            <p className="text-sm text-gray-700">{getPaymentLabel(formData.paymentMethod)}</p>
          </div>
        </div>
      </div>

      {/* Résumé Commande */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Résumé de la commande</h4>
        
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
                    Options: {item.selectedOptions.map(opt => opt.optionName).join(', ')}
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
            <span>Sous-total</span>
            <span className="font-medium">{formatPrice(cartTotal)}</span>
          </div>

          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Frais de livraison</span>
              <span className="font-medium">{formatPrice(deliveryFee)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Message informatif */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          {isOnlinePayment
            ? 'Vous serez redirigé vers une page de paiement sécurisée pour finaliser votre commande.'
            : 'En cliquant sur le bouton ci-dessous, vous serez redirigé vers WhatsApp pour confirmer votre commande.'}
        </p>
      </div>

      {/* Bouton de confirmation */}
      <div className="space-y-3">
        {/* Si WhatsApp URL est disponible après création de commande, afficher un lien direct */}
        {whatsappUrl && (
          <div className="space-y-3">
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900 mb-2 text-center">
                ✅ Commande créée avec succès !
              </p>
              <p className="text-xs text-green-700 mb-4 text-center">
                Cliquez sur le bouton ci-dessous pour ouvrir WhatsApp et envoyer votre commande :
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-lg text-lg font-bold transition-all flex items-center justify-center gap-3 text-white bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={(e) => {
                  console.log('📱 Lien direct WhatsApp cliqué', whatsappUrl);
                  // Ne pas empêcher le comportement par défaut pour que le lien fonctionne
                  // Le navigateur ouvrira WhatsApp ou l'app web
                }}
              >
                <MessageCircle className="w-6 h-6" />
                <span>Ouvrir WhatsApp maintenant</span>
              </a>
              <p className="text-xs text-gray-600 mt-3 text-center">
                Si WhatsApp ne s'ouvre pas, copiez le lien ou contactez directement le restaurant
              </p>
            </div>
            <button
              onClick={() => {
                setWhatsappUrl(null);
                setIsProcessing(false);
                // Ne pas appeler onConfirm() ici, juste réinitialiser pour permettre une nouvelle commande
              }}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm"
            >
              Créer une autre commande
            </button>
          </div>
        )}
        
        {/* Bouton principal (masqué si WhatsApp URL est disponible) */}
        {!whatsappUrl && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🖱️ onClick déclenché sur le bouton', { isMobile, isProcessing });
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
        
        {/* Debug info (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
            Debug: isMobile={String(isMobile)}, isProcessing={String(isProcessing)}, slug={restaurant.slug || 'undefined'}, items={cartItems.length}, hasWhatsAppUrl={String(!!whatsappUrl)}
          </div>
        )}
        
        {onPrev && (
          <button
            onClick={onPrev}
            disabled={isProcessing}
            className="w-full px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Retour
          </button>
        )}
      </div>
    </div>
  );
}
