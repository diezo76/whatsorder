'use client';

import { useState, useEffect } from 'react';
import { Truck, ShoppingBag, UtensilsCrossed, MapPin, Clock, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export type DeliveryType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';
export type DeliveryZone = 'NASR_CITY' | 'NEW_CAIRO' | '';

interface DeliveryFormData {
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  deliveryZone?: string;
  scheduledTime?: string;
  notes?: string;
}

interface CheckoutStepDeliveryProps {
  formData: DeliveryFormData;
  onChange: (field: string, value: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  isValid?: boolean;
  restaurantDeliveryZones?: Array<{ name: string; fee: number }>;
}

// Fonction de validation exportée
export const validateDeliveryInfo = (data: DeliveryFormData): boolean => {
  if (!data.deliveryType) return false;
  if (data.deliveryType === 'DELIVERY') {
    if (!data.deliveryAddress?.trim() || data.deliveryAddress.trim().length < 10) return false;
    if (!data.deliveryZone) return false;
  }
  return true;
};

export default function CheckoutStepDelivery({
  formData,
  onChange,
  onNext,
  onPrev,
  isValid,
  restaurantDeliveryZones,
}: CheckoutStepDeliveryProps) {
  const { t } = useLanguage();
  const [addressError, setAddressError] = useState<string | undefined>();
  const [showAddressField, setShowAddressField] = useState(
    formData.deliveryType === 'DELIVERY'
  );
  const [useScheduledTime, setUseScheduledTime] = useState(!!formData.scheduledTime);

  // Delivery options (translated)
  const deliveryOptions = [
    {
      value: 'DELIVERY' as DeliveryType,
      icon: Truck,
      title: t.checkout.homeDelivery,
      description: t.checkout.deliveredToYou,
      emoji: '🚚',
    },
    {
      value: 'PICKUP' as DeliveryType,
      icon: ShoppingBag,
      title: t.checkout.takeaway,
      description: t.checkout.pickUpOrder,
      emoji: '🏃',
    },
    {
      value: 'DINE_IN' as DeliveryType,
      icon: UtensilsCrossed,
      title: t.checkout.dineIn,
      description: t.checkout.eatAtRestaurant,
      emoji: '🍽️',
    },
  ];

  // Delivery zones dynamiques depuis les paramètres du restaurant
  const defaultZones = [
    { value: 'NASR_CITY' as DeliveryZone, label: t.checkout.nasrCity, fee: 50 },
    { value: 'NEW_CAIRO' as DeliveryZone, label: t.checkout.newCairo, fee: 100 },
  ];

  const deliveryZones = restaurantDeliveryZones && restaurantDeliveryZones.length > 0
    ? restaurantDeliveryZones.map((z) => ({
        value: z.name as DeliveryZone,
        label: z.name,
        fee: z.fee,
      }))
    : defaultZones;

  // Validation de l'adresse traduite
  const validateAddress = (address: string): string | undefined => {
    if (!address.trim()) return t.checkout.addressRequired;
    if (address.trim().length < 10) return t.checkout.addressMinLength;
    return undefined;
  };

  // Gestion du changement de type de livraison
  const handleDeliveryTypeChange = (type: DeliveryType) => {
    onChange('deliveryType', type);
    if (type !== 'DELIVERY') {
      if (formData.deliveryAddress) onChange('deliveryAddress', '');
      if (formData.deliveryZone) onChange('deliveryZone', '');
    }
    if (type === 'DELIVERY') {
      onChange('scheduledTime', '');
      setUseScheduledTime(false);
    }
  };

  // Afficher/masquer le champ adresse avec animation
  useEffect(() => {
    if (formData.deliveryType === 'DELIVERY') {
      setShowAddressField(true);
    } else {
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
  }, [formData.deliveryAddress, formData.deliveryType, t]);

  const handleAddressChange = (value: string) => {
    onChange('deliveryAddress', value);
  };

  const handleNotesChange = (value: string) => {
    if (value.length <= 200) {
      onChange('notes', value);
    }
  };

  const handleScheduleToggle = (scheduled: boolean) => {
    setUseScheduledTime(scheduled);
    if (!scheduled) {
      onChange('scheduledTime', '');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">{t.checkout.deliveryMode}</h3>

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
                <div
                  className={`
                    w-12 h-12 flex items-center justify-center mb-3
                    ${isSelected ? 'text-orange-600' : 'text-gray-400'}
                  `}
                >
                  <Icon className="w-full h-full" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {option.emoji} {option.title}
                </h4>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sélecteur d'heure pour emporter / sur place */}
      {(formData.deliveryType === 'PICKUP' || formData.deliveryType === 'DINE_IN') && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 inline-block mr-1 mb-0.5" />
            {t.checkout.whenDoYouWant}
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleScheduleToggle(false)}
              className={`p-3 border-2 rounded-lg text-center transition-all ${
                !useScheduledTime
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              <p className="font-semibold text-sm">{t.checkout.asap}</p>
              <p className="text-xs text-gray-500 mt-1">{t.checkout.immediatePreparation}</p>
            </button>
            <button
              type="button"
              onClick={() => handleScheduleToggle(true)}
              className={`p-3 border-2 rounded-lg text-center transition-all ${
                useScheduledTime
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              <p className="font-semibold text-sm">{t.checkout.schedule}</p>
              <p className="text-xs text-gray-500 mt-1">{t.checkout.chooseTime}</p>
            </button>
          </div>

          {useScheduledTime && (
            <div className="transition-all duration-300">
              <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                {t.checkout.desiredTime} <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="scheduledTime"
                value={formData.scheduledTime || ''}
                onChange={(e) => onChange('scheduledTime', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-lg"
              />
            </div>
          )}
        </div>
      )}

      {/* Section livraison : zone + message + adresse */}
      {showAddressField && (
        <div
          className={`space-y-4 transition-all duration-300 ease-in-out ${
            formData.deliveryType === 'DELIVERY' 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-2'
          }`}
        >
          {/* Sélection de la zone de livraison */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline-block mr-1 mb-0.5" />
              {t.checkout.deliveryZone} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {deliveryZones.map((zone) => {
                const isSelected = formData.deliveryZone === zone.value;
                return (
                  <button
                    key={zone.value}
                    type="button"
                    onClick={() => onChange('deliveryZone', zone.value)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-900">{zone.label}</p>
                    <p className={`text-sm mt-1 font-medium ${isSelected ? 'text-orange-600' : 'text-gray-500'}`}>
                      {zone.fee} EGP
                    </p>
                  </button>
                );
              })}
            </div>
            {!formData.deliveryZone && (
              <p className="mt-1 text-sm text-orange-600">
                {t.checkout.selectDeliveryZone}
              </p>
            )}
          </div>

          {/* Message WhatsApp localisation */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <span className="font-medium">{t.checkout.important} :</span> {t.checkout.whatsappLocationReminder}
            </p>
          </div>

          {/* Champ adresse */}
          <div>
            <label
              htmlFor="deliveryAddress"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.checkout.deliveryAddress}{' '}
              <span className="text-red-500" aria-label="requis">
                *
              </span>
            </label>
            <textarea
              id="deliveryAddress"
              value={formData.deliveryAddress || ''}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder={t.checkout.addressPlaceholder}
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
        </div>
      )}

      {/* Champ notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t.checkout.notesInstructions}{' '}
          <span className="text-gray-400 text-xs font-normal">({t.checkout.optional})</span>
        </label>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={t.checkout.specialInstructions}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          maxLength={200}
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.notes?.length || 0}/200 {t.checkout.characters}
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
            title={isValid === false ? t.checkout.fillRequiredFields : ''}
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
