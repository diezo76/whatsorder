'use client';

import { useEffect, useRef, useState } from 'react';
import MenuItemCard from './MenuItemCard';

interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  image?: string;
  tags?: string[];
  isFeatured?: boolean;
}

interface Category {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  items: MenuItem[];
}

interface MenuCategoryProps {
  category: Category;
  onAddToCart?: (item: MenuItem) => void;
}

export default function MenuCategory({ category, onAddToCart }: MenuCategoryProps) {
  const { id, name, nameAr, description, items } = category;
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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
      className={`mb-12 md:mb-16 transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Header de catégorie */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-2">
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

        {/* Divider décoratif */}
        <div className="mt-4 border-t-2 border-orange-500 w-16" />
      </div>

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
            Aucun plat disponible pour le moment
          </p>
        </div>
      )}
    </section>
  );
}
