'use client';

import { useState } from 'react';
import { UtensilsCrossed, ShoppingCart, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

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

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void; // Conservé pour compatibilité mais non utilisé
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { id, name, nameAr, description, descriptionAr, price, image, tags, isFeatured } = item;
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  return (
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

        {/* Badge Featured */}
        {isFeatured && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            ⭐ Populaire
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

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium"
              >
                {tag === 'vegetarian' && '🌱 '}
                {tag === 'spicy' && '🌶️ '}
                {tag === 'popular' && '⭐ '}
                {tag === 'traditional' && '🏛️ '}
                {tag === 'hot' && '🔥 '}
                {tag === 'fresh' && '✨ '}
                {tag === 'healthy' && '💚 '}
                {tag === 'sweet' && '🍰 '}
                {tag === 'grilled' && '🔥 '}
                {tag === 'seafood' && '🐟 '}
                {tag === 'breakfast' && '🌅 '}
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Prix et Bouton */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">
              {price} EGP
            </span>
          </div>

          {/* Bouton Ajouter au panier */}
          <button
            onClick={() => {
              // Générer un ID unique pour l'item dans le panier
              const cartItemId = `${id}-${Date.now()}`;
              
              // Ajouter au panier via le store
              addItem({
                id: cartItemId,
                menuItemId: id,
                name,
                nameAr,
                price,
                image,
              });

              // Feedback visuel : afficher "Ajouté ✓" pendant 1 seconde
              setIsAdded(true);
              setTimeout(() => {
                setIsAdded(false);
              }, 1000);
            }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${
                isAdded
                  ? 'bg-green-600 text-white scale-105'
                  : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
              }
            `}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>Ajouté</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Ajouter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
