'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingCart, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import { useCartStore, CartItem } from '@/store/cartStore';
import CheckoutModal from '@/components/checkout/CheckoutModal';

interface Restaurant {
  id?: string;
  slug?: string;
  name: string;
  phone: string;
  whatsappNumber?: string; // Optionnel car peut ne pas être défini
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant?: Restaurant;
}

export default function CartDrawer({ isOpen, onClose, restaurant }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Calculer total à la volée depuis les items
  const total = useCartStore((state) => 
    state.items.reduce((sum, item) => sum + (item.totalPrice || item.basePrice * item.quantity), 0)
  );

  // Restaurant par défaut si non fourni (pour tests)
  // ATTENTION: Le slug est requis pour créer une commande !
  // Ne pas utiliser de numéro WhatsApp par défaut - le restaurant doit avoir son propre numéro
  const defaultRestaurant: Restaurant = {
    name: 'Restaurant',
    phone: '',
    whatsappNumber: undefined, // Pas de numéro par défaut - le restaurant doit définir son numéro
    slug: '', // Slug vide par défaut - empêchera la création de commande si restaurant non défini
  };

  const restaurantData = restaurant || defaultRestaurant;
  
  // Log pour debug
  if (!restaurantData.slug) {
    console.warn('⚠️ [CART] Restaurant sans slug:', restaurantData);
  }

  // Gestion de la touche ESC pour fermer le drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body quand le drawer est ouvert
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Formatage du prix
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} EGP`;
  };

  // Calcul du sous-total d'un item
  const getItemSubtotal = (item: CartItem) => {
    return item.totalPrice || item.basePrice * item.quantity;
  };

  // Gestion du clic sur l'overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Gestion de l'incrémentation de quantité
  const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
    updateQuantity(itemId, currentQuantity + 1);
  };

  // Gestion de la décrémentation de quantité
  const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    } else {
      removeItem(itemId);
    }
  };

  // Gestion de l'ouverture du checkout modal
  const handleCheckout = () => {
    if (items.length === 0) {
      return; // Ne rien faire si le panier est vide
    }
    setIsCheckoutOpen(true);
  };

  // Gestion de la fermeture du checkout modal
  const handleCheckoutClose = () => {
    setIsCheckoutOpen(false);
  };

  // Gestion de la confirmation (ferme aussi le drawer)
  const handleCheckoutConfirm = () => {
    setIsCheckoutOpen(false);
    onClose(); // Ferme aussi le drawer
  };

  if (!isOpen) {
    return null;
  }

  const drawerContent = (
    <>
      {/* Overlay sombre */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={handleOverlayClick}
        aria-hidden="false"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full md:w-96 bg-white z-50 flex flex-col shadow-2xl"
        aria-hidden="false"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Mon Panier</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fermer le panier"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body - Liste des items ou message vide */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            // Panier vide
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">Votre panier est vide</p>
              <p className="text-gray-400 text-sm mt-2">
                Ajoutez des items depuis le menu
              </p>
            </div>
          ) : (
            // Liste des items
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex gap-3">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.menuItemName}
                          className="w-[60px] h-[60px] rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-[60px] h-[60px] rounded-lg bg-gray-200 flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      {/* Nom et prix */}
                      <div className="mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {item.menuItemName}
                        </h3>
                        {item.variantName && (
                          <p className="text-xs text-gray-500">
                            {item.variantName}
                          </p>
                        )}
                        <div className="text-sm font-medium text-primary mt-1">
                          <p>{formatPrice(item.basePrice)}</p>
                          {item.variantName && (
                            <p className="text-xs text-gray-500">{item.variantName}</p>
                          )}
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {item.selectedOptions.map((opt, idx) => (
                                <span key={idx}>
                                  {opt.optionName} {opt.priceModifier > 0 ? `+${opt.priceModifier} EGP` : ''}
                                  {idx < item.selectedOptions.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contrôles quantité */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Bouton - */}
                          <button
                            onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                            className="p-1 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>

                          {/* Quantité */}
                          <span className="text-sm font-medium text-gray-900 w-8 text-center">
                            {item.quantity}
                          </span>

                          {/* Bouton + */}
                          <button
                            onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                            className="p-1 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        {/* Bouton supprimer */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          aria-label="Supprimer l'item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Sous-total */}
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          Sous-total:{' '}
                          <span className="font-semibold text-gray-900">
                            {formatPrice(getItemSubtotal(item))}
                          </span>
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Total et bouton checkout */}
        {items.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3">
            {/* Détails du total */}
            <div className="space-y-2">
              {/* Sous-total */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>

              {/* Livraison */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Livraison</span>
                <span className="font-medium text-gray-400">À calculer</span>
              </div>

              {/* Total */}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Bouton Commander sur WhatsApp */}
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                items.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Finaliser la commande</span>
            </button>
          </div>
        )}
      </div>
    </>
  );

  // Utiliser un portail pour rendre directement dans le body
  if (typeof window !== 'undefined') {
    return (
      <>
        {createPortal(drawerContent, document.body)}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={handleCheckoutClose}
          restaurant={restaurantData}
          cartItems={items}
          cartTotal={total}
          onConfirm={handleCheckoutConfirm}
        />
      </>
    );
  }

  return null;
}
