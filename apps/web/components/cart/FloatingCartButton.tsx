'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface FloatingCartButtonProps {
  onClick: () => void;
}

export default function FloatingCartButton({ onClick }: FloatingCartButtonProps) {
  const [mounted, setMounted] = useState(false);

  // Calculer itemCount à la volée depuis les items (plus fiable que la propriété stockée)
  const itemCount = useCartStore((state) => 
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  // Formater le nombre pour le badge (9+ si > 9)
  const badgeText = itemCount > 9 ? '9+' : itemCount.toString();

  useEffect(() => {
    setMounted(true);
  }, []);

  const buttonContent = (
    <button
      onClick={onClick}
      className="w-14 h-14 md:w-16 md:h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center relative"
      aria-label="Ouvrir le panier"
      role="button"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        visibility: 'visible',
        opacity: 1,
      }}
    >
      {/* Icône ShoppingCart */}
      <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />

      {/* Badge avec le nombre d'items */}
      {itemCount > 0 && (
        <span
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse"
          aria-label={`${itemCount} article${itemCount > 1 ? 's' : ''} dans le panier`}
        >
          {badgeText}
        </span>
      )}
    </button>
  );

  // Utiliser un portail pour rendre directement dans le body
  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  return createPortal(buttonContent, document.body);
}
