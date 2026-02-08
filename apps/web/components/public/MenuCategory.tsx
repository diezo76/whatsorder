'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Animation au scroll avec Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id={`category-${id}`}
      className={`pt-8 md:pt-12 mb-12 md:mb-16 transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Header de catégorie - cliquable */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full text-left mb-6 border-b border-gray-200 pb-4 cursor-pointer group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1">
            {/* Nom de la catégorie */}
            <h2 className="text-2xl font-bold text-gray-900">{name}</h2>

            {/* Nom arabe si disponible */}
            {nameAr && (
              <p className="text-lg text-gray-600" dir="rtl">
                {nameAr}
              </p>
            )}

            {/* Description si disponible */}
            {description && (
              <p className="text-gray-500 mt-2">{description}</p>
            )}
          </div>

          {/* Chevron toggle */}
          <div className="flex-shrink-0">
            <ChevronDown
              className={`w-6 h-6 text-gray-400 group-hover:text-orange-500 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>
        </div>

        {/* Divider décoratif */}
        <div className="mt-4 border-t-2 border-orange-500 w-16" />
      </button>

      {/* Contenu dépliable */}
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          isExpanded
            ? 'max-h-[5000px] opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        {/* Grid d'items */}
        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-lg">
              {t.menu.noItemsAvailable}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
