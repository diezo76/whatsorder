# Compte Rendu - Intégration Realtime dans la Page Orders (Kanban)

**Date** : Intégration du hook Realtime dans la page Orders  
**Objectif** : Synchroniser les commandes en temps réel via Supabase Realtime dans le Kanban

## ✅ ÉTAPE 7 : Modification de la Page Orders

**Fichier modifié** : `apps/web/app/dashboard/orders/page.tsx`

### Modifications effectuées

#### 1. Installation de `sonner`
- Package installé : `sonner@2.0.7`
- Ajout du `Toaster` dans `apps/web/app/layout.tsx` pour afficher les notifications

#### 2. Imports ajoutés
```typescript
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { toast as sonnerToast } from 'sonner';
```

#### 3. Hook Realtime intégré
```typescript
const { isConnected } = useRealtimeOrders({
  restaurantId: user?.restaurantId || '',
  onNewOrder: (order) => {
    console.log('🆕 New order received:', order);
    sonnerToast.success(`Nouvelle commande : ${order.orderNumber}`);
    
    // Recharger les commandes
    loadOrders();
  },
  onOrderUpdate: (order) => {
    console.log('✏️ Order updated:', order);
    
    // Mettre à jour la commande dans la liste
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, ...order } : o))
    );
  },
});
```

**Fonctionnalités** :
- ✅ Écoute les nouvelles commandes (`INSERT`) en temps réel
- ✅ Écoute les mises à jour de commandes (`UPDATE`) en temps réel
- ✅ Affiche une notification toast lors d'une nouvelle commande
- ✅ Met à jour automatiquement la liste des commandes
- ✅ Recharge les commandes complètes lors d'une nouvelle commande

#### 4. Indicateur de connexion ajouté

**Dans le header** (lignes 478-488) :
```tsx
<div className="flex items-center gap-2 text-xs">
  <div
    className={`w-2 h-2 rounded-full ${
      socketConnected || isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
    }`}
  />
  <span className="text-gray-600">
    {socketConnected || isConnected ? 'Temps réel actif' : 'Déconnecté'}
  </span>
</div>
```

**Avant le Kanban** (lignes 549-555) :
```tsx
<div className="mb-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg border">
  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
  <span className="text-sm text-gray-600">
    {isConnected ? 'Temps réel actif' : 'Déconnecté'}
  </span>
</div>
```

**Caractéristiques** :
- ✅ Point vert qui pulse quand connecté (`animate-pulse`)
- ✅ Point rouge quand déconnecté
- ✅ Texte indiquant l'état de la connexion
- ✅ Deux indicateurs : un dans le header et un avant le Kanban

---

## 📋 Configuration du Toaster

**Fichier modifié** : `apps/web/app/layout.tsx`

```tsx
import { Toaster } from 'sonner'

// Dans le return :
<Toaster position="top-right" />
```

Les notifications toast s'afficheront en haut à droite de l'écran.

---

## 🔧 Fonctionnement

### Flux de synchronisation

1. **Nouvelle commande** :
   - Supabase Realtime détecte un `INSERT` sur la table `orders`
   - Le hook `useRealtimeOrders` déclenche `onNewOrder`
   - Une notification toast s'affiche
   - La fonction `loadOrders()` recharge toutes les commandes

2. **Mise à jour de commande** :
   - Supabase Realtime détecte un `UPDATE` sur la table `orders`
   - Le hook `useRealtimeOrders` déclenche `onOrderUpdate`
   - La commande est mise à jour dans le state local
   - Le Kanban se met à jour automatiquement

### Indicateur de connexion

- **Vert avec pulse** : Connexion Realtime active (`isConnected === true`)
- **Rouge** : Déconnecté (`isConnected === false`)

---

## ✅ Vérifications effectuées

1. ✅ Package `sonner` installé
2. ✅ Imports ajoutés correctement
3. ✅ Hook `useRealtimeOrders` intégré avec les callbacks spécifiés
4. ✅ Indicateur de connexion ajouté dans le header
5. ✅ Indicateur de connexion ajouté avant le Kanban
6. ✅ Toaster configuré dans le layout
7. ✅ Aucune erreur de linting
8. ✅ Code simplifié selon les spécifications

---

## 🧪 Tests à effectuer

### Test 1 : Vérifier l'indicateur de connexion
1. Lancer `pnpm dev`
2. Ouvrir `http://localhost:3000/dashboard/orders`
3. Vérifier que l'indicateur affiche "Temps réel actif" avec un point vert qui pulse

### Test 2 : Tester la synchronisation
1. Créer une nouvelle commande depuis une autre session/onglet
2. Vérifier que :
   - Une notification toast apparaît
   - La commande apparaît dans le Kanban
   - L'indicateur reste vert

### Test 3 : Tester la mise à jour
1. Modifier le statut d'une commande depuis une autre session
2. Vérifier que :
   - La commande se déplace dans le Kanban
   - Le statut est mis à jour en temps réel

---

## 📝 Notes importantes

### Compatibilité avec Socket.io
- Le code garde la compatibilité avec Socket.io (`socketConnected`)
- Les deux systèmes peuvent fonctionner en parallèle
- L'indicateur dans le header montre l'état des deux connexions

### Rechargement des commandes
- Lors d'une nouvelle commande, `loadOrders()` est appelé pour obtenir toutes les données complètes
- Lors d'une mise à jour, seule la commande concernée est mise à jour dans le state

### Performance
- Le hook Realtime utilise un canal unique par restaurant : `orders:${restaurantId}`
- Les événements sont filtrés par `restaurantId` côté Supabase
- Limite de débit : 10 événements par seconde (configuré dans le client Supabase)

---

## 🎯 Prochaines étapes recommandées

1. **Activer Realtime sur Supabase** :
   - Aller dans Supabase Dashboard → Database → Replication
   - Activer la réplication pour la table `orders`

2. **Tester en production** :
   - Vérifier que les variables d'environnement sont configurées
   - Tester avec plusieurs utilisateurs simultanés

3. **Optimiser les performances** :
   - Considérer l'ajout d'un debounce pour les mises à jour fréquentes
   - Ajouter une gestion d'erreur pour les cas de déconnexion

---

**Fichiers modifiés** :
- `apps/web/app/dashboard/orders/page.tsx` (hook Realtime intégré)
- `apps/web/app/layout.tsx` (Toaster ajouté)
- `apps/web/package.json` (sonner ajouté)

**Fichiers vérifiés** :
- `apps/web/hooks/useRealtimeOrders.ts` (hook Realtime)
- `apps/web/lib/supabase/client.ts` (client Supabase)
