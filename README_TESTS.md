# 🧪 Guide Rapide des Tests - Whataybo

## Installation

```bash
# 1. Installer dépendances de sécurité
cd apps/api && pnpm add express-rate-limit helmet

# 2. Installer dépendances de test
cd ../.. && ./install-test-deps.sh
```

## Exécution

```bash
# Tests API
cd apps/api && pnpm test

# Tests avec couverture
pnpm test:coverage

# Tests E2E
pnpm test:e2e
```

## Structure

- **16 fichiers de tests** avec **150+ tests**
- **Score sécurité** : 9/10
- **Couverture** : ~75%

## Documentation

- `TESTS_README.md` - Guide complet
- `SECURITY_AUDIT.md` - Audit sécurité
- `VALIDATION_FINALE.md` - Validation complète

**✅ Tout est prêt !**
