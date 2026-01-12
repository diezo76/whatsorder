import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Item dans le panier
 */
export interface CartItem {
  id: string; // ID unique de l'item dans le panier
  menuItemId: string; // ID de l'item du menu (pour identifier les doublons)
  name: string;
  nameAr?: string;
  price: number;
  quantity: number;
  image?: string;
  customization?: string; // Personnalisations optionnelles (ex: "Sans oignons, Extra sauce")
}

/**
 * Store du panier avec state et actions
 */
export interface CartStore {
  // State
  items: CartItem[];

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
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
       * Ajoute un item au panier ou incrémente sa quantité si déjà présent
       * @param item - Item à ajouter (sans quantity, qui sera initialisée à 1)
       */
      addItem: (item) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (cartItem) => cartItem.menuItemId === item.menuItemId
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Item déjà présent : incrémenter la quantité
          newItems = currentItems.map((cartItem, index) =>
            index === existingItemIndex
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        } else {
          // Nouvel item : ajouter avec quantity: 1
          const newItem: CartItem = {
            ...item,
            quantity: 1,
          };
          newItems = [...currentItems, newItem];
        }

        // Calculer les valeurs computed
        const total = newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
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
       * Retire un item du panier
       * @param menuItemId - ID de l'item du menu à retirer
       */
      removeItem: (menuItemId) => {
        const currentItems = get().items;
        const newItems = currentItems.filter(
          (item) => item.menuItemId !== menuItemId
        );

        // Calculer les valeurs computed
        const total = newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
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
       * @param menuItemId - ID de l'item du menu
       * @param quantity - Nouvelle quantité (doit être >= 0)
       */
      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          // Si quantité <= 0, retirer l'item
          get().removeItem(menuItemId);
          return;
        }

        const currentItems = get().items;
        const newItems = currentItems.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity }
            : item
        );

        // Calculer les valeurs computed
        const total = newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
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
       * @returns Prix total (sum de price * quantity pour chaque item)
       */
      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
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
            (sum, item) => sum + item.price * item.quantity,
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
