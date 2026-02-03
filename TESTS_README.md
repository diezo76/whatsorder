# Guide des Tests - Whataybo

Ce document décrit comment exécuter et maintenir la suite de tests de l'application Whataybo.

## 📋 Vue d'Ensemble

La suite de tests couvre :
- ✅ Authentification et autorisation
- ✅ Sécurité webhooks WhatsApp
- ✅ Validation des inputs (Zod)
- ✅ RBAC (Role-Based Access Control)
- ✅ CRUD Menu (catégories, items)
- ✅ Flux commandes
- ✅ Sécurité générale

## 🚀 Installation

### 1. Installer les dépendances

```bash
# Depuis la racine du projet
./install-test-deps.sh

# Ou manuellement
cd apps/api && pnpm install
cd ../web && pnpm install
```

### 2. Configurer la base de données de test

Les tests utilisent la même base de données que le développement par défaut. Pour isoler les tests :

```env
# .env.test
DATABASE_URL="postgresql://user:password@localhost:5432/whataybo_test"
NODE_ENV=test
JWT_SECRET=test-secret-key
```

## 🧪 Exécution des Tests

### Tests API

```bash
cd apps/api

# Tous les tests
pnpm test

# Mode watch (développement)
pnpm test:watch

# Avec couverture
pnpm test:coverage

# Tests E2E
pnpm test:e2e
```

### Tests Frontend

```bash
cd apps/web

# Tous les tests
pnpm test

# Mode watch
pnpm test:watch

# Avec couverture
pnpm test:coverage

# Tests E2E
pnpm test:e2e
```

### Tests depuis la racine

```bash
# Tous les tests (monorepo)
pnpm test

# Couverture complète
pnpm test:coverage
```

## 📁 Structure des Tests

```
apps/
├── api/
│   ├── src/
│   │   └── __tests__/
│   │       ├── setup.ts                    # Configuration globale
│   │       ├── auth.test.ts               # Tests authentification
│   │       ├── webhooks.test.ts           # Tests sécurité webhooks
│   │       ├── input-validation.test.ts   # Tests validation inputs
│   │       ├── rbac.test.ts               # Tests autorisation RBAC
│   │       ├── menu-crud.test.ts          # Tests CRUD menu
│   │       ├── orders-flow.test.ts        # Tests flux commandes
│   │       └── security.test.ts           # Tests sécurité générale
│   ├── e2e/                               # Tests end-to-end (à créer)
│   ├── jest.config.js                      # Configuration Jest
│   └── playwright.config.ts               # Configuration Playwright
└── web/
    ├── __tests__/                         # Tests unitaires (à créer)
    ├── e2e/                               # Tests E2E (à créer)
    ├── jest.config.js
    ├── jest.setup.js
    └── playwright.config.ts
```

## 📊 Couverture des Tests

### Tests Implémentés ✅

1. **Authentification** (`auth.test.ts`)
   - Register, Login, Me
   - Validation JWT, expiration
   - Routes protégées

2. **Sécurité Webhooks** (`webhooks.test.ts`)
   - Vérification signature HMAC SHA-256
   - Rejet requêtes non signées
   - Traitement messages

3. **Validation Inputs** (`input-validation.test.ts`)
   - Schémas Zod
   - Prévention injection SQL
   - Prévention XSS

4. **RBAC** (`rbac.test.ts`)
   - Permissions par rôle
   - Isolation données multi-tenant
   - Accès cross-restaurant

5. **CRUD Menu** (`menu-crud.test.ts`)
   - Catégories et items
   - Variants et modifiers
   - Validation slugs

6. **Flux Commandes** (`orders-flow.test.ts`)
   - Création depuis API publique
   - Gestion statuts
   - Assignation staff

7. **Sécurité Générale** (`security.test.ts`)
   - Protection routes
   - Validation inputs
   - Headers CORS

### Tests à Implémenter 🔄

- Tests inbox WhatsApp
- Tests pages publiques
- Tests analytics
- Tests E2E complets
- Tests performance
- Audit sécurité automatisé

## 🔧 Configuration

### Jest Configuration

Les fichiers `jest.config.js` sont configurés pour :
- TypeScript avec `ts-jest`
- Path aliases (`@/*`)
- Coverage reports
- Setup files

### Playwright Configuration

Les fichiers `playwright.config.ts` sont configurés pour :
- Tests E2E navigateur
- WebServer automatique
- Screenshots et traces
- Multi-navigateurs

## 🐛 Dépannage

### Erreurs de connexion base de données

```bash
# Vérifier que PostgreSQL est démarré
pg_isready

# Vérifier les migrations
cd apps/api
pnpm prisma migrate dev
```

### Erreurs de modules non trouvés

```bash
# Régénérer Prisma Client
cd apps/api
pnpm prisma generate
```

### Tests qui échouent

1. Vérifier que la base de données est propre
2. Vérifier les variables d'environnement
3. Vérifier que les mocks sont corrects

## 📝 Écriture de Nouveaux Tests

### Structure d'un test

```typescript
import request from 'supertest';
import express from 'express';

describe('Feature Tests', () => {
  beforeAll(async () => {
    // Setup initial
  });

  afterAll(async () => {
    // Cleanup
  });

  it('devrait faire quelque chose', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
```

### Bonnes Pratiques

1. **Isolation** : Chaque test doit être indépendant
2. **Cleanup** : Toujours nettoyer après les tests
3. **Mocks** : Utiliser des mocks pour les services externes
4. **Assertions** : Être spécifique dans les assertions
5. **Noms** : Utiliser des noms descriptifs en français

## 🎯 Prochaines Étapes

1. Implémenter les tests restants (inbox, analytics, E2E)
2. Configurer CI/CD pour exécution automatique
3. Ajouter tests de performance
4. Automatiser audit sécurité
5. Générer rapports automatiques

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

---

**Dernière mise à jour** : 15 janvier 2026
