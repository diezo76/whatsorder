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
  priceModifier: number; // Prix supplément (appliqué au-delà du quota inclus)
  optionGroupId?: string; // Lien vers le groupe d'options (optionnel)
  isRequired: boolean;
  isMultiple: boolean;
  maxSelections?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Groupe d'options avec quota inclus (ex: "Choix de viandes" avec 3 incluses)
export interface OptionGroup {
  id: string;
  menuItemId: string;
  name: string;
  nameAr?: string;
  includedCount: number;  // Nombre de choix INCLUS gratuitement dans le prix
  minSelections: number;  // Minimum requis
  maxSelections?: number; // Maximum autorisé (null = illimité)
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  options: MenuItemOption[]; // Options dans ce groupe
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
  options: MenuItemOption[];      // Options individuelles (sans groupe)
  optionGroups: OptionGroup[];    // Groupes d'options avec quota inclus
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
    priceModifier: number; // Prix réel appliqué (0 si inclus, prix si supplément)
    isIncluded?: boolean;  // true si dans le quota inclus du groupe
    groupId?: string;      // ID du groupe d'options (si applicable)
    groupName?: string;    // Nom du groupe (pour l'affichage)
  }[];
  totalPrice: number; // basePrice + sum(options payantes) * quantity
  image?: string;
}
