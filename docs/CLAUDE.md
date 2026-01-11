# 🍽️ WhatsOrder Clone - Système de Commande Restaurant WhatsApp

## 📌 Vue d'Ensemble

Application SaaS permettant aux restaurants de recevoir des commandes via WhatsApp avec :
- **Interface client** : Menu digital → Panier → Commande WhatsApp
- **Dashboard admin** : Gestion menu, inbox WhatsApp, commandes, analytics
- **Automatisation** : Workflows, notifications, campagnes marketing

**Inspiré de** : TimelinesAI (gestion WhatsApp) + WhatsOrder (commande simple)

---

## 🎯 Objectif du Projet

Créer une plateforme complète permettant aux restaurants (focus Égypte) de :
1. Proposer un menu digital accessible via lien/QR code
2. Recevoir commandes formatées sur WhatsApp
3. Gérer toutes les opérations depuis un dashboard centralisé
4. Automatiser communications et marketing

---

## 👥 Personas

### Client Final (Utilisateur Menu)
- **Qui** : Client restaurant voulant commander
- **Besoin** : Commander rapidement sans app, via WhatsApp
- **Parcours** : Scan QR → Menu → Panier → WhatsApp

### Propriétaire Restaurant (Admin)
- **Qui** : Gérant de restaurant en Égypte
- **Besoin** : Système simple pour recevoir et gérer commandes
- **Parcours** : Setup menu → Recevoir commandes WhatsApp → Gérer via dashboard

### Staff Restaurant
- **Qui** : Équipe (cuisinier, livreur)
- **Besoin** : Vue des commandes à préparer/livrer
- **Parcours** : Login → Voir commandes assignées → Update statuts

---

## 🗂️ Structure de la Documentation

Ce projet utilise une documentation structurée en plusieurs fichiers :

### 📁 `/docs`

#### 1️⃣ **specifications_techniques.md** 
**Contenu** :
- Stack technologique détaillée
- Architecture système (diagrammes)
- Choix techniques justifiés
- Environnements (dev, staging, prod)
- Services externes (WhatsApp API, Paymob, etc.)

**Pourquoi** : Référence technique unique. Évite les questions "on utilise quoi déjà ?"

#### 2️⃣ **plan_mvp.md**
**Contenu** :
- Roadmap en 3 phases
- Features par phase avec priorités (P0, P1, P2)
- Timeline estimée
- Critères de validation par phase
- What's out of scope (pour plus tard)

**Pourquoi** : Feuille de route claire. On sait exactement quoi coder maintenant vs plus tard.

#### 3️⃣ **base_de_donnees.md**
**Contenu** :
- Schéma Prisma complet annoté
- Diagramme ERD (Entity-Relationship)
- Explications des relations
- Exemples de queries courantes
- Stratégie d'indexation

**Pourquoi** : La DB est le cœur du système. Ce fichier évite toute confusion sur la structure des données.

#### 4️⃣ **guide_cursor.md** (ce fichier)
**Contenu** :
- Tous les prompts Cursor numérotés
- Instructions pas-à-pas
- Ordre d'exécution
- Checkpoints de validation

**Pourquoi** : Guide pratique pour développer avec Cursor 2.0.

#### 5️⃣ **api_endpoints.md**
**Contenu** :
- Liste complète des endpoints
- Request/Response examples
- Codes erreurs
- Authentication required
- Rate limiting

**Pourquoi** : Documentation API pour frontend et tests.

#### 6️⃣ **workflows_templates.md**
**Contenu** :
- Templates workflows pré-configurés
- Format JSON complet
- Use cases d'utilisation
- Variables disponibles

**Pourquoi** : Facilite création de workflows automatiques.

---

## 🚀 Démarrage Rapide

### Prérequis
```bash
- Node.js 20+
- pnpm 8+
- PostgreSQL 15+
- Redis 7+
- Cursor 2.0
- Compte Meta Business (WhatsApp API)
```

### Setup Initial
```bash
# 1. Cloner le repo
git clone <repo-url>
cd whatsorder-clone

# 2. Installer dépendances
pnpm install

# 3. Setup environnement
cp .env.example .env
# Remplir les variables (voir .env.example pour détails)

# 4. Lancer base de données
docker-compose up -d postgres redis

# 5. Migrations & Seed
pnpm prisma migrate dev
pnpm prisma db seed

# 6. Lancer dev
pnpm dev
```

### URLs :
- Frontend : http://localhost:3000
- API : http://localhost:4000
- Prisma Studio : http://localhost:5555

---

## 📂 Structure du Projet

```
whatsorder-clone/
├── apps/
│   ├── web/                    # Next.js 14 Frontend
│   │   ├── app/
│   │   │   ├── (public)/      # Pages publiques (menu client)
│   │   │   ├── (dashboard)/   # Dashboard admin
│   │   │   ├── (auth)/        # Login/Register
│   │   │   └── api/           # API routes Next.js
│   │   ├── components/
│   │   ├── lib/
│   │   └── hooks/
│   │
│   └── api/                    # Express Backend
│       ├── src/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── models/        # Prisma schema
│       │   ├── jobs/          # Bull queue
│       │   ├── websocket/     # Socket.io
│       │   └── utils/
│       └── prisma/
│
├── packages/
│   ├── types/                 # Types partagés
│   ├── config/                # Config partagée
│   └── ui/                    # Composants UI partagés
│
├── docs/                       # 📚 DOCUMENTATION
│   ├── specifications_techniques.md
│   ├── plan_mvp.md
│   ├── base_de_donnees.md
│   ├── guide_cursor.md
│   ├── api_endpoints.md
│   └── workflows_templates.md
│
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── docker-compose.yml
│
├── .env.example
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 🎨 Conventions de Code

### TypeScript
```typescript
// ✅ Bon
interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

// ❌ Éviter
const restaurant: any = {...}
```

### Nommage
```typescript
// Components : PascalCase
MenuCard.tsx
OrderKanban.tsx

// Hooks : camelCase avec "use"
useCart.ts
useAuth.ts

// Services : camelCase avec ".service"
order.service.ts
whatsapp.service.ts

// Types : PascalCase
OrderStatus
UserRole
```

### Commits
```bash
# Format : <type>: <description>

feat: add order kanban board
fix: correct cart total calculation
docs: update API documentation
refactor: simplify menu card component
test: add order service tests
```

Types : feat, fix, docs, style, refactor, test, chore

---

## 🔐 Variables d'Environnement

Voir `.env.example` pour la liste complète.

---

## 🧪 Testing

### Structure Tests
```
apps/api/src/
├── controllers/
│   ├── order.controller.ts
│   └── order.controller.test.ts
├── services/
│   ├── order.service.ts
│   └── order.service.test.ts
```

### Commandes
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

---

## 🐛 Debugging

### Backend
```typescript
// Utiliser Winston logger
import logger from '@/utils/logger';

logger.info('Order created', { orderId: order.id });
logger.error('Payment failed', { error, orderId });
```

### Frontend
```typescript
// React Query Devtools (dev uniquement)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Dans _app.tsx
<ReactQueryDevtools initialIsOpen={false} />
```

---

## 🚀 Déploiement

### Railway (Recommandé pour MVP)
```bash
# 1. Installer Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Init projet
railway init

# 4. Ajouter services
railway add postgres
railway add redis

# 5. Deploy
railway up
```

---

## 📚 Ressources Utiles

### Documentation Officielle
- [Next.js 14](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp)
- [Socket.io](https://socket.io/docs)
- [React Flow](https://reactflow.dev)
- [shadcn/ui](https://ui.shadcn.com)

---

## 📝 Changelog

### v0.1.0 (Étape actuelle)
- 🏗️ Setup projet
- 🏗️ Architecture base
- 🏗️ Documentation

---

## 📄 Licence

MIT License - voir LICENSE pour détails
