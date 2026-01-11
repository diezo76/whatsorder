'use client';

import { Building2, Image as ImageIcon, Phone, ChevronDown } from 'lucide-react';

interface RestaurantFormData {
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  timezone: string;
  language: string;
  openingHours: any;
  deliveryZones: any;
  whatsappNumber: string;
  whatsappApiToken: string;
  whatsappBusinessId: string;
}

interface SettingsGeneralTabProps {
  formData: RestaurantFormData;
  onChange: (field: string, value: any) => void;
}

// Options pour les selects
const languageOptions = [
  { value: 'ar', label: 'العربية (Arabe)' },
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];

const currencyOptions = [
  { value: 'EGP', label: 'EGP - Livre égyptienne' },
  { value: 'USD', label: 'USD - Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
];

const timezoneOptions = [
  { value: 'Africa/Cairo', label: 'Égypte (Cairo)' },
  { value: 'Europe/Paris', label: 'France (Paris)' },
  { value: 'Europe/London', label: 'Royaume-Uni (London)' },
  { value: 'America/New_York', label: 'États-Unis (New York)' },
  { value: 'Asia/Dubai', label: 'Émirats arabes unis (Dubai)' },
  { value: 'Africa/Casablanca', label: 'Maroc (Casablanca)' },
  { value: 'Europe/Madrid', label: 'Espagne (Madrid)' },
  { value: 'Europe/Rome', label: 'Italie (Rome)' },
];

// Fonction pour valider une URL
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true; // Vide est valide (optionnel)
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Fonction pour valider un email
const isValidEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return true; // Vide est valide (optionnel)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function SettingsGeneralTab({ formData, onChange }: SettingsGeneralTabProps) {
  const handleTextChange = (field: string, value: string) => {
    onChange(field, value);
  };

  const logoUrlValid = isValidUrl(formData.logo);
  const coverImageUrlValid = isValidUrl(formData.coverImage);
  const emailValid = isValidEmail(formData.email);

  return (
    <div className="space-y-8">
      {/* Section : Informations de base */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
        </div>

        <div className="space-y-4">
          {/* Nom du restaurant */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du restaurant <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleTextChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              placeholder="Ex: Restaurant El Fattah"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleTextChange('description', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-20 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              placeholder="Décrivez votre restaurant..."
            />
          </div>

          {/* Langue, Devise, Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Langue */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                Langue par défaut
              </label>
              <div className="relative">
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleTextChange('language', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors appearance-none bg-white"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Devise */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Devise
              </label>
              <div className="relative">
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleTextChange('currency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors appearance-none bg-white"
                >
                  {currencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Fuseau horaire */}
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                Fuseau horaire
              </label>
              <div className="relative">
                <select
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => handleTextChange('timezone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors appearance-none bg-white"
                >
                  {timezoneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section : Images */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Images</h3>
        </div>

        <div className="space-y-6">
          {/* Logo */}
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
              Logo du restaurant
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="url"
                  id="logo"
                  value={formData.logo}
                  onChange={(e) => handleTextChange('logo', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
                    !logoUrlValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  placeholder="https://example.com/logo.png"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload sera ajouté prochainement
                </p>
              </div>
              <div className="flex items-center justify-center">
                {formData.logo && logoUrlValid ? (
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="w-[150px] h-[150px] rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-[150px] h-[150px] rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image de couverture */}
          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
              Image de couverture
            </label>
            <div className="space-y-2">
              <input
                type="url"
                id="coverImage"
                value={formData.coverImage}
                onChange={(e) => handleTextChange('coverImage', e.target.value)}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
                  !coverImageUrlValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                }`}
                placeholder="https://example.com/cover.jpg"
              />
              <p className="text-xs text-gray-500">
                Recommandé : 1200x400px
              </p>
              {formData.coverImage && coverImageUrlValid ? (
                <div className="mt-2">
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-full max-w-[400px] h-[200px] rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full max-w-[400px] h-[200px] rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mt-2">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section : Coordonnées */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Coordonnées</h3>
        </div>

        <div className="space-y-4">
          {/* Téléphone et Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleTextChange('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                placeholder="+201234567890"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleTextChange('email', e.target.value)}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
                  !emailValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                }`}
                placeholder="contact@restaurant.com"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse complète
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleTextChange('address', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-20 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              placeholder="123 Rue Example, Ville, Pays"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
