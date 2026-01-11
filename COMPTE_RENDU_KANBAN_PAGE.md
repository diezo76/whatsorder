# Compte Rendu - Page Kanban des Commandes

**Date** : 2024-01-11  
**Tâche** : Remplacement de la page orders par une page Kanban complète

## ✅ Fichier créé/modifié

### `apps/web/app/dashboard/orders/page.tsx`
Page Kanban complète avec toutes les fonctionnalités demandées.

## 🏗️ Structure de la page

### 1. Directive 'use client'
La page est un Client Component pour utiliser les hooks React et les interactions.

### 2. Types TypeScript
**Interfaces définies** :
- `Order` : Commande complète avec customer, items, assignedTo, etc.
- `OrderItem` : Item de commande avec menuItem
- `Column` : Colonne du Kanban (id, title, color)

### 3. États principaux
```typescript
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
const [filters, setFilters] = useState({
  date: 'today',
  assignedTo: 'all',
  search: ''
});
```

### 4. Colonnes du Kanban
6 colonnes définies selon les statuts :
- `PENDING` : ⏳ En Attente (gray)
- `CONFIRMED` : ✅ Confirmée (blue)
- `PREPARING` : 👨‍🍳 En Préparation (yellow)
- `READY` : 🎉 Prête (green)
- `OUT_FOR_DELIVERY` : 🚗 En Livraison (purple)
- `DELIVERED` : ✅ Livrée (green)

## 📋 Fonctionnalités implémentées

### 1. Chargement des commandes
**Fonction `loadOrders()`** :
- Appel API `/orders` avec query params
- Filtres : date, assignedToId, search
- Gestion d'erreurs avec toast
- Loading state

**useEffect** :
- Déclenche le chargement au changement des filtres
- Recharge automatiquement quand les filtres changent

### 2. Header avec filtres
**Composants** :
- Titre "Commandes"
- Badge avec nombre total de commandes
- Bouton rafraîchir avec animation de spin pendant le chargement
- 3 filtres :
  - **Date** : today, yesterday, week, month, all
  - **Staff** : Tous les staffs (TODO: charger la liste)
  - **Recherche** : N° commande, client

**Styles** :
- Border bottom pour séparation
- Focus states avec ring-2 ring-blue-500
- Responsive avec flex-wrap

### 3. Board Kanban
**Structure** :
- Container : `flex-1 overflow-x-auto` pour scroll horizontal
- Colonnes : `flex gap-4 min-w-max` pour layout horizontal
- Chaque colonne : `w-80 flex-shrink-0` (largeur fixe)

**Colonnes** :
- Header avec titre et badge de compteur
- Liste scrollable des commandes (`max-h-[calc(100vh-20rem)]`)
- Cards de commandes cliquables
- État vide : "Aucune commande"

**Cards de commandes** :
- Order number en gras
- Nom du client
- Avatar du staff assigné (si présent)
- Nombre d'articles
- Total en euros
- Heure de création

### 4. Fonction helper `getOrdersByStatus()`
Filtre les commandes par statut pour chaque colonne.

### 5. Modal OrderDetails (basique)
**Fonctionnalités** :
- Affichage conditionnel si `selectedOrder` existe
- Overlay avec backdrop
- Informations affichées :
  - Numéro de commande
  - Client (nom + téléphone)
  - Liste des articles avec quantités et prix
  - Total
- Boutons pour changer le statut
- Bouton de fermeture

**TODO** : Créer le composant `OrderDetailsModal` complet dans un prochain prompt.

### 6. Gestion du changement de statut
**Fonction `handleStatusChange()`** :
- Appel API PATCH `/orders/:id/status`
- Mise à jour locale de l'état
- Toast de succès/erreur
- Fermeture du modal après succès

## 🎨 Styles et UX

### Layout
- Container principal : `flex flex-col h-[calc(100vh-4rem)]`
- Header fixe en haut
- Board scrollable horizontalement et verticalement

### Cards de commandes
- Hover effect : `hover:shadow-md`
- Cursor pointer
- Border et rounded corners
- Espacement cohérent

### Loading state
- Spinner centré pendant le chargement
- Animation de spin sur le bouton rafraîchir

### Responsive
- Filtres avec flex-wrap pour mobile
- Scroll horizontal pour les colonnes
- Modal responsive avec max-width

## 🔌 Intégration API

### Endpoints utilisés
- `GET /api/orders` : Liste des commandes avec filtres
- `PATCH /api/orders/:id/status` : Mise à jour du statut

### Query params supportés
- `date` : today, yesterday, week, month
- `assignedToId` : UUID du staff
- `search` : Recherche textuelle

## 📝 TODOs identifiés

1. **Composant KanbanColumn** :
   - Créer un composant dédié pour les colonnes
   - Intégrer @dnd-kit pour le drag-and-drop
   - Gérer les drops entre colonnes

2. **Composant OrderDetailsModal** :
   - Modal complet avec toutes les infos
   - Formulaires pour assigner un staff
   - Actions supplémentaires (annuler, modifier)

3. **Chargement des staffs** :
   - Récupérer la liste des users du restaurant
   - Populer le filtre "assignedTo"

4. **Socket.io** :
   - Écouter les événements `order_status_changed`
   - Mettre à jour en temps réel
   - Synchroniser entre utilisateurs

5. **Drag-and-drop** :
   - Implémenter avec @dnd-kit
   - Gérer les drops entre colonnes
   - Mettre à jour le statut automatiquement

## ✅ Vérifications

- ✅ Compilation TypeScript réussie
- ✅ Aucune erreur de linter
- ✅ Types correctement définis
- ✅ Intégration API fonctionnelle
- ✅ Gestion d'erreurs appropriée
- ✅ Loading states implémentés
- ✅ Responsive design

## 🚀 Prochaines étapes

1. **Créer KanbanColumn** avec @dnd-kit
2. **Créer OrderDetailsModal** complet
3. **Intégrer Socket.io** pour les mises à jour temps réel
4. **Charger les staffs** pour le filtre
5. **Ajouter animations** pour les transitions
6. **Optimiser les performances** (virtualisation si nécessaire)
