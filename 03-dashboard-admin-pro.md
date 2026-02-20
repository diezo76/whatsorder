# 📊 PROMPT CURSOR : Dashboard Admin - Interface Pro

## 🎯 OBJECTIF PRINCIPAL
Créer un dashboard admin moderne, efficace et élégant pour les restaurateurs. Inspiration : Vercel Dashboard, Linear, Notion, Stripe Dashboard (data-driven + design premium).

---

## 🎨 DIRECTION ARTISTIQUE

### Mood Board
**Style** : Clean, Data-Driven, Professional, Efficient
**Inspiration** :
- Vercel Dashboard (sidebar, layouts, micro-interactions)
- Linear (keyboard shortcuts, command palette, animations fluides)
- Notion (flexibilité, organisation)
- Stripe Dashboard (clarté des données, graphiques élégants)
- Airtable (tableaux, filtres puissants)

### Palette de Couleurs
```css
/* Light Mode */
--bg-primary: #ffffff;
--bg-secondary: #fafafa;
--bg-tertiary: #f5f5f5;
--bg-hover: #f0f0f0;
--bg-active: #e8e8e8;

--border-subtle: #e5e5e5;
--border-default: #d4d4d4;
--border-strong: #a3a3a3;

--text-primary: #0a0a0a;
--text-secondary: #737373;
--text-tertiary: #a3a3a3;

--accent-blue: #3b82f6;
--accent-green: #10b981;
--accent-orange: #f97316;
--accent-red: #ef4444;
--accent-purple: #a855f7;

/* Dark Mode */
--dark-bg-primary: #0a0a0a;
--dark-bg-secondary: #1a1a1a;
--dark-bg-tertiary: #262626;
--dark-bg-hover: #2e2e2e;
--dark-bg-active: #3a3a3a;

--dark-border-subtle: #262626;
--dark-border-default: #404040;
--dark-border-strong: #525252;

--dark-text-primary: #fafafa;
--dark-text-secondary: #a3a3a3;
--dark-text-tertiary: #737373;
```

### Typographie
```css
/* Fonts */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-display: 'Cal Sans', 'Inter', sans-serif;

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Sizes */
--text-xs: 0.75rem;    /* 12px - metadata */
--text-sm: 0.875rem;   /* 14px - body */
--text-base: 1rem;     /* 16px - default */
--text-lg: 1.125rem;   /* 18px - titles */
--text-xl: 1.25rem;    /* 20px - headings */
--text-2xl: 1.5rem;    /* 24px - page titles */
```

---

## 📐 STRUCTURE DU DASHBOARD

### Layout Général
```
┌─────────────────────────────────────────────────────────┐
│ [Sidebar Left]        │  [Main Content]                 │
│                       │                                 │
│ Logo                  │  [Header Bar]                   │
│                       │  [Breadcrumb] [Search] [Profile]│
│ Navigation            │                                 │
│ ├ 📊 Dashboard        │  ─────────────────────────────  │
│ ├ 📦 Commandes        │                                 │
│ ├ 🍽️ Menu             │  [Content Area]                 │
│ ├ 👥 Clients          │                                 │
│ ├ 💬 Messages         │                                 │
│ ├ 📈 Analytics        │                                 │
│ ├ ⚙️ Paramètres       │                                 │
│ └ 👤 Mon Compte       │                                 │
│                       │                                 │
│ [Restaurant Switcher] │                                 │
│                       │                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 PAGE 1 : DASHBOARD (ACCUEIL)

### Header
```
┌──────────────────────────────────────────────────────────┐
│ Dashboard              [🔍 Recherche Cmd+K] [🔔(3)] [👤] │
│ Vue d'ensemble         ────────────────────              │
└──────────────────────────────────────────────────────────┘
```

### Section 1 : KPI Cards (4 colonnes)
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 📈 CA Jour  │ 📦 Commandes│ 👥 Clients  │ ⭐ Note Moy │
│             │             │             │             │
│  2 847€     │     42      │    156      │   4.8/5     │
│  +12% ↗️    │  +8% ↗️     │  +15% ↗️    │   ─         │
│             │             │             │             │
│ vs hier     │ vs hier     │ vs hier     │ 234 avis    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Design des Cards** :
- Background : --bg-secondary avec border subtle
- Hover : Lift légère + border accent
- Icon : Circle background avec couleur thématique
- Metric : Font-size 2xl, font-weight semibold
- Trend : Badge avec arrow (vert/rouge)
- Label : Text-sm, text-secondary

### Section 2 : Graphique CA (Large)
```
┌──────────────────────────────────────────────────────────┐
│ Chiffre d'Affaires                    [7j][30j][3m][1an]│
│                                                          │
│  [Line Chart - Gradient Fill]                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │        *    *                                       │ │
│  │      *   * *  *                                     │ │
│  │    *          *  *                                  │ │
│  │  *                *   *                             │ │
│  │                       *  *                          │ │
│  └────────────────────────────────────────────────────┘ │
│  Lun  Mar  Mer  Jeu  Ven  Sam  Dim                      │
│                                                          │
│  📊 15 247€ ce mois (+18% vs mois dernier)              │
└──────────────────────────────────────────────────────────┘
```

**Chart Config** :
- Library : Recharts ou Chart.js
- Colors : Gradient (accent-blue → accent-purple)
- Tooltip : Hover montre valeur exacte
- Responsive : Mobile = scroll horizontal
- Animation : Line draw on mount

### Section 3 : Grid 2 Colonnes

#### Colonne Gauche : Commandes Récentes
```
┌──────────────────────────────────────────────────────┐
│ Commandes Récentes                      [Voir tout →]│
├──────────────────────────────────────────────────────┤
│                                                      │
│ #12345  Pizza Napoli                        42,50€  │
│ 🕐 Il y a 5 min  👤 Marc Dubois  [En préparation]   │
│ ──────────────────────────────────────────────────── │
│                                                      │
│ #12344  Sushi Time                          58,90€  │
│ 🕐 Il y a 12 min  👤 Sarah Cohen     [Prêt]         │
│ ──────────────────────────────────────────────────── │
│                                                      │
│ #12343  Le Tajine                           35,20€  │
│ 🕐 Il y a 18 min  👤 Ahmed Benali [Livré]    ✅     │
│ ──────────────────────────────────────────────────── │
│                                                      │
│ #12342  Burger House                        28,40€  │
│ 🕐 Il y a 23 min  👤 Julie Martin [Livré]    ✅     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Design** :
- Hover row : Background hover + cursor pointer
- Status badge : Couleur selon statut
  - Nouveau : Orange
  - En préparation : Blue
  - Prêt : Green
  - Livré : Gray
  - Annulé : Red
- Click : Ouvre modale détails commande

#### Colonne Droite : Top Plats & Stats Rapides
```
┌──────────────────────────────────────────────────────┐
│ Top 5 Plats de la Semaine                           │
├──────────────────────────────────────────────────────┤
│ 1. [🍕] Pizza Margherita           89 ventes  🔥    │
│ 2. [🍔] Burger Classic              67 ventes       │
│ 3. [🍜] Pad Thaï                    54 ventes       │
│ 4. [🥗] Salade César                48 ventes       │
│ 5. [🍰] Tiramisu                    42 ventes       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Stats Rapides                                       │
├──────────────────────────────────────────────────────┤
│ ⏱️ Temps moyen préparation         18 min          │
│ 🚚 Temps moyen livraison           34 min          │
│ 💰 Panier moyen                    32,50€          │
│ 🔄 Taux de commandes répétées      68%             │
└──────────────────────────────────────────────────────┘
```

### Section 4 : Alertes & Notifications
```
┌──────────────────────────────────────────────────────┐
│ ⚠️ 3 commandes en attente depuis >20 min            │
│ 📦 Stock faible : Mozzarella (5 restants)           │
│ ⭐ Nouvel avis 5 étoiles de Marc Dubois             │
└──────────────────────────────────────────────────────┘
```

---

## 🎨 PAGE 2 : COMMANDES (KANBAN)

### Header avec Filtres
```
┌──────────────────────────────────────────────────────────┐
│ Commandes                [Aujourd'hui ▾] [Tous ▾] [Filtre]│
│                                                          │
│ [🔍 Recherche commande...] [+ Nouvelle Commande]         │
└──────────────────────────────────────────────────────────┘
```

### Kanban Board (Drag & Drop)
```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│ │ 🆕 Nouveau  │ │ 🍳 En Prép. │ │ ✅ Prêt      │ │ 🚚 Livré    │       │
│ │    (8)      │ │    (5)      │ │    (3)      │ │    (24)     │       │
│ ├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤       │
│ │             │ │             │ │             │ │             │       │
│ │ [Card]      │ │ [Card]      │ │ [Card]      │ │ [Card]      │       │
│ │ #12345      │ │ #12344      │ │ #12340      │ │ #12338      │       │
│ │ Marc Dubois │ │ Sarah Cohen │ │ Julie M.    │ │ Ahmed B.    │       │
│ │ 42,50€      │ │ 58,90€      │ │ 28,40€      │ │ 35,20€      │       │
│ │ 🕐 5 min    │ │ 🕐 12 min   │ │ 🕐 18 min   │ │ 🕐 1h       │       │
│ │             │ │             │ │             │ │             │       │
│ │ [Card]      │ │ [Card]      │ │ [Card]      │ │ [Card]      │       │
│ │ ...         │ │ ...         │ │ ...         │ │ ...         │       │
│ │             │ │             │ │             │ │             │       │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Design des Cards** :
```
┌───────────────────────────┐
│ #12345        [•••]       │ ← Menu actions
│                           │
│ 👤 Marc Dubois            │
│ 📞 +33 6 12 34 56 78      │
│                           │
│ 🍕 Pizza Margherita x2    │
│ 🥗 Salade César x1        │
│                           │
│ 💰 42,50€      🕐 5 min   │
│                           │
│ [Badge "Urgent"]          │ ← Si >20min
└───────────────────────────┘
```

**Interactions** :
- Drag & Drop entre colonnes (animation smooth)
- Hover : Lift + shadow
- Click card : Modale détails
- Menu ••• : Actions (Modifier, Imprimer, Annuler)
- Badge urgent : Rouge si >20min sans action

### Modal Détails Commande
```
┌───────────────────────────────────────────────────────┐
│ Commande #12345                                  [✕]  │
├───────────────────────────────────────────────────────┤
│                                                       │
│ [Timeline Status]                                     │
│ ● Reçue        19:32  ✅                              │
│ ● En préparation 19:35  ✅                            │
│ ○ Prête        ~19:50                                 │
│ ○ Livrée       ~20:05                                 │
│                                                       │
│ ─── CLIENT ───                                        │
│ 👤 Marc Dubois                                        │
│ 📞 +33 6 12 34 56 78                                  │
│ 📧 marc.dubois@email.com                              │
│ 📍 15 rue de Lyon, 75012 Paris                        │
│    Bât A, 3ème étage                                  │
│                                                       │
│ ─── ARTICLES ───                                      │
│ Pizza Margherita (Moyenne)              12,90€        │
│   + Extra fromage                        1,50€        │
│   Qté: 2                                25,80€        │
│                                                       │
│ Salade César                             8,90€        │
│   Sans croûtons                                       │
│   Qté: 1                                 8,90€        │
│                                                       │
│ Tiramisu                                 6,50€        │
│   Qté: 1                                 6,50€        │
│                                                       │
│ ─── PAIEMENT ───                                      │
│ Sous-total                              41,20€        │
│ Livraison                                2,90€        │
│ Code promo (PIZZA20)                    -5,00€        │
│ ─────────────                                         │
│ TOTAL                                   39,10€        │
│ Payé par CB (Visa ****4242)             ✅           │
│                                                       │
│ ─── NOTES ───                                         │
│ Client : "Bien cuite SVP"                             │
│ Staff : "Client régulier VIP"                         │
│                                                       │
│ [Imprimer Ticket] [Modifier] [Rembourser] [Annuler]  │
└───────────────────────────────────────────────────────┘
```

---

## 🎨 PAGE 3 : MENU (GESTION)

### Header
```
┌──────────────────────────────────────────────────────────┐
│ Menu                [Catégories ▾] [Disponibilité ▾]     │
│                                                          │
│ [🔍 Recherche plat...] [+ Ajouter un Plat]               │
└──────────────────────────────────────────────────────────┘
```

### Vue Tableau
```
┌────────────────────────────────────────────────────────────────────────┐
│ [Thumbnail] │ Nom            │ Catégorie │ Prix   │ Stock │ Actions  │
├────────────────────────────────────────────────────────────────────────┤
│ [🍕 img]    │ Pizza          │ Pizzas    │ 12,90€ │ ✅ Oui│ [Edit]   │
│             │ Margherita     │           │        │       │ [Delete] │
├────────────────────────────────────────────────────────────────────────┤
│ [🍔 img]    │ Burger Classic │ Burgers   │ 11,50€ │ ⚠️ 3  │ [Edit]   │
│             │                │           │        │       │ [Delete] │
├────────────────────────────────────────────────────────────────────────┤
│ [🥗 img]    │ Salade César   │ Salades   │  8,90€ │ ❌ Non│ [Edit]   │
│             │                │           │        │       │ [Delete] │
└────────────────────────────────────────────────────────────────────────┘
```

**Features** :
- Inline edit (double-click sur cellule)
- Drag to reorder (handle à gauche)
- Toggle disponibilité (switch rapide)
- Bulk actions (sélection multiple + actions en masse)
- Export CSV/Excel

### Modal Ajouter/Modifier Plat
```
┌───────────────────────────────────────────────────────┐
│ Ajouter un Plat                                  [✕]  │
├───────────────────────────────────────────────────────┤
│                                                       │
│ [Upload Image - Drag & Drop]                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │                                                 │   │
│ │     📷 Glisser une image ou cliquer            │   │
│ │        Formats: JPG, PNG (max 5MB)             │   │
│ │                                                 │   │
│ └─────────────────────────────────────────────────┘   │
│                                                       │
│ Nom du plat *                                         │
│ [Input]                                               │
│                                                       │
│ Description                                           │
│ [Textarea]                                            │
│                                                       │
│ Catégorie *                                           │
│ [Select : Pizzas, Burgers, Salades, Desserts...]     │
│                                                       │
│ Prix *                                                │
│ [Input number] €                                      │
│                                                       │
│ ─── VARIANTES (optionnel) ───                        │
│ ☑️ Petite  (+0€)                                      │
│ ☑️ Moyenne (+2€)                                      │
│ ☑️ Grande  (+4€)                                      │
│                                                       │
│ ─── OPTIONS (optionnel) ───                          │
│ [+ Ajouter un groupe d'options]                      │
│                                                       │
│ Groupe : Extras                                       │
│   ☐ Extra fromage   (+1,50€) [✕]                     │
│   ☐ Olives          (+1,00€) [✕]                     │
│   [+ Ajouter option]                                  │
│                                                       │
│ ─── DISPONIBILITÉ ───                                │
│ [Switch] En stock                                     │
│                                                       │
│ ─── TAGS ───                                         │
│ [Multi-select]                                        │
│ ☑️ 🌶️ Épicé  ☑️ 🌱 Végétarien  ☐ 🥜 Allergènes      │
│                                                       │
│ [Annuler]                      [Enregistrer]          │
└───────────────────────────────────────────────────────┘
```

---

## 🎨 PAGE 4 : CLIENTS (CRM)

### Vue Tableau
```
┌────────────────────────────────────────────────────────────────────────┐
│ [Avatar] │ Nom           │ Téléphone      │ Commandes │ Total │ VIP  │
├────────────────────────────────────────────────────────────────────────┤
│ [MD]     │ Marc Dubois   │ +33 6 12 ... │ 42        │ 1850€ │ ⭐   │
├────────────────────────────────────────────────────────────────────────┤
│ [SC]     │ Sarah Cohen   │ +33 6 23 ... │ 28        │ 1240€ │ ⭐   │
├────────────────────────────────────────────────────────────────────────┤
│ [JM]     │ Julie Martin  │ +33 6 34 ... │ 15        │  650€ │      │
└────────────────────────────────────────────────────────────────────────┘
```

**Click sur ligne → Modal Détails Client**

### Modal Détails Client
```
┌───────────────────────────────────────────────────────┐
│ [Avatar MD]  Marc Dubois                         [✕]  │
│              ⭐ Client VIP                            │
├───────────────────────────────────────────────────────┤
│                                                       │
│ 📞 +33 6 12 34 56 78                                  │
│ 📧 marc.dubois@email.com                              │
│ 📍 15 rue de Lyon, 75012 Paris                        │
│                                                       │
│ ─── STATISTIQUES ───                                  │
│ Total dépensé         1 850€                          │
│ Nombre de commandes   42                              │
│ Panier moyen          44,05€                          │
│ Dernière commande     Hier (18/02)                    │
│ Client depuis         12/08/2025                      │
│                                                       │
│ ─── PLAT PRÉFÉRÉ ───                                 │
│ 🍕 Pizza Margherita (18 fois commandée)              │
│                                                       │
│ ─── HISTORIQUE COMMANDES ───                         │
│ [Liste scrollable avec 10 dernières]                 │
│ #12345  18/02/2026  42,50€  ✅ Livrée                │
│ #12301  15/02/2026  38,90€  ✅ Livrée                │
│ #12256  12/02/2026  46,20€  ✅ Livrée                │
│ ...                                                   │
│                                                       │
│ ─── NOTES INTERNES ───                               │
│ [Textarea]                                            │
│ "Client régulier, toujours bien cuite"               │
│                                                       │
│ [📧 Envoyer Message] [🎁 Offrir Promo] [Modifier]    │
└───────────────────────────────────────────────────────┘
```

---

## 🎨 PAGE 5 : ANALYTICS

### KPIs Top (6 cards)
```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ CA Mois  │ Commandes│ Clients  │ Panier   │ Taux     │ Note     │
│          │          │ Actifs   │ Moyen    │ Retour   │ Moyenne  │
│ 45 680€  │  1 245   │   487    │  36,70€  │   68%    │  4.8/5   │
│ +15% ↗️  │  +12% ↗️ │  +23% ↗️ │  +5% ↗️  │  +3% ↗️  │    ─     │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Graphiques (2 colonnes)
```
┌──────────────────────────────┬──────────────────────────────┐
│ CA par Jour (Line Chart)     │ Commandes/Heure (Bar Chart)  │
│                              │                              │
│ [Graph]                      │ [Graph]                      │
│                              │                              │
├──────────────────────────────┴──────────────────────────────┤
│ Top Plats (Horizontal Bar)   │ Moyens Paiement (Pie Chart)  │
│                              │                              │
│ [Graph]                      │ [Graph]                      │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

### Tableaux Détaillés
```
─── TOP 10 PLATS ───
┌────────────────────────────────────────────────────┐
│ Plat               │ Ventes │ CA      │ Part      │
├────────────────────────────────────────────────────┤
│ Pizza Margherita   │ 245    │ 3160€   │ 18%       │
│ Burger Classic     │ 189    │ 2173€   │ 12%       │
└────────────────────────────────────────────────────┘

─── PERFORMANCE PAR JOUR ───
[Tableau avec CA, commandes, panier moyen par jour]

─── FIDÉLITÉ CLIENT ───
[Segments: Nouveaux, Occasionnels, Réguliers, VIP]
```

---

## 🎨 PAGE 6 : PARAMÈTRES

### Navigation Onglets
```
[Général] [Horaires] [Livraison] [Paiements] [Notifications] [Équipe]
─────────
```

#### Onglet Général
```
┌───────────────────────────────────────────────────────┐
│ Logo Restaurant                                       │
│ [Upload Image]                                        │
│                                                       │
│ Nom du Restaurant *                                   │
│ [Input]                                               │
│                                                       │
│ Description                                           │
│ [Textarea]                                            │
│                                                       │
│ Adresse *                                             │
│ [Input avec autocomplete]                             │
│                                                       │
│ Téléphone *                                           │
│ [Input]                                               │
│                                                       │
│ Email                                                 │
│ [Input]                                               │
│                                                       │
│ Site Web                                              │
│ [Input]                                               │
│                                                       │
│ [Switch] Mode Occupé                                  │
│ Désactiver temporairement les nouvelles commandes    │
│                                                       │
│ [Annuler]                      [Enregistrer]          │
└───────────────────────────────────────────────────────┘
```

---

## 🎬 ANIMATIONS & MICRO-INTERACTIONS

### Navigation
- Hover sidebar item : Background + border left accent
- Active page : Bold + accent color + border left
- Page transition : Fade in content
- Breadcrumb : Chevron animation

### Boutons
- Hover : Scale 1.02 + shadow
- Active : Scale 0.98
- Loading : Spinner animation
- Success : Checkmark animation

### Modales
- Enter : Scale 0.95 → 1 + fade backdrop
- Exit : Scale 1 → 0.95 + fade out
- Backdrop : Blur 8px

### Drag & Drop (Kanban)
- Pickup : Card lifts + rotate 2deg
- Drag : Shadow trail
- Hover column : Border glow
- Drop : Smooth slide into place

### Toasts
- Enter : Slide in from top right
- Exit : Slide out to right + fade
- Progress bar : Width animation

### Tableaux
- Hover row : Background hover
- Sort : Column header arrow rotate
- Filter : Badge count animation

---

## 📱 RESPONSIVE

### Desktop (>1280px)
- Sidebar : 240px fixed
- Content : Flex grow
- Modales : 600-800px width centered

### Tablet (768-1280px)
- Sidebar : Collapsible (icons only)
- Content : Full width
- Kanban : Scroll horizontal

### Mobile (<768px)
- Sidebar : Hidden (hamburger menu)
- Bottom nav : 5 icons
- Kanban : Stack vertical
- Modales : Fullscreen

---

## 🎨 COMPOSANTS CLÉS

### 1. Sidebar
```typescript
// src/components/dashboard/Sidebar.tsx
- Logo + restaurant switcher
- Navigation items avec icons
- Active state
- Collapse/expand
- Dark mode toggle
```

### 2. KPI Card
```typescript
// src/components/dashboard/KPICard.tsx
interface KPICardProps {
  title: string;
  value: string | number;
  trend?: { value: number; direction: 'up' | 'down' };
  icon: React.ReactNode;
  color: string;
}
```

### 3. OrderCard (Kanban)
```typescript
// src/components/orders/OrderCard.tsx
- Draggable
- Badge statut
- Menu actions
- Click → modal
```

### 4. DataTable
```typescript
// src/components/common/DataTable.tsx
- Sortable columns
- Filterable
- Pagination
- Row selection
- Inline edit
```

### 5. CommandPalette
```typescript
// src/components/dashboard/CommandPalette.tsx
- Cmd+K trigger
- Recherche globale
- Navigation rapide
- Actions rapides
```

---

## 🛠️ TECHNOLOGIES

### Core
- Next.js 14 App Router
- TypeScript strict
- Tailwind CSS
- Zustand (global state)

### UI
- Framer Motion (animations)
- Radix UI (primitives)
- Recharts (graphiques)
- React DnD ou dnd-kit (Kanban)

### Data
- React Query (fetching, cache)
- Socket.io (real-time)
- Zod (validation)

### Utils
- date-fns (dates)
- numeral (nombres)
- clsx (classnames)

---

## 🚀 PROMPT CURSOR FINAL

```
Tu es un expert en design d'interfaces admin et développement React. Je veux créer un dashboard restaurant moderne, efficace et élégant.

🎯 OBJECTIF
Dashboard admin avec :
1. Vue d'ensemble (KPIs, graphiques, récents)
2. Kanban commandes (drag & drop)
3. Gestion menu (CRUD)
4. CRM clients (historique, stats)
5. Analytics avancé (graphiques, tableaux)
6. Paramètres restaurant

🎨 DESIGN
- Style : Vercel + Linear (minimaliste, efficace)
- Colors : Neutres + accents (blue, green, orange, red)
- Sidebar fixe gauche + content area
- Dark mode ready
- Micro-interactions partout

📦 STACK
- Next.js 14 App Router
- TypeScript strict
- Tailwind CSS
- Framer Motion
- Recharts (graphs)
- dnd-kit (Kanban)
- React Query

🚀 COMMENCE PAR
1. Layout (Sidebar + Header + Content)
2. Page Dashboard (KPIs + graphs)
3. Page Kanban (drag & drop)

Code propre, commenté, performant, accessible.
Let's build an amazing admin experience! 🚀✨
```

---

## ✅ CHECKLIST FINALE

### Design
- [ ] Cohérence visuelle (colors, spacing, typography)
- [ ] Dark mode complet
- [ ] Micro-interactions everywhere
- [ ] Loading states
- [ ] Empty states
- [ ] Error states

### UX
- [ ] Navigation claire (sidebar, breadcrumb)
- [ ] Raccourcis clavier (Cmd+K, etc.)
- [ ] Feedback visuel immédiat
- [ ] Undo/redo où pertinent
- [ ] Bulk actions (sélection multiple)

### Performance
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Images optimisées
- [ ] React Query caching
- [ ] Debounce search/filters

### Data
- [ ] Real-time updates (Socket.io)
- [ ] Optimistic UI
- [ ] Error handling
- [ ] Retry logic

### Accessibilité
- [ ] Keyboard navigation
- [ ] Screen reader friendly
- [ ] Focus visible
- [ ] ARIA labels

**Résultat : Dashboard admin premium niveau Vercel/Linear ! 🎨✨**
