'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MenuItemWithVariantsAndOptions, CartItem } from '@/types/menu';

interface ProductModalProps {
  product: MenuItemWithVariantsAndOptions;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.hasVariants && product.variants.length > 0 ? product.variants[0].id : null
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Réinitialiser les sélections quand le produit change
  useEffect(() => {
    if (product.hasVariants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0].id);
    } else {
      setSelectedVariant(null);
    }
    setSelectedOptions([]);
    setQuantity(1);
  }, [product.id]);

  // Calculer le prix de base
  const getBasePrice = () => {
    if (product.hasVariants && selectedVariant) {
      const variant = product.variants.find(v => v.id === selectedVariant);
      return variant?.price || 0;
    }
    return product.price || 0;
  };

  // Calculer le prix total des options sélectionnées
  const getOptionsPrice = () => {
    return product.options
      .filter(opt => selectedOptions.includes(opt.id))
      .reduce((sum, opt) => sum + opt.priceModifier, 0);
  };

  // Calculer le prix total
  const getTotalPrice = () => {
    const basePrice = getBasePrice();
    const optionsPrice = getOptionsPrice();
    return (basePrice + optionsPrice) * quantity;
  };

  // Vérifier si les options requises sont sélectionnées
  const requiredOptions = product.options.filter(opt => opt.isRequired);
  const hasAllRequiredOptions = requiredOptions.every(opt => selectedOptions.includes(opt.id));

  // Gérer la sélection d'options
  const handleOptionToggle = (optionId: string) => {
    const option = product.options.find(o => o.id === optionId);
    if (!option) return;

    if (option.isMultiple) {
      // Option multiple : toggle
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        // Vérifier le maxSelections
        if (option.maxSelections) {
          const currentCount = selectedOptions.filter(id => {
            const opt = product.options.find(o => o.id === id);
            return opt?.isMultiple;
          }).length;
          if (currentCount >= option.maxSelections) {
            return; // Ne pas ajouter si max atteint
          }
        }
        setSelectedOptions([...selectedOptions, optionId]);
      }
    } else {
      // Option unique : remplacer les autres options non-multiples
      const otherSingleOptions = product.options
        .filter(o => !o.isMultiple && o.id !== optionId)
        .map(o => o.id);
      
      setSelectedOptions([
        ...selectedOptions.filter(id => !otherSingleOptions.includes(id)),
        optionId,
      ]);
    }
  };

  const handleAddToCart = () => {
    // Vérifier que toutes les options requises sont sélectionnées
    if (!hasAllRequiredOptions) {
      alert('Veuillez sélectionner toutes les options requises');
      return;
    }

    const variant = product.hasVariants && selectedVariant
      ? product.variants.find(v => v.id === selectedVariant)
      : null;

    const selectedOptionsData = product.options
      .filter(opt => selectedOptions.includes(opt.id))
      .map(opt => ({
        optionId: opt.id,
        optionName: opt.name,
        priceModifier: opt.priceModifier,
      }));

    const cartItem: CartItem = {
      id: `${product.id}-${selectedVariant || 'default'}-${Date.now()}`, // ID unique
      menuItemId: product.id,
      menuItemName: product.name,
      variantId: selectedVariant || undefined,
      variantName: variant?.name,
      quantity,
      basePrice: getBasePrice(),
      selectedOptions: selectedOptionsData,
      totalPrice: getTotalPrice(),
      image: product.image,
    };

    onAddToCart(cartItem);
    onClose();
  };

  const basePrice = getBasePrice();
  const optionsPrice = getOptionsPrice();
  const totalPrice = getTotalPrice();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}

          {/* Description */}
          {product.description && (
            <p className="text-gray-600">{product.description}</p>
          )}

          {/* Variants */}
          {product.hasVariants && product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Choisissez la taille</h3>
              <div className="grid grid-cols-3 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      selectedVariant === variant.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <p className="font-medium">{variant.name}</p>
                    <p className="text-sm text-gray-600">{variant.price} EGP</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          {product.options.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Options</h3>
              <div className="space-y-2">
                {product.options.map((option) => {
                  const isSelected = selectedOptions.includes(option.id);
                  const isRequired = option.isRequired;
                  
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${isRequired ? 'ring-2 ring-red-200' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type={option.isMultiple ? 'checkbox' : 'radio'}
                          checked={isSelected}
                          onChange={() => handleOptionToggle(option.id)}
                          className="w-4 h-4"
                        />
                        <div>
                          <span className="font-medium">{option.name}</span>
                          {isRequired && (
                            <span className="text-xs text-red-600 ml-2">(Requis)</span>
                          )}
                          {option.isMultiple && option.maxSelections && (
                            <span className="text-xs text-gray-500 ml-2">
                              (Max {option.maxSelections})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {option.priceModifier > 0 ? `+${option.priceModifier} EGP` : 'Gratuit'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Quantité</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-bold"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Prix récapitulatif */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Prix de base:</span>
              <span className="font-medium">{basePrice} EGP</span>
            </div>
            {optionsPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span>Options:</span>
                <span className="font-medium">+{optionsPrice} EGP</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Quantité:</span>
              <span className="font-medium">×{quantity}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-lg text-blue-600">{totalPrice} EGP</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4">
          <button
            onClick={handleAddToCart}
            disabled={!hasAllRequiredOptions}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              hasAllRequiredOptions
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {hasAllRequiredOptions
              ? `Ajouter au panier - ${totalPrice} EGP`
              : 'Veuillez sélectionner toutes les options requises'}
          </button>
        </div>
      </div>
    </div>
  );
}
