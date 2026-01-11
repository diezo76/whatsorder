'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Mail } from 'lucide-react';

interface CustomerFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

interface CheckoutStepCustomerProps {
  formData: CustomerFormData;
  onChange: (field: string, value: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  isValid?: boolean;
}

interface FieldErrors {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

// Fonction de validation du nom
const validateName = (name: string): string | undefined => {
  if (!name.trim()) {
    return 'Le nom est requis';
  }
  if (name.trim().length < 3) {
    return 'Le nom doit contenir au moins 3 caractères';
  }
  return undefined;
};

// Fonction de validation du téléphone
const validatePhone = (phone: string): string | undefined => {
  if (!phone.trim()) {
    return 'Le numéro de téléphone est requis';
  }
  
  // Nettoyer le numéro (enlever espaces, tirets, parenthèses, points)
  const cleanedPhone = phone.replace(/\s|-|\(|\)|\./g, '');
  
  // Vérifier qu'il contient au moins quelques chiffres
  if (!/\d/.test(cleanedPhone)) {
    return 'Le numéro doit contenir des chiffres';
  }
  
  // Extraire uniquement les chiffres et le + éventuel au début
  const digitsOnly = cleanedPhone.replace(/\+/g, '');
  
  // Vérifier la longueur minimale (au moins 9 chiffres)
  if (digitsOnly.length < 9) {
    return 'Le numéro est trop court (minimum 9 chiffres)';
  }
  
  // Vérifier la longueur maximale (max 13 chiffres)
  if (digitsOnly.length > 13) {
    return 'Le numéro est trop long (maximum 13 chiffres)';
  }
  
  // Formats acceptés (plus flexibles) :
  // - Commence par +20 ou 20 suivi de 10 chiffres (format international)
  // - Commence par 01 suivi de 9 chiffres (format local égyptien)
  // - Commence par 1 suivi de 10 chiffres (format local sans 0)
  // - Ou simplement au moins 10 chiffres (validation basique)
  
  const startsWithPlus20 = cleanedPhone.startsWith('+20') || cleanedPhone.startsWith('20');
  const startsWith01 = cleanedPhone.startsWith('01');
  const startsWith1 = cleanedPhone.startsWith('1') && !cleanedPhone.startsWith('10');
  
  if (startsWithPlus20) {
    // Format international : +20 ou 20 suivi de 10 chiffres
    const afterCountryCode = cleanedPhone.replace(/^\+?20/, '');
    if (afterCountryCode.length !== 10 || !/^\d{10}$/.test(afterCountryCode)) {
      return 'Format international invalide. Utilisez: +20 123 456 7890';
    }
  } else if (startsWith01) {
    // Format local : 01 suivi de 9 chiffres (total 11)
    if (cleanedPhone.length !== 11 || !/^01\d{9}$/.test(cleanedPhone)) {
      return 'Format local invalide. Utilisez: 01012345678';
    }
  } else if (startsWith1) {
    // Format local sans 0 : 1 suivi de 10 chiffres (total 11)
    if (cleanedPhone.length !== 11 || !/^1\d{10}$/.test(cleanedPhone)) {
      return 'Format invalide. Utilisez: 01012345678 ou +20 123 456 7890';
    }
  } else {
    // Pour les autres formats, vérifier qu'il y a au moins 10 chiffres
    if (digitsOnly.length < 10) {
      return 'Format invalide. Utilisez: +20 123 456 7890 ou 01012345678';
    }
    // Accepter si c'est un numéro valide avec au moins 10 chiffres
    if (!/^\d{10,13}$/.test(digitsOnly)) {
      return 'Format invalide. Le numéro doit contenir entre 10 et 13 chiffres';
    }
  }
  
  return undefined;
};

// Fonction de validation de l'email
const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) {
    // Email optionnel, pas d'erreur si vide
    return undefined;
  }
  
  // Regex basique pour email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return 'Format d\'email invalide';
  }
  
  return undefined;
};

// Fonction de validation exportée
export const validateCustomerInfo = (data: CustomerFormData): boolean => {
  const nameError = validateName(data.customerName);
  const phoneError = validatePhone(data.customerPhone);
  
  // Email optionnel, on ne vérifie que s'il est rempli
  const emailError = data.customerEmail ? validateEmail(data.customerEmail) : undefined;
  
  return !nameError && !phoneError && !emailError;
};

export default function CheckoutStepCustomer({
  formData,
  onChange,
  onNext,
  onPrev,
  isValid,
}: CheckoutStepCustomerProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation en temps réel quand les champs sont modifiés
  useEffect(() => {
    const newErrors: FieldErrors = {};
    
    if (touched.customerName || formData.customerName) {
      newErrors.customerName = validateName(formData.customerName);
    }
    
    if (touched.customerPhone || formData.customerPhone) {
      newErrors.customerPhone = validatePhone(formData.customerPhone);
    }
    
    if (touched.customerEmail || formData.customerEmail) {
      newErrors.customerEmail = validateEmail(formData.customerEmail || '');
    }
    
    setErrors(newErrors);
  }, [formData, touched]);

  // Gestion du changement de valeur
  const handleChange = (field: string, value: string) => {
    onChange(field, value);
  };

  // Gestion du blur (champ perdu le focus)
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Vos informations</h3>

      {/* Champ Nom complet */}
      <div>
        <label
          htmlFor="customerName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Nom complet{' '}
          <span className="text-red-500" aria-label="requis">
            *
          </span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="customerName"
            value={formData.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            onBlur={() => handleBlur('customerName')}
            placeholder="Ex: Ahmed Mohamed"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.customerName && touched.customerName
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-orange-500'
            }`}
            aria-invalid={errors.customerName && touched.customerName ? 'true' : 'false'}
            aria-describedby={errors.customerName && touched.customerName ? 'customerName-error' : undefined}
          />
        </div>
        {errors.customerName && touched.customerName && (
          <p
            id="customerName-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.customerName}
          </p>
        )}
      </div>

      {/* Champ Numéro de téléphone */}
      <div>
        <label
          htmlFor="customerPhone"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Numéro de téléphone{' '}
          <span className="text-red-500" aria-label="requis">
            *
          </span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            id="customerPhone"
            value={formData.customerPhone}
            onChange={(e) => handleChange('customerPhone', e.target.value)}
            onBlur={() => handleBlur('customerPhone')}
            placeholder="+20 123 456 7890 ou 01012345678"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.customerPhone && touched.customerPhone
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-orange-500'
            }`}
            aria-invalid={errors.customerPhone && touched.customerPhone ? 'true' : 'false'}
            aria-describedby={
              errors.customerPhone && touched.customerPhone
                ? 'customerPhone-error'
                : 'customerPhone-help'
            }
          />
        </div>
        <p
          id="customerPhone-help"
          className="mt-1 text-xs text-gray-500"
        >
          Format: +20 123 456 7890 ou 01012345678
        </p>
        {errors.customerPhone && touched.customerPhone && (
          <p
            id="customerPhone-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.customerPhone}
          </p>
        )}
      </div>

      {/* Champ Email */}
      <div>
        <label
          htmlFor="customerEmail"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email <span className="text-gray-400 text-xs">(optionnel)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="customerEmail"
            value={formData.customerEmail || ''}
            onChange={(e) => handleChange('customerEmail', e.target.value)}
            onBlur={() => handleBlur('customerEmail')}
            placeholder="exemple@email.com"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              errors.customerEmail && touched.customerEmail
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-orange-500'
            }`}
            aria-invalid={errors.customerEmail && touched.customerEmail ? 'true' : 'false'}
            aria-describedby={errors.customerEmail && touched.customerEmail ? 'customerEmail-error' : undefined}
          />
        </div>
        {errors.customerEmail && touched.customerEmail && (
          <p
            id="customerEmail-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.customerEmail}
          </p>
        )}
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
