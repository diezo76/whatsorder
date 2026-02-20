# 🍽️ PROMPT CURSOR : Site Restaurant Client - UX Premium

## 🎯 OBJECTIF PRINCIPAL
Créer une expérience de commande en ligne fluide, intuitive et délicieuse pour les clients des restaurants utilisant Whataybo. Inspiration : Uber Eats + Deliveroo + Apple Store (simplicité et élégance).

---

## 🎨 DIRECTION ARTISTIQUE

### Mood Board
**Style** : Clean, Appétissant, Rapide, Mobile-First
**Inspiration** :
- Uber Eats (navigation simple, cards appétissantes)
- Deliveroo (filtres, recherche efficace)
- Apple Store (checkout fluide, micro-interactions)
- Just Eat (social proof, reviews)

### Palette de Couleurs (Adaptable par Restaurant)
```css
/* Couleurs Principales (Variables dynamiques) */
--restaurant-primary: #ff6b35 (Orange appétissant - par défaut)
--restaurant-secondary: #004e89 (Bleu confiance)

/* Couleurs Système */
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6

/* Neutres */
--bg-main: #ffffff
--bg-subtle: #fafafa
--bg-hover: #f5f5f5
--border: #e5e7eb
--text-primary: #1a1a1a
--text-secondary: #666666
--text-muted: #999999
```

### Typographie
```css
/* Fonts */
--font-heading: 'DM Sans', sans-serif;
--font-body: 'Inter', sans-serif;
--font-price: 'JetBrains Mono', monospace;

/* Échelle */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
```

---

## 📐 STRUCTURE DU SITE CLIENT

### Page 1 : Page d'Accueil Restaurant
**URL** : `/restaurant/[slug]` (ex: `/restaurant/pizza-napoli`)

#### Header Sticky
```
┌─────────────────────────────────────────────┐
│ [←] [Logo Restaurant]     🔍 [Panier(3)] 🌙│
└─────────────────────────────────────────────┘
```

**Éléments** :
- Bouton retour (si navigation depuis liste restos)
- Logo + nom restaurant (cliquable → scroll top)
- Icône recherche (ouvre search overlay)
- Badge panier avec nombre d'items
- Toggle dark mode

#### Hero Restaurant
```
┌─────────────────────────────────────────────┐
│                                             │
│  [Photo Couverture - Gradient Overlay]     │
│                                             │
│  [Avatar Logo]  Pizza Napoli               │
│                 ⭐ 4.8 (234 avis)           │
│                 🍕 Italien · Pizza          │
│                 📍 15 rue de Lyon, Paris    │
│                 🕐 Ouvert · Livraison 30min │
│                                             │
│  [❤️ Favori]  [📤 Partager]  [ℹ️ Info]     │
└─────────────────────────────────────────────┘
```

**Animations** :
- Image : Ken Burns zoom
- Avatar : Slide up + fade in
- Badges : Stagger appear

#### Navigation Catégories (Sticky sous header)
```
┌─────────────────────────────────────────────┐
│ 🔥 Populaire  🍕 Pizzas  🥗 Salades  🍰 Desserts │
│ ──────────                                  │
└─────────────────────────────────────────────┘
```

**Features** :
- Scroll horizontal mobile
- Active state avec underline animé
- Auto-scroll au clic (smooth)
- Highlight section en vue

#### Section Promo / Offres (Optionnel)
```
┌─────────────────────────────────────────────┐
│ 🎉 OFFRE SPÉCIALE                           │
│ -20% sur toutes les pizzas jusqu'à minuit  │
│ Code : PIZZA20          [Commander]        │
└─────────────────────────────────────────────┘
```

#### Sections Menu (Par Catégorie)
```
─── 🔥 LES PLUS POPULAIRES ───

[Grid 2 colonnes mobile, 3-4 desktop]

┌─────────────────┐ ┌─────────────────┐
│ [Image Plat]    │ │ [Image Plat]    │
│                 │ │                 │
│ Pizza Margherita│ │ Pizza 4 Fromages│
│ Tomate, mozza.. │ │ 4 fromages ita..│
│                 │ │                 │
│ 12,90€  [+]     │ │ 14,90€  [+]     │
│ ⭐ 4.9 (89)     │ │ ⭐ 4.7 (56)     │
└─────────────────┘ └─────────────────┘

─── 🍕 PIZZAS CLASSIQUES ───
[Même structure]

─── 🥗 SALADES ───
[Même structure]
```

**Design des Cards** :
```
┌─────────────────────────────┐
│                             │
│  [Image 16:9 - rounded]     │
│  [Badge "🔥 Populaire"]     │
│                             │
│  Pizza Margherita           │
│  Tomate, mozzarella,        │
│  basilic frais              │
│                             │
│  12,90€         [Bouton +]  │
│  ⭐ 4.9 (89 avis)           │
│                             │
│  🌶️ Épicé  🌱 Végétarien    │
└─────────────────────────────┘
```

**Hover Effects** :
- Image : Zoom léger (scale 1.05)
- Card : Lift + shadow
- Bouton + : Scale + color change

#### Footer
```
[Infos Restaurant]
📍 Adresse
📞 Téléphone
⏰ Horaires
🌐 Site web
📱 Réseaux sociaux

[Links]
Mentions légales
CGU
Contact
```

---

### Page 2 : Détail Plat (Modal ou Page)
**Trigger** : Clic sur card plat

**Design** : Modal fullscreen mobile, centered modal desktop

```
┌───────────────────────────────────────┐
│ [✕]                                   │
│                                       │
│ [Grande Image Plat]                   │
│                                       │
│ Pizza Margherita            ⭐ 4.9    │
│                                       │
│ Tomate San Marzano, mozzarella       │
│ di Bufala, basilic frais, huile      │
│ d'olive extra vierge                  │
│                                       │
│ 🌶️ Épicé  🌱 Végétarien  🏷️ Sans gluten│
│                                       │
│ ─── PERSONNALISEZ ───                │
│                                       │
│ Taille                                │
│ ○ Petite (+0€)                        │
│ ● Moyenne (+2€)                       │
│ ○ Grande (+4€)                        │
│                                       │
│ Options                               │
│ ☑️ Extra fromage (+1,50€)             │
│ ☐ Olives noires (+1€)                │
│ ☐ Champignons (+1€)                  │
│ ☐ Jambon (+2€)                       │
│                                       │
│ Instructions spéciales (optionnel)    │
│ [Textarea]                            │
│ Ex: Bien cuite, sans oignon...        │
│                                       │
│ ─── QUANTITÉ ───                     │
│ [ - ]  2  [ + ]                       │
│                                       │
│ [Ajouter au panier - 27,80€]         │
└───────────────────────────────────────┘
```

**Animations** :
- Modal : Slide up + backdrop blur
- Options : Checkbox avec checkmark animé
- Quantity : Number scale animation
- Bouton : Ripple effect

**Validations** :
- Taille obligatoire (highlight si pas sélectionné)
- Max caractères instructions (200)
- Update prix en temps réel

---

### Page 3 : Panier (Sidebar ou Page)
**Trigger** : Clic sur icône panier

**Design** : Sidebar right mobile/desktop, ou page dédiée

```
┌─────────────────────────────────────┐
│ MON PANIER (3 articles)        [✕]  │
├─────────────────────────────────────┤
│                                     │
│ [Thumbnail] Pizza Margherita        │
│             Moyenne, Extra fromage  │
│             [ - ] 2 [ + ]   25,80€  │
│             🗑️ Supprimer            │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ [Thumbnail] Salade César            │
│             [ - ] 1 [ + ]    8,90€  │
│             🗑️ Supprimer            │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ [Thumbnail] Tiramisu                │
│             [ - ] 1 [ + ]    6,50€  │
│             🗑️ Supprimer            │
│                                     │
├─────────────────────────────────────┤
│ Code promo                          │
│ [Input] [Appliquer]                 │
│ ✅ -5€ avec PIZZA20                 │
├─────────────────────────────────────┤
│ Sous-total            41,20€        │
│ Livraison              2,90€        │
│ Réduction             -5,00€        │
│ ─────────────────────────           │
│ TOTAL                 39,10€        │
├─────────────────────────────────────┤
│ [Commander - 39,10€]                │
│                                     │
│ 🔒 Paiement sécurisé                │
│ 🚚 Livraison estimée : 30-40 min   │
└─────────────────────────────────────┘
```

**Features** :
- Update quantité → prix temps réel
- Animation suppression (slide out)
- Empty state si panier vide
- Minimum commande (ex: 15€)
- Scroll si beaucoup d'items

---

### Page 4 : Checkout (Multi-étapes)
**URL** : `/checkout`

#### Step 1 : Informations Livraison
```
┌─────────────────────────────────────┐
│ ✅ Panier  →  ● Livraison  →  ○ Paiement│
├─────────────────────────────────────┤
│ VOS INFORMATIONS                    │
│                                     │
│ Prénom *                            │
│ [Input]                             │
│                                     │
│ Nom *                               │
│ [Input]                             │
│                                     │
│ Téléphone *                         │
│ [Input] +33                         │
│                                     │
│ Email                               │
│ [Input]                             │
│                                     │
│ ADRESSE DE LIVRAISON                │
│                                     │
│ [📍 Utiliser ma position]           │
│                                     │
│ Adresse *                           │
│ [Input avec autocomplete Google]    │
│                                     │
│ Complément (Bât, Étage, Code)       │
│ [Input]                             │
│                                     │
│ Instructions pour le livreur        │
│ [Textarea]                          │
│                                     │
│ HEURE DE LIVRAISON                  │
│ ● Dès que possible (30-40 min)     │
│ ○ Programmer [Date] [Heure]         │
│                                     │
│ [Continuer vers le paiement]        │
└─────────────────────────────────────┘
```

**Validations** :
- Champs requis * (highlight rouge si vide)
- Format téléphone (regex)
- Email valide
- Adresse dans zone de livraison (vérif backend)

#### Step 2 : Paiement
```
┌─────────────────────────────────────┐
│ ✅ Livraison  →  ● Paiement  →  ○ Confirmation│
├─────────────────────────────────────┤
│ MOYEN DE PAIEMENT                   │
│                                     │
│ ○ Carte Bancaire                    │
│   [💳 Icônes CB, Visa, Mastercard]  │
│                                     │
│ ○ PayPal                            │
│   [PayPal logo]                     │
│                                     │
│ ○ Espèces à la livraison            │
│   💰 Préparez l'appoint SVP         │
│                                     │
│ [Si Carte sélectionnée]             │
│ ┌─────────────────────────────────┐ │
│ │ Numéro de carte                 │ │
│ │ [Stripe Element]                │ │
│ │                                 │ │
│ │ Date expiration    CVC          │ │
│ │ [MM/YY]           [***]         │ │
│ │                                 │ │
│ │ 🔒 Paiement sécurisé par Stripe │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ☑️ J'accepte les CGU                │
│                                     │
│ [Payer 39,10€]                      │
│                                     │
│ 🔒 Transaction sécurisée SSL        │
└─────────────────────────────────────┘
```

**Features** :
- Stripe Elements (iframe sécurisé)
- PayPal SDK (bouton smart)
- Validation temps réel
- Loader pendant traitement
- Error handling (carte refusée, etc.)

#### Step 3 : Confirmation
```
┌─────────────────────────────────────┐
│ ✅ Commande Confirmée !             │
├─────────────────────────────────────┤
│ [Animation confetti]                │
│ [Icône check vert animé]            │
│                                     │
│ Merci pour votre commande !         │
│                                     │
│ Commande #12345                     │
│ 📅 18 février 2026, 19:32           │
│                                     │
│ 🚚 Livraison estimée                │
│ 20h00 - 20h10                       │
│                                     │
│ [Tracker de statut]                 │
│ ● Confirmée                         │
│ ○ En préparation                    │
│ ○ En livraison                      │
│ ○ Livrée                            │
│                                     │
│ ─── DÉTAILS ───                    │
│ Pizza Margherita x2  25,80€         │
│ Salade César x1       8,90€         │
│ Tiramisu x1           6,50€         │
│ Livraison             2,90€         │
│ Réduction            -5,00€         │
│ ─────────────                       │
│ TOTAL                39,10€         │
│ Payé par CB                         │
│                                     │
│ Livraison à :                       │
│ Marc Dubois                         │
│ 15 rue de Lyon, 75012 Paris         │
│ Bât A, 3ème étage                   │
│                                     │
│ [Télécharger le reçu PDF]           │
│ [Suivre ma commande]                │
│ [Retour à l'accueil]                │
└─────────────────────────────────────┘
```

**Animations** :
- Confetti explosion
- Check animé (draw SVG)
- Tracker : progress bar animée

---

### Page 5 : Suivi Commande (Temps Réel)
**URL** : `/order/[id]` ou `/track/[orderNumber]`

```
┌─────────────────────────────────────┐
│ Commande #12345                [✕]  │
├─────────────────────────────────────┤
│                                     │
│ [Lottie animation cooking]          │
│                                     │
│ 🍕 Votre pizza est en préparation ! │
│                                     │
│ Temps estimé : 15 minutes           │
│ [Progress bar animée]               │
│                                     │
│ ─── STATUT EN TEMPS RÉEL ───       │
│                                     │
│ ✅ Confirmée              19:32     │
│ ✅ En préparation         19:35     │
│ 🔄 En livraison          ~19:50     │
│ ⏳ Livrée                ~20:05     │
│                                     │
│ [Carte avec localisation livreur]   │
│ 📍 À 5 minutes de chez vous         │
│                                     │
│ ─── LIVREUR ───                    │
│ [Avatar] Jean-Marc                  │
│          ⭐ 4.9 (234 livraisons)    │
│          🏍️ Scooter                 │
│          [📞 Appeler] [💬 Message]  │
│                                     │
│ ─── BESOIN D'AIDE ? ───            │
│ [Contacter le restaurant]           │
│ [Signaler un problème]              │
│ [Annuler la commande]               │
└─────────────────────────────────────┘
```

**Features** :
- WebSocket pour updates temps réel
- Notifications push (si PWA)
- Carte Google Maps (si API disponible)
- Fallback : refresh auto toutes les 30s

---

### Page 6 : Historique Commandes (Compte Client)
**URL** : `/account/orders`

```
┌─────────────────────────────────────┐
│ [Avatar] Bonjour Marc !        [⚙️] │
├─────────────────────────────────────┤
│ 📦 Mes Commandes                    │
├─────────────────────────────────────┤
│                                     │
│ [Card Commande]                     │
│ ┌─────────────────────────────────┐ │
│ │ Pizza Napoli         18/02/2026 │ │
│ │ Commande #12345                 │ │
│ │ 3 articles · 39,10€             │ │
│ │ ✅ Livrée à 20:05               │ │
│ │                                 │ │
│ │ [Voir détails] [Commander à nouveau]│ │
│ │ [⭐ Noter & Commenter]          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Card Commande]                     │
│ ┌─────────────────────────────────┐ │
│ │ Sushi Time           15/02/2026 │ │
│ │ Commande #12301                 │ │
│ │ 5 articles · 52,40€             │ │
│ │ ✅ Livrée à 19:23               │ │
│ │ ⭐⭐⭐⭐⭐ "Excellent !"          │ │
│ │                                 │ │
│ │ [Voir détails] [Commander à nouveau]│ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Pagination]                        │
│ ← 1 2 3 ... 10 →                    │
└─────────────────────────────────────┘
```

---

## 🎬 ANIMATIONS & MICRO-INTERACTIONS

### Ajout au Panier
```javascript
// Animation bouton +
1. Ripple effect sur bouton
2. Item "vole" vers icône panier (arc animation)
3. Badge panier pulse + increment number
4. Toast success : "Ajouté au panier ✓"
```

### Changement Quantité
```javascript
// - ou +
1. Number scale out (old)
2. Number scale in (new)
3. Prix update avec fade
4. Micro haptic feedback (mobile)
```

### Suppression Item Panier
```javascript
1. Swipe left révèle bouton supprimer (mobile)
2. Confirmation dialog (si >10€)
3. Item slide out left + fade
4. Items restants slide up (fill gap)
5. Recalcul total animé
```

### Navigation Catégories
```javascript
// Scroll
- Active category : underline slide animation
- Highlight section : fade border left (desktop)
- Auto-scroll smooth to section
```

### Loading States
```javascript
// Checkout
- Button : Spinner + "Traitement..."
- Disable inputs pendant process
- Skeleton screens si data loading
```

---

## 📱 RESPONSIVE DESIGN

### Mobile First (<640px)
- Cards : 1 colonne, pleine largeur
- Panier : Fullscreen overlay (slide up)
- Checkout : 1 step par page
- Nav catégories : Scroll horizontal
- Hero : Images aspect ratio 16:9

### Tablet (640-1024px)
- Cards : 2 colonnes
- Panier : Sidebar right (60% largeur)
- Checkout : Formulaire centré (max-width 600px)

### Desktop (>1024px)
- Cards : 3-4 colonnes
- Panier : Sidebar right (400px fixe)
- Checkout : 2 colonnes (form left, résumé right sticky)
- Hover states actifs

---

## 🎨 COMPOSANTS CLÉS

### 1. MenuItemCard
```typescript
// src/components/restaurant/MenuItemCard.tsx
interface MenuItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  tags: string[]; // ["🌶️ Épicé", "🌱 Végétarien"]
  isPopular?: boolean;
  onAddToCart: () => void;
}
```

### 2. CartSidebar
```typescript
// src/components/cart/CartSidebar.tsx
- Liste items avec quantity controls
- Code promo form
- Summary (subtotal, delivery, discount, total)
- CTA checkout
- Empty state
```

### 3. ItemCustomizationModal
```typescript
// src/components/restaurant/ItemCustomizationModal.tsx
- Radio groups (taille)
- Checkboxes (options)
- Textarea (instructions)
- Quantity control
- Dynamic price update
```

### 4. OrderTracker
```typescript
// src/components/order/OrderTracker.tsx
- Status steps with icons
- Progress bar
- Timestamps
- Animation transitions
```

### 5. AddressAutocomplete
```typescript
// src/components/checkout/AddressAutocomplete.tsx
- Google Places Autocomplete
- Validation zone livraison
- Format adresse
```

---

## 🛠️ TECHNOLOGIES

### Core
- **Next.js 14** (App Router recommandé)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (state panier)

### UI/UX
- **Framer Motion** (animations)
- **Radix UI** (Dialog, RadioGroup, Checkbox)
- **React Hook Form** (formulaires)
- **Zod** (validation)

### Paiement
- **Stripe Elements** (cartes)
- **PayPal SDK** (PayPal)

### Maps & Location
- **Google Maps API** (tracking livreur)
- **Google Places API** (autocomplete adresse)

### Real-time
- **Socket.io Client** (updates statut)
- **React Query** (cache + refetch)

---

## 🚀 PLAN D'IMPLÉMENTATION

### Phase 1 : Pages Statiques (3h)
- Layout + Header + Footer
- Page restaurant (sans interactivité)
- Cards menu items
- Responsive

### Phase 2 : Panier & State (2h)
- Zustand store (cart)
- Add/Remove/Update items
- Sidebar panier
- Persistance localStorage

### Phase 3 : Modal Item (2h)
- Modal customization
- Options + variants
- Validation
- Add to cart

### Phase 4 : Checkout (4h)
- Multi-step form
- Address autocomplete
- Validation
- Stripe integration
- PayPal integration

### Phase 5 : Confirmation & Suivi (2h)
- Page confirmation
- Order tracker
- Real-time updates (Socket.io)

### Phase 6 : Compte Client (2h)
- Historique commandes
- Favoris
- Adresses enregistrées

**Total : ~15h de dev**

---

## ✅ CHECKLIST FINALE

### UX
- [ ] Navigation intuitive (3 clics max → checkout)
- [ ] Feedback visuel sur chaque action
- [ ] Error states clairs
- [ ] Loading states partout
- [ ] Empty states engageants
- [ ] Micro-interactions délicieuses

### Performance
- [ ] Images optimisées (next/image)
- [ ] Lazy loading (below fold)
- [ ] Code splitting (dynamic imports)
- [ ] Lighthouse Performance 90+

### Mobile
- [ ] Touch targets 44x44px min
- [ ] Swipe gestures (panier)
- [ ] Scroll momentum
- [ ] PWA ready (manifest + SW)

### Conversion
- [ ] CTA visible et clair
- [ ] Panier accessible partout
- [ ] Checkout rapide (<2 min)
- [ ] Paiement sécurisé (badges confiance)
- [ ] Social proof (avis)

### Accessibilité
- [ ] Keyboard navigation
- [ ] Screen reader friendly
- [ ] Contraste AA
- [ ] Focus visible

---

## 🎯 PROMPT CURSOR FINAL

```
Tu es un expert en UX e-commerce et développement React. Je veux créer une expérience de commande restaurant fluide, moderne et convertissante.

🎯 OBJECTIF
Site client pour restaurant avec :
1. Page menu avec cards appétissantes
2. Modal customization (variants, options)
3. Panier sidebar avec animations
4. Checkout multi-étapes fluide
5. Suivi commande temps réel

🎨 DESIGN
- Style : Uber Eats meets Apple Store
- Mobile-first, animations Framer Motion
- Couleurs : Orange primary (#ff6b35), neutres clairs
- Cards : Images 16:9, hover lift, badges

📦 STACK
- Next.js 14 App Router
- TypeScript strict
- Tailwind CSS
- Zustand (cart state)
- Framer Motion (animations)
- Stripe Elements (paiement)
- Socket.io (real-time)

🚀 COMMENCE PAR
1. Layout + Header sticky avec panier badge
2. Page restaurant avec grid cards
3. Modal item avec customization
4. Cart sidebar avec animations

Code propre, commenté, accessible. Let's go ! 🍕✨
```
