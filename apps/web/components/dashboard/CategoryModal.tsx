'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Folder, ToggleLeft } from 'lucide-react';

// Interfaces TypeScript
interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface CategoryFormData {
  name: string;
  nameAr: string;
  description: string;
  image: string;
  isActive: boolean;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSave: (data: CategoryFormData) => Promise<void>;
}

export default function CategoryModal({
  isOpen,
  onClose,
  category,
  onSave,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    nameAr: '',
    description: '',
    image: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialisation en mode édition
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        nameAr: category.nameAr || '',
        description: category.description || '',
        image: category.image || '',
        isActive: category.isActive ?? true,
      });
    } else {
      // Réinitialiser pour création
      setFormData({
        name: '',
        nameAr: '',
        description: '',
        image: '',
        isActive: true,
      });
    }
    setErrors({});
    setTouched({});
  }, [category, isOpen]);

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

    if (touched.image || formData.image) {
      if (formData.image && formData.image.trim()) {
        try {
          new URL(formData.image);
        } catch {
          newErrors.image = 'URL invalide';
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
    field: keyof CategoryFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

    if (formData.image && formData.image.trim()) {
      try {
        new URL(formData.image);
      } catch {
        newErrors.image = 'URL invalide';
      }
    }

    setErrors(newErrors);
    setTouched({
      name: true,
      image: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  // Fonction handleSave
  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      // L'erreur sera gérée par le parent
    } finally {
      setLoading(false);
    }
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

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col m-4 md:m-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {category ? `Modifier "${category.name}"` : 'Nouvelle Catégorie'}
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
                    placeholder="Ex: Entrées"
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
                    placeholder="Ex: المقبلات"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description
                    <span className="text-gray-400 text-xs font-normal ml-2">
                      (optionnel)
                    </span>
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Description de la catégorie..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors min-h-24"
                  />
                </div>
              </div>
            </div>

            {/* Section: Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Image
              </h3>
              <div className="space-y-4">
                {/* URL de l'image */}
                <div>
                  <label
                    htmlFor="image"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    URL de l'image
                    <span className="text-gray-400 text-xs font-normal ml-2">
                      (optionnel)
                    </span>
                  </label>
                  <input
                    type="url"
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleChange('image', e.target.value)}
                    onBlur={() => handleBlur('image')}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-colors ${
                      errors.image && touched.image
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                    aria-invalid={errors.image && touched.image ? 'true' : 'false'}
                  />
                  {errors.image && touched.image && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.image}
                    </p>
                  )}
                </div>

                {/* Preview de l'image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aperçu
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                    {formData.image && formData.image.trim() ? (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-[100px] h-[100px] rounded-lg object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const container = img.parentElement;
                          if (container) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-[100px] h-[100px] rounded-lg bg-gray-200 flex items-center justify-center';
                            placeholder.innerHTML = '<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>';
                            container.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-[100px] h-[100px] rounded-lg bg-gray-200 flex items-center justify-center">
                        <Folder className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
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
              <div className="bg-gray-50 rounded-lg p-4">
                <Switch
                  label="Catégorie active"
                  checked={formData.isActive}
                  onChange={(checked) => handleChange('isActive', checked)}
                  description="Une catégorie inactive ne sera pas visible dans le menu public"
                />
              </div>
            </div>
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
            disabled={loading || !formData.name.trim()}
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
