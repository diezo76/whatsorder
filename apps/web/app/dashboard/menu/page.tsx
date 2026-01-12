'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, FolderPlus, Plus } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import MenuItemsTable from '@/components/dashboard/MenuItemsTable';
import ItemModal, { ItemFormData } from '@/components/dashboard/ItemModal';
import CategoryModal, { CategoryFormData } from '@/components/dashboard/CategoryModal';

// Interfaces TypeScript
interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    items: number;
  };
  items?: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  images: string[];
  variants?: any;
  modifiers?: any;
  isAvailable: boolean;
  isActive: boolean;
  isFeatured: boolean;
  calories?: number;
  preparationTime?: number;
  tags: string[];
  allergens: string[];
  sortOrder: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    nameAr?: string;
    slug: string;
  };
}

type TabType = 'all' | 'by-category' | 'categories';

export default function MenuPage() {
  // States
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Debounce pour la recherche (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch des données au mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories et items en parallèle
        const [categoriesResponse, itemsResponse] = await Promise.all([
          api.get<{ success: boolean; categories: Category[] }>('/menu/categories'),
          api.get<{ success: boolean; items: MenuItem[] }>('/menu/items'),
        ]);

        setCategories(categoriesResponse.data.categories || []);
        setItems(itemsResponse.data.items || []);
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        // TODO: Afficher une notification d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrage des items
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Filtre par recherche
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.nameAr?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.categoryId === selectedCategory);
    }

    // Filtre par isActive
    if (showActiveOnly) {
      filtered = filtered.filter((item) => item.isActive);
    }

    // Filtre par isAvailable
    if (showAvailableOnly) {
      filtered = filtered.filter((item) => item.isAvailable);
    }

    return filtered;
  }, [items, debouncedSearchQuery, selectedCategory, showActiveOnly, showAvailableOnly]);

  // Catégories filtrées (pour l'onglet "Par catégorie")
  const categoriesWithItems = useMemo(() => {
    return categories
      .filter((cat) => cat.isActive)
      .map((category) => ({
        ...category,
        items: filteredItems.filter((item) => item.categoryId === category.id),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, filteredItems]);

  // Handlers
  const handleNewCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleNewItem = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  // Fonction pour recharger les données
  const refreshData = async () => {
    try {
        const [categoriesResponse, itemsResponse] = await Promise.all([
          api.get<{ success: boolean; categories: Category[] }>('/menu/categories'),
          api.get<{ success: boolean; items: MenuItem[] }>('/menu/items'),
        ]);
      setCategories(categoriesResponse.data.categories || []);
      setItems(itemsResponse.data.items || []);
    } catch (error: any) {
      console.error('Erreur lors du rechargement des données:', error);
      toast.error('Erreur lors du rechargement des données');
    }
  };

  // ==========================================
  // CRUD ITEMS
  // ==========================================

  const handleCreateItem = async (data: ItemFormData) => {
    try {
      const response = await api.post<{ success: boolean; item: MenuItem }>('/menu/items', data);
      setItems((prev) => [...prev, response.data.item]);
      toast.success('Item créé ✅');
      setIsItemModalOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'item:', error);
      
      // Afficher les détails de validation si disponibles
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const validationErrors = error.response.data.details
          .map((detail: any) => `${detail.path.join('.')}: ${detail.message}`)
          .join(', ');
        toast.error(`Erreur de validation: ${validationErrors}`);
      } else {
        const errorMessage = error.response?.data?.error || 'Erreur lors de la création de l\'item';
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const handleUpdateItem = async (data: ItemFormData) => {
    if (!editingItem) return;

    try {
      const response = await api.put<{ success: boolean; item: MenuItem }>(`/menu/items/${editingItem.id}`, data);
      setItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? response.data.item : item))
      );
      toast.success('Item modifié ✅');
      setIsItemModalOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      console.error('Erreur lors de la modification de l\'item:', error);
      
      // Afficher les détails de validation si disponibles
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const validationErrors = error.response.data.details
          .map((detail: any) => `${detail.path.join('.')}: ${detail.message}`)
          .join(', ');
        toast.error(`Erreur de validation: ${validationErrors}`);
      } else {
        const errorMessage = error.response?.data?.error || 'Erreur lors de la modification de l\'item';
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.delete(`/menu/items/${itemId}`);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success('Item supprimé ✅');
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'item:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression de l\'item';
      toast.error(errorMessage);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      const response = await api.patch<MenuItem>(`/menu/items/${itemId}/toggle-availability`);
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? response.data : item))
      );
      toast.success('Disponibilité mise à jour');
    } catch (error: any) {
      console.error('Erreur lors du toggle de disponibilité:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);
    }
  };

  // ==========================================
  // CRUD CATEGORIES
  // ==========================================

  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      const response = await api.post<{ success: boolean; category: Category }>('/menu/categories', data);
      setCategories((prev) => [...prev, response.data.category]);
      toast.success('Catégorie créée ✅');
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      console.error('Erreur lors de la création de la catégorie:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la création de la catégorie';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return;

    try {
      const response = await api.put<{ success: boolean; category: Category }>(`/menu/categories/${editingCategory.id}`, data);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === editingCategory.id ? response.data.category : cat))
      );
      toast.success('Catégorie modifiée ✅');
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      // Recharger les items car ils peuvent avoir changé de catégorie
      await refreshData();
    } catch (error: any) {
      console.error('Erreur lors de la modification de la catégorie:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la modification de la catégorie';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await api.delete(`/menu/categories/${categoryId}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      toast.success('Catégorie supprimée ✅');
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la suppression de la catégorie';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gestion du Menu</h1>
        <div className="flex gap-3">
          <button
            onClick={handleNewCategory}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            Nouvelle Catégorie
          </button>
          <button
            onClick={handleNewItem}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvel Item
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-6">
          {[
            { id: 'all' as TabType, label: 'Tous les items' },
            { id: 'by-category' as TabType, label: 'Par catégorie' },
            { id: 'categories' as TabType, label: 'Catégories' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`pb-3 px-1 font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mb-6 space-y-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un plat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Filtres */}
        <div className="flex gap-4 flex-wrap">
          {/* Filtre par catégorie */}
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Toutes les catégories</option>
            {categories
              .filter((cat) => cat.isActive)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>

          {/* Toggle Items actifs */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-slate-700">Items actifs seulement</span>
          </label>

          {/* Toggle Disponibles */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-slate-700">Disponibles seulement</span>
          </label>
        </div>
      </div>

      {/* Contenu selon le tab sélectionné */}
      <div>
        {/* Tab: Tous les items */}
        {selectedTab === 'all' && (
          <MenuItemsTable
            items={filteredItems}
            categories={categories}
            onEdit={(item) => {
              setEditingItem(item as MenuItem);
              setIsItemModalOpen(true);
            }}
            onDelete={handleDeleteItem}
            onToggleAvailability={handleToggleAvailability}
            onCreateItem={handleNewItem}
          />
        )}

        {/* Tab: Par catégorie */}
        {selectedTab === 'by-category' && (
          <div>
            <div className="mb-4 text-sm text-slate-600">
              {categoriesWithItems.length} catégorie{categoriesWithItems.length > 1 ? 's' : ''} avec items
            </div>
            <div className="space-y-4">
              {categoriesWithItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
                  Aucune catégorie avec items trouvée
                </div>
              ) : (
                categoriesWithItems.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                  >
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-900">{category.name}</h3>
                      <p className="text-sm text-slate-600">
                        {category.items.length} item{category.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-slate-900">{item.name}</h4>
                                {!item.isAvailable && (
                                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                                    Indisponible
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="mt-1 text-sm text-slate-600 line-clamp-1">
                                  {item.description}
                                </p>
                              )}
                              <div className="mt-2 text-sm font-semibold text-slate-900">
                                {item.price.toFixed(2)} EGP
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Catégories */}
        {selectedTab === 'categories' && (
          <div>
            <div className="mb-4 text-sm text-slate-600">
              {categories.length} catégorie{categories.length > 1 ? 's' : ''}
            </div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {categories.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Aucune catégorie trouvée
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{category.name}</h3>
                            {!category.isActive && (
                              <span className="px-2 py-1 text-xs bg-slate-200 text-slate-600 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          {category.description && (
                            <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          <div className="mt-2 text-sm text-slate-600">
                            {category._count?.items || 0} item{(category._count?.items || 0) > 1 ? 's' : ''}
                            {' • '}
                            Ordre: {category.sortOrder}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(category as Category);
                              setIsCategoryModalOpen(true);
                            }}
                            className="px-3 py-1 text-sm text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)) {
                                handleDeleteCategory(category.id);
                              }
                            }}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        categories={categories}
        onSave={editingItem ? handleUpdateItem : handleCreateItem}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
      />
      </div>
    </>
  );
}
