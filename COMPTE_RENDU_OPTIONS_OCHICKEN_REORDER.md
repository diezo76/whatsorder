# Compte Rendu - Modifications options O'Chicken + Drag-and-Drop Reorder

## Date : 16 février 2026

## Partie A : Modifications des données SQL

### A1. Sandwiches (9 articles) - Formule Menu en premier
- Converti l'option standalone "Formule Menu (+40 EGP)" en option group avec sortOrder 1
- Réordonné les groupes pour les 9 sandwiches (Chicken Rouge, Jaune, Mix, Fines Herbes, Emmental, Classique, Signature, Cheezy, Mixte Royal) :
  1. Formule Menu (Frites + Boisson) +40 EGP
  2. Type de pain (Pain / Tortilla)
  3. Sauces (7 sauces, 1 incluse, +10 EGP/supp)
  4. Suppléments (Viande +60, Cheddar +20, + Oeuf +15 pour Le Classique)
  5. Retirer des ingrédients (Sans Salade, Sans Tomates, Sans Oignons)

### A2. Le Classique - AUCUN CHANGEMENT
- Tout gardé tel quel : Formule Menu + Pain + Sauces + Suppléments (Viande, Cheddar, Oeuf) + Retirer + Simple/Double

### A3. L'Assiette Kebab - Boisson incluse
- Ajouté option group "Boisson incluse" (sortOrder 2, required, 1 incluse)
- 6 options de boisson : Canette, Eau petite, Eau grande, Jus de fruits, Boisson grande, Bebela
- Ordre final : Sauce au choix (1), Boisson incluse (2), Retirer (3)

### A4. Menu Jeûneur - Sauce incluse
- Ajouté option group "Sauce incluse" (sortOrder 2, required, 1 incluse gratuite)
- 7 sauces : Harissa, Algérienne, Ketchup, Mayonnaise, Biggy Burger, Sauce Blanche, BBQ
- Mise à jour description : "Offre spéciale Lundi et Jeudi : Chicken Rouge ou Jaune, Frites, Sauce incluse, Bouteille d'eau incluse"
- Ordre : Choix du sandwich (1), Sauce incluse (2), Retirer (3)

### A5. Menu Enfant - Sauce incluse
- Ajouté option group "Sauce incluse" (même configuration)
- Mise à jour description : "1 Crok ou 1 Boîte de 4 Nuggets, Frites incluses, Sauce incluse, Jus de fruits inclus"
- Ordre : Choix principal (1), Sauce incluse (2), Retirer (3)

### A6. Petites Faims - Sauce incluse
- Ajouté "Sauce incluse" pour : Frites, 4 Nuggets, 6 Nuggets
- 7 sauces dans chaque groupe (1 incluse gratuite, required)

## Partie B : Fonctionnalité Drag-and-Drop

### B1. Nouvelles API routes créées
- `PUT /api/menu/items/[id]/option-groups/reorder` - Réorganiser les groupes d'options
- `PUT /api/menu/items/[id]/options/reorder` - Réorganiser les options (dans un groupe ou standalone)
- `PUT /api/menu/items/[id]/variants/reorder` - Réorganiser les variants

### B2. Composants modifiés avec drag-and-drop (@dnd-kit)
- `OptionGroupManager.tsx` : Drag-and-drop pour réordonner les groupes d'options ET les options dans chaque groupe
- `VariantManager.tsx` : Drag-and-drop pour réordonner les variants
- `OptionManager.tsx` : Drag-and-drop pour réordonner les options standalone

### B3. UX
- Icône de poignée (GripVertical) sur chaque élément réordonnançable
- Texte d'aide "Glissez-déposez pour réorganiser l'ordre"
- Sauvegarde automatique au drop via les API
- Feedback visuel pendant le drag (opacité réduite)

## Fichiers créés
- `apps/web/app/api/menu/items/[id]/option-groups/reorder/route.ts`
- `apps/web/app/api/menu/items/[id]/options/reorder/route.ts`
- `apps/web/app/api/menu/items/[id]/variants/reorder/route.ts`

## Fichiers modifiés
- `apps/web/components/menu/OptionGroupManager.tsx`
- `apps/web/components/menu/VariantManager.tsx`
- `apps/web/components/menu/OptionManager.tsx`

## Déploiement
- Déployé sur Vercel en production
- URL : https://whatsorder-3z63eicns-diiezos-projects.vercel.app
