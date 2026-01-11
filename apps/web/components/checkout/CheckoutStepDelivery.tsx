'use client';

import { useState, useEffect } from 'react';
import { Truck, ShoppingBag, UtensilsCrossed } from 'lucide-react';

export type DeliveryType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';

interface DeliveryFormData {
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  notes?: string;
}

interface CheckoutStepDeliveryProps {
  formData: DeliveryFormData;
  onChange: (field: string, value: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  isValid?: boolean;
}

interface DeliveryOption {
  value: DeliveryType;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  emoji: string;
}

const deliveryOptions: DeliveryOption[] = [
  {
    value: 'DELIVERY',
    icon: Truck,
    title: 'Livraison à domicile',
    description: 'Livré chez vous',
    emoji: '🚚',
  },
  {
    value: 'PICKUP',
    icon: ShoppingBag,
    title: 'À emporter',
    description: 'Récupérez votre commande',
    emoji: '🏃',
  },
  {
    value: 'DINE_IN',
    icon: UtensilsCrossed,
    title: 'Sur place',
    description: 'Mangez au restaurant',
    emoji: '🍽️',
  },
];

// Fonction de validation de l'adresse
const validateAddress = (address: string): string | undefined => {
  if (!address.trim()) {
    return 'L\'adresse est requise pour la livraison';
  }
  if (address.trim().length < 10) {
    return 'L\'adresse doit contenir au moins 10 caractères';
  }
  return undefined;
};

// Fonction de validation exportée
export const validateDeliveryInfo = (data: DeliveryFormData): boolean => {
  // Vérifier que deliveryType existe
  if (!data.deliveryType) {
    return false;
  }

  // Si DELIVERY, vérifier que l'adresse est remplie et >= 10 caractères
  if (data.deliveryType === 'DELIVERY') {
    if (!data.deliveryAddress?.trim() || data.deliveryAddress.trim().length < 10) {
      return false;
    }
  }

  return true;
};

export default function CheckoutStepDelivery({
  formData,
  onChange,
  onNext,
  onPrev,
  isValid,
}: CheckoutStepDeliveryProps) {
  const [addressError, setAddressError] = useState<string | undefined>();
  const [showAddressField, setShowAddressField] = useState(
    formData.deliveryType === 'DELIVERY'
  );

  // Gestion du changement de type de livraison
  const handleDeliveryTypeChange = (type: DeliveryType) => {
    onChange('deliveryType', type);
    
    // Réinitialiser l'adresse si on passe de DELIVERY à autre chose
    if (type !== 'DELIVERY' && formData.deliveryAddress) {
      onChange('deliveryAddress', '');
    }
  };

  // Afficher/masquer le champ adresse avec animation
  useEffect(() => {
    if (formData.deliveryType === 'DELIVERY') {
      setShowAddressField(true);
    } else {
      // Délai pour permettre l'animation de sortie
      const timer = setTimeout(() => {
        setShowAddressField(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [formData.deliveryType]);

  // Validation de l'adresse en temps réel
  useEffect(() => {
    if (formData.deliveryType === 'DELIVERY' && formData.deliveryAddress) {
      setAddressError(validateAddress(formData.deliveryAddress));
    } else {
      setAddressError(undefined);
    }
  }, [formData.deliveryAddress, formData.deliveryType]);

  // Gestion du changement d'adresse
  const handleAddressChange = (value: string) => {
    onChange('deliveryAddress', value);
  };

  // Gestion du changement de notes
  const handleNotesChange = (value: string) => {
    // Limiter à 200 caractères
    if (value.length <= 200) {
      onChange('notes', value);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Mode de récupération</h3>

      {/* Sélecteur de type de livraison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deliveryOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = formData.deliveryType === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleDeliveryTypeChange(option.value)}
              className={`
                bg-white border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                text-left hover:border-orange-200
                ${isSelected 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-300'
                }
              `}
              aria-pressed={isSelected}
            >
              <div className="flex flex-col items-center text-center">
                {/* Icône */}
                <div
                  className={`
                    w-12 h-12 flex items-center justify-center mb-3
                    ${isSelected ? 'text-orange-600' : 'text-gray-400'}
                  `}
                >
                  <Icon className="w-full h-full" />
                </div>

                {/* Titre */}
                <h4 className="font-semibold text-gray-900 mb-1">
                  {option.emoji} {option.title}
                </h4>

                {/* Description */}
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Champ adresse (conditionnel) */}
      {showAddressField && (
        <div
          className={`
            transition-all duration-300 ease-in-out
            ${formData.deliveryType === 'DELIVERY' 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-2'
            }
          `}
        >
          <label
            htmlFor="deliveryAddress"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Adresse de livraison{' '}
            <span className="text-red-500" aria-label="requis">
              *
            </span>
          </label>
          <textarea
            id="deliveryAddress"
            value={formData.deliveryAddress || ''}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="Numéro, rue, quartier, ville..."
            rows={3}
            className={`
              w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-colors
              ${addressError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-orange-500'
              }
            `}
            aria-invalid={addressError ? 'true' : 'false'}
            aria-describedby={addressError ? 'deliveryAddress-error' : undefined}
          />
          {addressError && (
            <p
              id="deliveryAddress-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {addressError}
            </p>
          )}
        </div>
      )}

      {/* Champ notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Notes / Instructions{' '}
          <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
        </label>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Instructions spéciales, allergies, préférences..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          maxLength={200}
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.notes?.length || 0}/200 caractères
        </p>
      </div>

      {/* Bouton Suivant */}
      {onNext && (
        <div className="pt-4 space-y-3">
          <button
            onClick={onNext}
            disabled={isValid === false}
            className={`w-full px-8 py-3 rounded-lg font-semibold text-base transition-all ${
              isValid !== false
                ? 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
            title={isValid === false ? 'Veuillez remplir correctement tous les champs requis' : ''}
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
