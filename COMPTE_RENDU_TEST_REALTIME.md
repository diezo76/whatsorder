# Compte Rendu - Tests Realtime

**Date** : Tests de synchronisation Realtime  
**Objectif** : Vérifier que la synchronisation en temps réel fonctionne correctement

## 🧪 Tests à effectuer

### ÉTAPE 8 : Test avec 2 onglets (Drag & Drop)

**Objectif** : Vérifier que le drag & drop synchronise entre les onglets

**Procédure** :
1. Lancer le serveur : `pnpm dev`
2. Ouvrir 2 onglets dans le navigateur : `http://localhost:3000/dashboard/orders`
3. Se connecter dans les 2 onglets avec :
   - Email : `admin@whatsorder.com`
   - Mot de passe : `Admin123!`
4. Dans l'onglet 1 : Drag & drop une commande vers une autre colonne
5. Vérifier dans l'onglet 2 : La commande doit changer de colonne automatiquement

**Résultat attendu** :
- ✅ La commande se déplace dans l'onglet 1
- ✅ La commande se déplace automatiquement dans l'onglet 2
- ✅ L'indicateur "Temps réel actif" reste vert dans les deux onglets

---

### ÉTAPE 9 : Test avec curl (Créer une commande)

**Objectif** : Vérifier que les nouvelles commandes apparaissent en temps réel

**Script créé** : `test-realtime.sh`

**Utilisation** :
```bash
./test-realtime.sh
```

**Ce que fait le script** :
1. ✅ Se connecte avec `admin@whatsorder.com` / `Admin123!`
2. ✅ Récupère le restaurant de l'utilisateur
3. ✅ Récupère le premier item du menu
4. ✅ Récupère un client (depuis les conversations ou crée un temporaire)
5. ✅ Crée une nouvelle commande avec les données de test

**Vérifications dans le navigateur** :
- ✅ La nouvelle commande apparaît automatiquement dans le Kanban
- ✅ Un toast "Nouvelle commande : ORD-xxx" s'affiche
- ✅ L'indicateur "Temps réel actif" reste vert

---

## 📋 Routes API utilisées

### Routes Next.js (port 3000)

- `POST /api/auth/login` - Connexion
- `GET /api/restaurant` - Récupérer le restaurant
- `GET /api/menu/items` - Liste des items du menu
- `GET /api/conversations` - Liste des conversations (pour obtenir un client)
- `POST /api/orders` - Créer une commande

### Structure de la requête POST /api/orders

```json
{
  "customerId": "uuid-du-client",
  "items": [{
    "menuItemId": "uuid-de-l-item",
    "quantity": 1
  }],
  "deliveryType": "DELIVERY",
  "deliveryAddress": "Adresse de livraison",
  "customerNotes": "Notes du client"
}
```

---

## 🔍 Points de vérification

### 1. Indicateur de connexion
- ✅ Point vert qui pulse quand connecté
- ✅ Point rouge quand déconnecté
- ✅ Texte "Temps réel actif" / "Déconnecté"

### 2. Logs console
- ✅ Un seul log `📡 Orders status: SUBSCRIBED` au chargement
- ✅ Pas de reconnexions en boucle (CLOSED → SUBSCRIBED → CLOSED)

### 3. Synchronisation drag & drop
- ✅ Changement de statut dans l'onglet 1
- ✅ Mise à jour automatique dans l'onglet 2
- ✅ Pas de rechargement de page nécessaire

### 4. Synchronisation nouvelle commande
- ✅ Commande apparaît automatiquement
- ✅ Toast de notification s'affiche
- ✅ Commande dans la bonne colonne selon son statut

---

## 🐛 Problèmes possibles et solutions

### Problème 1 : L'indicateur reste rouge
**Cause** : Realtime non activé sur Supabase ou variables d'environnement manquantes
**Solution** : Vérifier que les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont configurées

### Problème 2 : Reconnexions en boucle
**Cause** : Bug corrigé avec `useRef` dans les hooks
**Solution** : Vérifier que les hooks utilisent `useRef` pour les callbacks

### Problème 3 : La commande n'apparaît pas
**Cause** : Le hook Realtime n'est pas connecté ou la table n'est pas dans la publication
**Solution** : Vérifier que la table `orders` est dans `supabase_realtime` (déjà vérifié ✅)

### Problème 4 : Le toast ne s'affiche pas
**Cause** : Le Toaster de sonner n'est pas configuré
**Solution** : Vérifier que `<Toaster />` est dans `apps/web/app/layout.tsx` (déjà ajouté ✅)

---

## ✅ Checklist de test

- [ ] Serveur lancé (`pnpm dev`)
- [ ] 2 onglets ouverts sur `/dashboard/orders`
- [ ] Connecté dans les 2 onglets
- [ ] Indicateur "Temps réel actif" vert dans les 2 onglets
- [ ] Test drag & drop : commande se synchronise entre onglets
- [ ] Script `test-realtime.sh` exécuté
- [ ] Nouvelle commande apparaît automatiquement
- [ ] Toast de notification s'affiche
- [ ] Pas d'erreurs dans la console

---

## 📝 Notes techniques

### Format des données Realtime

Les événements Realtime retournent les données directement depuis la base de données. Il faut s'assurer que :
- Les champs correspondent au schéma Prisma
- Les relations sont correctement chargées si nécessaire
- Les types TypeScript correspondent aux données reçues

### Performance

- Limite de débit : 10 événements par seconde (configuré dans le client Supabase)
- Un canal par restaurant : `orders:${restaurantId}`
- Filtrage côté Supabase : seulement les commandes du restaurant

---

**Statut** : ✅ **Prêt pour les tests !**

Tous les composants sont en place pour tester la synchronisation Realtime. Utilisez le script `test-realtime.sh` pour créer des commandes de test et vérifier que tout fonctionne correctement.
