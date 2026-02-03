'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { MenuItemOption } from '@/types/menu';

interface OptionManagerProps {
  menuItemId: string;
  initialOptions?: MenuItemOption[];
  onOptionsChange?: (options: MenuItemOption[]) => void;
}

export function OptionManager({ menuItemId, initialOptions = [], onOptionsChange }: OptionManagerProps) {
  const [options, setOptions] = useState<MenuItemOption[]>(initialOptions);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newOption, setNewOption] = useState({
    name: '',
    nameAr: '',
    type: 'ADDON' as 'ADDON' | 'MODIFICATION' | 'INSTRUCTION',
    priceModifier: 0,
    isRequired: false,
    isMultiple: false,
    maxSelections: undefined as number | undefined,
  });

  // Charger les options au montage
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get<{ success: boolean; options: MenuItemOption[] }>(
          `/menu/items/${menuItemId}/options`
        );
        setOptions(response.data.options || []);
        if (onOptionsChange) {
          onOptionsChange(response.data.options || []);
        }
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };

    if (menuItemId) {
      fetchOptions();
    }
  }, [menuItemId, onOptionsChange]);

  const handleAddOption = async () => {
    if (!newOption.name || !newOption.type) {
      toast.error('Le nom et le type sont requis');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post<{ success: boolean; option: MenuItemOption }>(
        `/menu/items/${menuItemId}/options`,
        {
          name: newOption.name,
          nameAr: newOption.nameAr || undefined,
          type: newOption.type,
          priceModifier: newOption.priceModifier || 0,
          isRequired: newOption.isRequired,
          isMultiple: newOption.isMultiple,
          maxSelections: newOption.isMultiple ? newOption.maxSelections : undefined,
        }
      );

      const updatedOptions = [...options, response.data.option];
      setOptions(updatedOptions);
      if (onOptionsChange) {
        onOptionsChange(updatedOptions);
      }
      setNewOption({
        name: '',
        nameAr: '',
        type: 'ADDON',
        priceModifier: 0,
        isRequired: false,
        isMultiple: false,
        maxSelections: undefined,
      });
      setIsAdding(false);
      toast.success('Option ajoutée ✅');
    } catch (error: any) {
      console.error('Failed to add option:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout de l\'option');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOption = async (optionId: string, updates: Partial<MenuItemOption>) => {
    try {
      setLoading(true);
      const response = await api.put<{ success: boolean; option: MenuItemOption }>(
        `/menu/items/${menuItemId}/options/${optionId}`,
        updates
      );

      const updatedOptions = options.map(o => o.id === optionId ? response.data.option : o);
      setOptions(updatedOptions);
      if (onOptionsChange) {
        onOptionsChange(updatedOptions);
      }
      setEditingId(null);
      toast.success('Option modifiée ✅');
    } catch (error: any) {
      console.error('Failed to update option:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la modification de l\'option');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm('Supprimer cette option ?')) return;

    try {
      setLoading(true);
      await api.delete(`/menu/items/${menuItemId}/options/${optionId}`);

      const updatedOptions = options.filter(o => o.id !== optionId);
      setOptions(updatedOptions);
      if (onOptionsChange) {
        onOptionsChange(updatedOptions);
      }
      toast.success('Option supprimée ✅');
    } catch (error: any) {
      console.error('Failed to delete option:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression de l\'option');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (option: MenuItemOption) => {
    setEditingId(option.id);
    setNewOption({
      name: option.name,
      nameAr: option.nameAr || '',
      type: option.type,
      priceModifier: option.priceModifier,
      isRequired: option.isRequired,
      isMultiple: option.isMultiple,
      maxSelections: option.maxSelections,
    });
    setIsAdding(true);
  };

  const cancelEditing = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewOption({
      name: '',
      nameAr: '',
      type: 'ADDON',
      priceModifier: 0,
      isRequired: false,
      isMultiple: false,
      maxSelections: undefined,
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ADDON':
        return 'Add-on payant';
      case 'MODIFICATION':
        return 'Modification gratuite';
      case 'INSTRUCTION':
        return 'Instruction spéciale';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Options (Add-ons)</h3>
          <p className="text-sm text-gray-500">Ajoutez des extras payants ou des modifications gratuites</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={16} />
            Ajouter une option
          </button>
        )}
      </div>

      {/* Liste des options */}
      {options.length > 0 && (
        <div className="space-y-2">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {option.name}
                    {option.nameAr && <span className="text-gray-500 ml-2">({option.nameAr})</span>}
                  </p>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {getTypeLabel(option.type)}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-600">
                    {option.priceModifier > 0 ? `+${option.priceModifier} EGP` : 'Gratuit'}
                  </p>
                  {option.isRequired && (
                    <span className="text-xs text-red-600">Requis</span>
                  )}
                  {option.isMultiple && (
                    <span className="text-xs text-gray-500">
                      Multiple {option.maxSelections ? `(max: ${option.maxSelections})` : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEditing(option)}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                  title="Modifier"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteOption(option.id)}
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
            <h4 className="font-semibold">{editingId ? 'Modifier l\'option' : 'Nouvelle option'}</h4>
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
              placeholder="Nom (ex: Extra cheese)"
              value={newOption.name}
              onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Nom arabe (ex: جبنة إضافية)"
              value={newOption.nameAr}
              onChange={(e) => setNewOption({ ...newOption, nameAr: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
            <select
              value={newOption.type}
              onChange={(e) => setNewOption({ ...newOption, type: e.target.value as any })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="ADDON">Add-on payant</option>
              <option value="MODIFICATION">Modification gratuite</option>
              <option value="INSTRUCTION">Instruction spéciale</option>
            </select>
            <input
              type="number"
              placeholder="Prix supplémentaire (0 si gratuit)"
              value={newOption.priceModifier || ''}
              onChange={(e) => setNewOption({ ...newOption, priceModifier: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newOption.isRequired}
                onChange={(e) => setNewOption({ ...newOption, isRequired: e.target.checked })}
              />
              <span className="text-sm">Option requise (le client doit choisir)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newOption.isMultiple}
                onChange={(e) => setNewOption({ ...newOption, isMultiple: e.target.checked })}
              />
              <span className="text-sm">Sélection multiple autorisée</span>
            </label>
            {newOption.isMultiple && (
              <input
                type="number"
                placeholder="Nombre maximum de sélections"
                value={newOption.maxSelections || ''}
                onChange={(e) => setNewOption({ ...newOption, maxSelections: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border rounded"
                min="1"
              />
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={editingId ? () => handleUpdateOption(editingId, newOption) : handleAddOption}
              disabled={loading || !newOption.name || !newOption.type}
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

      {options.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500 text-center py-4">
          Aucune option. Cliquez sur "Ajouter une option" pour commencer.
        </p>
      )}
    </div>
  );
}
