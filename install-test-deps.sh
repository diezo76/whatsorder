#!/bin/bash
echo "Installation des dépendances de test..."

cd apps/api
echo "Installation dépendances API..."
pnpm add -D jest@^29.7.0 ts-jest@^29.1.2 @types/jest@^29.5.12 @types/supertest@^6.0.2 supertest@^7.0.0 @playwright/test@^1.48.0

cd ../web
echo "Installation dépendances Web..."
pnpm add -D jest@^29.7.0 ts-jest@^29.1.2 @types/jest@^29.5.12 @playwright/test@^1.48.0 @testing-library/react@^16.0.1 @testing-library/jest-dom@^6.4.2 @testing-library/user-event@^14.5.2 jest-environment-jsdom@^29.7.0

echo "✅ Dépendances installées !"
