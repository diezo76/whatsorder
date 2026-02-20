'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
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

// Sauces disponibles pour le Menu (sauce accompagnement frites)
const SAUCES_MENU = [
  'Algérienne',
  'Barbecue',
  'Ketchup',
  'Mayonnaise',
  'Dynamite',
  'Creamy tartare',
  'Sauce Burger',
];

// Plats du Menu Enfant
const KIDS_PLATS = ['Petit tacos', 'Smasheese', 'Nuggets'];

// Jus du Menu Enfant
const KIDS_JUS = ['Jus Mangue enfant', 'Jus Orange enfant'];

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const { t } = useLanguage();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.hasVariants && product.variants.length > 0 ? product.variants[0].id : null
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addFrites, setAddFrites] = useState(false);

  // Détecter si le produit est un Menu Enfant
  const isKidsMenu = useMemo(() => {
    const name = product.name.toLowerCase();
    return name.includes('menu enfant') || name.includes('kids') || name.includes('menu kid');
  }, [product.name]);

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
    (product.options ?? []).filter(opt => opt && !opt.optionGroupId),
    [product.options]
  );

  // Séparer les viandes des autres options standalone
  const viandeOptions = useMemo(() => 
    standaloneOptions.filter(opt => VIANDES_NAMES.includes(opt.name)),
    [standaloneOptions]
  );

  // Compter les viandes sélectionnées
  const selectedViandesCount = useMemo(() => 
    viandeOptions.filter(opt => selectedOptions.includes(opt.id)).length,
    [viandeOptions, selectedOptions]
  );

  // Groupes d'options depuis la BDD (fallback si undefined)
  const optionGroups = useMemo(() => 
    (product.optionGroups ?? []).filter(g => g && Array.isArray(g.options)),
    [product.optionGroups]
  );

  // Détecter le groupe "Formule Menu" (pattern ochicken : option group au lieu de variants)
  const formuleMenuGroup = useMemo(() => 
    optionGroups.find(g => {
      const name = (g.name || '').toLowerCase();
      return name.includes('formule menu');
    }),
    [optionGroups]
  );

  // Vérifier si l'option Formule Menu est cochée
  const isFormuleMenuSelected = useMemo(() => {
    if (!formuleMenuGroup) return false;
    return formuleMenuGroup.options.some(opt => selectedOptions.includes(opt.id));
  }, [formuleMenuGroup, selectedOptions]);

  // Séparer les groupes de sauces et de boissons depuis la BDD (détection élargie)
  const sauceGroupFromDB = useMemo(() => 
    optionGroups.find(g => {
      const name = (g.name || '').toLowerCase();
      return name.includes('sauce') || name.includes('sauces');
    }),
    [optionGroups]
  );

  const boissonGroupFromDB = useMemo(() => 
    optionGroups.find(g => {
      const name = (g.name || '').toLowerCase();
      return name.includes('boisson') || name.includes('boissons') || name.includes('drink') || name.includes('boisson au choix');
    }),
    [optionGroups]
  );

  // Groupe de viandes (pour tacos "À composer")
  const viandeGroup = useMemo(() => 
    optionGroups.find(g => {
      const name = (g.name || '').toLowerCase();
      return name.includes('viande');
    }),
    [optionGroups]
  );

  // Groupes synthétiques (fallback quand les groupes n'existent pas en BDD)
  const syntheticSauceGroup: OptionGroup | null = useMemo(() => {
    if (sauceGroupFromDB) return null;
    if (!product.hasVariants) return null;
    return {
      id: 'syn-sauce-group',
      menuItemId: product.id,
      name: 'Sauce au choix',
      includedCount: 1,
      minSelections: 0,
      maxSelections: 1,
      isRequired: false,
      isActive: true,
      sortOrder: 100,
      options: SAUCES_MENU.map((sauceName, i): MenuItemOption => ({
        id: `syn-sauce-${i}`,
        menuItemId: product.id,
        name: sauceName,
        type: 'ADDON',
        priceModifier: 0,
        optionGroupId: 'syn-sauce-group',
        isRequired: false,
        isMultiple: true,
        isActive: true,
        sortOrder: i,
      })),
    };
  }, [sauceGroupFromDB, product.hasVariants, product.id]);

  const syntheticBoissonGroup: OptionGroup | null = useMemo(() => {
    if (boissonGroupFromDB) return null;
    if (!product.hasVariants) return null;
    const drinks = Object.entries(BOISSONS_PRIX_COMPLET);
    return {
      id: 'syn-boisson-group',
      menuItemId: product.id,
      name: 'Boisson au choix',
      includedCount: 1,
      minSelections: 0,
      maxSelections: 1,
      isRequired: false,
      isActive: true,
      sortOrder: 101,
      options: drinks.map(([drinkName, fullPrice], i): MenuItemOption => ({
        id: `syn-boisson-${i}`,
        menuItemId: product.id,
        name: drinkName,
        type: 'ADDON',
        priceModifier: fullPrice > 40 ? fullPrice - 40 : 0,
        optionGroupId: 'syn-boisson-group',
        isRequired: false,
        isMultiple: true,
        isActive: true,
        sortOrder: i,
      })),
    };
  }, [boissonGroupFromDB, product.hasVariants, product.id]);

  // Le "Plat au choix" du Menu Enfant est géré par le vrai groupe DB "Choix principal"
  const kidsPlatsGroup: OptionGroup | null = null;

  const kidsSauceGroup: OptionGroup | null = useMemo(() => {
    if (!isKidsMenu) return null;
    return {
      id: 'syn-kids-sauce-group',
      menuItemId: product.id,
      name: 'Sauce au choix',
      includedCount: 1,
      minSelections: 0,
      maxSelections: 1,
      isRequired: false,
      isActive: true,
      sortOrder: 51,
      options: SAUCES_MENU.map((sauceName, i): MenuItemOption => ({
        id: `syn-kids-sauce-${i}`,
        menuItemId: product.id,
        name: sauceName,
        type: 'ADDON',
        priceModifier: 0,
        optionGroupId: 'syn-kids-sauce-group',
        isRequired: false,
        isMultiple: false,
        isActive: true,
        sortOrder: i,
      })),
    };
  }, [isKidsMenu, product.id]);

  const kidsJusGroup: OptionGroup | null = useMemo(() => {
    if (!isKidsMenu) return null;
    return {
      id: 'syn-kids-jus-group',
      menuItemId: product.id,
      name: 'Jus au choix',
      includedCount: 1,
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      isActive: true,
      sortOrder: 52,
      options: KIDS_JUS.map((jusName, i): MenuItemOption => ({
        id: `syn-kids-jus-${i}`,
        menuItemId: product.id,
        name: jusName,
        type: 'ADDON',
        priceModifier: 0,
        optionGroupId: 'syn-kids-jus-group',
        isRequired: false,
        isMultiple: false,
        isActive: true,
        sortOrder: i,
      })),
    };
  }, [isKidsMenu, product.id]);

  // Groupes finaux : BDD si disponible, sinon synthétique
  const sauceGroup = useMemo(() => sauceGroupFromDB ?? syntheticSauceGroup, [sauceGroupFromDB, syntheticSauceGroup]);
  const boissonGroup = useMemo(() => boissonGroupFromDB ?? syntheticBoissonGroup, [boissonGroupFromDB, syntheticBoissonGroup]);

  // Autres options standalone (exclure viandes + sauces couvertes par le groupe synthétique)
  const otherStandaloneOptions = useMemo(() => {
    const sauceNamesLower = syntheticSauceGroup ? SAUCES_MENU.map(s => s.toLowerCase()) : [];
    return standaloneOptions.filter(opt =>
      !VIANDES_NAMES.includes(opt.name) &&
      !sauceNamesLower.includes(opt.name.toLowerCase())
    );
  }, [standaloneOptions, syntheticSauceGroup]);

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
    if (!isMenuVariant && !addFrites && sauceGroup?.options) {
      setSelectedOptions(prev => prev.filter(id => 
        !sauceGroup.options.some(opt => opt.id === id)
      ));
    }
  }, [isMenuVariant, addFrites, sauceGroup]);

  // Vider la sélection de boisson quand on décoche Formule Menu
  useEffect(() => {
    if (!isFormuleMenuSelected && boissonGroupFromDB?.options) {
      setSelectedOptions(prev => prev.filter(id =>
        !boissonGroupFromDB.options.some(opt => opt.id === id)
      ));
    }
  }, [isFormuleMenuSelected, boissonGroupFromDB]);

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
    // Groupes DB + synthétiques + kids
    const allGroups: OptionGroup[] = [
      ...optionGroups,
      ...(syntheticSauceGroup ? [syntheticSauceGroup] : []),
      ...(syntheticBoissonGroup ? [syntheticBoissonGroup] : []),
      ...(kidsPlatsGroup ? [kidsPlatsGroup] : []),
      ...(kidsSauceGroup ? [kidsSauceGroup] : []),
      ...(kidsJusGroup ? [kidsJusGroup] : []),
    ];
    for (const group of allGroups) {
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
    // Si Formule Menu est cochée, la boisson est obligatoire
    if (isFormuleMenuSelected && boissonGroup) {
      if (getSelectedInGroup(boissonGroup).length < 1) return false;
    }
    return true;
  };

  // Vérifier si les options requises sont sélectionnées (ancien système)
  // Exclure les options couvertes par les groupes synthétiques (viandes, sauces) car elles sont validées séparément
  const sauceNamesLowerForValidation = syntheticSauceGroup ? SAUCES_MENU.map(s => s.toLowerCase()) : [];
  const requiredOptions = standaloneOptions.filter(opt => {
    if (!opt.isRequired) return false;
    // Exclure les viandes (gérées par le sélecteur de viandes)
    if (VIANDES_NAMES.includes(opt.name)) return false;
    // Exclure les sauces couvertes par le groupe synthétique
    if (sauceNamesLowerForValidation.includes(opt.name.toLowerCase())) return false;
    return true;
  });
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

    // Options des groupes (DB + synthétiques + kids)
    const allCartGroups: OptionGroup[] = [
      ...optionGroups,
      ...(syntheticSauceGroup ? [syntheticSauceGroup] : []),
      ...(syntheticBoissonGroup ? [syntheticBoissonGroup] : []),
      ...(kidsPlatsGroup ? [kidsPlatsGroup] : []),
      ...(kidsSauceGroup ? [kidsSauceGroup] : []),
      ...(kidsJusGroup ? [kidsJusGroup] : []),
    ];
    for (const group of allCartGroups) {
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
            <div className="relative w-full aspect-square rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
                priority
              />
            </div>
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

          {/* === MENU ENFANT === */}
          {isKidsMenu && (
            <>
              {/* Plat au choix */}
              {kidsPlatsGroup && renderOptionGroup(kidsPlatsGroup, 'menu')}

              {/* Sauce au choix */}
              {kidsSauceGroup && renderOptionGroup(kidsSauceGroup, 'menu')}

              {/* Jus au choix */}
              {kidsJusGroup && renderOptionGroup(kidsJusGroup, 'menu')}
            </>
          )}

          {/* === ARTICLES SIMPLES (sans variantes) avec sauce incluse === */}
          {!product.hasVariants && !isKidsMenu && sauceGroup && (sauceGroup.options?.length ?? 0) > 0 && (
            renderOptionGroup(sauceGroup, 'menu')
          )}

          {/* === BOISSON pour articles sans variantes === */}
          {/* Si Formule Menu existe : afficher seulement quand cochée */}
          {/* Sinon (ex: L'Assiette) : toujours afficher */}
          {!product.hasVariants && !isKidsMenu && boissonGroup && (boissonGroup.options?.length ?? 0) > 0 && (
            formuleMenuGroup
              ? (isFormuleMenuSelected && renderOptionGroup(boissonGroup, 'menu'))
              : renderOptionGroup(boissonGroup, 'menu')
          )}

          {/* === MODE SOLO (articles avec variantes) === */}
          {!isMenuVariant && product.hasVariants && (
            <>
              {/* Option Frites (Solo uniquement) */}
              {sauceGroup && (sauceGroup.options?.length ?? 0) > 0 && (
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

              {/* Sauces (Solo) - Pour les composés (avec viandes) : toujours incluse. Pour burgers/bowls : uniquement si frites cochées */}
              {sauceGroup && (sauceGroup.options?.length ?? 0) > 0 && (
                (viandeGroup || viandeOptions.length > 0)
                  ? renderOptionGroup(sauceGroup, 'menu')
                  : addFrites && renderOptionGroup(sauceGroup, 'solo-frites')
              )}

              {/* Boissons en supplément (Solo) */}
              {boissonGroup && (boissonGroup.options?.length ?? 0) > 0 && (
                renderOptionGroup(boissonGroup, 'solo-boisson')
              )}
            </>
          )}

          {/* === MODE MENU === */}
          {isMenuVariant && (
            <>
              {/* Choix de viandes via optionGroup (tacos "À composer") - affiché en premier */}
              {viandeGroup && (viandeGroup.options?.length ?? 0) > 0 && (
                renderOptionGroup(viandeGroup, 'menu')
              )}

              {/* Choix de viandes standalone (ancien système) - affiché en premier */}
              {!viandeGroup && viandeOptions.length > 0 && maxViandesFromVariant && (
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

              {/* Sauces (Menu) - affiché avant les boissons */}
              {sauceGroup && (sauceGroup.options?.length ?? 0) > 0 && (
                renderOptionGroup(sauceGroup, 'menu')
              )}

              {/* Boissons (Menu) - affiché après les sauces */}
              {boissonGroup && (boissonGroup.options?.length ?? 0) > 0 && (
                renderOptionGroup(boissonGroup, 'menu')
              )}
            </>
          )}

          {/* === MODE SOLO : viandes, autres groupes === */}
          {!isMenuVariant && (
            <>
              {/* Choix de viandes via optionGroup (tacos "À composer") */}
              {viandeGroup && (viandeGroup.options?.length ?? 0) > 0 && (
                renderOptionGroup(viandeGroup, 'solo-frites')
              )}

              {/* Choix de viandes standalone (ancien système) */}
              {!viandeGroup && viandeOptions.length > 0 && maxViandesFromVariant && (
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
            </>
          )}

          {/* Autres groupes d'options (ni sauce, ni boisson, ni viande) */}
          {optionGroups
            .filter(g => g !== sauceGroup && g !== boissonGroup && g !== viandeGroup)
            .map((group) => renderOptionGroup(group, isMenuVariant ? 'menu' : 'solo-frites'))}

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
