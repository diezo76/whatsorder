# ✅ Checklist de Tests - WhatsOrder

**Date** : 11 janvier 2026  
**Statut** : Tests à effectuer

---

## 🚀 Services Lancés

- ✅ **Frontend** : http://localhost:3000
- ✅ **API** : http://localhost:4000
- ✅ **PostgreSQL** : Port 5432 (actif)
- ✅ **Redis** : Port 6379 (actif)

---

## 📋 Tests à Effectuer

### 1. ✅ Login / Authentification

**URL** : http://localhost:3000/login

**Tests** :
- [ ] Accéder à la page de login
- [ ] Vérifier le formulaire (email, password)
- [ ] Tester la connexion avec un compte existant
- [ ] Vérifier la redirection vers `/dashboard` après login
- [ ] Vérifier le stockage du token dans localStorage
- [ ] Tester la déconnexion

**Endpoints API** :
- `POST /api/auth/login`
- `GET /api/auth/me`

---

### 2. ✅ CRUD Menu

**URL** : http://localhost:3000/dashboard/menu

**Tests** :

#### Catégories
- [ ] Voir la liste des catégories
- [ ] Créer une nouvelle catégorie
- [ ] Modifier une catégorie existante
- [ ] Supprimer une catégorie
- [ ] Réordonner les catégories (drag & drop)

#### Items
- [ ] Voir la liste des items
- [ ] Filtrer par catégorie
- [ ] Rechercher un item
- [ ] Créer un nouvel item
- [ ] Modifier un item existant
- [ ] Supprimer un item
- [ ] Toggle disponibilité d'un item
- [ ] Upload d'image pour un item

**Endpoints API** :
- `GET /api/menu/categories`
- `POST /api/menu/categories`
- `PUT /api/menu/categories/:id`
- `DELETE /api/menu/categories/:id`
- `PATCH /api/menu/categories/reorder`
- `GET /api/menu/items`
- `POST /api/menu/items`
- `PUT /api/menu/items/:id`
- `DELETE /api/menu/items/:id`
- `PATCH /api/menu/items/:id/toggle-availability`

---

### 3. ✅ Kanban Orders

**URL** : http://localhost:3000/dashboard/orders

**Tests** :
- [ ] Voir toutes les colonnes du Kanban
- [ ] Voir les commandes dans chaque colonne
- [ ] Déplacer une commande entre colonnes (drag & drop)
- [ ] Ouvrir les détails d'une commande
- [ ] Changer le statut d'une commande
- [ ] Assigner une commande à un membre du staff
- [ ] Annuler une commande
- [ ] Filtrer par date (today, week, month)
- [ ] Rechercher une commande
- [ ] Vérifier les mises à jour en temps réel (Socket.io)

**Endpoints API** :
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `PATCH /api/orders/:id/assign`
- `PATCH /api/orders/:id/cancel`

**Socket Events** :
- `order_status_changed`
- `order_assigned`
- `order_cancelled`
- `new_order`

---

### 4. ✅ Inbox WhatsApp

**URL** : http://localhost:3000/dashboard/inbox

**Tests** :
- [ ] Voir la liste des conversations
- [ ] Ouvrir une conversation
- [ ] Voir l'historique des messages
- [ ] Envoyer un message
- [ ] Voir les informations du client
- [ ] Créer une note sur une conversation
- [ ] Marquer une conversation comme lue
- [ ] Archiver une conversation
- [ ] Parser une commande depuis un message WhatsApp
- [ ] Créer une commande depuis un message parsé
- [ ] Vérifier les mises à jour en temps réel (Socket.io)

**Endpoints API** :
- `GET /api/conversations`
- `GET /api/conversations/:id`
- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`
- `POST /api/ai/parse-order`
- `POST /api/ai/create-order`
- `GET /api/conversations/:conversationId/notes`
- `POST /api/conversations/:conversationId/notes`
- `PATCH /api/conversations/:id/mark-read`
- `PATCH /api/conversations/:id/archive`

**Socket Events** :
- `conversation_updated`
- `message_sent`
- `new_conversation`

---

### 5. ✅ Analytics

**URL** : http://localhost:3000/dashboard/analytics

**Tests** :

#### KPIs
- [ ] Voir les 6 cartes KPI :
  - Revenus (avec changement %)
  - Commandes (avec changement %)
  - Nouveaux clients
  - Taux de conversion
  - Panier moyen
  - Temps moyen de traitement
- [ ] Changer la période (Aujourd'hui, 7 jours, 30 jours)
- [ ] Vérifier les calculs de changement %

#### Graphiques
- [ ] Graphique d'évolution des revenus (ligne)
- [ ] Graphique des types de livraison (camembert)
- [ ] Graphique des top 10 plats (barres)
- [ ] Vérifier les tooltips sur les graphiques
- [ ] Vérifier le formatage des dates en français

#### Export CSV
- [ ] Ouvrir le modal d'export
- [ ] Exporter le rapport complet
- [ ] Exporter la liste des commandes
- [ ] Exporter le top des plats
- [ ] Exporter l'évolution des revenus
- [ ] Vérifier l'ouverture des fichiers CSV dans Excel
- [ ] Vérifier l'encodage UTF-8 (caractères arabes/français)

**Endpoints API** :
- `GET /api/analytics/dashboard-stats?period={period}`
- `GET /api/analytics/revenue-chart?period={period}`
- `GET /api/analytics/top-items?period={period}&limit=10`
- `GET /api/analytics/orders-by-status?period={period}`
- `GET /api/analytics/delivery-types?period={period}`
- `GET /api/orders?date={date}&limit=1000`

---

### 6. ✅ Export CSV

**Tests** :
- [ ] Ouvrir le modal depuis le bouton "Export CSV"
- [ ] Voir les 4 options d'export
- [ ] Tester chaque type d'export :
  - Rapport complet
  - Liste des commandes
  - Top des plats
  - Évolution des revenus
- [ ] Vérifier le téléchargement du fichier
- [ ] Vérifier le nom du fichier (avec timestamp)
- [ ] Ouvrir le fichier CSV dans Excel/Google Sheets
- [ ] Vérifier l'encodage UTF-8 (caractères spéciaux)
- [ ] Vérifier le formatage des dates
- [ ] Vérifier la traduction des statuts/types

---

## 🔍 Tests de Performance

- [ ] Temps de chargement de la page analytics (< 2s)
- [ ] Temps de chargement du Kanban (< 1s)
- [ ] Temps de réponse API (< 500ms)
- [ ] Fluidité du drag & drop
- [ ] Performance avec beaucoup de données (100+ commandes)

---

## 🐛 Tests de Robustesse

- [ ] Gestion des erreurs API (affichage de toasts)
- [ ] Gestion des données vides (empty states)
- [ ] Gestion de la déconnexion (redirection login)
- [ ] Gestion des erreurs réseau
- [ ] Gestion des timeouts

---

## 📱 Tests Responsive

- [ ] Mobile (< 768px)
- [ ] Tablette (768px - 1024px)
- [ ] Desktop (> 1024px)
- [ ] Vérifier le menu hamburger sur mobile
- [ ] Vérifier les graphiques sur mobile

---

## 🔐 Tests de Sécurité

- [ ] Vérifier que les routes sont protégées (401 sans token)
- [ ] Vérifier que les données sont filtrées par restaurantId
- [ ] Vérifier que les tokens expirent correctement
- [ ] Vérifier la validation des inputs

---

## 📝 Notes

- Les services doivent être lancés avec `pnpm dev`
- La base de données doit être migrée et seedée
- Les variables d'environnement doivent être configurées
- Socket.io doit être connecté pour les mises à jour en temps réel

---

## ✅ Résultat Final

Une fois tous les tests effectués, cocher les cases et documenter les problèmes rencontrés.

**Statut** : ⏳ En cours de test
