'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Translations } from '@/lib/i18n/translations';

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

// Fonction de validation du nom (interne, retourne la clé de traduction)
const validateNameRaw = (name: string): boolean => {
  return !!name.trim() && name.trim().length >= 3;
};

// Fonction de validation du téléphone (interne)
const validatePhoneRaw = (phone: string): boolean => {
  if (!phone.trim()) return false;
  const cleanedPhone = phone.replace(/\s|-|\(|\)|\./g, '');
  if (!/\d/.test(cleanedPhone)) return false;
  const digitsOnly = cleanedPhone.replace(/\+/g, '');
  if (digitsOnly.length < 9 || digitsOnly.length > 13) return false;
  return true;
};

// Fonction de validation de l'email (interne)
const validateEmailRaw = (email: string): boolean => {
  if (!email.trim()) return true; // optionnel
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validation traduite du nom
const validateName = (name: string, t: Translations): string | undefined => {
  if (!name.trim()) return t.checkout.nameRequired;
  if (name.trim().length < 3) return t.checkout.nameMinLength;
  return undefined;
};

// Validation traduite du téléphone
const validatePhone = (phone: string, t: Translations): string | undefined => {
  if (!phone.trim()) return t.checkout.phoneRequired;
  
  const cleanedPhone = phone.replace(/\s|-|\(|\)|\./g, '');
  if (!/\d/.test(cleanedPhone)) return t.checkout.phoneMustContainDigits;
  
  const digitsOnly = cleanedPhone.replace(/\+/g, '');
  if (digitsOnly.length < 9) return t.checkout.phoneTooShort;
  if (digitsOnly.length > 13) return t.checkout.phoneTooLong;
  
  const startsWithPlus20 = cleanedPhone.startsWith('+20') || cleanedPhone.startsWith('20');
  const startsWith01 = cleanedPhone.startsWith('01');
  const startsWith1 = cleanedPhone.startsWith('1') && !cleanedPhone.startsWith('10');
  
  if (startsWithPlus20) {
    const afterCountryCode = cleanedPhone.replace(/^\+?20/, '');
    if (afterCountryCode.length !== 10 || !/^\d{10}$/.test(afterCountryCode)) {
      return t.checkout.phoneInvalidInternational;
    }
  } else if (startsWith01) {
    if (cleanedPhone.length !== 11 || !/^01\d{9}$/.test(cleanedPhone)) {
      return t.checkout.phoneInvalidLocal;
    }
  } else if (startsWith1) {
    if (cleanedPhone.length !== 11 || !/^1\d{10}$/.test(cleanedPhone)) {
      return t.checkout.phoneInvalidFormat;
    }
  } else {
    if (digitsOnly.length < 10) {
      return t.checkout.phoneInvalidFormat;
    }
    if (!/^\d{10,13}$/.test(digitsOnly)) {
      return t.checkout.phoneInvalidDigits;
    }
  }
  
  return undefined;
};

// Validation traduite de l'email
const validateEmail = (email: string, t: Translations): string | undefined => {
  if (!email.trim()) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t.checkout.emailInvalid;
  return undefined;
};

// Fonction de validation exportée (retourne boolean, pas de traduction nécessaire)
export const validateCustomerInfo = (data: CustomerFormData): boolean => {
  const nameOk = validateNameRaw(data.customerName);
  const phoneOk = validatePhoneRaw(data.customerPhone);
  const emailOk = data.customerEmail ? validateEmailRaw(data.customerEmail) : true;
  return nameOk && phoneOk && emailOk;
};

export default function CheckoutStepCustomer({
  formData,
  onChange,
  onNext,
  onPrev,
  isValid,
}: CheckoutStepCustomerProps) {
  const { t } = useLanguage();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation en temps réel quand les champs sont modifiés
  useEffect(() => {
    const newErrors: FieldErrors = {};
    
    if (touched.customerName || formData.customerName) {
      newErrors.customerName = validateName(formData.customerName, t);
    }
    
    if (touched.customerPhone || formData.customerPhone) {
      newErrors.customerPhone = validatePhone(formData.customerPhone, t);
    }
    
    if (touched.customerEmail || formData.customerEmail) {
      newErrors.customerEmail = validateEmail(formData.customerEmail || '', t);
    }
    
    setErrors(newErrors);
  }, [formData, touched, t]);

  const handleChange = (field: string, value: string) => {
    onChange(field, value);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">{t.checkout.yourInfo}</h3>

      {/* Champ Nom complet */}
      <div>
        <label
          htmlFor="customerName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t.checkout.fullName}{' '}
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
            placeholder={t.checkout.namePlaceholder}
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
          {t.checkout.phoneNumber}{' '}
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
            placeholder={t.checkout.phonePlaceholder}
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
          {t.checkout.phoneFormat}
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
          {t.checkout.email} <span className="text-gray-400 text-xs">({t.checkout.optional})</span>
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
            placeholder={t.checkout.emailPlaceholder}
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
