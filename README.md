# 🍽️ Whataybo - Système de Commande Restaurant WhatsApp

Application SaaS permettant aux restaurants de recevoir des commandes via WhatsApp avec interface client, dashboard admin et automatisation complète.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+
- pnpm 8+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Installation

```bash
# 1. Installer les dépendances
pnpm install

# 2. Setup base de données (PostgreSQL + Redis)
# Option A: Via script automatique (Homebrew requis)
./scripts/setup-database.sh

# Option B: Via Docker
docker compose -f docker/docker-compose.yml up -d postgres redis

# Option C: Manuellement (voir docs/SETUP_DATABASE.md)

# 3. Démarrer les services (si installés via Homebrew)
./scripts/start-services.sh

# 4. Migrations & Seed
cd apps/api
pnpm prisma migrate dev --name init
pnpm prisma generate
pnpm prisma db seed

# 5. Lancer en développement
pnpm dev
```

### URLs

- **Frontend** : http://localhost:3000
- **API** : http://localhost:4000
- **Prisma Studio** : http://localhost:5555

## 📚 Documentation

Toute la documentation du projet se trouve dans le dossier `/docs` :

- `specifications_techniques.md` - Stack et architecture
- `plan_mvp.md` - Roadmap et features
- `base_de_donnees.md` - Schéma Prisma et relations
- `guide_cursor.md` - Guide de développement avec Cursor
- `api_endpoints.md` - Documentation API complète
- `workflows_templates.md` - Templates workflows

## 🏗️ Structure du Projet

```
whatsorder-clone/
├── apps/
│   ├── web/          # Next.js 14 Frontend
│   └── api/          # Express Backend
├── packages/
│   ├── types/        # Types partagés
│   ├── config/       # Config partagée
│   └── ui/           # Composants UI partagés
├── docs/             # Documentation complète
└── docker/           # Configuration Docker
```

## 🛠️ Scripts Disponibles

### Développement
- `pnpm dev` - Lancer frontend et backend en développement
- `pnpm build` - Build production
- `pnpm test` - Lancer les tests
- `pnpm prisma:studio` - Ouvrir Prisma Studio
- `pnpm lint` - Linter le code

### Base de Données
- `./scripts/setup-database.sh` - Installer PostgreSQL et Redis (Homebrew)
- `./scripts/start-services.sh` - Démarrer PostgreSQL et Redis
- `./scripts/stop-services.sh` - Arrêter PostgreSQL et Redis

## 📄 Licence

MIT License
