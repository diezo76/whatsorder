'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Tag, Clock, ToggleLeft, Plus } from 'lucide-react';
import { VariantManager } from '@/components/menu/VariantManager';
import { OptionManager } from '@/components/menu/OptionManager';
import { OptionGroupManager } from '@/components/menu/OptionGroupManager';
import ImageUpload from '@/components/ui/ImageUpload';

// Interfaces TypeScript
interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  isActive?: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  descriptionAr?: string;
  price?: number | null;
  compareAtPrice?: number;
  image?: string;
  images?: string[];
  tags?: string[];
  allergens?: string[];
  calories?: number;
  preparationTime?: number;
  isAvailable: boolean;
  isActive: boolean;
  isFeatured?: boolean;
  hasVariants?: boolean;
  categoryId: string;
  category?: Category;
}

export interface ItemFormData {
  name: string;
  nameAr: string;
  categoryId: string;
  description: string;
  descriptionAr: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  tags: string[];
  allergens: string[];
  calories: number | null;
  preparationTime: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isActive: boolean;
}

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: MenuItem | null;
  categories: Category[];
  onSave: (data: ItemFormData) => Promise<void>;
}

export default function ItemModal({
  isOpen,
  onClose,
  item,
  categories,
  onSave,
}: ItemModalProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    nameAr: '',
    categoryId: '',
    description: '',
    descriptionAr: '',
    price: 0,
    compareAtPrice: null,
    image: '',
    tags: [],
    allergens: [],
    calories: null,
    preparationTime: null,
    isAvailable: true,
    isFeatured: false,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialisation en mode édition
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        nameAr: item.nameAr || '',
        categoryId: item.categoryId || '',
        description: item.description || '',
        descriptionAr: item.descriptionAr || '',
        price: item.price || 0,
        compareAtPrice: item.compareAtPrice || null,
        image: item.image || '',
        tags: item.tags || [],
        allergens: item.allergens || [],
        calories: item.calories || null,
        preparationTime: item.preparationTime || null,
        isAvailable: item.isAvailable ?? true,
        isFeatured: item.isFeatured ?? false,
        isActive: item.isActive ?? true,
      });
    } else {
      // Réinitialiser pour création
      setFormData({
        name: '',
        nameAr: '',
        categoryId: '',
        description: '',
        descriptionAr: '',
        price: 0,
        compareAtPrice: null,
        image: '',
        tags: [],
        allergens: [],
        calories: null,
        preparationTime: null,
        isAvailable: true,
        isFeatured: false,
        isActive: true,
      });
    }
    setErrors({});
    setTouched({});
  }, [item, isOpen]);

  // Validation en temps réel
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (touched.name || formData.name) {
      if (!formData.name.trim()) {
        newErrors.name = 'Le nom est requis';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Le nom doit contenir au moins 2 caractères';
      }
    }

    if (touched.categoryId || formData.categoryId) {
      if (!formData.categoryId) {
        newErrors.categoryId = 'La catégorie est requise';
      }
    }

    // Le prix n'est pas obligatoire si l'item a des variants
    if (!item?.hasVariants) {
      if (touched.price || formData.price) {
        if (formData.price <= 0) {
          newErrors.price = 'Le prix doit être supérieur à 0 (ou ajoutez des variants)';
        }
      }
    }

    setErrors(newErrors);
  }, [formData, touched]);

  // Gestion de la touche ESC et du scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  // Gestion du clic sur l'overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  // Gestion du changement de valeur
  const handleChange = (
    field: keyof ItemFormData,
    value: string | number | boolean | null | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Composant TagInput
  const TagInput = ({
    label,
    tags,
    onAddTag,
    onRemoveTag,
    placeholder,
  }: {
    label: string;
    tags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (index: number) => void;
    placeholder: string;
  }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
      const trimmed = inputValue.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onAddTag(trimmed);
        setInputValue('');
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          <span className="text-gray-400 text-xs font-normal ml-2">
            (optionnel)
          </span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => onRemoveTag(index)}
                  className="ml-1 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={`Supprimer ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Composant Switch
  const Switch = ({
    label,
    checked,
    onChange,
    description,
  }: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    description?: string;
  }) => {
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 cursor-pointer">
            {label}
          </label>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
            checked ? 'bg-orange-600' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={checked}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  };

  // Gestion du blur
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation complète avant sauvegarde
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'La catégorie est requise';
    }

    // Le prix est requis seulement si l'item n'a pas de variants
    // Si l'item a des variants (avec leurs propres prix), le prix de base peut être 0 ou vide
    if (!item?.hasVariants) {
      if (!formData.price || formData.price <= 0 || isNaN(formData.price)) {
        newErrors.price = 'Le prix doit être supérieur à 0 (ou ajoutez des variants)';
      }
    }

    if (formData.compareAtPrice !== null && formData.compareAtPrice !== undefined) {
      if (formData.compareAtPrice <= 0 || isNaN(formData.compareAtPrice)) {
        newErrors.compareAtPrice = 'Le prix de comparaison doit être supérieur à 0';
      }
      if (formData.compareAtPrice <= formData.price) {
        newErrors.compareAtPrice = 'Le prix de comparaison doit être supérieur au prix';
      }
    }

    if (formData.calories !== null && formData.calories !== undefined) {
      if (formData.calories < 0 || isNaN(formData.calories)) {
        newErrors.calories = 'Les calories doivent être positives';
      }
    }

    if (formData.preparationTime !== null && formData.preparationTime !== undefined) {
      if (formData.preparationTime < 0 || isNaN(formData.preparationTime)) {
        newErrors.preparationTime = 'Le temps de préparation doit être positif';
      }
    }

    setErrors(newErrors);
    setTouched({
      name: true,
      categoryId: true,
      price: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  // Fonction pour nettoyer les données avant l'envoi (seulement les champs qui existent dans la DB)
  const cleanFormData = (data: ItemFormData): any => {
    const cleaned: any = {
      name: data.name.trim(),
      categoryId: data.categoryId,
      price: data.price,
      isAvailable: data.isAvailable,
      isActive: data.isActive,
    };

    // Ajouter les champs optionnels seulement s'ils ont une valeur
    if (data.nameAr && data.nameAr.trim()) {
      cleaned.nameAr = data.nameAr.trim();
    }
    if (data.description && data.description.trim()) {
      cleaned.description = data.description.trim();
    }
    if (data.descriptionAr && data.descriptionAr.trim()) {
      cleaned.descriptionAr = data.descriptionAr.trim();
    }
    if (data.image && data.image.trim()) {
      cleaned.image = data.image.trim();
    }

    return cleaned;
  };

  // Fonction handleSave
  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const cleanedData = cleanFormData(formData);
      await onSave(cleanedData as ItemFormData);
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      // L'erreur sera gérée par le parent
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] flex flex-col m-4 md:m-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? `Modifier "${item.name}"` : 'Nouvel Item'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-6">
            {/* Section: Informations de base */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Informations de base
              </h3>
              <div className="space-y-4">
                {/* Nom (FR) */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nom (FR){' '}
                    <span className="text-red-500" aria-label="requis">
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="Ex: Koshari"
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
                      errors.name && touched.name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                    aria-invalid={errors.name && touched.name ? 'true' : 'false'}
                  />
                  {errors.name && touched.name && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Nom (AR) */}
                <div>
                  <label
                    htmlFor="nameAr"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nom (AR)
                    <span className="text-gray-400 text-xs font-normal ml-2">
                      (optionnel)
                    </span>
                  </label>
                  <input
                    type="text"
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => handleChange('nameAr', e.target.value)}
                    placeholder="Ex: كشري"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Catégorie{' '}
                    <span className="text-red-500" aria-label="requis">
                      *
                    </span>
                  </label>
                  <select
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) => handleChange('categoryId', e.target.value)}
                    onBlur={() => handleBlur('categoryId')}
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
                      errors.categoryId && touched.categoryId
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                    aria-invalid={
                      errors.categoryId && touched.categoryId ? 'true' : 'false'
                    }
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories
                      .filter((cat) => cat.isActive !== false)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                  {errors.categoryId && touched.categoryId && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                {/* Description (FR) */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description (FR)
                    <span className="text-gray-400 text-xs font-normal ml-2">
                      (optionnel)
                    </span>
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Description du plat..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors min-h-24"
                  />
                </div>

                {/* Description (AR) */}
                <div>
                  <label
                    htmlFor="descriptionAr"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description (AR)
                    <span className="text-gray-400 text-xs font-normal ml-2">
                      (optionnel)
                    </span>
                  </label>
                  <textarea
                    id="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) => handleChange('descriptionAr', e.target.value)}
                    placeholder="وصف الطبق..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors min-h-24"
                  />
                </div>
              </div>
            </div>

            {/* Section: Prix */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Prix
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prix */}
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Prix (EGP){' '}
                    {item?.hasVariants ? (
                      <span className="text-gray-400 text-xs font-normal ml-1">
                        (optionnel - prix dans les variants)
                      </span>
                    ) : (
                      <span className="text-red-500" aria-label="requis">
                        *
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="price"
                      value={formData.price || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleChange('price', 0);
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue)) {
                            handleChange('price', numValue);
                          }
                        }
                      }}
                      onBlur={() => handleBlur('price')}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
                        errors.price && touched.price
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      aria-invalid={errors.price && touched.price ? 'true' : 'false'}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      EGP
                    </span>
                  </div>
                  {item?.hasVariants && (
                    <p className="mt-1 text-xs text-blue-600">
                      💡 Les prix sont définis dans les variants ci-dessous
                    </p>
                  )}
                  {errors.price && touched.price && !item?.hasVariants && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.price}
                    </p>
                  )}
                </div>

                {/* Prix barré (compareAtPrice) */}
                <div>
                  <label
                    htmlFor="compareAtPrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Prix barré (pour promotions)
                    <span className="text-gray-400 text-xs font-normal ml-2">
                      (optionnel)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="compareAtPrice"
                      value={formData.compareAtPrice || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleChange('compareAtPrice', null);
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue)) {
                            handleChange('compareAtPrice', numValue);
                          }
                        }
                      }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      EGP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Image du plat
              </h3>
              <div className="space-y-4">
                {/* Upload d'image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo du plat
                    <span className="text-gray-400 text-xs font-normal ml-2">
                      (optionnel)
                    </span>
                  </label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => handleChange('image', url)}
                    onRemove={() => handleChange('image', '')}
                    folder="items"
                    aspectRatio="video"
                  />
                </div>

                {/* Option URL manuelle */}
                <div>
                  <label
                    htmlFor="image-url"
                    className="block text-sm font-medium text-gray-500 mb-1"
                  >
                    Ou entrez une URL
                  </label>
                  <input
                    type="url"
                    id="image-url"
                    value={formData.image}
                    onChange={(e) => handleChange('image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section: Détails supplémentaires */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Détails supplémentaires
              </h3>
              <div className="space-y-4">
                {/* Tags */}
                <TagInput
                  label="Tags"
                  tags={formData.tags}
                  onAddTag={(tag) => {
                    handleChange('tags', [...formData.tags, tag]);
                  }}
                  onRemoveTag={(index) => {
                    handleChange(
                      'tags',
                      formData.tags.filter((_, i) => i !== index)
                    );
                  }}
                  placeholder="Ex: Épicé, Végétarien, Populaire..."
                />

                {/* Allergènes */}
                <TagInput
                  label="Allergènes"
                  tags={formData.allergens}
                  onAddTag={(allergen) => {
                    handleChange('allergens', [...formData.allergens, allergen]);
                  }}
                  onRemoveTag={(index) => {
                    handleChange(
                      'allergens',
                      formData.allergens.filter((_, i) => i !== index)
                    );
                  }}
                  placeholder="Ex: Gluten, Lactose, Noix..."
                />
              </div>
            </div>

            {/* Section: Informations nutritionnelles */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Informations nutritionnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Calories */}
                <div>
                  <label
                    htmlFor="calories"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Calories
                    <span className="text-gray-400 text-xs font-normal ml-2">
                      (optionnel)
                    </span>
                  </label>
                  <input
                    type="number"
                    id="calories"
                    value={formData.calories || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        handleChange('calories', null);
                      } else {
                        const intValue = parseInt(value);
                        if (!isNaN(intValue)) {
                          handleChange('calories', intValue);
                        }
                      }
                    }}
                    placeholder="0"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                  />
                </div>

                {/* Temps de préparation */}
                <div>
                  <label
                    htmlFor="preparationTime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Temps de préparation
                    <span className="text-gray-400 text-xs font-normal ml-2">
                      (optionnel)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="preparationTime"
                      value={formData.preparationTime || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleChange('preparationTime', null);
                        } else {
                          const intValue = parseInt(value);
                          if (!isNaN(intValue)) {
                            handleChange('preparationTime', intValue);
                          }
                        }
                      }}
                      placeholder="0"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      minutes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Statut */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                <ToggleLeft className="w-5 h-5" />
                Statut
              </h3>
              <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                <Switch
                  label="Item actif"
                  checked={formData.isActive}
                  onChange={(checked) => handleChange('isActive', checked)}
                  description="Un item inactif ne sera pas visible dans le menu public"
                />
                <div className="border-t border-gray-200 my-2" />
                <Switch
                  label="Disponible"
                  checked={formData.isAvailable}
                  onChange={(checked) => handleChange('isAvailable', checked)}
                  description="Marquer comme indisponible si l'item est temporairement en rupture"
                />
                <div className="border-t border-gray-200 my-2" />
                <Switch
                  label="Mis en avant (Featured)"
                  checked={formData.isFeatured}
                  onChange={(checked) => handleChange('isFeatured', checked)}
                  description="Afficher cet item en vedette sur la page d'accueil"
                />
              </div>
            </div>

            {/* Section: Variants et Options - Seulement en mode édition */}
            {item && item.id && (
              <>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    Variants et Options
                  </h3>
                  <div className="space-y-6">
                    <VariantManager menuItemId={item.id} />
                    
                    {/* Groupes d'options avec quota inclus (ex: "Choix de 3 viandes") */}
                    <div className="border-t pt-6">
                      <OptionGroupManager menuItemId={item.id} />
                    </div>
                    
                    {/* Options individuelles (pour compatibilité avec l'ancien système) */}
                    <div className="border-t pt-6">
                      <OptionManager menuItemId={item.id} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !formData.name.trim() || !formData.categoryId || (!item && (!formData.price || formData.price <= 0 || isNaN(formData.price)))}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
