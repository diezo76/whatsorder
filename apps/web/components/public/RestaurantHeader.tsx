'use client';

import Image from 'next/image';
import { Phone, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const open = isRestaurantOpen(openingHours);

  return (
    <div className="relative w-full">
      {/* Hero */}
      <div
        className={`relative h-56 sm:h-64 md:h-72 w-full ${
          coverImage ? '' : 'bg-gradient-to-br from-gray-800 to-gray-900'
        }`}
      >
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        <div className="relative z-10 h-full flex items-end">
          <div className="max-w-5xl mx-auto px-4 pb-6 w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' as const }}
              className="flex items-end gap-4"
            >
              {/* Logo */}
              {logo ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl bg-white">
                  <Image
                    src={logo}
                    alt={name}
                    fill
                    sizes="96px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-xl">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {getInitials(name)}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0 pb-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg truncate">
                  {name}
                </h1>
                {description && (
                  <p className="text-sm sm:text-base text-white/80 mt-1 line-clamp-2 drop-shadow">
                    {description}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm"
          >
            {/* Status */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs ${
              open
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                open ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              {open ? t.header.open : t.header.closed}
            </div>

            {/* Phone */}
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{phone}</span>
            </a>

            {/* Address */}
            {address && (
              <span className="inline-flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[200px] sm:max-w-none">{address}</span>
              </span>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
