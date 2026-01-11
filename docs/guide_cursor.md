# 🎯 Guide Cursor - Développement avec Cursor 2.0

## 📋 Vue d'Ensemble

Ce guide contient tous les prompts Cursor numérotés pour développer le projet étape par étape.

**Ordre d'exécution** : Suivre les prompts dans l'ordre pour construire le projet progressivement.

---

## 🚀 Phase 1 : Foundation

### Prompt 1 : Setup Monorepo
```
Créer la structure monorepo avec pnpm workspaces :
- apps/web (Next.js 14)
- apps/api (Express)
- packages/types, packages/config, packages/ui

Configurer package.json racine avec scripts de base.
```

### Prompt 2 : Configuration TypeScript
```
Créer tsconfig.json partagé dans packages/config avec :
- Strict mode activé
- Path aliases (@/ pour src/)
- Config pour Next.js et Node.js

Créer tsconfig.json spécifiques pour web et api qui étendent le config partagé.
```

### Prompt 3 : Setup Prisma
```
Créer le schéma Prisma complet selon base_de_donnees.md dans apps/api/prisma/schema.prisma.

Configurer Prisma avec :
- PostgreSQL comme provider
- Migrations folder
- Seed script
- Prisma Studio script
```

### Prompt 4 : Setup Database Docker
```
Créer docker-compose.yml avec :
- PostgreSQL 15
- Redis 7
- Volumes persistants
- Ports exposés (5432, 6379)

Créer script de démarrage rapide.
```

### Prompt 5 : Authentication Backend
```
Créer le système d'authentification dans apps/api :
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- JWT middleware
- Password hashing (bcrypt)
- Validation avec Zod

Utiliser le schéma Prisma User.
```

### Prompt 6 : Authentication Frontend
```
Créer les pages d'authentification dans apps/web :
- /login
- /register
- /forgot-password

Utiliser React Hook Form + Zod pour validation.
Créer hook useAuth() avec React Query.
```

### Prompt 7 : Dashboard Layout
```
Créer le layout du dashboard dans apps/web/app/(dashboard) :
- Sidebar navigation
- Header avec user menu
- Layout responsive
- Protected routes middleware

Utiliser shadcn/ui pour les composants.
```

---

## 🍽️ Phase 2 : Menu & Commandes

### Prompt 8 : Menu Management Backend
```
Créer les endpoints menu dans apps/api :
- GET /restaurants/:id/menu/categories
- POST /restaurants/:id/menu/categories
- GET /restaurants/:id/menu/items
- POST /restaurants/:id/menu/items
- PUT/DELETE pour catégories et items

Validation avec Zod, upload images Cloudinary.
```

### Prompt 9 : Menu Management Frontend
```
Créer l'interface de gestion menu dans apps/web/app/(dashboard)/menu :
- Liste catégories avec drag & drop
- Formulaire création/édition catégorie
- Liste items avec filtres
- Formulaire création/édition item
- Upload image avec preview

Utiliser React Hook Form, React Query pour mutations.
```

### Prompt 10 : Menu Public
```
Créer la page menu publique dans apps/web/app/(public)/menu/[slug] :
- Affichage menu par restaurant (slug)
- Catégories et items avec images
- Panier avec localStorage
- Design mobile-first
- Calcul total dynamique

Page statique avec ISR (revalidate 60s).
```

### Prompt 11 : WhatsApp Integration Backend
```
Créer le service WhatsApp dans apps/api/src/services/whatsapp.service.ts :
- Envoyer messages (template et texte)
- Recevoir webhooks Meta
- Parser messages entrants
- Gérer conversations

Intégrer avec Meta WhatsApp Cloud API.
```

### Prompt 12 : WhatsApp Webhook
```
Créer l'endpoint webhook dans apps/api :
- POST /webhooks/whatsapp
- Vérification signature Meta
- Parser événements (messages, status)
- Créer/update conversations et messages
- Détecter commandes dans messages

Queue jobs avec BullMQ pour traitement async.
```

### Prompt 13 : Order Creation
```
Créer le système de commandes dans apps/api :
- POST /restaurants/:id/orders (depuis panier)
- Générer orderNumber unique
- Calculer totals
- Envoyer message WhatsApp formaté
- Stocker en DB avec status PENDING

Validation complète avec Zod.
```

### Prompt 14 : Order Management Frontend
```
Créer l'interface gestion commandes dans apps/web/app/(dashboard)/orders :
- Liste commandes avec filtres (statut, date)
- Détails commande (modal)
- Changer statut commande
- Assigner à staff
- Notifications real-time (Socket.io)

Utiliser React Query pour data fetching.
```

---

## 📊 Phase 3 : Dashboard & Analytics

### Prompt 15 : Dashboard Overview
```
Créer le dashboard principal dans apps/web/app/(dashboard) :
- Cards métriques (commandes jour, revenus)
- Graphique revenus (Recharts)
- Top items vendus
- Commandes récentes
- Notifications

Utiliser React Query pour data fetching avec cache.
```

### Prompt 16 : WhatsApp Inbox
```
Créer l'inbox WhatsApp dans apps/web/app/(dashboard)/whatsapp :
- Liste conversations avec last message
- Vue messages d'une conversation
- Envoyer message depuis dashboard
- Marquer comme lu/non lu
- Recherche conversations

Real-time updates avec Socket.io.
```

### Prompt 17 : Order Kanban Board
```
Créer le Kanban board dans apps/web/app/(dashboard)/orders/kanban :
- Colonnes par statut (PENDING, CONFIRMED, etc.)
- Drag & drop pour changer statut
- Détails commande au clic
- Filtres (date, staff)
- Assigner commande

Utiliser @dnd-kit pour drag & drop.
```

### Prompt 18 : Analytics Backend
```
Créer les endpoints analytics dans apps/api :
- GET /restaurants/:id/analytics/overview
- GET /restaurants/:id/analytics/revenue
- Calculer métriques (revenus, commandes, top items)
- Aggrégations par période (jour/semaine/mois)

Optimiser queries avec Prisma aggregations.
```

### Prompt 19 : Analytics Frontend
```
Créer les pages analytics dans apps/web/app/(dashboard)/analytics :
- Vue d'ensemble avec graphiques
- Revenus par période (Recharts)
- Top items vendus (tableau)
- Export CSV

Filtres par période (date picker).
```

### Prompt 20 : Workflows Backend
```
Créer le système workflows dans apps/api :
- GET/POST/PUT/DELETE /restaurants/:id/workflows
- Exécuter workflows selon triggers
- Queue jobs pour exécution async
- Logger exécutions dans DB

Parser config JSON (React Flow format).
```

### Prompt 21 : Workflows Frontend
```
Créer l'interface workflows dans apps/web/app/(dashboard)/workflows :
- Liste workflows avec toggle actif/inactif
- Éditeur workflow avec React Flow
- Templates pré-configurés
- Tester workflow
- Voir exécutions (logs)

Utiliser React Flow pour visualisation.
```

---

## 🧪 Phase 4 : Testing & Polish

### Prompt 22 : Tests Backend
```
Créer tests pour apps/api :
- Unit tests services (Jest)
- Integration tests endpoints (Supertest)
- Tests webhook WhatsApp
- Coverage > 70%

Setup Jest avec config TypeScript.
```

### Prompt 23 : Tests Frontend
```
Créer tests pour apps/web :
- Component tests (React Testing Library)
- Hook tests
- E2E tests critiques (Playwright)
- Tests auth flow

Setup Playwright pour E2E.
```

### Prompt 24 : Error Handling
```
Améliorer gestion erreurs :
- Error boundaries React
- Toast notifications (shadcn/ui)
- Logging errors (Sentry)
- Retry logic (React Query)

Messages d'erreur user-friendly.
```

### Prompt 25 : Performance Optimization
```
Optimiser performance :
- Code splitting Next.js
- Image optimization (next/image)
- Redis caching (menu, restaurant)
- Database indexes
- Lazy loading components

Lighthouse score > 90.
```

---

## ✅ Checkpoints de Validation

### Après Phase 1
- [ ] Tests : Authentication fonctionne
- [ ] Code Review : Architecture validée
- [ ] Demo : Créer compte → Dashboard

### Après Phase 2
- [ ] Tests : End-to-end flow complet
- [ ] Performance : Menu charge < 2s
- [ ] Demo : Menu → Panier → Commande WhatsApp → Dashboard

### Après Phase 3
- [ ] Tests : Tous les workflows fonctionnent
- [ ] UX Review : Interface intuitive
- [ ] Demo : Dashboard complet avec analytics

---

## 📝 Notes Importantes

1. **Ordre** : Suivre les prompts dans l'ordre
2. **Validation** : Valider chaque phase avant de continuer
3. **Documentation** : Documenter chaque feature
4. **Tests** : Écrire tests en même temps que le code
5. **Commits** : Commits fréquents avec messages clairs

---

## 🆘 Aide

Si un prompt ne fonctionne pas :
1. Vérifier la documentation dans `/docs`
2. Vérifier les dépendances installées
3. Vérifier les variables d'environnement
4. Consulter les logs (backend/frontend)

---

## 🎯 Prochaines Étapes

Une fois tous les prompts exécutés :
1. Deploy sur staging (Railway)
2. Tests utilisateurs beta
3. Corrections bugs
4. Deploy production
