'use client';

import { useState } from 'react';
import {
  UtensilsCrossed,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';

// Interfaces TypeScript
interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
}

interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  images: string[];
  tags: string[];
  isAvailable: boolean;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  category?: Category;
}

interface MenuItemsTableProps {
  items: MenuItem[];
  categories: Category[];
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onToggleAvailability: (itemId: string) => void;
  onCreateItem?: () => void;
}

export default function MenuItemsTable({
  items,
  categories,
  onEdit,
  onDelete,
  onToggleAvailability,
  onCreateItem,
}: MenuItemsTableProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Trouver la catégorie d'un item
  const getCategory = (categoryId: string): Category | undefined => {
    return categories.find((cat) => cat.id === categoryId);
  };

  // Gérer l'erreur d'image
  const handleImageError = (itemId: string) => {
    setImageErrors((prev) => new Set(prev).add(itemId));
  };

  // Confirmation avant suppression
  const handleDelete = (item: MenuItem) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer "${item.name}" ?`
      )
    ) {
      onDelete(item.id);
    }
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <UtensilsCrossed className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucun item trouvé
        </h3>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Commencez par créer votre premier item de menu
        </p>
        {onCreateItem && (
          <button
            onClick={onCreateItem}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer un item
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="font-semibold text-left p-4 text-gray-700">Image</th>
              <th className="font-semibold text-left p-4 text-gray-700">Nom</th>
              <th className="font-semibold text-left p-4 text-gray-700">Catégorie</th>
              <th className="font-semibold text-left p-4 text-gray-700">Prix</th>
              <th className="font-semibold text-left p-4 text-gray-700">Statut</th>
              <th className="font-semibold text-left p-4 text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const category = getCategory(item.categoryId);
              const hasImageError = imageErrors.has(item.id);
              const showImage = item.image && !hasImageError;

              return (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-0"
                >
                  {/* Image */}
                  <td className="p-4">
                    {showImage ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-[60px] h-[60px] rounded object-cover"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] rounded bg-gray-100 flex items-center justify-center">
                        <UtensilsCrossed className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>

                  {/* Nom */}
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.nameAr && (
                        <div className="text-sm text-gray-500 mt-1">
                          {item.nameAr}
                        </div>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Catégorie */}
                  <td className="p-4">
                    {category ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Sans catégorie</span>
                    )}
                  </td>

                  {/* Prix */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {item.price.toFixed(2)} EGP
                      </span>
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {item.compareAtPrice.toFixed(2)} EGP
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${
                          item.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.isActive ? 'Actif' : 'Inactif'}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${
                          item.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.isAvailable ? 'Disponible' : 'Indisponible'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {/* Toggle disponibilité */}
                      <button
                        onClick={() => onToggleAvailability(item.id)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                        title={
                          item.isAvailable
                            ? 'Marquer comme indisponible'
                            : 'Marquer comme disponible'
                        }
                        aria-label={
                          item.isAvailable
                            ? 'Marquer comme indisponible'
                            : 'Marquer comme disponible'
                        }
                      >
                        {item.isAvailable ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>

                      {/* Modifier */}
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-all hover:scale-110"
                        title="Modifier"
                        aria-label="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      {/* Supprimer */}
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                        title="Supprimer"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {items.map((item) => {
          const category = getCategory(item.categoryId);
          const hasImageError = imageErrors.has(item.id);
          const showImage = item.image && !hasImageError;

          return (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="flex-shrink-0">
                  {showImage ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded object-cover"
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded bg-gray-100 flex items-center justify-center">
                      <UtensilsCrossed className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  {/* Nom et catégorie */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {item.nameAr && (
                        <p className="text-sm text-gray-500 mt-1">{item.nameAr}</p>
                      )}
                    </div>
                    {category && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                        {category.name}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Prix */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-gray-900">
                      {item.price.toFixed(2)} EGP
                    </span>
                    {item.compareAtPrice && item.compareAtPrice > item.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {item.compareAtPrice.toFixed(2)} EGP
                      </span>
                    )}
                  </div>

                  {/* Statut */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isAvailable ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => onToggleAvailability(item.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      {item.isAvailable ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Indisponible
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Disponible
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
