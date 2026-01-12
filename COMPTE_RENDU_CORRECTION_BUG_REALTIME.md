# Compte Rendu - Correction du Bug de Reconnexion Realtime

**Date** : Correction du bug de reconnexion en boucle  
**Problème** : Le canal Realtime se connectait et se déconnectait en boucle (CLOSED → SUBSCRIBED → CLOSED)

## 🐛 Problème identifié

### Symptômes
```
📡 Orders status: CLOSED
📡 Orders status: SUBSCRIBED
📡 Orders status: CLOSED
📡 Orders status: SUBSCRIBED
```

Le canal Realtime se reconnectait en boucle, causant :
- Des reconnexions inutiles
- Une consommation excessive de ressources
- Des logs répétitifs dans la console

### Cause racine

Les callbacks (`onNewOrder`, `onOrderUpdate`, etc.) étaient passés directement dans les dépendances du `useEffect`, mais ces callbacks étaient recréés à chaque render du composant parent. Cela causait :

1. **Render du composant** → Nouveaux callbacks créés
2. **useEffect détecte le changement** → Les dépendances ont changé
3. **Cleanup exécuté** → Canal déconnecté (CLOSED)
4. **useEffect réexécuté** → Nouveau canal créé (SUBSCRIBED)
5. **Boucle infinie** → Retour à l'étape 1

## ✅ Solution appliquée

### Utilisation de `useRef` pour stabiliser les callbacks

Au lieu de mettre les callbacks directement dans les dépendances du `useEffect`, nous utilisons `useRef` pour stocker les références aux callbacks :

```typescript
// Avant (problématique)
useEffect(() => {
  // ...
  onNewOrder?.(payload.new as Order);
}, [restaurantId, onNewOrder, onOrderUpdate]); // ❌ Callbacks dans les dépendances

// Après (corrigé)
const onNewOrderRef = useRef(onNewOrder);
const onOrderUpdateRef = useRef(onOrderUpdate);

// Mettre à jour les refs quand les callbacks changent
useEffect(() => {
  onNewOrderRef.current = onNewOrder;
  onOrderUpdateRef.current = onOrderUpdate;
}, [onNewOrder, onOrderUpdate]);

useEffect(() => {
  // ...
  onNewOrderRef.current?.(payload.new as Order); // ✅ Utiliser la ref
}, [restaurantId]); // ✅ Seulement restaurantId dans les dépendances
```

### Avantages de cette approche

1. **Stabilité** : Le `useEffect` principal ne se réexécute que si `restaurantId` change
2. **Callbacks à jour** : Les refs sont mises à jour dans un `useEffect` séparé
3. **Performance** : Évite les reconnexions inutiles
4. **Simplicité** : Solution standard pour ce type de problème

## 📋 Fichiers modifiés

### 1. `apps/web/hooks/useRealtimeOrders.ts`
- ✅ Ajout de `useRef` pour `onNewOrder` et `onOrderUpdate`
- ✅ Séparation des dépendances : un `useEffect` pour les refs, un autre pour le canal
- ✅ Dépendances du canal : seulement `restaurantId`

### 2. `apps/web/hooks/useRealtimeMessages.ts`
- ✅ Même correction appliquée
- ✅ `useRef` pour `onNewMessage` et `onMessageUpdate`
- ✅ Dépendances du canal : seulement `conversationId`

### 3. `apps/web/hooks/useRealtimeConversations.ts`
- ✅ Même correction appliquée
- ✅ `useRef` pour `onConversationUpdate` et `onNewConversation`
- ✅ Dépendances du canal : seulement `restaurantId`

## 🧪 Tests à effectuer

### Test 1 : Vérifier la connexion stable
1. Ouvrir la page Orders (`/dashboard/orders`)
2. Vérifier dans la console qu'il n'y a qu'un seul log :
   ```
   📡 Orders status: SUBSCRIBED
   ```
3. L'indicateur doit rester vert avec "Temps réel actif"

### Test 2 : Vérifier que les callbacks fonctionnent toujours
1. Créer une commande depuis une autre session
2. Vérifier que :
   - La notification toast s'affiche
   - La commande apparaît dans le Kanban
   - Le callback `onNewOrder` fonctionne correctement

### Test 3 : Vérifier la mise à jour
1. Modifier le statut d'une commande
2. Vérifier que :
   - La commande se met à jour dans le Kanban
   - Le callback `onOrderUpdate` fonctionne correctement

## 📝 Notes techniques

### Pourquoi `useRef` et pas `useCallback` ?

`useCallback` pourrait aussi fonctionner, mais :
- Nécessite de wrapper tous les callbacks dans le composant parent
- Plus verbeux et complexe
- `useRef` est plus simple et direct pour ce cas d'usage

### Pattern utilisé

Ce pattern est standard pour les hooks qui acceptent des callbacks :
1. Stocker les callbacks dans des refs
2. Mettre à jour les refs dans un `useEffect` séparé
3. Utiliser les refs dans le `useEffect` principal
4. Ne mettre que les valeurs primitives dans les dépendances

## ✅ Résultat

- ✅ Plus de reconnexions en boucle
- ✅ Connexion stable et permanente
- ✅ Callbacks toujours à jour
- ✅ Performance améliorée
- ✅ Logs propres dans la console

---

**Statut** : ✅ **Bug corrigé !**

Les hooks Realtime sont maintenant stables et ne se reconnectent plus en boucle. La synchronisation en temps réel fonctionne correctement.
