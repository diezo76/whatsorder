# Compte Rendu - Heure obligatoire hors des horaires d'ouverture

**Date** : 14 fevrier 2026

## Probleme

Le client pouvait passer commande meme quand le restaurant etait ferme (hors horaires), sans selectionner d'heure. Le selecteur d'heure n'apparaissait que pour PICKUP/DINE_IN, pas pour DELIVERY.

## Modifications effectuees

### Fichiers modifies

1. **`apps/web/components/checkout/CheckoutStepDelivery.tsx`**
2. **`apps/web/components/checkout/CheckoutModal.tsx`**

### Changements detailles

#### CheckoutStepDelivery.tsx

1. **Nouvelle fonction `isCurrentlyOpenCheck()`** (exportee) : verifie si le restaurant est actuellement ouvert en comparant l'heure actuelle avec les horaires du jour. Supporte les cles en francais et anglais, et les horaires apres minuit.

2. **`isCurrentlyOpen` (useMemo)** : calcule en temps reel si le restaurant est ouvert.

3. **`useEffect` auto-planifier** : quand le restaurant est ferme, force automatiquement `useScheduledTime = true`.

4. **Time picker pour TOUS les types** : le selecteur d'heure s'affiche maintenant pour DELIVERY, PICKUP et DINE_IN (plus seulement PICKUP/DINE_IN).

5. **Suppression de la remise a zero** : quand on passe en mode DELIVERY, le `scheduledTime` n'est plus efface.

6. **Comportement conditionnel** :
   - **Restaurant ouvert** : toggle ASAP / Planifier (comme avant)
   - **Restaurant ferme (hors horaires)** : message orange, pas de bouton ASAP, time picker obligatoire
   - **Restaurant ferme (jour de fermeture)** : message rouge, pas de time picker

7. **Validation mise a jour** : `validateDeliveryInfo` accepte maintenant `openingHours` en 2e parametre et exige `scheduledTime` si le restaurant est ferme.

#### CheckoutModal.tsx

- Les 2 appels a `validateDeliveryInfo` (isStepValid et nextStep) passent maintenant `restaurant.openingHours`.

## Comportement final

| Situation | ASAP disponible | Heure obligatoire |
|-----------|----------------|-------------------|
| Restaurant ouvert | Oui | Non |
| Restaurant ferme (hors horaires) | Non | Oui |
| Jour de fermeture | Non | Impossible |

## Pour un agent suivant

- La fonction `isCurrentlyOpenCheck` est exportee et peut etre reutilisee
- La validation `validateDeliveryInfo` a maintenant 2 parametres : `(data, openingHours?)`
- Le time picker s'affiche pour les 3 types de livraison
- Les bornes min/max du time picker sont calculees dans `timeBounds`
