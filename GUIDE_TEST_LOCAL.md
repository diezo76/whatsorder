# 🧪 Guide de Test Local - WhatsOrder

**Date** : 11 janvier 2026  
**Statut** : ✅ Services démarrés et fonctionnels

---

## ✅ Statut des Services

- ✅ **Frontend** : http://localhost:3000 (ACTIF)
- ✅ **API** : http://localhost:4000 (ACTIF)
- ✅ **PostgreSQL** : Port 5432 (ACTIF)
- ✅ **Redis** : Port 6379 (ACTIF)

---

## 🚀 Démarrage Rapide

Les services sont déjà lancés. Si vous devez les relancer :

```bash
cd "/Users/diezowee/whatsapp order"
pnpm install
pnpm dev
```

---

## 📋 Checklist de Tests

### 1. ✅ Login / Authentification

**URL** : http://localhost:3000/login

**Tests** :
1. Ouvrir http://localhost:3000/login
2. Se connecter avec un compte existant
3. Vérifier la redirection vers `/dashboard`
4. Vérifier que le token est stocké dans localStorage

**Si vous n'avez pas de compte** :
- Créer un compte via http://localhost:3000/register
- Ou utiliser le seed de la base de données

---

### 2. ✅ CRUD Menu

**URL** : http://localhost:3000/dashboard/menu

**Tests** :

#### Catégories
- [ ] Voir la liste des catégories
- [ ] Cliquer sur "Nouvelle Catégorie"
- [ ] Créer une catégorie (nom français + arabe)
- [ ] Modifier une catégorie existante
- [ ] Supprimer une catégorie
- [ ] Réordonner les catégories (drag & drop)

#### Items
- [ ] Voir la liste des items
- [ ] Filtrer par catégorie (onglet "Par catégorie")
- [ ] Rechercher un item dans la barre de recherche
- [ ] Cliquer sur "Nouvel Item"
- [ ] Créer un item avec :
  - Nom français et arabe
  - Prix
  - Catégorie
  - Image (upload)
  - Description
- [ ] Modifier un item existant
- [ ] Toggle disponibilité (bouton vert/rouge)
- [ ] Supprimer un item

---

### 3. ✅ Kanban Orders

**URL** : http://localhost:3000/dashboard/orders

**Tests** :
- [ ] Voir les 6 colonnes du Kanban :
  - ⏳ En Attente
  - ✅ Confirmée
  - 👨‍🍳 En Préparation
  - 🎉 Prête
  - 🚗 En Livraison
  - ✅ Livrée
- [ ] Voir les commandes dans chaque colonne
- [ ] Cliquer sur une commande pour voir les détails
- [ ] Dans le modal de détails :
  - Voir les informations du client
  - Voir les articles commandés
  - Voir le total
  - Changer le statut
  - Assigner à un membre du staff
  - Annuler la commande
- [ ] Déplacer une commande entre colonnes (drag & drop)
- [ ] Filtrer par date (Aujourd'hui, 7 jours, 30 jours)
- [ ] Rechercher une commande par numéro ou client

**Test Temps Réel** :
- Ouvrir deux onglets du dashboard
- Dans un onglet, changer le statut d'une commande
- Vérifier que l'autre onglet se met à jour automatiquement

---

### 4. ✅ Inbox WhatsApp

**URL** : http://localhost:3000/dashboard/inbox

**Tests** :
- [ ] Voir la liste des conversations dans la sidebar gauche
- [ ] Cliquer sur une conversation pour l'ouvrir
- [ ] Voir l'historique des messages
- [ ] Dans la zone de saisie, taper un message
- [ ] Cliquer sur "Envoyer" ou appuyer sur Entrée
- [ ] Voir le message apparaître dans la conversation
- [ ] Voir les informations du client dans le panneau droit
- [ ] Créer une note sur la conversation
- [ ] Parser une commande depuis un message :
  - Sélectionner un message contenant une commande
  - Cliquer sur "Parser la commande"
  - Vérifier l'aperçu de la commande parsée
  - Créer la commande depuis l'aperçu
- [ ] Marquer une conversation comme lue
- [ ] Archiver une conversation

**Test Temps Réel** :
- Ouvrir deux onglets du dashboard
- Dans un onglet, envoyer un message
- Vérifier que l'autre onglet reçoit le message en temps réel

---

### 5. ✅ Analytics

**URL** : http://localhost:3000/dashboard/analytics

**Tests** :

#### KPIs
- [ ] Voir les 6 cartes KPI :
  - Revenus (avec changement % et icône trend)
  - Commandes (avec changement %)
  - Nouveaux Clients
  - Taux de Conversion
  - Panier Moyen
  - Temps Moyen
- [ ] Changer la période :
  - Cliquer sur "Aujourd'hui"
  - Cliquer sur "7 jours"
  - Cliquer sur "30 jours"
- [ ] Vérifier que les données se mettent à jour
- [ ] Vérifier les pourcentages de changement (vert/rouge)

#### Graphiques
- [ ] **Graphique Revenus** (gauche) :
  - Voir la ligne orange (revenus)
  - Voir la ligne bleue (commandes)
  - Survoler pour voir le tooltip avec les détails
  - Vérifier le formatage des dates en français
- [ ] **Graphique Types de Livraison** (droite) :
  - Voir le camembert avec les 3 types
  - Survoler pour voir les pourcentages
  - Vérifier les couleurs (orange, bleu, vert)
- [ ] **Graphique Top Items** (pleine largeur) :
  - Voir les 10 barres colorées
  - Survoler pour voir les détails (quantité + revenus)
  - Vérifier que les noms longs sont tronqués

#### Export CSV
- [ ] Cliquer sur le bouton "Export CSV" (orange, en haut à droite)
- [ ] Voir le modal s'ouvrir avec 4 options
- [ ] Tester chaque export :
  1. **Rapport Complet** :
     - Cliquer sur "Rapport Complet"
     - Voir le spinner pendant l'export
     - Voir le toast de succès avec le nom du fichier
     - Vérifier le téléchargement du fichier
     - Ouvrir dans Excel/Google Sheets
     - Vérifier toutes les sections (KPI, Top Items, Revenus)
  2. **Liste des Commandes** :
     - Cliquer sur "Liste des Commandes"
     - Vérifier le téléchargement
     - Ouvrir dans Excel
     - Vérifier les colonnes (Numéro, Date, Client, etc.)
     - Vérifier le formatage des dates
  3. **Top des Plats** :
     - Cliquer sur "Top des Plats"
     - Vérifier le téléchargement
     - Ouvrir dans Excel
     - Vérifier les colonnes (Rang, Plat, Quantité, Revenus)
  4. **Évolution des Revenus** :
     - Cliquer sur "Évolution des Revenus"
     - Vérifier le téléchargement
     - Ouvrir dans Excel
     - Vérifier les colonnes (Date, Revenus, Commandes)
- [ ] Vérifier l'encodage UTF-8 (caractères arabes/français corrects)
- [ ] Fermer le modal

#### Bouton Rafraîchir
- [ ] Cliquer sur le bouton "Rafraîchir"
- [ ] Voir l'icône tourner pendant le chargement
- [ ] Voir le toast "Données mises à jour ✓"
- [ ] Vérifier que les données sont actualisées

---

## 🔍 Tests de Performance

- [ ] Temps de chargement de la page analytics (< 3s)
- [ ] Temps de chargement du Kanban (< 2s)
- [ ] Temps de réponse API (< 500ms)
- [ ] Fluidité du drag & drop (pas de lag)
- [ ] Performance avec beaucoup de données

---

## 📱 Tests Responsive

### Mobile (< 768px)
- [ ] Ouvrir sur un appareil mobile ou réduire la fenêtre
- [ ] Vérifier le menu hamburger
- [ ] Vérifier que les graphiques s'adaptent
- [ ] Vérifier que les cartes KPI s'empilent verticalement

### Tablette (768px - 1024px)
- [ ] Vérifier le layout à 2 colonnes pour les KPIs
- [ ] Vérifier que les graphiques restent lisibles

### Desktop (> 1024px)
- [ ] Vérifier le layout à 3 colonnes pour les KPIs
- [ ] Vérifier que tout est bien aligné

---

## 🐛 Tests de Robustesse

- [ ] Déconnexion : Vérifier la redirection vers `/login`
- [ ] Erreur API : Vérifier l'affichage des toasts d'erreur
- [ ] Données vides : Vérifier les messages "Aucune donnée disponible"
- [ ] Réseau lent : Vérifier les états de chargement
- [ ] Token expiré : Vérifier la redirection automatique

---

## ✅ Résultat Final

Une fois tous les tests effectués :

- [ ] Tous les tests passent
- [ ] Aucune erreur dans la console
- [ ] Les fonctionnalités principales fonctionnent
- [ ] Les exports CSV fonctionnent correctement
- [ ] Les mises à jour en temps réel fonctionnent

---

## 📝 Notes

- Les services sont lancés avec `pnpm dev`
- Les logs sont disponibles dans les terminaux
- Pour arrêter les services : `Ctrl+C` dans les terminaux ou `pkill -f "next dev"` et `pkill -f "tsx"`
- Pour relancer : `pnpm dev`

---

**Bon test ! 🚀**
