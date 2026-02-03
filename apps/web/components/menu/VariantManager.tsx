'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { MenuItemVariant } from '@/types/menu';

interface VariantManagerProps {
  menuItemId: string;
  initialVariants?: MenuItemVariant[];
  onVariantsChange?: (variants: MenuItemVariant[]) => void;
}

export function VariantManager({ menuItemId, initialVariants = [], onVariantsChange }: VariantManagerProps) {
  const [variants, setVariants] = useState<MenuItemVariant[]>(initialVariants);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newVariant, setNewVariant] = useState({
    name: '',
    nameAr: '',
    price: 0,
    sku: '',
    trackInventory: false,
    stockQuantity: 0,
    lowStockAlert: 5,
  });

  // Charger les variants au montage
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const response = await api.get<{ success: boolean; variants: MenuItemVariant[] }>(
          `/menu/items/${menuItemId}/variants`
        );
        setVariants(response.data.variants || []);
        if (onVariantsChange) {
          onVariantsChange(response.data.variants || []);
        }
      } catch (error) {
        console.error('Failed to fetch variants:', error);
      }
    };

    if (menuItemId) {
      fetchVariants();
    }
  }, [menuItemId, onVariantsChange]);

  const handleAddVariant = async () => {
    if (!newVariant.name || newVariant.price <= 0) {
      toast.error('Le nom et le prix sont requis');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post<{ success: boolean; variant: MenuItemVariant }>(
        `/menu/items/${menuItemId}/variants`,
        {
          name: newVariant.name,
          nameAr: newVariant.nameAr || undefined,
          price: newVariant.price,
          sku: newVariant.sku || undefined,
          trackInventory: newVariant.trackInventory,
          stockQuantity: newVariant.trackInventory ? newVariant.stockQuantity : undefined,
          lowStockAlert: newVariant.trackInventory ? newVariant.lowStockAlert : undefined,
        }
      );

      const updatedVariants = [...variants, response.data.variant];
      setVariants(updatedVariants);
      if (onVariantsChange) {
        onVariantsChange(updatedVariants);
      }
      setNewVariant({
        name: '',
        nameAr: '',
        price: 0,
        sku: '',
        trackInventory: false,
        stockQuantity: 0,
        lowStockAlert: 5,
      });
      setIsAdding(false);
      toast.success('Variant ajouté ✅');
    } catch (error: any) {
      console.error('Failed to add variant:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout du variant');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVariant = async (variantId: string, updates: Partial<MenuItemVariant>) => {
    try {
      setLoading(true);
      const response = await api.put<{ success: boolean; variant: MenuItemVariant }>(
        `/menu/items/${menuItemId}/variants/${variantId}`,
        updates
      );

      const updatedVariants = variants.map(v => v.id === variantId ? response.data.variant : v);
      setVariants(updatedVariants);
      if (onVariantsChange) {
        onVariantsChange(updatedVariants);
      }
      setEditingId(null);
      toast.success('Variant modifié ✅');
    } catch (error: any) {
      console.error('Failed to update variant:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la modification du variant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Supprimer ce variant ?')) return;

    try {
      setLoading(true);
      await api.delete(`/menu/items/${menuItemId}/variants/${variantId}`);

      const updatedVariants = variants.filter(v => v.id !== variantId);
      setVariants(updatedVariants);
      if (onVariantsChange) {
        onVariantsChange(updatedVariants);
      }
      toast.success('Variant supprimé ✅');
    } catch (error: any) {
      console.error('Failed to delete variant:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression du variant');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (variant: MenuItemVariant) => {
    setEditingId(variant.id);
    setNewVariant({
      name: variant.name,
      nameAr: variant.nameAr || '',
      price: variant.price,
      sku: variant.sku || '',
      trackInventory: variant.trackInventory,
      stockQuantity: variant.stockQuantity || 0,
      lowStockAlert: variant.lowStockAlert || 5,
    });
    setIsAdding(true);
  };

  const cancelEditing = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewVariant({
      name: '',
      nameAr: '',
      price: 0,
      sku: '',
      trackInventory: false,
      stockQuantity: 0,
      lowStockAlert: 5,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Variants (Tailles/Versions)</h3>
          <p className="text-sm text-gray-500">Ajoutez différentes tailles ou versions avec des prix différents</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={16} />
            Ajouter un variant
          </button>
        )}
      </div>

      {/* Liste des variants */}
      {variants.length > 0 && (
        <div className="space-y-2">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">
                  {variant.name}
                  {variant.nameAr && <span className="text-gray-500 ml-2">({variant.nameAr})</span>}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-600">{variant.price} EGP</p>
                  {variant.sku && <p className="text-xs text-gray-400">SKU: {variant.sku}</p>}
                  {variant.trackInventory && (
                    <p className="text-xs text-gray-400">
                      Stock: {variant.stockQuantity || 0}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEditing(variant)}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                  title="Modifier"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteVariant(variant.id)}
                  disabled={loading}
                  className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors disabled:opacity-50"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout/modification */}
      {isAdding && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">{editingId ? 'Modifier le variant' : 'Nouveau variant'}</h4>
            <button
              onClick={cancelEditing}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nom (ex: Small, Medium, Large)"
              value={newVariant.name}
              onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Nom arabe (ex: صغير)"
              value={newVariant.nameAr}
              onChange={(e) => setNewVariant({ ...newVariant, nameAr: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="number"
              placeholder="Prix"
              value={newVariant.price || ''}
              onChange={(e) => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded"
              min="0"
              step="0.01"
            />
            <input
              type="text"
              placeholder="SKU (optionnel)"
              value={newVariant.sku}
              onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newVariant.trackInventory}
              onChange={(e) => setNewVariant({ ...newVariant, trackInventory: e.target.checked })}
            />
            <span className="text-sm">Suivre le stock</span>
          </label>

          {newVariant.trackInventory && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Quantité en stock"
                value={newVariant.stockQuantity || ''}
                onChange={(e) => setNewVariant({ ...newVariant, stockQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded"
                min="0"
              />
              <input
                type="number"
                placeholder="Alerte stock bas"
                value={newVariant.lowStockAlert || ''}
                onChange={(e) => setNewVariant({ ...newVariant, lowStockAlert: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 border rounded"
                min="0"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={editingId ? () => handleUpdateVariant(editingId, newVariant) : handleAddVariant}
              disabled={loading || !newVariant.name || newVariant.price <= 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </button>
            <button
              onClick={cancelEditing}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {variants.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500 text-center py-4">
          Aucun variant. Cliquez sur "Ajouter un variant" pour commencer.
        </p>
      )}
    </div>
  );
}
