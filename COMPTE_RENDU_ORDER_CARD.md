# Compte Rendu - Composant OrderCard

**Date** : 2024-01-11  
**Tâche** : Création du composant OrderCard pour afficher les commandes dans le Kanban

## ✅ Fichiers créés/modifiés

### 1. `apps/web/components/orders/OrderCard.tsx`
Composant complet pour afficher une carte de commande avec toutes les informations.

### 2. `apps/web/components/orders/KanbanColumn.tsx`
Mise à jour pour utiliser le composant `OrderCard` au lieu du placeholder.

## 🏗️ Structure du composant

### Props
```typescript
interface OrderCardProps {
  order: Order;      // Commande complète avec toutes les relations
  onClick: () => void;  // Callback au clic sur la card
}
```

### Structure interne
1. **Header** : Numéro de commande + timing + badge type livraison
2. **Section Client** : Nom + téléphone avec icônes
3. **Section Items** : Nombre d'items + preview (max 2) + "+X autres"
4. **Footer** : Total + avatar du staff assigné

## 🎨 Fonctionnalités implémentées

### 1. Header
- **Numéro de commande** : Affiché en gras
- **Timing** : Format relatif intelligent avec `formatTime()`
  - "À l'instant" si < 1 min
  - "Il y a X min" si < 60 min
  - "Il y a Xh" si < 24h
  - Date complète sinon
- **Badge type livraison** : Composant `DeliveryTypeBadge` avec icône et couleur

### 2. Composant DeliveryTypeBadge
**Types supportés** :
- `DELIVERY` : Icône Truck, bleu (Livraison)
- `PICKUP` : Icône ShoppingBag, vert (À emporter)
- `DINE_IN` : Icône UtensilsCrossed, violet (Sur place)

**Fonctionnalités** :
- Icône + label
- Label masqué sur mobile (`hidden sm:inline`)
- Couleurs coordonnées par type

### 3. Section Client
- **Icône User** + nom du client
- **Icône Phone** + numéro de téléphone
- Fallback sur "Client" si nom manquant

### 4. Section Items
- **Compteur** : "X item(s)" avec icône ShoppingBag
- **Preview** : Affiche les 2 premiers items avec quantité
- **"+X autres"** : Si plus de 2 items, affiche le nombre restant
- **Séparateur** : Border-bottom pour séparer du footer

### 5. Footer
- **Total** : Montant en EGP avec label "Total"
- **Staff assigné** : Avatar avec initiales (orange)
  - Tooltip avec nom complet
  - Initiales générées avec `getInitials()`

### 6. Fonction formatTime()
**Logique** :
- Calcule la différence en minutes
- Retourne un format relatif si récent
- Retourne une date formatée si ancien
- Format français avec jour, mois abrégé, heure

### 7. Fonction getInitials()
**Logique** :
- Split le nom par espaces
- Prend la première lettre de chaque mot
- Met en majuscules
- Limite à 2 caractères
- Fallback sur "?" si nom vide

### 8. Urgence visuelle
**Condition** :
- Status = PENDING
- Créée il y a plus de 30 minutes

**Effet** :
- Border rouge (`border-red-300`) au lieu de gris
- Permet d'identifier rapidement les commandes urgentes

## 🎯 Styles et UX

### États visuels
- **Default** : `border-gray-200`
- **Hover** : `border-orange-300 shadow-md`
- **Urgent** : `border-red-300` (si PENDING > 30 min)

### Transitions
- `transition-all` pour les changements d'état
- Hover smooth sur border et shadow

### Responsive
- Badge livraison : Label masqué sur mobile
- Layout adaptatif avec flex
- Espacement cohérent

### Icônes utilisées
- `User` : Pour le nom du client
- `Phone` : Pour le téléphone
- `ShoppingBag` : Pour les items
- `Truck` : Pour DELIVERY
- `UtensilsCrossed` : Pour DINE_IN

## 📝 Types TypeScript

Tous les types sont définis dans le composant :
- `Order` : Commande complète
- `OrderItem` : Item de commande
- `OrderCardProps` : Props du composant

## ✅ Intégration dans KanbanColumn

Le composant `KanbanColumn` utilise maintenant :
```tsx
import OrderCard from './OrderCard';

// Dans le map
{orders.map(order => (
  <OrderCard
    key={order.id}
    order={order}
    onClick={() => onOrderClick(order)}
  />
))}
```

**Avantages** :
- Code plus propre et réutilisable
- Séparation des responsabilités
- Facilite la maintenance

## 🚀 Améliorations possibles

1. **Images des items** :
   - Afficher les miniatures des items dans le preview
   - Carousel si plusieurs items

2. **Animations** :
   - Animation lors de l'apparition
   - Animation lors du hover
   - Transition lors du changement de statut

3. **Tooltips** :
   - Tooltip sur le total avec détails (sous-total, taxes, etc.)
   - Tooltip sur les items avec description complète

4. **Actions rapides** :
   - Boutons d'action dans le footer (assigner, annuler)
   - Menu contextuel au clic droit

5. **Badges supplémentaires** :
   - Badge de paiement (payé/non payé)
   - Badge de priorité
   - Badge de source (WhatsApp, Web, etc.)

## ✅ Vérifications

- ✅ Compilation TypeScript réussie
- ✅ Aucune erreur de linter
- ✅ Types correctement définis
- ✅ Styles cohérents avec le design system
- ✅ Responsive et accessible
- ✅ Intégration réussie dans KanbanColumn
- ✅ Fonctions helper testées

## 📋 Notes importantes

- Le composant est un Client Component (`'use client'`)
- Les icônes sont importées depuis `lucide-react`
- Le format de monnaie est EGP (à adapter selon le besoin)
- L'urgence est calculée côté client (pourrait être côté serveur)
- Les initiales sont générées à partir du nom complet
- Le preview des items est limité à 2 pour éviter l'encombrement
