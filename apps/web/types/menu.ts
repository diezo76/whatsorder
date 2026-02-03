// Types pour les variants et options
export interface MenuItemVariant {
  id: string;
  menuItemId: string;
  name: string;
  nameAr?: string;
  price: number;
  sku?: string;
  trackInventory: boolean;
  stockQuantity?: number;
  lowStockAlert?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuItemOption {
  id: string;
  menuItemId: string;
  name: string;
  nameAr?: string;
  type: 'ADDON' | 'MODIFICATION' | 'INSTRUCTION';
  priceModifier: number;
  isRequired: boolean;
  isMultiple: boolean;
  maxSelections?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuItemWithVariantsAndOptions {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  price?: number;
  hasVariants: boolean;
  categoryId: string;
  isActive: boolean;
  isAvailable: boolean;
  variants: MenuItemVariant[];
  options: MenuItemOption[];
  category: {
    id: string;
    name: string;
    nameAr?: string;
  };
}

export interface CartItem {
  id: string; // ID unique de l'item dans le panier
  menuItemId: string;
  menuItemName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  basePrice: number;
  selectedOptions: {
    optionId: string;
    optionName: string;
    priceModifier: number;
  }[];
  totalPrice: number; // basePrice + sum(options) * quantity
  image?: string;
}
