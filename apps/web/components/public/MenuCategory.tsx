'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import MenuItemCard from './MenuItemCard';
import { MenuItemWithVariantsAndOptions } from '@/types/menu';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  items: MenuItemWithVariantsAndOptions[];
}

interface MenuCategoryProps {
  category: Category;
  onAddToCart?: (item: MenuItemWithVariantsAndOptions) => void;
}

export default function MenuCategory({ category, onAddToCart }: MenuCategoryProps) {
  const { id, name, nameAr, description, items } = category;
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section id={`category-${id}`} className="scroll-mt-32">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full text-left mb-6 group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{name}</h2>
            {nameAr && (
              <p className="text-base text-gray-500 mt-0.5" dir="rtl">{nameAr}</p>
            )}
            {description && (
              <p className="text-sm text-gray-400 mt-1">{description}</p>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform duration-300 flex-shrink-0 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
        <div className="mt-3 h-px bg-gray-100" />
      </button>

      {/* Content */}
      <div className={`overflow-hidden transition-all duration-400 ease-in-out ${
        isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400">{t.menu.noItemsAvailable}</p>
          </div>
        )}
      </div>
    </section>
  );
}
