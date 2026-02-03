'use client';

import { Banknote, CreditCard, Wallet } from 'lucide-react';

export type PaymentMethod = 'CASH' | 'CARD' | 'STRIPE' | 'PAYPAL';

interface PaymentFormData {
  paymentMethod: PaymentMethod;
}

// Options de paiement activées par le restaurant
export interface PaymentOptions {
  enableCashPayment?: boolean;
  enableCardPayment?: boolean;
  enableStripePayment?: boolean;
  enablePaypalPayment?: boolean;
}

interface CheckoutStepPaymentProps {
  formData: PaymentFormData;
  onChange: (field: string, value: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  isValid?: boolean;
  paymentOptions?: PaymentOptions;
}

interface PaymentOption {
  value: PaymentMethod;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  emoji: string;
  badge?: string;
  enabledKey: keyof PaymentOptions;
}

const allPaymentOptions: PaymentOption[] = [
  {
    value: 'CASH',
    icon: Banknote,
    title: 'Espèces',
    description: 'Paiement à la livraison',
    emoji: '💵',
    enabledKey: 'enableCashPayment',
  },
  {
    value: 'CARD',
    icon: CreditCard,
    title: 'Carte (à la livraison)',
    description: 'TPE mobile à la livraison',
    emoji: '💳',
    enabledKey: 'enableCardPayment',
  },
  {
    value: 'STRIPE',
    icon: CreditCard,
    title: 'Carte bancaire',
    description: 'Paiement sécurisé en ligne',
    emoji: '🔒',
    badge: 'En ligne',
    enabledKey: 'enableStripePayment',
  },
  {
    value: 'PAYPAL',
    icon: Wallet,
    title: 'PayPal',
    description: 'Paiement via votre compte PayPal',
    emoji: '🅿️',
    enabledKey: 'enablePaypalPayment',
  },
];

// Fonction de validation exportée
export const validatePaymentInfo = (data: PaymentFormData): boolean => {
  return !!data.paymentMethod;
};

export default function CheckoutStepPayment({
  formData,
  onChange,
  onNext,
  onPrev,
  isValid,
  paymentOptions = {
    enableCashPayment: true,
    enableCardPayment: true,
    enableStripePayment: false,
    enablePaypalPayment: false,
  },
}: CheckoutStepPaymentProps) {
  // Filtrer les options de paiement activées
  const availableOptions = allPaymentOptions.filter(
    (option) => paymentOptions[option.enabledKey] !== false
  );

  // Gestion du changement de mode de paiement
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    onChange('paymentMethod', method);
  };

  // Vérifier si le paiement est en ligne (nécessite redirection)
  const isOnlinePayment = formData.paymentMethod === 'STRIPE' || formData.paymentMethod === 'PAYPAL';

  // S'il n'y a qu'une seule option, la sélectionner automatiquement
  if (availableOptions.length === 1 && !formData.paymentMethod) {
    handlePaymentMethodChange(availableOptions[0].value);
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Mode de paiement</h3>

      {availableOptions.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            ⚠️ Aucun mode de paiement n'est configuré pour ce restaurant.
          </p>
        </div>
      ) : (
        <>
          {/* Sélecteur de mode de paiement */}
          <div className={`grid grid-cols-1 ${availableOptions.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
            {availableOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = formData.paymentMethod === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handlePaymentMethodChange(option.value)}
                  className={`
                    relative bg-white border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                    text-left hover:border-orange-200
                    ${isSelected 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-300'
                    }
                  `}
                  aria-pressed={isSelected}
                >
                  {/* Badge */}
                  {option.badge && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {option.badge}
                    </span>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icône */}
                    <div
                      className={`
                        w-12 h-12 flex items-center justify-center rounded-full
                        ${isSelected ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}
                      `}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {option.emoji} {option.title}
                      </h4>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>

                    {/* Radio indicator */}
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1
                        ${isSelected 
                          ? 'border-orange-500 bg-orange-500' 
                          : 'border-gray-300'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Message informatif pour paiement en ligne */}
          {isOnlinePayment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                🔒 Vous serez redirigé vers une page de paiement sécurisée après avoir confirmé votre commande.
              </p>
            </div>
          )}

          {/* Message informatif pour paiement à la livraison */}
          {(formData.paymentMethod === 'CASH' || formData.paymentMethod === 'CARD') && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                💡 Le paiement sera effectué à la réception de votre commande.
              </p>
            </div>
          )}
        </>
      )}

      {/* Boutons de navigation */}
      {onNext && (
        <div className="pt-4 space-y-3">
          <button
            onClick={onNext}
            disabled={!formData.paymentMethod || availableOptions.length === 0}
            className={`w-full px-8 py-3 rounded-lg font-semibold text-base transition-all ${
              formData.paymentMethod && availableOptions.length > 0
                ? 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            Suivant
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
      )}
    </div>
  );
}
