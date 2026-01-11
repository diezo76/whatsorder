# 🎯 Plan MVP - WhatsOrder Clone

**Version** : 1.0.0  
**Date** : 11 janvier 2026  
**Timeline Totale** : 8-10 semaines

---

## 📋 Philosophie MVP

### Principe RICE
Chaque feature est évaluée selon :
- **R**each : Combien d'utilisateurs impactés ?
- **I**mpact : Quel impact sur satisfaction ?
- **C**onfidence : Quelle confiance dans l'estimation ?
- **E**ffort : Combien de temps de dev ?

**Score RICE** = (R × I × C) / E

### Priorités
- **P0 (Must-Have)** : Fonctionnalités essentielles MVP
- **P1 (Should-Have)** : Important mais pas bloquant
- **P2 (Nice-to-Have)** : Améliorations futures

---

## 🚀 Phase 1 : MVP Core (Semaines 1-4)

**Objectif** : Restaurant peut recevoir commandes via WhatsApp

### Semaine 1 : Foundation

#### Setup Projet (P0)
- [x] Initialiser monorepo pnpm
- [x] Configurer TypeScript (web + api)
- [x] Setup Prisma + PostgreSQL
- [x] Docker Compose (postgres + redis)
- [ ] ESLint + Prettier
- [ ] Git hooks (Husky)

**Estimation** : 1 jour  
**Validation** : `pnpm dev` lance frontend + backend

#### Base de Données (P0)
- [ ] Créer schema Prisma complet
- [ ] Migrations initiales
- [ ] Seed script (restaurant + menu de test)

**Estimation** : 1 jour  
**Validation** : Prisma Studio affiche données seed

#### Authentification (P0)
- [ ] Backend : JWT auth (register/login/logout)
- [ ] Frontend : Pages login/register
- [ ] Middleware protection routes
- [ ] Context React auth

**Estimation** : 2 jours  
**Validation** : Peut créer compte et accéder dashboard

#### Dashboard Layout (P0)
- [ ] Sidebar navigation
- [ ] Top bar
- [ ] Responsive mobile
- [ ] Protected layout

**Estimation** : 1 jour  
**Validation** : Navigation fonctionne, logout ok

---

### Semaine 2 : Menu Public

#### Page Landing Restaurant (P0)
- [ ] Route dynamique `/[slug]`
- [ ] Hero section
- [ ] Info restaurant (horaires, adresse)
- [ ] Bouton "Commander"

**Estimation** : 1 jour  
**Validation** : Page restaurant s'affiche avec données DB

#### Interface Menu (P0)
- [ ] Catégories tabs
- [ ] Grid menu items
- [ ] Cards avec images
- [ ] Modal détails item
- [ ] Variantes selector
- [ ] Modificateurs checkboxes

**Estimation** : 3 jours  
**Validation** : Peut naviguer menu, voir détails items

#### Panier (P0)
- [ ] State management Zustand
- [ ] Drawer panier flottant
- [ ] Ajout/suppression items
- [ ] Calcul total automatique
- [ ] Persist localStorage

**Estimation** : 1 jour  
**Validation** : Panier fonctionne, total correct

---

### Semaine 3 : Commande WhatsApp

#### Checkout Flow (P0)
- [ ] Modal checkout multi-steps
- [ ] Step 1 : Info client
- [ ] Step 2 : Type livraison
- [ ] Step 3 : Récapitulatif
- [ ] Validation formulaire (react-hook-form + zod)

**Estimation** : 2 jours  
**Validation** : Formulaire validation fonctionne

#### Génération Message WhatsApp (P0)
- [ ] Fonction formatOrderForWhatsApp()
- [ ] Template message formaté
- [ ] Génération lien WhatsApp
- [ ] Redirection automatique
- [ ] Test envoi réel

**Estimation** : 1 jour  
**Validation** : Message WhatsApp bien formaté reçu

#### API Routes Public (P0)
- [ ] GET `/api/restaurants/[slug]`
- [ ] GET `/api/restaurants/[slug]/menu`
- [ ] Cache Redis (5 min)

**Estimation** : 1 jour  
**Validation** : APIs retournent données correctes

---

### Semaine 4 : Dashboard Admin Menu

#### Gestion Menu - CRUD (P0)
- [ ] Liste items avec filtres
- [ ] Modal création item
- [ ] Upload image (Cloudinary)
- [ ] Formulaire complet
- [ ] Validation
- [ ] Preview temps réel

**Estimation** : 3 jours  
**Validation** : Peut créer/modifier/supprimer items

#### Gestion Catégories (P0)
- [ ] CRUD catégories
- [ ] Drag-and-drop réorganisation

**Estimation** : 1 jour  
**Validation** : Catégories gérables, ordre sauvegardé

#### Settings Restaurant (P0)
- [ ] Info de base (nom, adresse, phone)
- [ ] Horaires d'ouverture
- [ ] Zones de livraison

**Estimation** : 1 jour  
**Validation** : Settings sauvegardés et affichés sur page publique

---

### ✅ Checkpoint Phase 1

**Critères de Validation MVP** :
1. ✅ Restaurant peut créer compte
2. ✅ Restaurant peut ajouter menu complet
3. ✅ Client peut voir menu via lien
4. ✅ Client peut créer panier
5. ✅ Client peut envoyer commande WhatsApp
6. ✅ Restaurant reçoit message formaté

**Demo User Story** :
> "Je suis propriétaire de restaurant. Je crée mon compte, j'ajoute 20 plats avec photos et prix. Je partage le lien à mes clients. Un client commande 3 items via WhatsApp. Je reçois la commande formatée."

**Si non validé** : NE PAS passer Phase 2

---

## 🔥 Phase 2 : Dashboard Opérationnel (Semaines 5-7)

**Objectif** : Restaurant gère commandes efficacement

### Semaine 5 : WhatsApp Integration

#### Connexion WhatsApp Business API (P0)
- [ ] Setup Meta Business Account
- [ ] Configuration dans settings
- [ ] Test connexion
- [ ] Sauvegarde credentials

**Estimation** : 1 jour  
**Validation** : Connexion WhatsApp réussie

#### Webhook Handler (P0)
- [ ] POST `/api/webhooks/whatsapp`
- [ ] Vérification signature Meta
- [ ] Parse messages entrants
- [ ] Créer/update Customer
- [ ] Créer/update Conversation
- [ ] Créer Message
- [ ] Emit Socket.io event

**Estimation** : 2 jours  
**Validation** : Webhooks reçus et traités

#### Inbox Basic (P0)
- [ ] Liste conversations
- [ ] Chat window
- [ ] Envoyer message texte
- [ ] Real-time via Socket.io

**Estimation** : 2 jours  
**Validation** : Peut voir et répondre aux messages

---

### Semaine 6 : Gestion Commandes

#### Parser Commande IA (P1)
- [ ] Intégration OpenAI GPT-4
- [ ] Prompt engineering
- [ ] Extraction items + quantités
- [ ] Gestion ambiguïté
- [ ] Fallback manual

**Estimation** : 2 jours  
**Validation** : 80%+ commandes parsées correctement

#### Création Commande Manuelle (P0)
- [ ] Modal création commande
- [ ] Sélection client existant
- [ ] Ajout items
- [ ] Calcul total
- [ ] Sauvegarde

**Estimation** : 1 jour  
**Validation** : Peut créer commande manuellement

#### Kanban Commandes (P0)
- [ ] Board avec colonnes statuts
- [ ] Cards commandes draggable
- [ ] Drag & drop changement statut
- [ ] Auto-save
- [ ] Filtres et recherche

**Estimation** : 2 jours  
**Validation** : Kanban fonctionne, statuts updatent

---

### Semaine 7 : Notifications & Analytics

#### Notifications WhatsApp Auto (P1)
- [ ] Template messages par statut
- [ ] Envoi auto changement statut
- [ ] Variables dynamiques
- [ ] Logs envois

**Estimation** : 2 jours  
**Validation** : Notifications envoyées automatiquement

#### Analytics Basic (P1)
- [ ] KPI cards (commandes, revenus)
- [ ] Graphique revenus par jour
- [ ] Top 10 produits
- [ ] Page analytics dashboard

**Estimation** : 2 jours  
**Validation** : Analytics affichent données correctes

#### Gestion Clients (P1)
- [ ] Liste clients
- [ ] Détails client (historique)
- [ ] Tags
- [ ] Notes

**Estimation** : 1 jour  
**Validation** : Base clients consultable

---

### ✅ Checkpoint Phase 2

**Critères de Validation** :
1. ✅ Restaurant connecté à WhatsApp API
2. ✅ Messages clients visibles dans inbox
3. ✅ Commandes créées (auto ou manual)
4. ✅ Kanban pour gérer commandes
5. ✅ Notifications auto aux clients
6. ✅ Analytics de base fonctionnels

**Demo User Story** :
> "Je reçois un message WhatsApp d'un client. Le message apparaît dans mon inbox. Je crée la commande en 2 clics. Je drag & drop vers 'Preparing'. Le client reçoit automatiquement 'Commande en préparation'. Je vois mes stats du jour."

---

## 🚀 Phase 3 : Automatisation & Scale (Semaines 8-10)

**Objectif** : Restaurant automatise marketing et workflows

### Semaine 8 : Workflows

#### Workflow Engine (P1)
- [ ] Service workflow-engine
- [ ] Triggers (new_order, status_changed)
- [ ] Actions (send_message, wait)
- [ ] Conditions
- [ ] Queue Bull execution

**Estimation** : 3 jours  
**Validation** : Workflow simple fonctionne

#### Workflow Builder UI (P2)
- [ ] Canvas React Flow
- [ ] Node types (Trigger, Message, Wait, Condition)
- [ ] Connections
- [ ] Save workflow

**Estimation** : 2 jours  
**Validation** : Peut créer workflow visuellement

---

### Semaine 9 : Campagnes Marketing

#### Campagnes Messages Masse (P1)
- [ ] Créateur campagne (wizard)
- [ ] Segmentation audience
- [ ] Programmation envois
- [ ] Queue Bull rate-limited
- [ ] Stats temps réel

**Estimation** : 3 jours  
**Validation** : Campagne envoyée à 100+ contacts

#### Templates Workflows (P1)
- [ ] 5 templates pré-configurés
- [ ] Clone template
- [ ] Library templates

**Estimation** : 1 jour  
**Validation** : Templates utilisables

---

### Semaine 10 : Polish & Deploy

#### UI/UX Polish (P1)
- [ ] Animations (framer-motion)
- [ ] Loading states
- [ ] Error boundaries
- [ ] Empty states
- [ ] Responsive final

**Estimation** : 2 jours

#### Tests (P1)
- [ ] Tests unitaires services critiques
- [ ] Tests E2E Playwright (flow commande)
- [ ] Fix bugs trouvés

**Estimation** : 2 jours

#### Déploiement Production (P0)
- [ ] Setup Railway/Render
- [ ] Variables environnement
- [ ] Migrations DB production
- [ ] DNS configuration
- [ ] SSL certificates
- [ ] Monitoring setup

**Estimation** : 1 jour  
**Validation** : App accessible en production

---

### ✅ Checkpoint Phase 3

**Critères de Validation** :
1. ✅ Workflows automatiques actifs
2. ✅ Campagne marketing envoyée avec succès
3. ✅ Application déployée en production
4. ✅ Performance < 200ms API
5. ✅ Uptime 99%+

---

## 🔮 Phase 4+ : Features Futures (Post-Launch)

### Q2 2026

#### Paiements en Ligne (P1)
- [ ] Intégration Paymob/Fawry
- [ ] Flow paiement sécurisé
- [ ] Webhook confirmations
- [ ] Gestion refunds

**Estimation** : 1 semaine

#### Programme Fidélité (P2)
- [ ] Points par commande
- [ ] Niveaux VIP
- [ ] Récompenses automatiques
- [ ] Dashboard client

**Estimation** : 1 semaine

#### Multi-Restaurants (P1)
- [ ] Support plusieurs restaurants par compte
- [ ] Switch restaurant dans dashboard
- [ ] Analytics consolidées

**Estimation** : 1 semaine

---

### Q3 2026

#### App Mobile (P2)
- [ ] React Native app (iOS + Android)
- [ ] Menu browsing
- [ ] Commande in-app
- [ ] Notifications push

**Estimation** : 4 semaines

#### Intégrations CRM (P2)
- [ ] HubSpot
- [ ] Salesforce
- [ ] Pipedrive
- [ ] Sync bidirectionnel

**Estimation** : 2 semaines

#### Réservations Tables (P2)
- [ ] Système de réservation
- [ ] Calendrier disponibilités
- [ ] Confirmations auto
- [ ] Rappels

**Estimation** : 2 semaines

---

### Q4 2026

#### White-Label (P1)
- [ ] Branding complet personnalisé
- [ ] Domaine custom
- [ ] Emails custom
- [ ] Plan Enterprise

**Estimation** : 2 semaines

#### API Publique (P2)
- [ ] REST API documentée
- [ ] API Keys
- [ ] Rate limiting
- [ ] Webhooks sortants
- [ ] Developer portal

**Estimation** : 3 semaines

#### Gestion Inventaire (P2)
- [ ] Stock tracking
- [ ] Alertes stock bas
- [ ] Auto-disable items épuisés
- [ ] Prédictions IA

**Estimation** : 3 semaines

---

## 📊 Roadmap Visuelle

```
Phase 1 (Weeks 1-4) : MVP Core
├── Setup & Auth
├── Menu Public
├── Commande WhatsApp
└── Dashboard Menu
✅ LAUNCH MVP

Phase 2 (Weeks 5-7) : Operations
├── WhatsApp Integration
├── Inbox & Conversations
├── Gestion Commandes
└── Analytics
✅ OPERATIONAL

Phase 3 (Weeks 8-10) : Automation
├── Workflows
├── Campagnes
└── Deploy Production
✅ PRODUCTION READY

Phase 4+ (Post-Launch) : Scale
├── Q2: Payments, Loyalty, Multi-resto
├── Q3: Mobile App, CRM, Reservations
└── Q4: White-label, API, Inventory
```

---

## 🎯 Success Metrics

### Phase 1 Metrics
- [ ] 1 restaurant utilise le système
- [ ] 10+ commandes reçues via WhatsApp
- [ ] 0 bugs critiques

### Phase 2 Metrics
- [ ] 5 restaurants actifs
- [ ] 100+ commandes/semaine
- [ ] Temps réponse < 5 min

### Phase 3 Metrics
- [ ] 20 restaurants actifs
- [ ] 500+ commandes/semaine
- [ ] 1 campagne marketing envoyée
- [ ] Uptime 99%+

### Post-Launch (3 mois)
- [ ] 100 restaurants payants
- [ ] 5000+ commandes/mois
- [ ] MRR $5000+
- [ ] Churn < 5%

---

## 🚫 Out of Scope (MVP)

**NE PAS développer en Phase 1-3** :

### Features Complexes
- ❌ Intégrations CRM (HubSpot, Salesforce)
- ❌ App mobile native
- ❌ Paiements en ligne complets
- ❌ Programme fidélité avancé
- ❌ Réservations de tables
- ❌ Gestion inventaire automatique
- ❌ Prédictions IA demande
- ❌ White-label complet
- ❌ API publique
- ❌ Multi-langues au-delà AR/EN

### Optimisations Prématurées
- ❌ Microservices architecture
- ❌ Kubernetes deployment
- ❌ Multi-region deployment
- ❌ Advanced caching strategies
- ❌ Read replicas database

### Nice-to-Have UI
- ❌ Dark mode
- ❌ Animations avancées
- ❌ Customizable dashboard layouts
- ❌ Advanced data visualizations
- ❌ Drag-and-drop menu organization

---

## 🔄 Processus Itératif

### Weekly Review
Chaque vendredi :
1. **Demo** : Présenter features terminées
2. **Metrics** : Vérifier progress vs timeline
3. **Blockers** : Identifier obstacles
4. **Adjust** : Reprioriser si nécessaire

### Pivot Criteria
Pivoter si :
- 2 semaines de retard sur Phase 1
- Features P0 non fonctionnelles après 3 tentatives
- Feedback utilisateurs très négatif
- Contraintes techniques bloquantes

---

## ✅ Definition of Done

Une feature est "Done" quand :
- [ ] Code écrit et testé
- [ ] Code review passée
- [ ] Tests unitaires écrits
- [ ] Documentation mise à jour
- [ ] Déployé en staging
- [ ] Testé par QA/utilisateur
- [ ] Pas de bugs critiques
- [ ] Déployé en production

---

**Dernière mise à jour** : 11 janvier 2026  
**Version** : 1.0.0  
**Mainteneur** : [Votre Nom]
