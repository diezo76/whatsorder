'use client';

import { useEffect, useRef, useState } from 'react';

interface CategoryNavProps {
  categories: { id: string; name: string }[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    categories.forEach((cat) => {
      const el = document.getElementById(`category-${cat.id}`);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(cat.id);
          }
        },
        { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [categories]);

  const scrollToCategory = (id: string) => {
    const el = document.getElementById(`category-${id}`);
    if (el) {
      const offset = 130;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!navRef.current || !activeId) return;
    const activeBtn = navRef.current.querySelector(`[data-cat="${activeId}"]`) as HTMLElement;
    if (activeBtn) {
      const nav = navRef.current;
      const btnLeft = activeBtn.offsetLeft;
      const btnWidth = activeBtn.offsetWidth;
      const navWidth = nav.offsetWidth;
      const scrollTarget = btnLeft - navWidth / 2 + btnWidth / 2;
      nav.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    }
  }, [activeId]);

  if (categories.length === 0) return null;

  return (
    <div
      ref={navRef}
      className="flex gap-1 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {categories.map((cat) => (
        <button
          key={cat.id}
          data-cat={cat.id}
          onClick={() => scrollToCategory(cat.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeId === cat.id
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
