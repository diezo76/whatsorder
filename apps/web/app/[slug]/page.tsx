'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, UtensilsCrossed } from 'lucide-react';
import { api } from '@/lib/api';
import RestaurantHeader from '@/components/public/RestaurantHeader';
import MenuCategory from '@/components/public/MenuCategory';
import CartDrawer from '@/components/cart/CartDrawer';
import FloatingCartButton from '@/components/cart/FloatingCartButton';

// Types TypeScript
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  currency: string;
  timezone: string;
  language: string;
  openingHours?: Record<string, { open: string; close: string }>;
  deliveryZones?: Array<{ name: string; radius: number; fee: number }>;
  whatsappNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users: User[];
}

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
  const params = useParams();
  const slug = params?.slug as string;

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

      // Fetch restaurant data
      const restaurantResponse = await api.get<Restaurant>(`/public/restaurants/${slug}`);
      setRestaurant(restaurantResponse.data);

      // Fetch menu data
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

  // Callback pour ajouter au panier (optionnel, MenuItemCard utilise directement le store)
  const handleAddToCart = (_item: any) => {
    // MenuItemCard utilise directement useCartStore, cette fonction est conservée pour compatibilité
  };

  // Fonction pour mapper les items du menu vers le format attendu par MenuItemCard
  const mapMenuItem = (item: MenuItem) => ({
    id: item.id,
    name: item.name,
    nameAr: item.nameAr,
    description: item.description,
    descriptionAr: item.descriptionAr,
    price: item.price || 0,
    image: item.image,
    hasVariants: item.hasVariants || false,
    variants: item.variants || [],
    options: item.options || [],
    categoryId: item.categoryId || '',
    isActive: item.isActive !== undefined ? item.isActive : true,
    isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
    category: {
      id: item.categoryId || '',
      name: '',
      nameAr: '',
    },
  });

  // Fonction pour mapper les catégories vers le format attendu par MenuCategory
  const mapCategory = (category: Category) => ({
    id: category.id,
    name: category.name,
    nameAr: category.nameAr,
    description: category.description,
    items: category.items.map(mapMenuItem),
  });

  // Loading state avec skeleton loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Skeleton Header */}
        <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/10" />
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 py-8 w-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/30 mb-4 animate-pulse" />
                <div className="h-8 w-64 bg-white/30 rounded mb-3 animate-pulse" />
                <div className="h-4 w-96 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Infos */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton Cards */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-12 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200" />
                <div className="p-4">
                  <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-20 bg-gray-200 rounded" />
                    <div className="h-10 w-24 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state avec icône et bouton réessayer
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Préparer les données pour RestaurantHeader
  const restaurantHeaderData = restaurant
    ? {
        name: restaurant.name,
        description: restaurant.description,
        logo: restaurant.logo,
        coverImage: restaurant.coverImage,
        phone: restaurant.phone,
        address: restaurant.address,
        openingHours: restaurant.openingHours,
      }
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      {restaurantHeaderData && <RestaurantHeader restaurant={restaurantHeaderData} />}

      {/* Menu */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Titre section */}
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Notre Menu
        </h2>

        {/* Navigation sticky des catégories (optionnel pour l'instant) */}
        {/* TODO: Ajouter navigation sticky des catégories */}

        {/* Catégories */}
        {menu?.categories && menu.categories.length > 0 ? (
          <div className="space-y-0">
            {menu.categories.map((category) => (
              <MenuCategory
                key={category.id}
                category={mapCategory(category)}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <UtensilsCrossed className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Le menu n'est pas encore disponible
                </h3>
                <p className="text-gray-500">
                  Nous travaillons à mettre à jour notre menu. Revenez bientôt !
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bouton flottant panier */}
      <FloatingCartButton onClick={() => setIsCartOpen(true)} />

      {/* Drawer panier */}
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
                whatsappNumber: restaurant.whatsappNumber || undefined, // Pas de fallback - utiliser le numéro du restaurant ou undefined
              }
            : undefined
        }
      />
    </div>
  );
}
