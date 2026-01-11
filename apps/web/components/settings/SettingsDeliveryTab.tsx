'use client';

import { useState, useEffect, useRef } from 'react';
import { Edit2, Check, X, Trash2, Plus, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export interface DeliveryZone {
  name: string;
  fee: number;
}

interface SettingsDeliveryTabProps {
  deliveryZones: DeliveryZone[] | null;
  onChange: (zones: DeliveryZone[]) => void;
}

// Zones par défaut
const DEFAULT_ZONES: DeliveryZone[] = [
  { name: 'Centre-ville', fee: 20 },
  { name: 'Banlieue', fee: 35 },
  { name: 'Périphérie', fee: 50 },
];

export default function SettingsDeliveryTab({
  deliveryZones,
  onChange,
}: SettingsDeliveryTabProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localZones, setLocalZones] = useState<DeliveryZone[]>(() => {
    return deliveryZones && deliveryZones.length > 0 ? deliveryZones : [];
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Synchroniser avec les props
  useEffect(() => {
    if (deliveryZones && deliveryZones.length > 0) {
      setLocalZones(deliveryZones);
    } else {
      setLocalZones([]);
    }
  }, [deliveryZones]);

  // Focus automatique sur l'input nom quand on entre en mode édition
  useEffect(() => {
    if (editingIndex !== null && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingIndex]);

  // Gérer l'ajout d'une nouvelle zone
  const handleAdd = () => {
    const newZone: DeliveryZone = { name: '', fee: 0 };
    const updatedZones = [...localZones, newZone];
    setLocalZones(updatedZones);
    setEditingIndex(updatedZones.length - 1);
    onChange(updatedZones);
  };

  // Gérer la mise à jour d'un champ
  const handleUpdate = (index: number, field: keyof DeliveryZone, value: string | number) => {
    const updatedZones = [...localZones];
    updatedZones[index] = {
      ...updatedZones[index],
      [field]: value,
    };
    setLocalZones(updatedZones);
    onChange(updatedZones);
  };

  // Gérer la suppression d'une zone
  const handleDelete = (index: number) => {
    if (window.confirm('Supprimer cette zone ?')) {
      const updatedZones = localZones.filter((_, i) => i !== index);
      setLocalZones(updatedZones);
      onChange(updatedZones);
      
      // Si on supprimait la zone en cours d'édition, annuler l'édition
      if (editingIndex === index) {
        setEditingIndex(null);
      } else if (editingIndex !== null && editingIndex > index) {
        // Ajuster l'index d'édition si nécessaire
        setEditingIndex(editingIndex - 1);
      }
      
      toast.success('Zone supprimée ✅');
    }
  };

  // Valider une zone
  const validateZone = (zone: DeliveryZone): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!zone.name || zone.name.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }
    
    if (zone.fee <= 0 || isNaN(zone.fee)) {
      errors.push('Les frais doivent être supérieurs à 0');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  };

  // Gérer la sauvegarde d'une zone
  const handleSave = (index: number) => {
    const zone = localZones[index];
    const validation = validateZone(zone);
    
    if (!validation.valid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }
    
    setEditingIndex(null);
    toast.success('Zone enregistrée ✅');
  };

  // Gérer l'annulation de l'édition
  const handleCancel = () => {
    // Restaurer les valeurs depuis deliveryZones
    if (deliveryZones && deliveryZones.length > 0) {
      setLocalZones(deliveryZones);
    } else {
      setLocalZones([]);
    }
    setEditingIndex(null);
  };

  // Charger les zones par défaut
  const handleLoadDefaults = () => {
    if (window.confirm('Charger les zones par défaut ? Cela remplacera vos zones actuelles.')) {
      setLocalZones(DEFAULT_ZONES);
      onChange(DEFAULT_ZONES);
      setEditingIndex(null);
      toast.success('Zones par défaut chargées ✅');
    }
  };

  // Empty state
  if (localZones.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Zones de livraison</h2>
          <p className="text-gray-600 text-sm">
            Définissez vos zones de livraison et leurs tarifs
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <Truck className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Aucune zone de livraison configurée
          </p>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Commencez par ajouter votre première zone de livraison
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Ajouter votre première zone
            </button>
            <button
              onClick={handleLoadDefaults}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Charger zones par défaut
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Zones de livraison</h2>
          <p className="text-gray-600 text-sm">
            Définissez vos zones de livraison et leurs tarifs
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleLoadDefaults}
            className="hidden md:flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
          >
            Charger zones par défaut
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter une zone
          </button>
        </div>
      </div>

      {/* Tableau des zones */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Nom de la zone</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Frais de livraison</th>
              <th className="p-3 text-center font-semibold text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {localZones.map((zone, index) => {
              const isEditing = editingIndex === index;
              const validation = validateZone(zone);
              const hasErrors = !validation.valid && isEditing;

              return (
                <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                  {/* Nom */}
                  <td className="p-3">
                    {isEditing ? (
                      <div>
                        <input
                          ref={index === editingIndex ? nameInputRef : null}
                          type="text"
                          value={zone.name}
                          onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                          className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 transition-colors ${
                            hasErrors && !zone.name.trim()
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-orange-500'
                          }`}
                          placeholder="Ex: Centre-ville"
                        />
                        {hasErrors && !zone.name.trim() && (
                          <p className="mt-1 text-xs text-red-600">
                            Le nom doit contenir au moins 2 caractères
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-900">{zone.name || '—'}</span>
                    )}
                  </td>

                  {/* Frais */}
                  <td className="p-3">
                    {isEditing ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={zone.fee}
                            onChange={(e) => handleUpdate(index, 'fee', parseFloat(e.target.value) || 0)}
                            className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 transition-colors ${
                              hasErrors && zone.fee <= 0
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-orange-500'
                            }`}
                            placeholder="0"
                          />
                          <span className="text-gray-600 whitespace-nowrap">EGP</span>
                        </div>
                        {hasErrors && zone.fee <= 0 && (
                          <p className="mt-1 text-xs text-red-600">
                            Les frais doivent être supérieurs à 0
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-900">{zone.fee.toFixed(2)} EGP</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(index)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Enregistrer"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Annuler"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingIndex(index)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bouton "Charger zones par défaut" pour mobile */}
      <div className="md:hidden">
        <button
          onClick={handleLoadDefaults}
          className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Charger zones par défaut
        </button>
      </div>
    </div>
  );
}
