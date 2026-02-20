'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingCart, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, CartItem } from '@/store/cartStore';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { useLanguage } from '@/contexts/LanguageContext';
import type { RestaurantCart } from '@/types/restaurant';
import { formatPrice as sharedFormatPrice } from '@/lib/shared/pricing';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant?: RestaurantCart;
}

export default function CartDrawer({ isOpen, onClose, restaurant }: CartDrawerProps) {
  const { t } = useLanguage();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const total = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + (item.totalPrice || item.basePrice * item.quantity), 0)
  );

  const defaultRestaurant: RestaurantCart = {
    id: '',
    name: 'Restaurant',
    phone: '',
    whatsappNumber: undefined,
    slug: '',
  };

  const restaurantData = restaurant || defaultRestaurant;

  if (!restaurantData.slug) {
    console.warn('[CART] Restaurant sans slug:', restaurantData);
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const formatPrice = (price: number) => sharedFormatPrice(price);

  const getItemSubtotal = (item: CartItem) => item.totalPrice || item.basePrice * item.quantity;

  const handleCheckout = () => {
    if (items.length === 0) return;
    setIsCheckoutOpen(true);
  };

  const handleCheckoutClose = () => setIsCheckoutOpen(false);

  const handleCheckoutConfirm = () => {
    setIsCheckoutOpen(false);
    onClose();
  };

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{t.cart.myCart}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={t.cart.closeCart}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <ShoppingCart className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">{t.cart.emptyCart}</p>
                  <p className="text-gray-400 text-sm mt-1">{t.cart.addItemsFromMenu}</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25 }}
                        className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                      >
                        <div className="flex gap-3">
                          {/* Image */}
                          <div className="flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.menuItemName}
                                className="w-14 h-14 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {item.menuItemName}
                            </h3>
                            {item.variantName && (
                              <p className="text-xs text-gray-500">{item.variantName}</p>
                            )}
                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {item.selectedOptions.map((opt) => opt.optionName).join(', ')}
                              </p>
                            )}

                            {/* Quantity + Price */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                                  className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                  aria-label={t.cart.decreaseQty}
                                >
                                  <Minus className="w-3 h-3 text-gray-600" />
                                </button>
                                <span className="text-sm font-semibold text-gray-900 w-5 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                  aria-label={t.cart.increaseQty}
                                >
                                  <Plus className="w-3 h-3 text-gray-600" />
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">
                                  {formatPrice(getItemSubtotal(item))}
                                </span>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  aria-label={t.cart.removeItem}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 p-4 space-y-3 bg-white">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t.cart.subtotal}</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{t.cart.delivery}</span>
                    <span>{t.cart.toCalculate}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>{t.cart.total}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  className="w-full font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{t.cart.finalizeOrder}</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

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
