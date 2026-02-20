'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { UtensilsCrossed, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { ProductModal } from './ProductModal';
import { MenuItemWithVariantsAndOptions, CartItem } from '@/types/menu';
import { useLanguage } from '@/contexts/LanguageContext';

interface MenuItemCardProps {
  item: MenuItemWithVariantsAndOptions;
  onAddToCart?: (item: MenuItemWithVariantsAndOptions) => void;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { id, name, nameAr, description, descriptionAr, price, image, hasVariants, variants, options, optionGroups } = item;
  const addItem = useCartStore((state) => state.addItem);
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (cartItem: CartItem) => {
    addItem(cartItem);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const isKidsMenu = name.toLowerCase().includes('menu enfant') || name.toLowerCase().includes('kids') || name.toLowerCase().includes('menu kid');

  const needsModal = hasVariants || (options && options.length > 0) || (optionGroups && optionGroups.length > 0) || isKidsMenu;

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (needsModal) {
      setShowModal(true);
    } else {
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
      handleAddToCart(cartItem);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.35 }}
        onClick={() => needsModal && setShowModal(true)}
        className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${needsModal ? 'cursor-pointer' : ''}`}
      >
        {/* Image */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <UtensilsCrossed className="w-12 h-12 text-gray-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-1">
            <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-1">{name}</h3>
            {nameAr && (
              <p className="text-sm text-gray-500 mt-0.5 leading-snug" dir="rtl">{nameAr}</p>
            )}
          </div>

          {(description || descriptionAr) && (
            <div className="mb-3 flex-1">
              {description && (
                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{description}</p>
              )}
            </div>
          )}

          {/* Price + Button */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <span className="text-base font-bold text-gray-900">
              {hasVariants && variants && variants.length > 0
                ? `${t.menu.startingFrom} ${variants[0]?.price || price || 0} EGP`
                : `${price || 0} EGP`}
            </span>

            <button
              onClick={handleButtonClick}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                justAdded
                  ? 'bg-green-500 text-white scale-110'
                  : 'bg-gray-900 text-white hover:bg-gray-700'
              }`}
              aria-label={t.menu.add}
            >
              {justAdded ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {showModal && typeof document !== 'undefined' && createPortal(
        <ProductModal
          product={item}
          onClose={() => setShowModal(false)}
          onAddToCart={handleAddToCart}
        />,
        document.body
      )}
    </>
  );
}
