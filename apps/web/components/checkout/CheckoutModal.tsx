'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { CartItem, useCartStore } from '@/store/cartStore';
import CheckoutStepCustomer, { validateCustomerInfo } from './CheckoutStepCustomer';
import CheckoutStepDelivery, { validateDeliveryInfo, DeliveryType } from './CheckoutStepDelivery';
import CheckoutStepPayment, { validatePaymentInfo, PaymentMethod } from './CheckoutStepPayment';
import CheckoutStepConfirmation from './CheckoutStepConfirmation';

interface Restaurant {
  id?: string;
  slug?: string;
  name: string;
  phone: string;
  whatsappNumber?: string; // Optionnel car peut ne pas être défini
}

interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  cartItems: CartItem[];
  cartTotal: number;
  onConfirm?: () => void;
}

const TOTAL_STEPS = 4;

export default function CheckoutModal({
  isOpen,
  onClose,
  restaurant,
  cartItems,
  cartTotal,
  onConfirm,
}: CheckoutModalProps) {
  const clearCart = useCartStore((state) => state.clearCart);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryType: 'DELIVERY',
    deliveryAddress: '',
    notes: '',
    paymentMethod: 'CASH',
  });

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        deliveryType: 'DELIVERY',
        deliveryAddress: '',
        notes: '',
        paymentMethod: 'CASH',
      });
    }
  }, [isOpen]);

  // Gestion de la touche ESC pour fermer le modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body quand le modal est ouvert
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Gestion du clic sur l'overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Gestion du changement de formulaire
  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validation pour déterminer si le bouton "Suivant" doit être disabled
  const isStepValid = useMemo((): boolean => {
    if (currentStep === 1) {
      return validateCustomerInfo({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
      });
    } else if (currentStep === 2) {
      return validateDeliveryInfo({
        deliveryType: formData.deliveryType,
        deliveryAddress: formData.deliveryAddress,
        notes: formData.notes,
      });
    } else if (currentStep === 3) {
      return validatePaymentInfo({
        paymentMethod: formData.paymentMethod,
      });
    }
    return true;
  }, [currentStep, formData]);

  // Navigation vers l'étape suivante avec validation
  const nextStep = () => {
    // Validation selon l'étape actuelle
    if (currentStep === 1) {
      if (!validateCustomerInfo({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
      })) {
        return;
      }
    } else if (currentStep === 2) {
      if (!validateDeliveryInfo({
        deliveryType: formData.deliveryType,
        deliveryAddress: formData.deliveryAddress,
        notes: formData.notes,
      })) {
        return;
      }
    } else if (currentStep === 3) {
      if (!validatePaymentInfo({
        paymentMethod: formData.paymentMethod,
      })) {
        return;
      }
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigation vers l'étape précédente
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Gestion de la confirmation (vidage du panier et fermeture)
  const handleConfirm = () => {
    clearCart();
    onClose();
    if (onConfirm) {
      onConfirm();
    }
  };

  // Rendu de l'indicateur d'étapes
  const renderStepIndicator = () => {
    const steps = [1, 2, 3, 4];
    
    return (
      <div className="flex items-center justify-center gap-1 mb-6">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                currentStep >= step
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`w-8 h-0.5 mx-1 ${
                  currentStep > step ? 'bg-orange-600' : 'bg-gray-200'
                }`} 
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Titres des étapes
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Vos informations';
      case 2: return 'Livraison';
      case 3: return 'Paiement';
      case 4: return 'Confirmation';
      default: return '';
    }
  };

  // Rendu du contenu de l'étape actuelle
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CheckoutStepCustomer
            formData={{
              customerName: formData.customerName,
              customerPhone: formData.customerPhone,
              customerEmail: formData.customerEmail,
            }}
            onChange={handleFormChange}
            onNext={nextStep}
            onPrev={currentStep > 1 ? prevStep : undefined}
            isValid={currentStep === 1 ? isStepValid : undefined}
          />
        );
      case 2:
        return (
          <CheckoutStepDelivery
            formData={{
              deliveryType: formData.deliveryType,
              deliveryAddress: formData.deliveryAddress,
              notes: formData.notes,
            }}
            onChange={handleFormChange}
            onNext={nextStep}
            onPrev={prevStep}
            isValid={currentStep === 2 ? isStepValid : undefined}
          />
        );
      case 3:
        return (
          <CheckoutStepPayment
            formData={{
              paymentMethod: formData.paymentMethod,
            }}
            onChange={handleFormChange}
            onNext={nextStep}
            onPrev={prevStep}
            isValid={currentStep === 3 ? isStepValid : undefined}
          />
        );
      case 4:
        return (
          <CheckoutStepConfirmation
            formData={{
              customerName: formData.customerName,
              customerPhone: formData.customerPhone,
              customerEmail: formData.customerEmail,
              deliveryType: formData.deliveryType,
              deliveryAddress: formData.deliveryAddress,
              notes: formData.notes,
              paymentMethod: formData.paymentMethod,
            }}
            cartItems={cartItems}
            cartTotal={cartTotal}
            restaurant={restaurant}
            onConfirm={handleConfirm}
            onPrev={prevStep}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <>
      {/* Overlay sombre */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={handleOverlayClick}
        aria-hidden="false"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full w-full h-full md:h-auto bg-white rounded-lg shadow-2xl z-50 flex flex-col transition-all duration-300 max-h-screen"
        aria-hidden="false"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-lg">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Finaliser la commande</h2>
            <p className="text-sm text-gray-500 mt-1">
              Étape {currentStep}/{TOTAL_STEPS} - {getStepTitle()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
            aria-label="Fermer le modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Indicateur d'étapes */}
        <div className="px-6 pt-6">
          {renderStepIndicator()}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {renderStepContent()}
        </div>

      </div>
    </>
  );

  // Utiliser un portail pour rendre directement dans le body
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}
