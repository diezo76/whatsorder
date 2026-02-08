'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { MenuItemWithVariantsAndOptions, CartItem, OptionGroup, MenuItemOption } from '@/types/menu';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductModalProps {
  product: MenuItemWithVariantsAndOptions;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

// Prix des frites en supplément pour les variantes Solo
const FRITES_PRICE = 30;

// Prix complets des boissons (pour mode Solo)
const BOISSONS_PRIX_COMPLET: Record<string, number> = {
  'Vcola': 40,
  'Blueberry': 40,
  'Romane': 40,
  'Ananas pinacolada': 40,
  'Kebela': 50,
  'Jus Mangue enfant': 10,
  'Jus Orange enfant': 10,
};

// Liste des viandes pour la section "À composer"
const VIANDES_NAMES = [
  'Tenders',
  'Tenders spicy',
  'Cordon bleu',
  'Bacon',
  'Poulet indien',
  'Steak haché épicé',
  'Boeuf effiloché',
];

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const { t } = useLanguage();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.hasVariants && product.variants.length > 0 ? product.variants[0].id : null
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addFrites, setAddFrites] = useState(false);

  // Détecter si la variante sélectionnée est un "Menu"
  const isMenuVariant = useMemo(() => {
    if (!selectedVariant) return false;
    const variant = product.variants.find(v => v.id === selectedVariant);
    if (!variant) return false;
    const name = variant.name.toLowerCase();
    return name.includes('menu') || name.includes('+ menu');
  }, [selectedVariant, product.variants]);

  // Extraire le nombre de viandes autorisées de la variante (ex: "2 Viandes" → 2)
  const maxViandesFromVariant = useMemo(() => {
    if (!selectedVariant) return null;
    const variant = product.variants.find(v => v.id === selectedVariant);
    if (!variant) return null;
    const match = variant.name.match(/(\d+)\s*viande/i);
    return match ? parseInt(match[1], 10) : null;
  }, [selectedVariant, product.variants]);

  // Options sans groupe (ancien système)
  const standaloneOptions = useMemo(() => 
    product.options.filter(opt => !opt.optionGroupId),
    [product.options]
  );

  // Séparer les viandes des autres options standalone
  const viandeOptions = useMemo(() => 
    standaloneOptions.filter(opt => VIANDES_NAMES.includes(opt.name)),
    [standaloneOptions]
  );

  const otherStandaloneOptions = useMemo(() => 
    standaloneOptions.filter(opt => !VIANDES_NAMES.includes(opt.name)),
    [standaloneOptions]
  );

  // Compter les viandes sélectionnées
  const selectedViandesCount = useMemo(() => 
    viandeOptions.filter(opt => selectedOptions.includes(opt.id)).length,
    [viandeOptions, selectedOptions]
  );

  // Groupes d'options
  const optionGroups = useMemo(() => 
    product.optionGroups || [],
    [product.optionGroups]
  );

  // Séparer les groupes de sauces et de boissons
  const sauceGroup = useMemo(() => 
    optionGroups.find(g => g.name.toLowerCase().includes('sauce')),
    [optionGroups]
  );

  const boissonGroup = useMemo(() => 
    optionGroups.find(g => g.name.toLowerCase().includes('boisson')),
    [optionGroups]
  );

  // Réinitialiser les sélections quand le produit ou la variante change
  useEffect(() => {
    if (product.hasVariants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0].id);
    } else {
      setSelectedVariant(null);
    }
    setSelectedOptions([]);
    setQuantity(1);
    setAddFrites(false);
  }, [product.id]);

  // Réinitialiser les options de sauce quand on change de mode (Solo <-> Menu)
  useEffect(() => {
    // Si on passe en mode Solo et qu'on n'a pas de frites, on désélectionne les sauces
    if (!isMenuVariant && !addFrites && sauceGroup) {
      setSelectedOptions(prev => prev.filter(id => 
        !sauceGroup.options.some(opt => opt.id === id)
      ));
    }
  }, [isMenuVariant, addFrites, sauceGroup]);

  // Calculer le prix de base
  const getBasePrice = () => {
    if (product.hasVariants && selectedVariant) {
      const variant = product.variants.find(v => v.id === selectedVariant);
      return variant?.price || 0;
    }
    return product.price || 0;
  };

  // Obtenir les options sélectionnées dans un groupe
  const getSelectedInGroup = (group: OptionGroup): string[] => {
    return selectedOptions.filter(id => 
      group.options.some(opt => opt.id === id)
    );
  };

  // Vérifier si une option est dans le quota inclus (seulement en mode Menu ou avec frites pour sauces)
  const isOptionIncluded = (optionId: string, group: OptionGroup): boolean => {
    // En mode Solo sans frites, rien n'est inclus pour les sauces
    if (!isMenuVariant && group === sauceGroup && !addFrites) {
      return false;
    }
    // En mode Solo, les boissons ne sont jamais incluses
    if (!isMenuVariant && group === boissonGroup) {
      return false;
    }
    
    const selectedInGroup = getSelectedInGroup(group);
    const optionIndex = selectedInGroup.indexOf(optionId);
    // L'option est incluse si elle est dans les X premiers choix
    return optionIndex !== -1 && optionIndex < group.includedCount;
  };

  // Obtenir le prix effectif d'une option selon le mode
  const getEffectiveOptionPrice = (option: MenuItemOption, group: OptionGroup): number => {
    // En mode Solo, les boissons ont leur prix complet
    if (!isMenuVariant && group === boissonGroup) {
      return BOISSONS_PRIX_COMPLET[option.name] || option.priceModifier || 40;
    }
    // Sinon, utiliser le priceModifier normal
    return option.priceModifier;
  };

  // Calculer le prix des options d'un groupe
  const getGroupOptionsPrice = (group: OptionGroup): number => {
    const selectedInGroup = getSelectedInGroup(group);
    
    // Articles simples (sans variantes) avec sauce - traiter comme inclus
    if (!product.hasVariants && group === sauceGroup) {
      const includedCount = group.includedCount;
      const paidOptions = selectedInGroup.slice(includedCount);
      return paidOptions.reduce((sum, optId) => {
        const opt = group.options.find(o => o.id === optId);
        return sum + (opt?.priceModifier || 0);
      }, 0);
    }
    
    // En mode Solo (avec variantes), les boissons sont toutes payantes à leur prix complet
    if (!isMenuVariant && product.hasVariants && group === boissonGroup) {
      return selectedInGroup.reduce((sum, optId) => {
        const opt = group.options.find(o => o.id === optId);
        if (!opt) return sum;
        return sum + (BOISSONS_PRIX_COMPLET[opt.name] || opt.priceModifier || 40);
      }, 0);
    }
    
    // En mode Solo sans frites (avec variantes), les sauces ne sont pas disponibles
    if (!isMenuVariant && product.hasVariants && group === sauceGroup && !addFrites) {
      return 0;
    }
    
    // En mode Menu ou Solo+frites pour sauces : utiliser le quota inclus
    const includedCount = group.includedCount;
    let total = 0;
    
    // Ajouter le supplément des options incluses qui ont un priceModifier (ex: Kebela +10 EGP)
    const includedOptions = selectedInGroup.slice(0, includedCount);
    total += includedOptions.reduce((sum, optId) => {
      const opt = group.options.find(o => o.id === optId);
      return sum + (opt?.priceModifier || 0); // Kebela a priceModifier = 10
    }, 0);
    
    // Ajouter le prix complet des options au-delà du quota
    const paidOptions = selectedInGroup.slice(includedCount);
    total += paidOptions.reduce((sum, optId) => {
      const opt = group.options.find(o => o.id === optId);
      return sum + (opt?.priceModifier || 0);
    }, 0);
    
    return total;
  };

  // Calculer le prix total des options individuelles (ancien système)
  const getStandaloneOptionsPrice = (): number => {
    return standaloneOptions
      .filter(opt => selectedOptions.includes(opt.id))
      .reduce((sum, opt) => sum + opt.priceModifier, 0);
  };

  // Calculer le prix des frites
  const getFritesPrice = (): number => {
    return (!isMenuVariant && addFrites) ? FRITES_PRICE : 0;
  };

  // Calculer le prix total de toutes les options
  const getTotalOptionsPrice = (): number => {
    let total = getStandaloneOptionsPrice();
    total += getFritesPrice();
    for (const group of optionGroups) {
      total += getGroupOptionsPrice(group);
    }
    return total;
  };

  // Calculer le prix total
  const getTotalPrice = () => {
    const basePrice = getBasePrice();
    const optionsPrice = getTotalOptionsPrice();
    return (basePrice + optionsPrice) * quantity;
  };

  // Vérifier si les groupes requis ont le minimum de sélections
  const hasRequiredGroupSelections = (): boolean => {
    for (const group of optionGroups) {
      if (group.isRequired) {
        const selectedCount = getSelectedInGroup(group).length;
        if (selectedCount < group.minSelections) {
          return false;
        }
      }
    }
    // En mode Menu, sauce et boisson sont obligatoires (1 minimum chacun)
    if (isMenuVariant) {
      if (sauceGroup && getSelectedInGroup(sauceGroup).length < 1) return false;
      if (boissonGroup && getSelectedInGroup(boissonGroup).length < 1) return false;
    }
    return true;
  };

  // Vérifier si les options requises sont sélectionnées (ancien système)
  const requiredOptions = standaloneOptions.filter(opt => opt.isRequired);
  const hasAllRequiredStandalone = requiredOptions.every(opt => selectedOptions.includes(opt.id));
  const hasAllRequiredOptions = hasAllRequiredStandalone && hasRequiredGroupSelections();

  // Gérer la sélection d'option dans un groupe
  const handleGroupOptionToggle = (optionId: string, group: OptionGroup) => {
    const selectedInGroup = getSelectedInGroup(group);
    const isSelected = selectedInGroup.includes(optionId);

    if (isSelected) {
      // Désélectionner
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      // Vérifier si on peut encore sélectionner (max non atteint)
      if (group.maxSelections && selectedInGroup.length >= group.maxSelections) {
        return; // Max atteint
      }
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  // Gérer la sélection d'options individuelles (ancien système)
  const handleOptionToggle = (optionId: string) => {
    const option = standaloneOptions.find(o => o.id === optionId);
    if (!option) return;

    if (option.isMultiple) {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        if (option.maxSelections) {
          const currentCount = selectedOptions.filter(id => {
            const opt = standaloneOptions.find(o => o.id === id);
            return opt?.isMultiple;
          }).length;
          if (currentCount >= option.maxSelections) {
            return;
          }
        }
        setSelectedOptions([...selectedOptions, optionId]);
      }
    } else {
      const otherSingleOptions = standaloneOptions
        .filter(o => !o.isMultiple && o.id !== optionId)
        .map(o => o.id);
      
      setSelectedOptions([
        ...selectedOptions.filter(id => !otherSingleOptions.includes(id)),
        optionId,
      ]);
    }
  };

  const handleAddToCart = () => {
    if (!hasAllRequiredOptions) {
      alert(t.product.selectRequiredOptions);
      return;
    }

    const variant = product.hasVariants && selectedVariant
      ? product.variants.find(v => v.id === selectedVariant)
      : null;

    // Construire les données des options sélectionnées avec info sur inclusion
    const selectedOptionsData: CartItem['selectedOptions'] = [];

    // Ajouter les frites si sélectionnées (mode Solo)
    if (!isMenuVariant && addFrites) {
      selectedOptionsData.push({
        optionId: 'frites-supplement',
        optionName: 'Frites',
        priceModifier: FRITES_PRICE,
        isIncluded: false,
      });
    }

    // Options des groupes
    for (const group of optionGroups) {
      const selectedInGroup = getSelectedInGroup(group);
      selectedInGroup.forEach((optId, index) => {
        const opt = group.options.find(o => o.id === optId);
        if (opt) {
          let isIncluded = false;
          let priceModifier = opt.priceModifier;
          
          // Articles simples (sans variantes) avec sauce incluse
          if (!product.hasVariants && group === sauceGroup) {
            isIncluded = index < group.includedCount;
            priceModifier = isIncluded ? 0 : opt.priceModifier;
          }
          // En mode Solo (avec variantes), les boissons ne sont jamais incluses
          else if (!isMenuVariant && group === boissonGroup) {
            isIncluded = false;
            priceModifier = BOISSONS_PRIX_COMPLET[opt.name] || opt.priceModifier || 40;
          } 
          // En mode Solo+frites pour les sauces, 1 inclus
          else if (!isMenuVariant && group === sauceGroup && addFrites) {
            isIncluded = index < group.includedCount;
            priceModifier = isIncluded ? 0 : opt.priceModifier;
          }
          // En mode Menu
          else if (isMenuVariant) {
            isIncluded = index < group.includedCount;
            // Toujours garder le priceModifier même si inclus (ex: Kebela +10 EGP)
            priceModifier = opt.priceModifier;
          }
          
          selectedOptionsData.push({
            optionId: opt.id,
            optionName: opt.name,
            priceModifier,
            isIncluded,
            groupId: group.id,
            groupName: group.name,
          });
        }
      });
    }

    // Options individuelles
    for (const opt of standaloneOptions) {
      if (selectedOptions.includes(opt.id)) {
        selectedOptionsData.push({
          optionId: opt.id,
          optionName: opt.name,
          priceModifier: opt.priceModifier,
        });
      }
    }

    const cartItem: CartItem = {
      id: `${product.id}-${selectedVariant || 'default'}-${Date.now()}`,
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
  const optionsPrice = getTotalOptionsPrice();
  const totalPrice = getTotalPrice();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Rendu d'un groupe d'options
  const renderOptionGroup = (group: OptionGroup, mode: 'menu' | 'solo-frites' | 'solo-boisson') => {
    const selectedInGroup = getSelectedInGroup(group);
    const selectedCount = selectedInGroup.length;
    const isMaxReached = group.maxSelections ? selectedCount >= group.maxSelections : false;
    const needsMore = group.isRequired && selectedCount < group.minSelections;
    
    // Déterminer le nombre d'inclus selon le mode
    const effectiveIncludedCount = mode === 'solo-boisson' ? 0 : group.includedCount;

    return (
      <div key={group.id} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{group.name}</h3>
            <p className="text-sm text-gray-500">
              {mode === 'solo-boisson' 
                ? t.product.asExtra
                : t.product.includedCount.replace('{count}', String(effectiveIncludedCount))}
              {group.minSelections > 0 && ` - ${t.product.min}: ${group.minSelections}`}
              {group.maxSelections && ` - ${t.product.max}: ${group.maxSelections}`}
            </p>
          </div>
          {mode !== 'solo-boisson' && (
            <div className="text-sm">
              <span className={`font-medium ${needsMore ? 'text-red-600' : 'text-green-600'}`}>
                {selectedCount} / {effectiveIncludedCount} {t.product.included}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {group.options.map((option) => {
            const isSelected = selectedInGroup.includes(option.id);
            const isIncluded = isSelected && mode !== 'solo-boisson' && 
              selectedInGroup.indexOf(option.id) < effectiveIncludedCount;
            const wouldBeExtra = !isSelected && selectedCount >= effectiveIncludedCount;
            const isDisabled = !isSelected && isMaxReached;
            
            // Prix à afficher
            let displayPrice = '';
            if (mode === 'solo-boisson') {
              // En mode Solo, afficher le prix complet de la boisson
              const fullPrice = BOISSONS_PRIX_COMPLET[option.name] || option.priceModifier || 40;
              displayPrice = `+${fullPrice} EGP`;
            } else if (wouldBeExtra || (isSelected && !isIncluded)) {
              // Option au-delà du quota inclus
              if (option.priceModifier > 0) {
                displayPrice = `+${option.priceModifier} EGP`;
              } else {
                displayPrice = '+0 EGP';
              }
            } else {
              // Option incluse dans le quota
              if (option.priceModifier > 0) {
                // Cas spécial : boisson avec supplément même si incluse (ex: Kebela)
                displayPrice = `${t.product.included} +${option.priceModifier} EGP`;
              } else {
                displayPrice = t.product.included;
              }
            }
            
            return (
              <label
                key={option.id}
                className={`flex items-center justify-between p-3 border-2 rounded-lg transition-all ${
                  isDisabled
                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                    : isSelected
                      ? 'border-blue-600 bg-blue-50 cursor-pointer'
                      : wouldBeExtra || mode === 'solo-boisson'
                        ? 'border-orange-300 bg-orange-50 cursor-pointer hover:border-orange-400'
                        : 'border-gray-300 cursor-pointer hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => !isDisabled && handleGroupOptionToggle(option.id, group)}
                    disabled={isDisabled}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <span className="font-medium">{option.name}</span>
                    {isSelected && isIncluded && option.priceModifier === 0 && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {t.product.included}
                      </span>
                    )}
                    {isSelected && isIncluded && option.priceModifier > 0 && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {t.product.included} <span className="text-orange-600">+{option.priceModifier} EGP</span>
                      </span>
                    )}
                    {isSelected && !isIncluded && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        {t.product.supplement}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  mode === 'solo-boisson' || wouldBeExtra || (isSelected && !isIncluded)
                    ? 'text-orange-600' 
                    : 'text-green-600'
                }`}>
                  {displayPrice}
                </span>
              </label>
            );
          })}
        </div>

        {needsMore && (
          <p className="text-sm text-red-600">
            {t.product.pleaseChooseAtLeast.replace('{count}', String(group.minSelections))}
          </p>
        )}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label={t.product.close}
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
              <h3 className="font-semibold text-lg">{t.product.chooseFormula}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.variants.map((variant) => {
                  const isMenu = variant.name.toLowerCase().includes('menu');
                  return (
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
                      {isMenu && (
                        <p className="text-xs text-green-600 mt-1">{t.product.friesAndDrinkIncluded}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* === ARTICLES SIMPLES (sans variantes) avec sauce incluse === */}
          {!product.hasVariants && sauceGroup && sauceGroup.options.length > 0 && !boissonGroup && (
            renderOptionGroup(sauceGroup, 'menu')
          )}

          {/* === MODE SOLO (articles avec variantes) === */}
          {!isMenuVariant && product.hasVariants && (
            <>
              {/* Option Frites (Solo uniquement) */}
              {sauceGroup && sauceGroup.options.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{t.product.side}</h3>
                  <label
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      addFrites
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={addFrites}
                        onChange={(e) => setAddFrites(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <div>
                        <span className="font-medium">{t.product.addFries}</span>
                        <p className="text-sm text-gray-500">{t.product.friesWithSauce}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-orange-600">+{FRITES_PRICE} EGP</span>
                  </label>
                </div>
              )}

              {/* Sauces (Solo - uniquement si frites cochées) */}
              {addFrites && sauceGroup && sauceGroup.options.length > 0 && (
                renderOptionGroup(sauceGroup, 'solo-frites')
              )}

              {/* Boissons en supplément (Solo) */}
              {boissonGroup && boissonGroup.options.length > 0 && (
                renderOptionGroup(boissonGroup, 'solo-boisson')
              )}
            </>
          )}

          {/* === MODE MENU === */}
          {isMenuVariant && (
            <>
              {/* Sauces (Menu) */}
              {sauceGroup && sauceGroup.options.length > 0 && (
                renderOptionGroup(sauceGroup, 'menu')
              )}

              {/* Boissons (Menu) */}
              {boissonGroup && boissonGroup.options.length > 0 && (
                renderOptionGroup(boissonGroup, 'menu')
              )}
            </>
          )}

          {/* Autres groupes d'options (ni sauce ni boisson) */}
          {optionGroups
            .filter(g => g !== sauceGroup && g !== boissonGroup)
            .map((group) => renderOptionGroup(group, isMenuVariant ? 'menu' : 'solo-frites'))}

          {/* Choix de viandes (avec limitation selon la variante) */}
          {viandeOptions.length > 0 && maxViandesFromVariant && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{maxViandesFromVariant > 1 ? t.product.meatChoicePlural : t.product.meatChoice}</h3>
                <span className={`text-sm font-medium ${
                  selectedViandesCount === maxViandesFromVariant ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {selectedViandesCount > 1 
                    ? t.product.selectedCountPlural.replace('{count}', String(selectedViandesCount)).replace('{max}', String(maxViandesFromVariant))
                    : t.product.selectedCount.replace('{count}', String(selectedViandesCount)).replace('{max}', String(maxViandesFromVariant))}
                </span>
              </div>
              <div className="space-y-2">
                {viandeOptions.map((option) => {
                  const isSelected = selectedOptions.includes(option.id);
                  const isDisabled = !isSelected && selectedViandesCount >= maxViandesFromVariant;
                  
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between p-3 border-2 rounded-lg transition-all ${
                        isDisabled
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                          : isSelected
                            ? 'border-blue-600 bg-blue-50 cursor-pointer'
                            : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => !isDisabled && handleOptionToggle(option.id)}
                          disabled={isDisabled}
                          className="w-5 h-5 rounded"
                        />
                        <div>
                          <span className="font-medium">{option.name}</span>
                          {isSelected && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              {t.product.selected}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${
                        option.priceModifier > 0 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {option.priceModifier > 0 ? `+${option.priceModifier} EGP` : t.product.included}
                      </span>
                    </label>
                  );
                })}
              </div>
              {selectedViandesCount < maxViandesFromVariant && (
                <p className="text-sm text-orange-600">
                  {t.product.pleaseSelectMore.replace('{count}', String(maxViandesFromVariant - selectedViandesCount))}
                </p>
              )}
            </div>
          )}

          {/* Options individuelles (ancien système - hors viandes) */}
          {otherStandaloneOptions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{t.product.additionalOptions}</h3>
              <div className="space-y-2">
                {otherStandaloneOptions.map((option) => {
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
                            <span className="text-xs text-red-600 ml-2">({t.product.required})</span>
                          )}
                          {option.isMultiple && option.maxSelections && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({t.product.max} {option.maxSelections})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {option.priceModifier > 0 ? `+${option.priceModifier} EGP` : t.product.included}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{t.product.quantity}</h3>
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
              <span>{t.product.basePrice}:</span>
              <span className="font-medium">{basePrice} EGP</span>
            </div>
            {!isMenuVariant && addFrites && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>{t.product.fries}:</span>
                <span className="font-medium">+{FRITES_PRICE} EGP</span>
              </div>
            )}
            {optionsPrice - getFritesPrice() > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>{t.product.supplements}:</span>
                <span className="font-medium">+{optionsPrice - getFritesPrice()} EGP</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>{t.product.quantity}:</span>
              <span className="font-medium">x{quantity}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between">
              <span className="font-bold text-lg">{t.product.total}:</span>
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
              ? `${t.product.addToCart} - ${totalPrice} EGP`
              : t.product.selectRequiredOptions}
          </button>
        </div>
      </div>
    </div>
  );
}
