'use client';

import Image from 'next/image';
import { Phone, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { isRestaurantOpen } from '@/lib/shared/pricing';

interface Restaurant {
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  phone: string;
  address: string;
  openingHours?: Record<string, { open: string; close: string; closed?: boolean }> | string;
}

interface RestaurantHeaderProps {
  restaurant: Restaurant;
}

// Fonction pour obtenir les initiales du restaurant
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  const { name, description, logo, coverImage, phone, address, openingHours } = restaurant;
  const { t } = useLanguage();

  return (
    <div className="relative w-full">
      {/* Hero Section avec image de couverture */}
      <div
        className={`relative h-64 md:h-80 w-full ${
          coverImage ? '' : 'bg-gradient-to-br from-primary to-primary/80'
        }`}
      >
        {/* Image de couverture optimisée */}
        {coverImage && (
          <Image
            src={coverImage}
            alt={`${name} - couverture`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        {/* Overlay gradient pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />

        {/* Container centré avec contenu */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 py-8 w-full">
            <div className="flex flex-col items-center text-center text-white">
              {/* Logo du restaurant */}
              {logo ? (
                <div className="mb-4 relative w-24 h-24 md:w-32 md:h-32">
                  <Image
                    src={logo}
                    alt={name}
                    fill
                    sizes="128px"
                    className="rounded-full object-cover border-4 border-white/20 shadow-lg"
                    priority
                  />
                </div>
              ) : (
                <div className="mb-4 w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/20 shadow-lg">
                  <span className="text-3xl md:text-4xl font-bold text-white">
                    {getInitials(name)}
                  </span>
                </div>
              )}

              {/* Nom du restaurant */}
              <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">{name}</h1>

              {/* Description */}
              {description && (
                <p className="text-lg md:text-xl text-gray-100 max-w-2xl drop-shadow-md">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section infos pratiques */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Téléphone */}
            <div className="bg-white rounded-lg shadow p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.header.phone}
                </h3>
                <a
                  href={`tel:${phone}`}
                  className="text-gray-900 font-medium hover:text-primary transition-colors break-all"
                >
                  {phone}
                </a>
              </div>
            </div>

            {/* Adresse */}
            <div className="bg-white rounded-lg shadow p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.header.address}
                </h3>
                <p className="text-gray-900 font-medium break-words">{address}</p>
              </div>
            </div>

            {/* Statut Ouvert/Fermé */}
            <div className="bg-white rounded-lg shadow p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isRestaurantOpen(openingHours) ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Clock className={`w-5 h-5 ${
                  isRestaurantOpen(openingHours) ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.header.status}
                </h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  isRestaurantOpen(openingHours)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    isRestaurantOpen(openingHours) ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></span>
                  {isRestaurantOpen(openingHours) ? t.header.open : t.header.closed}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
