'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { UtensilsCrossed, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { ProductModal } from './ProductModal';
import { MenuItemWithVariantsAndOptions, CartItem } from '@/types/menu';
import { useLanguage } from '@/contexts/LanguageContext';

interface MenuItemCardProps {
  item: MenuItemWithVariantsAndOptions;
  onAddToCart?: (item: MenuItemWithVariantsAndOptions) => void;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { id, name, nameAr, description, descriptionAr, price, image, hasVariants, variants, options } = item;
  const addItem = useCartStore((state) => state.addItem);
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = (cartItem: CartItem) => {
    addItem(cartItem);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation
    // Si l'item a des variants ou options, ouvrir le modal
    // Sinon, ajouter directement au panier
    if (hasVariants || (options && options.length > 0)) {
      setShowModal(true);
    } else {
      // Ajouter directement au panier pour les items simples
      const cartItem: CartItem = {
        id: `${id}-${Date.now()}`,
        menuItemId: id,
        menuItemName: name,
        quantity: 1,
        basePrice: price || 0,
        selectedOptions: [],
        totalPrice: price || 0,
        image,
      };
      addItem(cartItem);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden flex flex-col">
        {/* Image avec hauteur fixe h-48 */}
        <div className="relative w-full h-48 overflow-hidden bg-gray-100 rounded-t-lg">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <UtensilsCrossed className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Nom du plat (bilingue) */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {name}
            </h3>
            {nameAr && (
              <p className="text-base text-gray-600 mt-1 leading-tight" dir="rtl">
                {nameAr}
              </p>
            )}
          </div>

          {/* Description (tronquée à 2 lignes) */}
          {(description || descriptionAr) && (
            <div className="mb-3 flex-1">
              {description && (
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {description}
                </p>
              )}
              {descriptionAr && (
                <p
                  className="text-sm text-gray-600 line-clamp-2 leading-relaxed mt-1"
                  dir="rtl"
                >
                  {descriptionAr}
                </p>
              )}
            </div>
          )}

          {/* Prix et Bouton */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">
                {hasVariants && variants && variants.length > 0 
                  ? `${t.menu.startingFrom} ${variants[0]?.price || price || 0} EGP`
                  : `${price || 0} EGP`}
              </span>
            </div>

            {/* Bouton Ajouter au panier */}
            <button
              onClick={handleButtonClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 bg-primary text-white hover:bg-primary/90 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t.menu.add}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal rendu via portal pour éviter les problèmes de transform */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <ProductModal
          product={item}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
        />,
        document.body
      )}
    </>
  );
}
