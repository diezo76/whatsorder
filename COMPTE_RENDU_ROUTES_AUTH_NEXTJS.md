# Compte Rendu - Création des Routes d'Authentification Next.js

## Date
Correction effectuée pour résoudre le problème d'authentification sur Vercel.

## Problème Identifié
Le test de login échouait avec l'erreur `"Invalid credentials"` car les routes d'authentification n'existaient pas dans l'application Next.js déployée sur Vercel.

### Cause
- L'application utilisait `lib/auth.ts` qui appelait une API externe via `NEXT_PUBLIC_API_URL`
- Les routes `/api/auth/login`, `/api/auth/register`, `/api/auth/me` n'existaient pas dans Next.js
- Seule la route `/api/auth/health` existait

## Solution Implémentée

### Fichiers Créés

#### 1. `apps/web/app/api/auth/login/route.ts`
- Endpoint POST pour la connexion
- Vérifie email/password avec bcrypt
- Génère un token JWT
- Retourne l'utilisateur et le token

#### 2. `apps/web/app/api/auth/register/route.ts`
- Endpoint POST pour l'inscription
- Crée un restaurant automatiquement
- Hash le mot de passe avec bcrypt
- Génère un token JWT
- Retourne l'utilisateur et le token

#### 3. `apps/web/app/api/auth/me/route.ts`
- Endpoint GET pour récupérer le profil
- Vérifie le token JWT dans le header Authorization
- Retourne les informations de l'utilisateur connecté

### Fichier Modifié

#### `apps/web/lib/auth.ts`
- Supprimé la dépendance à l'API externe
- Utilise maintenant les routes locales Next.js (`/api/auth/*`)
- Utilise `fetch` au lieu d'axios pour les appels auth

## Fonctionnalités

### Login (`POST /api/auth/login`)
```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (succès)
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "OWNER",
    "restaurantId": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Register (`POST /api/auth/register`)
```json
// Request
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "restaurantName": "Mon Restaurant"
}

// Response (succès)
{
  "success": true,
  "user": {...},
  "token": "..."
}
```

### Me (`GET /api/auth/me`)
```
Authorization: Bearer <token>

// Response (succès)
{
  "success": true,
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "...",
    "restaurantId": "...",
    "restaurant": {
      "id": "...",
      "name": "...",
      "slug": "..."
    }
  }
}
```

## Comment Tester

### 1. Créer un utilisateur de test
Soit via l'interface `/register`, soit via ce script SQL dans Supabase :

```sql
-- Créer un utilisateur de test (mot de passe: Admin123!)
-- Hash généré avec bcrypt pour "Admin123!"
INSERT INTO "Restaurant" (id, name, slug, currency, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Test Restaurant',
  'test-restaurant',
  'EUR',
  NOW(),
  NOW()
);

INSERT INTO "User" (id, email, password, name, "firstName", "lastName", role, "restaurantId", "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'admin@whatsorder.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4Z1kxZlwN1j5zKWq', -- Admin123!
  'Admin User',
  'Admin',
  'User',
  'OWNER',
  id,
  true,
  NOW(),
  NOW()
FROM "Restaurant"
WHERE slug = 'test-restaurant';
```

### 2. Tester les routes
```bash
# Health check
curl https://whatsorder-web-diiezos-projects.vercel.app/api/auth/health

# Login
curl -X POST https://whatsorder-web-diiezos-projects.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@whatsorder.com","password":"Admin123!"}'

# Register (créer un nouveau compte)
curl -X POST https://whatsorder-web-diiezos-projects.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'
```

## Variables d'Environnement Requises
Les variables suivantes doivent être configurées sur Vercel :
- `DATABASE_URL` - URL de connexion Supabase (avec pooler `?pgbouncer=true`)
- `DIRECT_URL` - URL directe Supabase (pour les migrations)
- `JWT_SECRET` - Clé secrète pour signer les tokens JWT

## Résultat Attendu
- ✅ Les routes d'authentification fonctionnent directement dans Next.js
- ✅ Plus besoin d'API externe pour l'authentification
- ✅ Le déploiement sur Vercel inclut toutes les routes nécessaires
- ✅ L'inscription crée automatiquement un restaurant

## Prochaines Étapes
1. Déployer les changements sur Vercel (`git push`)
2. Créer un utilisateur via `/register` ou via SQL
3. Tester le login avec les identifiants créés
4. Vérifier que le dashboard est accessible après connexion
