'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, UtensilsCrossed, Globe, Clock, Ban } from 'lucide-react';
import { api } from '@/lib/api';
import RestaurantHeader from '@/components/public/RestaurantHeader';
import CategoryNav from '@/components/public/CategoryNav';
import MenuCategory from '@/components/public/MenuCategory';
import CartDrawer from '@/components/cart/CartDrawer';
import FloatingCartButton from '@/components/cart/FloatingCartButton';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';

import type { Restaurant } from '@/types/restaurant';

interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  descriptionAr?: string;
  price?: number;
  compareAtPrice?: number;
  image?: string;
  images?: string[];
  hasVariants?: boolean;
  variants?: any[];
  options?: any[];
  optionGroups?: any[];
  modifiers?: any;
  isAvailable: boolean;
  isFeatured?: boolean;
  calories?: number;
  preparationTime?: number;
  tags?: string[];
  allergens?: string[];
  sortOrder: number;
  categoryId?: string;
  isActive?: boolean;
}

interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  items: MenuItem[];
}

interface MenuResponse {
  restaurantId: string;
  categories: Category[];
}

export default function RestaurantMenuPage() {
  return (
    <LanguageProvider>
      <RestaurantPageContent />
    </LanguageProvider>
  );
}

function RestaurantPageContent() {
  const params = useParams();
  const slug = params?.slug as string;
  const { language, setLanguage, t } = useLanguage();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!slug) {
      setError('Slug du restaurant manquant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const restaurantResponse = await api.get<Restaurant>(`/public/restaurants/${slug}`);
      setRestaurant(restaurantResponse.data);

      const menuResponse = await api.get<MenuResponse>(`/public/restaurants/${slug}/menu`);
      setMenu(menuResponse.data);
    } catch (err: any) {
      console.error('Error fetching restaurant data:', err);
      if (err.response?.status === 404) {
        setError('Restaurant non trouvé');
      } else {
        setError(err.response?.data?.error || 'Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddToCart = (_item: any) => {};

  const getLocalizedName = (name: string, nameAr?: string): string => {
    if (language === 'ar' && nameAr) return nameAr;
    return name;
  };

  const getLocalizedDescription = (description?: string, descriptionAr?: string): string | undefined => {
    if (language === 'ar' && descriptionAr) return descriptionAr;
    return description;
  };

  const mapMenuItem = (item: MenuItem, categoryId?: string) => {
    const optionGroups = (item.optionGroups ?? []).map((g: any) => ({
      ...g,
      options: Array.isArray(g?.options) ? g.options : [],
    }));
    return {
      id: item.id,
      name: getLocalizedName(item.name, item.nameAr),
      nameAr: item.nameAr,
      description: getLocalizedDescription(item.description, item.descriptionAr),
      descriptionAr: item.descriptionAr,
      price: item.price || 0,
      image: item.image,
      hasVariants: item.hasVariants || false,
      variants: item.variants || [],
      options: item.options || [],
      optionGroups,
      categoryId: item.categoryId || categoryId || '',
      isActive: item.isActive !== undefined ? item.isActive : true,
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      category: {
        id: item.categoryId || categoryId || '',
        name: '',
        nameAr: '',
      },
    };
  };

  const mapCategory = (category: Category) => ({
    id: category.id,
    name: getLocalizedName(category.name, category.nameAr),
    nameAr: category.nameAr,
    description: getLocalizedDescription(category.description),
    items: category.items.map((item) => mapMenuItem(item, category.id)),
  });

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="relative w-full h-56 sm:h-64 md:h-72 bg-gray-100 animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-24 bg-gray-100 rounded-full animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-100 rounded" />
                  <div className="h-3 w-full bg-gray-50 rounded" />
                  <div className="h-3 w-1/2 bg-gray-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">{t.menu.error}</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            {t.menu.retry}
          </button>
        </div>
      </div>
    );
  }

  const restaurantHeaderData = restaurant
    ? {
        name: restaurant.name,
        description: restaurant.description ?? undefined,
        logo: restaurant.logo ?? undefined,
        coverImage: restaurant.coverImage ?? undefined,
        phone: restaurant.phone,
        address: restaurant.address ?? '',
        openingHours: restaurant.openingHours ?? undefined,
      }
    : null;

  const mappedCategories = menu?.categories?.map(mapCategory) || [];

  return (
    <div className={`min-h-screen bg-white ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Language selector + Category nav (sticky) */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between py-2.5 gap-4">
            {/* Category nav */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {mappedCategories.length > 0 && (
                <CategoryNav
                  categories={mappedCategories.map((c) => ({ id: c.id, name: c.name }))}
                />
              )}
            </div>

            {/* Language */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              {(['fr', 'ar', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                    language === lang
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {lang === 'fr' ? 'FR' : lang === 'ar' ? 'عربي' : 'EN'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Busy banner */}
      {restaurant?.isBusy && (
        <div className="bg-red-600 text-white py-3 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
            <Ban className="w-5 h-5 flex-shrink-0" />
            <div className="text-center">
              <p className="font-bold">{restaurant.busyTitle || t.menu.restaurantBusy || 'Restaurant temporairement indisponible'}</p>
              <p className="text-sm text-red-100">{restaurant.busyMessage || t.menu.restaurantBusyDesc || 'Trop de commandes en cours. Veuillez reessayer plus tard.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      {restaurantHeaderData && <RestaurantHeader restaurant={restaurantHeaderData} />}

      {/* Menu */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {mappedCategories.length > 0 ? (
          <div className="space-y-12">
            {mappedCategories.map((category) => (
              <MenuCategory
                key={category.id}
                category={category}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.menu.menuNotAvailable}</h3>
            <p className="text-gray-400 text-sm">{t.menu.menuNotAvailableDesc}</p>
          </div>
        )}
      </main>

      {/* Footer - Opening hours */}
      {restaurant?.openingHours && typeof restaurant.openingHours !== 'string' && (
        <footer className="bg-gray-950 text-white py-10">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-gray-400" />
                <h3 className="text-base font-semibold">{t.hours.openingHours}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 w-full max-w-3xl">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                  const hours = restaurant.openingHours?.[day];
                  const now = new Date();
                  const daysEn = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                  const isToday = daysEn[now.getDay()] === day;

                  return (
                    <div
                      key={day}
                      className={`text-center p-3 rounded-xl ${
                        isToday ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5'
                      }`}
                    >
                      <p className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-1">
                        {t.hours.days[day]}
                      </p>
                      <p className={`text-xs ${hours?.closed ? 'text-gray-500' : 'text-gray-300'}`}>
                        {hours?.closed ? t.hours.closed : hours ? `${hours.open} - ${hours.close}` : t.hours.closed}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Floating cart button */}
      {!restaurant?.isBusy && (
        <FloatingCartButton onClick={() => setIsCartOpen(true)} />
      )}

      {/* Cart drawer */}
      {!restaurant?.isBusy && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          restaurant={
            restaurant
              ? {
                  id: restaurant.id,
                  slug: restaurant.slug,
                  name: restaurant.name,
                  phone: restaurant.phone,
                  whatsappNumber: restaurant.whatsappNumber || undefined,
                  enableCashPayment: restaurant.enableCashPayment ?? true,
                  enableCardPayment: restaurant.enableCardPayment ?? true,
                  enableStripePayment: restaurant.enableStripePayment ?? false,
                  enablePaypalPayment: restaurant.enablePaypalPayment ?? false,
                  deliveryZones: restaurant.deliveryZones as Array<{ name: string; fee: number }> | undefined,
                  openingHours: restaurant.openingHours ?? undefined,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
