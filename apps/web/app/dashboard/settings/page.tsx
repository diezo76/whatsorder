'use client';

import { useState, useEffect, useMemo } from 'react';
import { Building2, Clock, Truck, MessageCircle, Save } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/api';
import SettingsGeneralTab from '@/components/settings/SettingsGeneralTab';
import SettingsHoursTab from '@/components/settings/SettingsHoursTab';
import SettingsDeliveryTab from '@/components/settings/SettingsDeliveryTab';
import SettingsIntegrationsTab from '@/components/settings/SettingsIntegrationsTab';

// Interfaces TypeScript
interface OpeningHours {
  [day: string]: { open: string; close: string; closed: boolean };
}

interface DeliveryZone {
  name: string;
  fee: number;
  radius?: number;
}

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
  openingHours: OpeningHours | null;
  deliveryZones: DeliveryZone[] | null;
  whatsappNumber: string;
  whatsappApiToken: string;
  whatsappBusinessId: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string | null;
  address: string | null;
  logo: string | null;
  coverImage: string | null;
  description: string | null;
  currency: string;
  timezone: string;
  language: string;
  openingHours: OpeningHours | null;
  deliveryZones: DeliveryZone[] | null;
  whatsappNumber: string | null;
  whatsappApiToken: string | null;
  whatsappBusinessId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'general' | 'hours' | 'delivery' | 'integrations';

// Fonction de comparaison profonde pour les objets
const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

export default function SettingsPage() {
  // States
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    description: '',
    logo: '',
    coverImage: '',
    phone: '',
    email: '',
    address: '',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    language: 'ar',
    openingHours: null,
    deliveryZones: null,
    whatsappNumber: '',
    whatsappApiToken: '',
    whatsappBusinessId: '',
  });
  const [selectedTab, setSelectedTab] = useState<TabType>('general');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Détection des changements
  const hasChanges = useMemo(() => {
    if (!restaurant) return false;
    
    // Utiliser les mêmes valeurs par défaut que dans formData pour la comparaison
    // Gérer les cas où les champs peuvent être undefined (API non déployée)
    const initialData: RestaurantFormData = {
      name: restaurant.name || '',
      description: restaurant.description || '',
      logo: restaurant.logo || '',
      coverImage: restaurant.coverImage || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      address: restaurant.address || '',
      currency: restaurant.currency || 'EGP',
      timezone: restaurant.timezone || 'Africa/Cairo',
      language: restaurant.language || 'ar',
      openingHours: restaurant.openingHours as OpeningHours | null,
      deliveryZones: restaurant.deliveryZones as DeliveryZone[] | null,
      whatsappNumber: restaurant.whatsappNumber || '',
      whatsappApiToken: restaurant.whatsappApiToken || '',
      whatsappBusinessId: restaurant.whatsappBusinessId || '',
    };

    // Comparaison profonde pour détecter les changements
    const hasChangesResult = !deepEqual(initialData, formData);
    
    // Log pour déboguer (à retirer en production)
    if (hasChangesResult && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('🔍 Changements détectés:', {
        initialData,
        formData,
        differences: Object.keys(initialData).filter(key => 
          initialData[key as keyof RestaurantFormData] !== formData[key as keyof RestaurantFormData]
        )
      });
    }
    
    return hasChangesResult;
  }, [restaurant, formData]);

  // Fetch des données au mount
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ success: boolean; restaurant: Restaurant }>('/restaurant');
        const data = response.data.restaurant || response.data;
        
        // Normaliser les données pour s'assurer que tous les champs sont présents avec leurs valeurs par défaut
        const restaurantData: Restaurant = {
          ...data,
          // S'assurer que les champs optionnels ont des valeurs par défaut si NULL/undefined
          timezone: data.timezone ?? 'Africa/Cairo',
          language: data.language ?? 'ar',
          email: data.email ?? null,
          coverImage: data.coverImage ?? null,
          description: data.description ?? null,
          logo: data.logo ?? null,
          address: data.address ?? null,
          whatsappNumber: data.whatsappNumber ?? null,
          whatsappApiToken: data.whatsappApiToken ?? null,
          whatsappBusinessId: data.whatsappBusinessId ?? null,
          openingHours: data.openingHours ?? null,
          deliveryZones: data.deliveryZones ?? null,
        };
        
        setRestaurant(restaurantData);
        setFormData({
          name: restaurantData.name,
          description: restaurantData.description || '',
          logo: restaurantData.logo || '',
          coverImage: restaurantData.coverImage || '',
          phone: restaurantData.phone,
          email: restaurantData.email || '',
          address: restaurantData.address || '',
          currency: restaurantData.currency,
          timezone: restaurantData.timezone || 'Africa/Cairo',
          language: restaurantData.language || 'ar',
          openingHours: restaurantData.openingHours as OpeningHours | null,
          deliveryZones: restaurantData.deliveryZones as DeliveryZone[] | null,
          whatsappNumber: restaurantData.whatsappNumber || '',
          whatsappApiToken: restaurantData.whatsappApiToken || '',
          whatsappBusinessId: restaurantData.whatsappBusinessId || '',
        });
      } catch (error: any) {
        console.error('Erreur lors du chargement des paramètres:', error);
        
        // Gestion spécifique des erreurs
        if (error.response?.status === 404) {
          const errorMessage = error.response?.data?.error || 'Aucun restaurant associé à votre compte';
          setError(errorMessage);
          toast.error(errorMessage);
        } else if (error.response?.status === 401) {
          const errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          setError(errorMessage);
          toast.error(errorMessage);
        } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          const errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré sur http://localhost:4000';
          setError(errorMessage);
          toast.error(errorMessage);
        } else {
          const errorMessage = error.response?.data?.error || 'Erreur lors du chargement des paramètres';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  // Fonction handleSave
  const handleSave = async () => {
    if (!hasChanges) {
      console.warn('⚠️ Tentative de sauvegarde sans changements détectés');
      toast.error('Aucune modification détectée');
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Début de la sauvegarde...', { restaurant, formData });

      // Préparer les données pour l'API (ne pas envoyer les champs vides comme chaînes vides)
      const updateData: any = {};
      
      if (formData.name !== restaurant?.name) updateData.name = formData.name;
      if (formData.description !== (restaurant?.description || '')) updateData.description = formData.description || null;
      if (formData.logo !== (restaurant?.logo || '')) updateData.logo = formData.logo || null;
      if (formData.coverImage !== (restaurant?.coverImage || '')) updateData.coverImage = formData.coverImage || null;
      if (formData.phone !== restaurant?.phone) updateData.phone = formData.phone;
      if (formData.email !== (restaurant?.email || '')) updateData.email = formData.email || null;
      if (formData.address !== (restaurant?.address || '')) updateData.address = formData.address || null;
      if (formData.currency !== restaurant?.currency) updateData.currency = formData.currency;
      // Comparer avec les valeurs normalisées (utiliser || pour gérer undefined)
      const restaurantTimezone = restaurant?.timezone || 'Africa/Cairo';
      const restaurantLanguage = restaurant?.language || 'ar';
      if (formData.timezone !== restaurantTimezone) updateData.timezone = formData.timezone;
      if (formData.language !== restaurantLanguage) updateData.language = formData.language;
      if (JSON.stringify(formData.openingHours) !== JSON.stringify(restaurant?.openingHours)) {
        updateData.openingHours = formData.openingHours;
      }
      if (JSON.stringify(formData.deliveryZones) !== JSON.stringify(restaurant?.deliveryZones)) {
        updateData.deliveryZones = formData.deliveryZones;
      }
      if (formData.whatsappNumber !== (restaurant?.whatsappNumber || '')) {
        updateData.whatsappNumber = formData.whatsappNumber || null;
      }
      if (formData.whatsappApiToken !== (restaurant?.whatsappApiToken || '')) {
        updateData.whatsappApiToken = formData.whatsappApiToken || null;
      }
      if (formData.whatsappBusinessId !== (restaurant?.whatsappBusinessId || '')) {
        updateData.whatsappBusinessId = formData.whatsappBusinessId || null;
      }

      const response = await api.put<{ success: boolean; restaurant: Restaurant }>('/restaurant', updateData);
      const data = response.data.restaurant || response.data;
      
      // Normaliser les données retournées pour s'assurer que tous les champs sont présents
      const updatedRestaurant: Restaurant = {
        ...data,
        timezone: data.timezone ?? 'Africa/Cairo',
        language: data.language ?? 'ar',
        email: data.email ?? null,
        coverImage: data.coverImage ?? null,
        description: data.description ?? null,
        logo: data.logo ?? null,
        address: data.address ?? null,
        whatsappNumber: data.whatsappNumber ?? null,
        whatsappApiToken: data.whatsappApiToken ?? null,
        whatsappBusinessId: data.whatsappBusinessId ?? null,
        openingHours: data.openingHours ?? null,
        deliveryZones: data.deliveryZones ?? null,
      };

      // Mettre à jour le state restaurant AVANT de mettre à jour formData
      setRestaurant(updatedRestaurant);
      
      // Mettre à jour le formData avec les données sauvegardées pour synchroniser l'état
      const updatedFormData = {
        name: updatedRestaurant.name,
        description: updatedRestaurant.description || '',
        logo: updatedRestaurant.logo || '',
        coverImage: updatedRestaurant.coverImage || '',
        phone: updatedRestaurant.phone,
        email: updatedRestaurant.email || '',
        address: updatedRestaurant.address || '',
        currency: updatedRestaurant.currency,
        timezone: updatedRestaurant.timezone || 'Africa/Cairo',
        language: updatedRestaurant.language || 'ar',
        openingHours: updatedRestaurant.openingHours as OpeningHours | null,
        deliveryZones: updatedRestaurant.deliveryZones as DeliveryZone[] | null,
        whatsappNumber: updatedRestaurant.whatsappNumber || '',
        whatsappApiToken: updatedRestaurant.whatsappApiToken || '',
        whatsappBusinessId: updatedRestaurant.whatsappBusinessId || '',
      };
      
      setFormData(updatedFormData);
      toast.success('Paramètres enregistrés ✅');
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      // Afficher les détails de validation si disponibles
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const validationErrors = error.response.data.details
          .map((detail: any) => `${detail.path.join('.')}: ${detail.message}`)
          .join(', ');
        toast.error(`Erreur de validation: ${validationErrors}`);
      } else {
        const errorMessage = error.response?.data?.error || 'Erreur lors de la sauvegarde';
        toast.error(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  // Gestion du changement de formulaire
  const handleChange = (field: keyof RestaurantFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Note: La création de restaurant nécessite un endpoint POST backend
  // Pour l'instant, on affiche un message guidant l'utilisateur

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  if (error && error.includes('Aucun restaurant associé')) {
    return (
      <div className="h-full">
        <Toaster position="top-right" />
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Aucun restaurant associé</h2>
            <p className="text-blue-700 mb-4">
              Vous n'avez pas encore de restaurant associé à votre compte.
            </p>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Solution : Exécuter le seed de la base de données</h3>
              <p className="text-sm text-gray-600 mb-3">
                Pour créer un restaurant de test et l'associer à votre compte, exécutez la commande suivante :
              </p>
              <div className="bg-gray-100 rounded p-3 mb-3">
                <code className="text-sm">cd apps/api && pnpm prisma db seed</code>
              </div>
              <p className="text-sm text-gray-600">
                Cela créera un restaurant de test "Nile Bites" et l'associera à l'utilisateur admin@whatsorder.com.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Informations de connexion par défaut</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li><strong>Email :</strong> admin@whataybo.com</li>
                <li><strong>Mot de passe :</strong> Admin123!</li>
              </ul>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  setError(null);
                  // Recharger la page pour réessayer
                  window.location.reload();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Actualiser la page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full">
        <Toaster position="top-right" />
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Erreur de chargement</h2>
            <p className="text-red-700 mb-4">{error}</p>
            {error.includes('Impossible de se connecter') && (
              <div className="mt-4">
                <p className="text-sm text-red-600 mb-2">
                  Vérifiez que :
                </p>
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  <li>Le serveur backend est démarré (port 4000)</li>
                  <li>La base de données PostgreSQL est accessible</li>
                  <li>Les variables d'environnement sont correctement configurées</li>
                </ul>
                <p className="text-sm text-red-600 mt-2">
                  Pour démarrer le serveur : <code className="bg-red-100 px-2 py-1 rounded">pnpm --filter api dev</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paramètres du Restaurant
          </h1>
          <p className="text-gray-600">
            Gérez les informations et la configuration de votre restaurant
          </p>
        </div>

        {/* Bouton Enregistrer - Sticky Top */}
        <div className={`sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 mb-6 transition-all ${hasChanges ? 'shadow-md' : 'shadow-none border-transparent opacity-60'}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {hasChanges && (
                <p className="text-sm text-orange-600 font-medium">
                  ⚠️ Vous avez des modifications non enregistrées
                </p>
              )}
              {!hasChanges && (
                <p className="text-sm text-gray-500">
                  Toutes les modifications sont enregistrées
                </p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                hasChanges
                  ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Save className="w-5 h-5" />
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('general')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'general'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-5 h-5" />
              Général
            </button>
            <button
              onClick={() => setSelectedTab('hours')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'hours'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="w-5 h-5" />
              Horaires
            </button>
            <button
              onClick={() => setSelectedTab('delivery')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'delivery'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Truck className="w-5 h-5" />
              Livraison
            </button>
            <button
              onClick={() => setSelectedTab('integrations')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'integrations'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp & Intégrations
            </button>
          </nav>
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="bg-white rounded-lg shadow p-6">
          {selectedTab === 'general' && (
            <SettingsGeneralTab
              formData={formData}
              onChange={(field, value) => handleChange(field as keyof RestaurantFormData, value)}
            />
          )}

          {selectedTab === 'hours' && (
            <SettingsHoursTab
              openingHours={formData.openingHours}
              onChange={(hours) => handleChange('openingHours', hours)}
            />
          )}

          {selectedTab === 'delivery' && (
            <SettingsDeliveryTab
              deliveryZones={formData.deliveryZones}
              onChange={(zones) => setFormData({ ...formData, deliveryZones: zones })}
            />
          )}

          {selectedTab === 'integrations' && (
            <SettingsIntegrationsTab
              formData={{
                whatsappNumber: formData.whatsappNumber,
                whatsappApiToken: formData.whatsappApiToken,
                whatsappBusinessId: formData.whatsappBusinessId,
              }}
              onChange={(field, value) => setFormData({ ...formData, [field]: value })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
