# Compte Rendu - Sélecteur d'heure limité aux heures d'ouverture

**Date** : 14 février 2026

## Objectif

Empêcher le client de sélectionner une heure en dehors des heures d'ouverture du restaurant lors du checkout (modes PICKUP et DINE_IN).

## Fichiers modifiés

### 1. `apps/web/types/restaurant.ts`
- Ajout de `openingHours` au type `RestaurantCart` pour que les données d'heures d'ouverture soient disponibles dans le flux checkout.

### 2. `apps/web/app/[slug]/page.tsx`
- Transmission de `restaurant.openingHours` dans l'objet restaurant passé au composant `CartDrawer`.

### 3. `apps/web/components/checkout/CheckoutModal.tsx`
- Transmission de `restaurant.openingHours` en tant que prop `openingHours` au composant `CheckoutStepDelivery`.

### 4. `apps/web/components/checkout/CheckoutStepDelivery.tsx` (changement principal)
- **Nouvelle prop** : `openingHours` (optionnelle, type `OpeningHoursMap | null`)
- **Nouveau `useMemo` `todaySchedule`** : Détecte les heures d'ouverture du jour actuel (supporte les clés en anglais ET en français)
- **Nouveau `useMemo` `timeBounds`** : Calcule les bornes min/max du time picker :
  - `min` = max(maintenant + 30 min, heure d'ouverture)
  - `max` = heure de fermeture
- **Gestion du cas "fermé aujourd'hui"** : 
  - Message d'alerte rouge
  - Bouton "Planifier" désactivé (grisé, non cliquable)
- **Validation automatique** : Si l'utilisateur entre une heure hors bornes, elle est corrigée au min ou max
- **Message informatif** : Affiche "Heures d'ouverture aujourd'hui : HH:MM - HH:MM" sous le time picker

## Flux de données

```
[slug]/page.tsx (restaurant.openingHours)
  → CartDrawer (restaurant prop avec openingHours)
    → CheckoutModal (restaurant prop)
      → CheckoutStepDelivery (prop openingHours)
        → <input type="time" min={...} max={...} />
```

## Comportement

1. **Restaurant avec heures configurées et ouvert** : Le time picker est borné entre max(now+30min, ouverture) et fermeture
2. **Restaurant avec heures configurées mais fermé aujourd'hui** : Message rouge + option "Planifier" désactivée
3. **Restaurant sans heures configurées** : Comportement inchangé (min = now+30min, max = 23:59)

## Pour un agent suivant

- Le sélecteur d'heure n'est affiché que pour PICKUP et DINE_IN (pas DELIVERY)
- La logique supporte les clés de jours en anglais et en français (ex: `monday` ou `lundi`)
- Les erreurs TypeScript pré-existantes sur `isApproved` ne sont pas liées à cette modification
