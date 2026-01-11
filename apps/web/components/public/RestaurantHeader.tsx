'use client';

import { Phone, MapPin, Clock } from 'lucide-react';

interface Restaurant {
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  phone: string;
  address: string;
  openingHours?: Record<string, { open: string; close: string }> | string;
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

// Fonction pour formater les horaires
const formatOpeningHours = (
  openingHours?: Record<string, { open: string; close: string }> | string
): string => {
  if (!openingHours) {
    return 'Horaires non disponibles';
  }

  if (typeof openingHours === 'string') {
    return openingHours;
  }

  // Formater les horaires par jour
  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const formattedDays = days.map((day) => {
    const hours = openingHours[day];
    if (!hours) return null;
    return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours.open} - ${hours.close}`;
  });

  const availableDays = formattedDays.filter(Boolean);
  if (availableDays.length === 0) {
    return 'Horaires non disponibles';
  }

  // Si tous les jours ont les mêmes horaires
  const firstDayHours = formattedDays[0];
  if (availableDays.every((day) => day === firstDayHours)) {
    return `Tous les jours: ${openingHours[days[0]]?.open} - ${openingHours[days[0]]?.close}`;
  }

  // Sinon, afficher les jours de la semaine
  return availableDays.join(', ');
};

export default function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  const { name, description, logo, coverImage, phone, address, openingHours } = restaurant;

  return (
    <div className="relative w-full">
      {/* Hero Section avec image de couverture */}
      <div
        className={`relative h-64 md:h-80 w-full bg-cover bg-center ${
          coverImage ? '' : 'bg-gradient-to-br from-primary to-primary/80'
        }`}
        style={
          coverImage
            ? {
                backgroundImage: `url(${coverImage})`,
              }
            : undefined
        }
      >
        {/* Overlay gradient pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />

        {/* Container centré avec contenu */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 py-8 w-full">
            <div className="flex flex-col items-center text-center text-white">
              {/* Logo du restaurant */}
              {logo ? (
                <div className="mb-4">
                  <img
                    src={logo}
                    alt={name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white/20 shadow-lg"
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
                  Téléphone
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
                  Adresse
                </h3>
                <p className="text-gray-900 font-medium break-words">{address}</p>
              </div>
            </div>

            {/* Horaires */}
            <div className="bg-white rounded-lg shadow p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Horaires
                </h3>
                <p className="text-gray-900 font-medium text-sm leading-relaxed">
                  {formatOpeningHours(openingHours)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
