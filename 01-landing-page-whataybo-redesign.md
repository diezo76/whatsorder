# 🚀 PROMPT CURSOR : Landing Page Whataybo - Redesign Complet

## 🎯 OBJECTIF PRINCIPAL
Transformer la landing page Whataybo en une vitrine ultra-moderne, élégante et convertissante, inspirée des meilleures pratiques 2026 (Vercel, Linear, Stripe).

---

## 🎨 DIRECTION ARTISTIQUE

### Mood Board
**Style** : Minimaliste Premium + Moderne + Professionnel
**Inspiration** : 
- Vercel (simplicité, espacements généreux)
- Linear (animations fluides, typographie élégante)
- Stripe (clarté, hiérarchie visuelle)
- Apple (attention aux détails)

### Palette de Couleurs
```css
/* Couleurs Principales */
--primary: #6366f1 (Indigo vibrant)
--primary-dark: #4f46e5
--primary-light: #818cf8

/* Couleurs Secondaires */
--secondary: #10b981 (Vert succès)
--accent: #f59e0b (Orange pour CTAs importants)

/* Neutres */
--background: #ffffff
--surface: #f9fafb
--surface-dark: #f3f4f6
--border: #e5e7eb
--text-primary: #111827
--text-secondary: #6b7280
--text-muted: #9ca3af

/* Dark Mode */
--dark-bg: #0a0a0a
--dark-surface: #1a1a1a
--dark-border: #2a2a2a
--dark-text: #fafafa
```

### Typographie
```css
/* Fonts */
--font-display: 'Cal Sans', 'Inter', sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Échelle */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
--text-7xl: 4.5rem;    /* 72px */
```

---

## 📐 STRUCTURE DE LA PAGE

### Section 1 : Hero (Au-dessus de la ligne de flottaison)
**Objectif** : Capter l'attention en 3 secondes, expliquer la value proposition

**Contenu** :
```
[Navigation transparente en haut]
  Logo Whataybo | Features | Pricing | Blog | [CTA: Démarrer Gratuitement]

[Hero Principal - Centré]
  Badge animé: "🎉 Nouveau : IA Claude 3.5 Sonnet intégrée"
  
  Titre (text-7xl, gradient):
  "Gérez votre restaurant
   avec l'IA WhatsApp"
  
  Sous-titre (text-xl, text-muted):
  "Transformez vos messages WhatsApp en commandes automatiquement.
   Gagnez 5h par jour. Zéro formation nécessaire."
  
  [CTA Primaire] Essai Gratuit 14 Jours   [CTA Secondaire] Voir la Démo
  
  Texte trust: "✓ Aucune carte bancaire · ✓ 2 min setup · ✓ Support 24/7"

[Mockup Animé]
  - Interface dashboard en 3D (perspective)
  - Capture écran WhatsApp → Commande créée (animation)
  - Effet de profondeur (parallax au scroll)
```

**Animations** :
- Titre : Fade in + slide up (stagger letters)
- Badge : Pulse subtil
- Mockup : Float animation + shadow dynamique
- Background : Gradient mesh animé (subtil)

---

### Section 2 : Social Proof
**Objectif** : Crédibilité immédiate

```
[Logos Clients - Défilant]
  "Utilisé par 500+ restaurants en France"
  [Logos en grayscale : Pizza Hut, Sushi Shop, etc.]

[Statistiques - Grid 3 colonnes]
  📈 15M€               ⚡ 200K                🌟 4.9/5
  de CA généré         commandes gérées        sur Trustpilot
```

---

### Section 3 : Problème → Solution
**Objectif** : Resonance émotionnelle

```
[Titre centré]
"Marre de perdre des commandes
 à cause d'un téléphone qui sonne ?"

[Grid 2 colonnes - Avant/Après]

AVANT (fond rouge subtil, icône ❌)
  • Appels manqués pendant le rush
  • Erreurs de prise de commande
  • Clients qui raccrochent
  • Stress de l'équipe
  • Perte de CA

APRÈS (fond vert subtil, icône ✅)
  • WhatsApp toujours disponible
  • IA comprend et crée la commande
  • Clients satisfaits
  • Équipe concentrée sur la cuisine
  • +30% de commandes
```

---

### Section 4 : Fonctionnalités (Bento Grid)
**Objectif** : Montrer la richesse fonctionnelle visuellement

```
[Titre centré]
"Tout ce dont vous avez besoin.
 Rien de superflu."

[Bento Grid - 6 cartes avec animations au scroll]

┌─────────────┬─────────────┐
│   Card 1    │   Card 2    │
│ (2x height) │             │
├─────────────┼─────────────┤
│   Card 3    │   Card 4    │
│             │             │
├─────────────┴─────────────┤
│        Card 5 (full)      │
├─────────────┬─────────────┤
│   Card 6    │   Card 7    │
└─────────────┴─────────────┘

Card 1 (Large) : 🤖 IA WhatsApp
  - Animation : Message client → Commande créée
  - Screenshot animé
  - "Compréhension naturelle en français"

Card 2 : 📊 Dashboard Temps Réel
  - Mini graphique animé
  - Chiffres qui s'incrémentent
  - "Toutes vos stats en un coup d'œil"

Card 3 : 💳 Paiements Intégrés
  - Logos Stripe + PayPal
  - "Encaissez en ligne ou sur place"

Card 4 : 📱 Mobile-First
  - Preview iPhone + Android
  - "Application progressive (PWA)"

Card 5 (Full) : 🗂️ Kanban Intuitif
  - Screenshot du Kanban avec drag & drop
  - Animation de carte qui se déplace
  - "Gérez vos commandes visuellement"

Card 6 : 📈 Analytics Avancé
  - Mini dashboard avec courbes
  - "Prenez des décisions data-driven"

Card 7 : 🔔 Notifications Push
  - Illustration notification
  - "Soyez alerté instantanément"
```

**Design des Cartes** :
- Background : Glassmorphism (backdrop-blur)
- Border : 1px gradient subtil
- Hover : Scale légèrement + shadow accrue
- Transitions : Smooth (300ms ease)

---

### Section 5 : Démo Vidéo / Animation
**Objectif** : Montrer le produit en action

```
[Section fond sombre avec spotlight]

[Titre centré]
"Voyez Whataybo en action"

[Vidéo Interactive - Format Loom/Arcade]
  - Thumbnail avec play button
  - Au clic : Modal avec vidéo
  - Durée : 90 secondes
  - Contenu : 
    1. Client envoie message WhatsApp
    2. IA parse et crée commande (15s)
    3. Commande apparaît dans Kanban (5s)
    4. Staff change statut par drag & drop (10s)
    5. Client reçoit confirmation automatique (10s)
    6. Tableau analytics se met à jour (10s)
```

**Alternative si pas de vidéo** :
Animation interactive avec Lottie ou Rive

---

### Section 6 : Témoignages
**Objectif** : Preuve sociale authentique

```
[Titre centré]
"Ils ont transformé leur restaurant"

[Grid 3 colonnes - Cards témoignages]

Card Structure :
  ┌─────────────────────────┐
  │ ⭐⭐⭐⭐⭐               │
  │                         │
  │ "Citation impactante    │
  │  en 2-3 lignes max"     │
  │                         │
  │ [Photo]  Prénom Nom     │
  │          Restaurant X    │
  │          📍 Paris        │
  └─────────────────────────┘

Exemple Témoignages :
1. Marc Dubois - Pizza Napoli (Lyon)
   "On a doublé nos commandes en 3 mois. L'IA ne se trompe jamais."

2. Sarah Cohen - Sushi Time (Marseille)
   "Fini le stress du rush. WhatsApp gère tout automatiquement."

3. Ahmed Benali - Le Tajine d'Or (Toulouse)
   "Installation en 10 minutes. ROI en 2 semaines. Incroyable."
```

**Animations** :
- Cards : Fade in au scroll (stagger)
- Stars : Animation shimmer
- Hover : Lift + border glow

---

### Section 7 : Pricing (Simple & Transparent)
**Objectif** : Lever les objections prix

```
[Titre centré]
"Un tarif simple.
 Pas de frais cachés."

[Toggle : Mensuel / Annuel (20% de réduction)]

[Grid 3 colonnes - Plans]

┌─────────────┬─────────────┬─────────────┐
│   Starter   │     Pro     │  Entreprise │
│   (Popular) │  (Badge 🔥) │             │
├─────────────┼─────────────┼─────────────┤
│    29€/mois │   79€/mois  │  Sur mesure │
│             │             │             │
│ ✓ 100 cmd   │ ✓ Illimité  │ ✓ Illimité  │
│ ✓ 1 resto   │ ✓ 3 restos  │ ✓ Illimité  │
│ ✓ IA basic  │ ✓ IA avancé │ ✓ IA custom │
│ ✓ Support   │ ✓ Priority  │ ✓ Dedicated │
│             │             │             │
│ [Essai 14j] │ [Essai 14j] │ [Contact]   │
└─────────────┴─────────────┴─────────────┘

[FAQ Prix en dessous]
  "💰 Aucun frais de transaction"
  "🔒 Annulation en 1 clic"
  "📊 Toutes les fonctionnalités incluses"
```

**Design** :
- Plan Pro : Border gradient + shadow
- Badge "Populaire" : Floating animation
- Hover : Scale + highlight

---

### Section 8 : FAQ
**Objectif** : Répondre aux objections

```
[Titre centré]
"Questions fréquentes"

[Accordion - 2 colonnes]

Questions :
1. Est-ce compliqué à installer ?
   → Non, 2 minutes. Suivez le guide vidéo.

2. Faut-il former mon équipe ?
   → Non, interface intuitive. Si vous savez utiliser WhatsApp, c'est bon.

3. Et si l'IA se trompe ?
   → Rare (<2%), et vous validez avant envoi. Support 24/7.

4. Mes données sont-elles sécurisées ?
   → Oui. RGPD, hébergement France, chiffrement bout en bout.

5. Puis-je garder mon numéro WhatsApp ?
   → Oui, ou créer un nouveau WhatsApp Business.

6. Quels moyens de paiement acceptés ?
   → Stripe (CB), PayPal, virement, espèces.
```

**Design** :
- Accordion animé (smooth expand)
- Icône + / - qui rotate
- Hover : Background subtil

---

### Section 9 : CTA Final
**Objectif** : Dernier push conversion

```
[Section gradient background avec blur]

[Titre centré - Large]
"Prêt à automatiser votre restaurant ?"

[Sous-titre]
"Rejoignez 500+ restaurateurs qui ont fait le choix de l'IA"

[CTA Primaire Large - Bouton avec shine effect]
  "🚀 Commencer Gratuitement"

[Trust badges en dessous]
  ✓ Sans carte bancaire  ✓ 14 jours gratuits  ✓ Support français 24/7

[Petite animation confetti au clic]
```

---

### Section 10 : Footer
```
[Grid 4 colonnes]

Colonne 1 : Whataybo
  - Logo + tagline
  - "Automatisez votre restaurant avec l'IA WhatsApp"
  - Réseaux sociaux (icons)

Colonne 2 : Produit
  - Fonctionnalités
  - Tarifs
  - Démo
  - Changelog

Colonne 3 : Resources
  - Blog
  - Documentation
  - API
  - Templates

Colonne 4 : Entreprise
  - À propos
  - Contact
  - Mentions légales
  - CGU

[Bottom bar]
  © 2026 Whataybo · Made with ❤️ in France
```

---

## 🎬 ANIMATIONS & INTERACTIONS

### Au Chargement
```javascript
// Hero
- Logo fade in (0ms)
- Nav slide down (100ms delay)
- Badge pulse in (200ms)
- Titre reveal par mots (300ms, stagger 50ms)
- Sous-titre fade in (800ms)
- CTAs scale in (1000ms)
- Mockup slide up + fade in (1200ms)
```

### Au Scroll
```javascript
// Sections
- Fade in + slide up quand visible (IntersectionObserver)
- Parallax subtil sur mockups
- Compteurs qui s'incrémentent (CountUp.js)
- Bento cards : stagger animation

// Background
- Gradient mesh qui suit le curseur (subtil)
- Blur balls flottants (ultra subtil, pas distrayant)
```

### Micro-interactions
```javascript
// Boutons
- Hover : Scale 1.05 + shadow increase
- Active : Scale 0.95
- Ripple effect au clic

// Cards
- Hover : Lift (translateY -4px)
- Border glow
- Content reveal animation

// Links
- Underline animé (width 0 → 100%)
- Color transition

// Inputs
- Focus : Border color + glow
- Label floating animation
```

---

## 📱 RESPONSIVE DESIGN

### Mobile (<768px)
- Hero : Titre text-5xl
- Mockup : Pleine largeur
- Bento Grid : 1 colonne
- Pricing : Stack vertical
- Nav : Hamburger menu animé

### Tablet (768-1024px)
- Hero : Titre text-6xl
- Bento Grid : 2 colonnes
- Pricing : 3 colonnes mais plus compact

### Desktop (>1024px)
- Full experience comme décrit
- Max-width: 1400px (centré)
- Espacements généreux

---

## 🎨 COMPOSANTS CLÉS À CRÉER

### 1. Hero Section
```typescript
// src/components/landing/HeroSection.tsx
- Gradient animated background
- Animated badge
- Text reveal animation
- CTA buttons with effects
- 3D mockup with parallax
```

### 2. Bento Grid
```typescript
// src/components/landing/BentoGrid.tsx
- Glassmorphism cards
- Hover effects
- Scroll reveal animations
- Responsive layout (CSS Grid)
```

### 3. Feature Card
```typescript
// src/components/landing/FeatureCard.tsx
- Icon avec background gradient
- Title + description
- Hover lift effect
- Border glow animation
```

### 4. Testimonial Card
```typescript
// src/components/landing/TestimonialCard.tsx
- Avatar avec border gradient
- Star rating animé
- Quote avec typographie élégante
- Metadata (nom, restaurant, ville)
```

### 5. Pricing Card
```typescript
// src/components/landing/PricingCard.tsx
- Badge "Popular"
- Price avec currency
- Feature list avec checkmarks
- CTA button
- Hover effects
```

### 6. Animated Counter
```typescript
// src/components/landing/AnimatedCounter.tsx
- CountUp animation
- Trigger on scroll (IntersectionObserver)
- Format number (15M€, 200K, etc.)
```

### 7. Video Modal
```typescript
// src/components/landing/VideoModal.tsx
- Fullscreen modal
- Video player (YouTube/Vimeo embed)
- Close button
- Background overlay blur
```

---

## 🛠️ TECHNOLOGIES À UTILISER

### Core
- **Next.js 14** (App Router si possible, sinon Pages Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** (+ custom design tokens)
- **Framer Motion** (animations)

### UI/UX
- **Radix UI** (composants accessibles : Accordion, Dialog, etc.)
- **Lucide Icons** (icons modernes)
- **Cal Sans** (font display premium - via next/font)
- **Inter** (font body)

### Animations
- **Framer Motion** (animations React)
- **Auto Animate** (micro-interactions)
- **CountUp.js** (animated numbers)
- **Lottie** (animations complexes si besoin)

### Optimisations
- **next/image** (images optimisées)
- **next/font** (fonts optimisées)
- **sharp** (image processing)
- **Lazy loading** (composants below fold)

---

## 📊 MÉTRIQUES DE SUCCÈS

### Performance (Lighthouse)
- ✅ Performance : 95+
- ✅ Accessibility : 100
- ✅ Best Practices : 100
- ✅ SEO : 100

### UX
- ✅ Time to Interactive : <2s
- ✅ First Contentful Paint : <1s
- ✅ Mobile responsive parfait
- ✅ Smooth 60fps animations

### Conversion
- ✅ CTA visible sans scroll
- ✅ Value proposition claire en 3s
- ✅ Social proof immédiat
- ✅ Path to signup évident

---

## 🚀 PLAN D'IMPLÉMENTATION

### Phase 1 : Setup (1h)
```bash
# Installer les dépendances
npm install framer-motion @radix-ui/react-accordion @radix-ui/react-dialog lucide-react countup.js

# Setup fonts
# Télécharger Cal Sans (ou alternative : Satoshi, Clash Display)
```

### Phase 2 : Design Tokens (30min)
```typescript
// tailwind.config.ts
// Ajouter les couleurs, fonts, spacing custom
```

### Phase 3 : Composants (4h)
```
1. HeroSection (1h)
2. BentoGrid + FeatureCard (1h)
3. TestimonialCard (30min)
4. PricingCard (45min)
5. Autres composants (45min)
```

### Phase 4 : Page Assembly (2h)
```typescript
// src/pages/index.tsx
// Assembler tous les composants
// Ajouter scroll animations
// Responsive final
```

### Phase 5 : Optimisations (1h)
```
- Images next/image
- Lazy loading
- SEO meta tags
- Open Graph
- Schema.org markup
```

### Phase 6 : Tests (1h)
```
- Test mobile (iPhone, Android)
- Test desktop (Chrome, Safari, Firefox)
- Test tablette
- Lighthouse audit
- Accessibility check
```

**Total : ~10h de dev**

---

## ✅ CHECKLIST FINALE

### Design
- [ ] Palette couleurs cohérente
- [ ] Typographie élégante (2 fonts max)
- [ ] Spacing généreux (whitespace)
- [ ] Hiérarchie visuelle claire
- [ ] Micro-interactions partout
- [ ] Dark mode (optionnel mais recommandé)

### Contenu
- [ ] Value proposition claire (hero)
- [ ] Social proof (stats, logos, témoignages)
- [ ] Fonctionnalités visuelles (bento grid)
- [ ] Pricing transparent
- [ ] FAQ répond aux objections
- [ ] CTAs clairs et répétés

### Technique
- [ ] Performance Lighthouse 95+
- [ ] Mobile-first responsive
- [ ] Accessibility (WCAG AA)
- [ ] SEO optimisé
- [ ] Open Graph tags
- [ ] Analytics tracking

### Conversion
- [ ] CTA above the fold
- [ ] Boutons contrastés
- [ ] Trust badges
- [ ] Pas de friction (no card needed)
- [ ] Multiple entry points (top, middle, bottom)

---

## 🎯 RÉSULTAT ATTENDU

**Avant** : Landing page basique, peu engageante
**Après** : Landing page premium qui :
- Capte l'attention en 3 secondes
- Explique clairement la value proposition
- Inspire confiance (social proof)
- Convertit (CTAs clairs)
- Démarque de la concurrence (design moderne)

**Taux de conversion cible** : 15-20% (visiteur → signup trial)

---

## 📝 PROMPT CURSOR FINAL

**Copier-coller ce prompt dans Cursor (Cmd+L) :**

```
Tu es un expert UI/UX designer et développeur Next.js/React. Je veux que tu transformes complètement la landing page de Whataybo en une page moderne, élégante et convertissante.

📋 CONTEXTE
- Projet : Whataybo (SaaS pour restaurants)
- Produit : Automatisation commandes WhatsApp via IA
- Stack : Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- Fichier actuel : src/pages/index.tsx (si existe)

🎯 OBJECTIF
Créer une landing page inspirée de Vercel, Linear et Stripe avec :
1. Hero section impactante (gradient, animations, 3D mockup)
2. Social proof immédiat (logos, stats, témoignages)
3. Bento Grid pour fonctionnalités (glassmorphism)
4. Pricing simple et transparent
5. FAQ avec accordion
6. CTA final puissant

🎨 DESIGN SYSTEM
Couleurs :
- Primary: #6366f1 (Indigo)
- Secondary: #10b981 (Green)
- Accent: #f59e0b (Orange)
- Backgrounds: #ffffff, #f9fafb
- Text: #111827, #6b7280, #9ca3af

Fonts :
- Display: Cal Sans (ou Inter Bold)
- Body: Inter

Animations :
- Framer Motion pour tout
- Scroll reveal (IntersectionObserver)
- Hover effects (scale, lift, glow)
- Micro-interactions partout

📦 LIVRABLES
1. src/pages/index.tsx (page principale)
2. src/components/landing/HeroSection.tsx
3. src/components/landing/BentoGrid.tsx
4. src/components/landing/FeatureCard.tsx
5. src/components/landing/TestimonialCard.tsx
6. src/components/landing/PricingCard.tsx
7. src/components/landing/FAQ.tsx
8. src/components/landing/Footer.tsx
9. tailwind.config.ts (custom tokens)

✅ CRITÈRES SUCCÈS
- [ ] Performance Lighthouse 95+
- [ ] Responsive mobile parfait
- [ ] Animations 60fps
- [ ] Accessibility AA
- [ ] SEO optimisé

🚀 COMMENCE PAR
1. Setup design tokens dans Tailwind
2. Créer HeroSection avec animations
3. Puis les autres sections dans l'ordre

Utilise les meilleures pratiques 2026. Code propre, commenté, TypeScript strict.
Go ! 🎨✨
```

---

**💡 Ce prompt est prêt à être utilisé directement dans Cursor !**
