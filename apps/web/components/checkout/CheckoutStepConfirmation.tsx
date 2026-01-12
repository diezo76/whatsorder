'use client';

import { User, Truck, ShoppingBag, UtensilsCrossed, MessageCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { CartItem } from '@/store/cartStore';
import { DeliveryType } from './CheckoutStepDelivery';

interface Restaurant {
  id?: string;
  slug?: string;
  name: string;
  whatsappNumber: string;
}

interface ConfirmationFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  notes?: string;
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
  cartTotal: number
): string => {
  const deliveryFee = getDeliveryFee(formData.deliveryType);
  const total = cartTotal + deliveryFee;

  // Formatage des items de la commande
  const itemsText = cartItems
    .map((item) => `• ${item.quantity}× ${item.name} - ${formatPrice(item.price * item.quantity)} EGP`)
    .join(' • ');

  // Formatage du type de livraison
  const deliveryTypeLabel = getDeliveryLabel(formData.deliveryType);
  const deliveryInfo = formData.deliveryType === 'DELIVERY' && formData.deliveryAddress
    ? `${deliveryTypeLabel}\n📍 Adresse: ${formData.deliveryAddress}`
    : deliveryTypeLabel;

  // Construction du message selon le format demandé
  let message = `🍽️ Nouvelle Commande - ${restaurant.name}\n\n`;
  message += `👤 Client Nom: ${formData.customerName} Tél: ${formData.customerPhone}\n`;
  
  if (formData.customerEmail) {
    message += `Email: ${formData.customerEmail}\n`;
  }
  
  message += `\n🚚 Livraison Type: ${deliveryInfo}\n`;
  
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
  const deliveryFee = getDeliveryFee(formData.deliveryType);
  const total = cartTotal + deliveryFee;
  const DeliveryIcon = getDeliveryIcon(formData.deliveryType);

  // Fonction pour normaliser le numéro WhatsApp au format international
  const normalizeWhatsAppNumber = (number: string): string => {
    // Enlever tous les espaces, tirets, parenthèses
    let cleaned = number.replace(/\s|-|\(|\)/g, '');
    
    // Si commence par +, garder tel quel
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // Si commence par 00, remplacer par +
    if (cleaned.startsWith('00')) {
      return '+' + cleaned.substring(2);
    }
    
    // Si commence par 20 (code pays Égypte), ajouter +
    if (cleaned.startsWith('20')) {
      return '+' + cleaned;
    }
    
    // Si commence par 0, remplacer par +20
    if (cleaned.startsWith('0')) {
      return '+20' + cleaned.substring(1);
    }
    
    // Sinon, ajouter +20 par défaut
    return '+20' + cleaned;
  };

  // Gestion du clic sur le bouton WhatsApp
  const handleWhatsAppClick = () => {
    // Vérifier que le numéro WhatsApp existe
    if (!restaurant.whatsappNumber) {
      toast.error('Numéro WhatsApp du restaurant non configuré');
      return;
    }

    try {
      // Générer le message WhatsApp
      const message = generateWhatsAppMessage(restaurant, formData, cartItems, cartTotal);
      const normalizedNumber = normalizeWhatsAppNumber(restaurant.whatsappNumber);
      const whatsappUrl = `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
      
      // Ouvrir WhatsApp dans un nouvel onglet
      window.open(whatsappUrl, '_blank');
      
      // Afficher un message de succès
      toast.success('Redirection vers WhatsApp...');
      
      // Appeler onConfirm pour fermer le modal et vider le panier après un court délai
      setTimeout(() => {
        onConfirm();
      }, 500);
    } catch (error: any) {
      console.error('Erreur lors de l\'ouverture de WhatsApp:', error);
      toast.error('Erreur lors de l\'ouverture de WhatsApp. Veuillez réessayer.');
    }
  };

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
              <p>
                <span className="font-medium">Nom:</span> {formData.customerName}
              </p>
              <p>
                <span className="font-medium">Téléphone:</span> {formData.customerPhone}
              </p>
              {formData.customerEmail && (
                <p>
                  <span className="font-medium">Email:</span> {formData.customerEmail}
                </p>
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
              <p>
                <span className="font-medium">Type:</span> {getDeliveryLabel(formData.deliveryType)}
              </p>
              {formData.deliveryType === 'DELIVERY' && formData.deliveryAddress && (
                <p>
                  <span className="font-medium">📍 Adresse:</span> {formData.deliveryAddress}
                </p>
              )}
              {formData.notes && (
                <p>
                  <span className="font-medium">📝 Notes:</span> {formData.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Résumé Commande */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Résumé de la commande</h4>
        
        {/* Liste des items */}
        <div className="divide-y divide-gray-200 mb-4">
          {cartItems.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {item.quantity}× {item.name}
                </p>
                {item.customization && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    {item.customization}
                  </p>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 ml-4">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Ligne séparatrice */}
        <div className="border-t border-gray-300 pt-4 space-y-2">
          {/* Sous-total */}
          <div className="flex justify-between text-sm text-gray-700">
            <span>Sous-total</span>
            <span className="font-medium">{formatPrice(cartTotal)}</span>
          </div>

          {/* Frais de livraison */}
          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm text-gray-700">
              <span>Frais de livraison</span>
              <span className="font-medium">{formatPrice(deliveryFee)}</span>
            </div>
          )}

          {/* Total final */}
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Message de confirmation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          En cliquant sur le bouton ci-dessous, vous serez redirigé vers WhatsApp pour confirmer votre commande.
        </p>
      </div>

      {/* Bouton WhatsApp */}
      <div className="space-y-3">
        <button
          onClick={handleWhatsAppClick}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-6 h-6" />
          <span>Envoyer sur WhatsApp</span>
        </button>
        
        {/* Bouton Retour */}
        {onPrev && (
          <button
            onClick={onPrev}
            className="w-full px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Retour
          </button>
        )}
      </div>
    </div>
  );
}
