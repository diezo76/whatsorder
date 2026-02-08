'use client';

import { Banknote, CreditCard, Wallet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  titleKey: 'cash' | 'cardDelivery' | 'creditCard' | 'paypal';
  descriptionKey: 'cashDescription' | 'cardDeliveryDescription' | 'creditCardDescription' | 'paypalDescription';
  emoji: string;
  badgeKey?: 'online';
  enabledKey: keyof PaymentOptions;
}

const allPaymentOptions: PaymentOption[] = [
  {
    value: 'CASH',
    icon: Banknote,
    titleKey: 'cash',
    descriptionKey: 'cashDescription',
    emoji: '💵',
    enabledKey: 'enableCashPayment',
  },
  {
    value: 'CARD',
    icon: CreditCard,
    titleKey: 'cardDelivery',
    descriptionKey: 'cardDeliveryDescription',
    emoji: '💳',
    enabledKey: 'enableCardPayment',
  },
  {
    value: 'STRIPE',
    icon: CreditCard,
    titleKey: 'creditCard',
    descriptionKey: 'creditCardDescription',
    emoji: '🔒',
    badgeKey: 'online',
    enabledKey: 'enableStripePayment',
  },
  {
    value: 'PAYPAL',
    icon: Wallet,
    titleKey: 'paypal',
    descriptionKey: 'paypalDescription',
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
  const { t } = useLanguage();

  // Filtrer les options de paiement activées
  const availableOptions = allPaymentOptions.filter(
    (option) => paymentOptions[option.enabledKey] !== false
  );

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    onChange('paymentMethod', method);
  };

  const isOnlinePayment = formData.paymentMethod === 'STRIPE' || formData.paymentMethod === 'PAYPAL';

  // S'il n'y a qu'une seule option, la sélectionner automatiquement
  if (availableOptions.length === 1 && !formData.paymentMethod) {
    handlePaymentMethodChange(availableOptions[0].value);
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">{t.checkout.paymentMode}</h3>

      {availableOptions.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            {t.checkout.noPaymentMethod}
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
                  {option.badgeKey && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {t.checkout[option.badgeKey]}
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
                        {option.emoji} {t.checkout[option.titleKey]}
                      </h4>
                      <p className="text-sm text-gray-500">{t.checkout[option.descriptionKey]}</p>
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
                {t.checkout.onlinePaymentRedirect}
              </p>
            </div>
          )}

          {/* Message informatif pour paiement à la livraison */}
          {(formData.paymentMethod === 'CASH' || formData.paymentMethod === 'CARD') && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                {t.checkout.paymentOnDelivery}
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
            {t.checkout.next}
          </button>
          
          {/* Bouton Retour */}
          {onPrev && (
            <button
              onClick={onPrev}
              className="w-full px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              {t.checkout.back}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
