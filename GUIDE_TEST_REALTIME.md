# 🧪 Guide de Test Realtime en Local

**Date** : 11 janvier 2026  
**Objectif** : Tester les fonctionnalités realtime (messages inbox et kanban commandes) avec 2 onglets

---

## 📋 Prérequis

### 1. Services démarrés

Assurez-vous que tous les services sont démarrés :

```bash
# 1. Démarrer PostgreSQL et Redis (si Docker)
cd docker
docker compose up -d

# 2. Vérifier que les services tournent
docker ps
```

### 2. Configuration Supabase

Vérifiez que les variables d'environnement Supabase sont configurées dans `apps/web/.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

**Important** : Le realtime Supabase nécessite que les tables `Message` et `Order` aient RLS (Row Level Security) activé et que les politiques permettent la lecture/écriture.

### 3. Démarrer l'application

```bash
# Depuis la racine du projet
pnpm dev

# OU séparément :
# Terminal 1 - Backend
cd apps/api
pnpm dev

# Terminal 2 - Frontend
cd apps/web
pnpm dev
```

L'application devrait être accessible sur :
- Frontend : http://localhost:3000
- Backend : http://localhost:4000

---

## ✅ Test 1 : Realtime Messages Inbox

### Objectif
Vérifier que les messages envoyés dans un onglet apparaissent instantanément dans l'autre onglet.

### Étapes

1. **Ouvrir 2 onglets du navigateur** :
   - Onglet 1 : http://localhost:3000/dashboard/inbox
   - Onglet 2 : http://localhost:3000/dashboard/inbox

2. **Se connecter avec le même compte** dans les 2 onglets :
   - Utilisez les mêmes identifiants de connexion
   - Assurez-vous d'être connecté dans les deux onglets

3. **Sélectionner la même conversation** dans les 2 onglets :
   - Cliquez sur une conversation existante dans la liste de gauche
   - Faites la même chose dans l'onglet 2

4. **Vérifier l'indicateur de connexion realtime** :
   - En haut de la page inbox, vous devriez voir un indicateur :
     - 🟢 "Temps réel actif" (vert) = connecté
     - 🔴 "Déconnecté" (rouge) = non connecté
   - Les deux onglets doivent afficher 🟢 vert

5. **Dans l'onglet 1** :
   - Tapez un message dans le champ de saisie en bas
   - Cliquez sur "Envoyer" ou appuyez sur Entrée
   - Le message apparaît immédiatement dans l'onglet 1

6. **Dans l'onglet 2** :
   - ✅ **Résultat attendu** : Le message apparaît instantanément (sans rafraîchir la page) !
   - Le message devrait apparaître dans la zone de chat avec la même date/heure

### Vérifications supplémentaires

- **Console du navigateur** (F12) :
  - Onglet 1 : Vous devriez voir `🆕 New message:` dans les logs
  - Onglet 2 : Vous devriez voir `🆕 New message:` dans les logs également
  - Les deux devraient afficher `📡 Realtime status: SUBSCRIBED`

- **Son de notification** :
  - Si le message est inbound (venant d'un client), un son devrait jouer dans l'onglet 2

### ✅ Critères de succès

- [ ] Les deux onglets affichent "Temps réel actif" (vert)
- [ ] Un message envoyé dans l'onglet 1 apparaît dans l'onglet 2 sans rafraîchir
- [ ] Le message apparaît avec le bon contenu, la bonne date et le bon statut
- [ ] Les logs de la console montrent les événements realtime

---

## ✅ Test 2 : Realtime Kanban Commandes

### Objectif
Vérifier que le drag & drop d'une commande dans un onglet met à jour le kanban dans l'autre onglet en temps réel.

### Étapes

1. **Ouvrir 2 onglets du navigateur** :
   - Onglet 1 : http://localhost:3000/dashboard/orders
   - Onglet 2 : http://localhost:3000/dashboard/orders

2. **Se connecter avec le même compte** dans les 2 onglets

3. **Vérifier l'indicateur de connexion realtime** :
   - En haut de la page orders, vous devriez voir :
     - 🟢 "Temps réel actif" (vert) = connecté
   - Les deux onglets doivent afficher 🟢 vert

4. **S'assurer qu'il y a au moins une commande** :
   - Si aucune commande n'existe, créez-en une via l'inbox ou manuellement
   - Les commandes doivent être visibles dans les deux onglets

5. **Dans l'onglet 1** :
   - Identifiez une commande dans une colonne (ex: "⏳ En Attente")
   - Cliquez et maintenez sur la carte de la commande
   - Glissez-la vers une autre colonne (ex: "✅ Confirmée")
   - Relâchez pour déposer la commande
   - La commande devrait se déplacer dans la nouvelle colonne dans l'onglet 1

6. **Dans l'onglet 2** :
   - ✅ **Résultat attendu** : La commande change automatiquement de colonne en temps réel !
   - La commande devrait disparaître de l'ancienne colonne et apparaître dans la nouvelle colonne
   - Un toast de notification devrait apparaître : "Commande [NUMERO] : [NOUVEAU_STATUT]"

### Vérifications supplémentaires

- **Console du navigateur** (F12) :
  - Onglet 1 : Vous devriez voir `✏️ Order updated:` dans les logs
  - Onglet 2 : Vous devriez voir `✏️ Order updated:` dans les logs également
  - Les deux devraient afficher `📡 Orders status: SUBSCRIBED`

- **Animation** :
  - La commande mise à jour devrait avoir une animation subtile (flash) dans l'onglet 2

- **Badge "Nouveau"** :
  - Si c'est une nouvelle commande, elle devrait avoir un badge "Nouveau" qui disparaît après 30 secondes

### ✅ Critères de succès

- [ ] Les deux onglets affichent "Temps réel actif" (vert)
- [ ] Un drag & drop dans l'onglet 1 met à jour le kanban dans l'onglet 2 sans rafraîchir
- [ ] La commande apparaît dans la bonne colonne dans les deux onglets
- [ ] Un toast de notification apparaît dans l'onglet 2
- [ ] Les logs de la console montrent les événements realtime

---

## 🐛 Dépannage

### Problème : "Déconnecté" (rouge) dans les deux onglets

**Causes possibles** :
1. Variables d'environnement Supabase manquantes ou incorrectes
2. RLS (Row Level Security) non configuré sur les tables
3. Problème de connexion réseau avec Supabase

**Solutions** :

1. **Vérifier les variables d'environnement** :
   ```bash
   # Vérifier que les variables existent
   cat apps/web/.env.local | grep SUPABASE
   ```

2. **Vérifier RLS sur Supabase** :
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet
   - Aller dans "Authentication" > "Policies"
   - Vérifier que les tables `Message` et `Order` ont des politiques permettant la lecture/écriture

3. **Vérifier la connexion réseau** :
   ```bash
   # Tester la connexion Supabase
   curl https://votre-projet.supabase.co/rest/v1/
   ```

### Problème : Les messages/commandes n'apparaissent pas en temps réel

**Causes possibles** :
1. Le hook realtime n'est pas activé
2. Les événements ne sont pas émis depuis le backend
3. Problème de filtres dans la subscription Supabase

**Solutions** :

1. **Vérifier les logs de la console** :
   - Ouvrir la console du navigateur (F12)
   - Chercher les messages `📡 Realtime status:`
   - Si vous voyez `TIMED_OUT` ou `CHANNEL_ERROR`, il y a un problème de connexion

2. **Vérifier que le backend émet les événements** :
   - Vérifier les logs du backend lors de l'envoi d'un message ou de la mise à jour d'une commande
   - Le backend devrait créer/updater les enregistrements dans la base de données

3. **Vérifier les filtres de subscription** :
   - Les hooks utilisent des filtres (`conversationId=eq.XXX` pour messages, `restaurantId=eq.XXX` pour orders)
   - Vérifier que les IDs correspondent bien

### Problème : Les messages apparaissent en double

**Cause** : Le message est ajouté à la fois via l'API et via le realtime

**Solution** :
- Vérifier que le code ne fait pas de double ajout
- Le hook realtime devrait être la seule source de vérité pour les mises à jour

### Problème : Le drag & drop ne fonctionne pas

**Causes possibles** :
1. Le package `@dnd-kit/core` n'est pas installé
2. Les sensors ne sont pas configurés correctement

**Solutions** :

1. **Vérifier l'installation** :
   ```bash
   cd apps/web
   pnpm list @dnd-kit/core
   ```

2. **Réinstaller si nécessaire** :
   ```bash
   pnpm add @dnd-kit/core @dnd-kit/sortable
   ```

---

## 📊 Checklist de Test Complète

### Test Inbox Messages
- [ ] Les deux onglets se connectent correctement
- [ ] L'indicateur "Temps réel actif" est vert dans les deux onglets
- [ ] Un message envoyé dans l'onglet 1 apparaît dans l'onglet 2
- [ ] Le message apparaît avec le bon contenu et la bonne date
- [ ] Les logs de la console montrent les événements realtime
- [ ] Le son de notification joue pour les messages inbound (si configuré)

### Test Kanban Commandes
- [ ] Les deux onglets se connectent correctement
- [ ] L'indicateur "Temps réel actif" est vert dans les deux onglets
- [ ] Un drag & drop dans l'onglet 1 met à jour l'onglet 2
- [ ] La commande apparaît dans la bonne colonne dans les deux onglets
- [ ] Un toast de notification apparaît dans l'onglet 2
- [ ] Les logs de la console montrent les événements realtime
- [ ] L'animation de mise à jour fonctionne

---

## 📝 Notes Techniques

### Architecture Realtime

Le système utilise **Supabase Realtime** pour les mises à jour en temps réel :

1. **Messages** (`useRealtimeMessages`) :
   - Canal : `messages:{conversationId}`
   - Écoute : `INSERT` et `UPDATE` sur la table `Message`
   - Filtre : `conversationId=eq.{conversationId}`

2. **Commandes** (`useRealtimeOrders`) :
   - Canal : `orders:{restaurantId}`
   - Écoute : `INSERT`, `UPDATE`, `DELETE` sur la table `Order`
   - Filtre : `restaurantId=eq.{restaurantId}`

3. **Conversations** (`useRealtimeConversations`) :
   - Canal : `conversations:{restaurantId}`
   - Écoute : `INSERT` et `UPDATE` sur la table `Conversation`
   - Filtre : `restaurantId=eq.{restaurantId}`

### Flux de Données

```
Backend API → PostgreSQL → Supabase Realtime → Frontend Hook → UI Update
```

1. Le backend crée/met à jour un enregistrement dans PostgreSQL
2. Supabase Realtime détecte le changement via les triggers PostgreSQL
3. Supabase envoie l'événement aux clients abonnés au canal
4. Le hook frontend reçoit l'événement et met à jour le state React
5. L'UI se met à jour automatiquement

---

## 🎯 Résultats Attendus

### ✅ Test Réussi

Si tous les tests passent, vous devriez voir :

1. **Inbox** :
   - Messages synchronisés en temps réel entre les onglets
   - Indicateur vert "Temps réel actif"
   - Logs de console montrant les événements

2. **Kanban** :
   - Commandes synchronisées en temps réel entre les onglets
   - Drag & drop fonctionnel avec mise à jour instantanée
   - Toasts de notification
   - Indicateur vert "Temps réel actif"

### ❌ Test Échoué

Si les tests échouent :

1. Vérifier les prérequis (services démarrés, variables d'environnement)
2. Vérifier les logs de la console pour les erreurs
3. Vérifier la configuration Supabase (RLS, politiques)
4. Consulter la section "Dépannage" ci-dessus

---

**Dernière mise à jour** : 11 janvier 2026
