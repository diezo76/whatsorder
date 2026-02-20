import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/menu';

// Réexporter le type pour compatibilité
export type { CartItem };

/**
 * Store du panier avec state et actions
 */
export interface CartStore {
  // State
  items: CartItem[];

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Computed values (getters)
  getTotalPrice: () => number;
  getItemCount: () => number;

  // Computed values (propriétés calculées)
  total: number;
  itemCount: number;
}

/**
 * Store Zustand pour la gestion du panier
 * 
 * Features:
 * - Persistence dans localStorage
 * - Gestion des quantités
 * - Calcul automatique du total et du nombre d'items
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State initial
      items: [],
      total: 0,
      itemCount: 0,

      /**
       * Ajoute un item au panier
       * Pour les items avec variants/options, on compare aussi variantId et selectedOptions
       * @param item - Item à ajouter (avec quantity déjà définie)
       */
      addItem: (item) => {
        const currentItems = get().items;
        
        // Créer une clé unique pour identifier les items identiques
        const itemKey = (cartItem: CartItem) => {
          const variantKey = cartItem.variantId || 'no-variant';
          const optionsKey = (cartItem.selectedOptions || [])
            .map(o => o.optionId)
            .sort()
            .join(',');
          return `${cartItem.menuItemId}-${variantKey}-${optionsKey}`;
        };

        const newItemKey = itemKey(item);
        const existingItemIndex = currentItems.findIndex(
          (cartItem) => itemKey(cartItem) === newItemKey
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Item identique déjà présent : incrémenter la quantité ET recalculer totalPrice
          newItems = currentItems.map((cartItem, index) => {
            if (index === existingItemIndex) {
              const newQuantity = cartItem.quantity + item.quantity;
              const optionsPrice = cartItem.selectedOptions.reduce(
                (sum, opt) => sum + opt.priceModifier,
                0
              );
              const newTotalPrice = (cartItem.basePrice + optionsPrice) * newQuantity;
              return { ...cartItem, quantity: newQuantity, totalPrice: newTotalPrice };
            }
            return cartItem;
          });
        } else {
          // Nouvel item : ajouter tel quel
          newItems = [...currentItems, item];
        }

        // Calculer les valeurs computed (utiliser totalPrice si disponible, sinon basePrice)
        const total = newItems.reduce(
          (sum, item) => sum + (item.totalPrice || (item.basePrice * item.quantity)),
          0
        );
        const itemCount = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        set({
          items: newItems,
          total,
          itemCount,
        });
      },

      /**
       * Retire un item du panier par son ID unique
       * @param itemId - ID unique de l'item dans le panier
       */
      removeItem: (itemId) => {
        const currentItems = get().items;
        const newItems = currentItems.filter(
          (item) => item.id !== itemId
        );

        // Calculer les valeurs computed
        const total = newItems.reduce(
          (sum, item) => sum + (item.totalPrice || (item.basePrice * item.quantity)),
          0
        );
        const itemCount = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        set({
          items: newItems,
          total,
          itemCount,
        });
      },

      /**
       * Met à jour la quantité d'un item
       * Si quantity = 0, retire l'item du panier
       * @param itemId - ID unique de l'item dans le panier
       * @param quantity - Nouvelle quantité (doit être >= 0)
       */
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          // Si quantité <= 0, retirer l'item
          get().removeItem(itemId);
          return;
        }

        const currentItems = get().items;
        const newItems = currentItems.map((item) => {
          if (item.id === itemId) {
            // Recalculer totalPrice avec la nouvelle quantité
            const optionsPrice = item.selectedOptions.reduce(
              (sum, opt) => sum + opt.priceModifier,
              0
            );
            const newTotalPrice = (item.basePrice + optionsPrice) * quantity;
            return { ...item, quantity, totalPrice: newTotalPrice };
          }
          return item;
        });

        // Calculer les valeurs computed
        const total = newItems.reduce(
          (sum, item) => sum + (item.totalPrice || (item.basePrice * item.quantity)),
          0
        );
        const itemCount = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        set({
          items: newItems,
          total,
          itemCount,
        });
      },

      /**
       * Vide complètement le panier
       */
      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
        });
      },

      /**
       * Calcule le prix total du panier
       * @returns Prix total (sum de totalPrice pour chaque item)
       */
      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + (item.totalPrice || (item.basePrice * item.quantity)),
          0
        );
      },

      /**
       * Compte le nombre total d'items dans le panier
       * @returns Nombre total d'items (sum des quantities)
       */
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'whataybo-cart', // Clé pour localStorage
      partialize: (state) => ({
        // Persiste uniquement 'items'
        items: state.items,
      }),
      onRehydrateStorage: () => (state) => {
        // Recalculer total et itemCount après hydratation depuis localStorage
        if (state && state.items) {
          const total = state.items.reduce(
            (sum, item) => sum + (item.totalPrice || (item.basePrice * item.quantity)),
            0
          );
          const itemCount = state.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          // Mettre à jour de manière immuable
          return {
            ...state,
            total,
            itemCount,
          };
        }
        return state;
      },
    }
  )
);
