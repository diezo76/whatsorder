# Guide d'Installation Finale - Whataybo

## 🚀 Installation Complète

### 1. Installer les dépendances de base

```bash
cd "/Users/diezowee/whatsapp order"
pnpm install
```

### 2. Installer les dépendances de test

```bash
# Option 1: Utiliser le script
./install-test-deps.sh

# Option 2: Manuellement
cd apps/api && pnpm add -D jest@^29.7.0 ts-jest@^29.1.2 @types/jest@^29.5.12 @types/supertest@^6.0.2 supertest@^7.0.0 @playwright/test@^1.48.0
cd ../web && pnpm add -D jest@^29.7.0 ts-jest@^29.1.2 @types/jest@^29.5.12 @playwright/test@^1.48.0 @testing-library/react@^16.0.1 @testing-library/jest-dom@^6.4.2 @testing-library/user-event@^14.5.2 jest-environment-jsdom@^29.7.0
```

### 3. Installer les dépendances de sécurité

```bash
cd apps/api
pnpm add express-rate-limit helmet
```

### 4. Configurer la base de données

```bash
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev
pnpm db:seed
```

### 5. Configurer les variables d'environnement

Créer `.env` dans `apps/api` avec :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/whataybo"
JWT_SECRET="votre-secret-jwt-super-securise"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# WhatsApp
WHATSAPP_API_URL="https://graph.facebook.com/v18.0"
WHATSAPP_PHONE_NUMBER_ID="votre-phone-number-id"
WHATSAPP_ACCESS_TOKEN="votre-access-token"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="votre-webhook-token"
WHATSAPP_APP_SECRET="votre-app-secret"

# OpenAI
OPENAI_API_KEY="votre-openai-key"
```

### 6. Exécuter les tests

```bash
# Tests API
cd apps/api
pnpm test

# Tests avec couverture
pnpm test:coverage

# Tests E2E
pnpm test:e2e

# Tests frontend
cd ../web
pnpm test
```

## ✅ Validation

Une fois installé, vérifier :

1. ✅ Les tests passent : `pnpm test`
2. ✅ Pas d'erreurs de linting : `pnpm lint`
3. ✅ L'API démarre : `pnpm dev`
4. ✅ Les headers de sécurité sont présents (vérifier avec curl)

## 🎉 C'est prêt !

Tout est configuré et prêt pour le développement et les tests.
