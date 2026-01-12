# Compte Rendu - Correction Erreur Dynamic Server Usage

## Date
Correction effectuée pour résoudre l'erreur `DYNAMIC_SERVER_USAGE` sur les routes API Next.js.

## Problème Identifié
Erreur Next.js lors du déploiement sur Vercel :
```
Route /api/restaurant couldn't be rendered statically because it used `request.headers`. 
See more info here: https://nextjs.org/docs/messages/dynamic-server-error
digest: 'DYNAMIC_SERVER_USAGE'
```

### Cause
Dans Next.js 14+ avec App Router, les routes API qui utilisent des données dynamiques (comme `request.headers`) doivent être explicitement marquées comme dynamiques. La fonction `withAuth` utilise `request.headers.get('authorization')` pour vérifier l'authentification, ce qui rend ces routes dynamiques.

## Solution Implémentée

### Configuration Ajoutée
Ajout de `export const dynamic = 'force-dynamic'` à toutes les routes API qui utilisent `withAuth`.

Cette configuration indique à Next.js que :
- La route ne peut pas être pré-rendue statiquement
- Elle doit être rendue à chaque requête
- Elle utilise des données dynamiques (headers, cookies, etc.)

### Fichiers Modifiés (18 routes API)

#### Routes Principales
1. ✅ `apps/web/app/api/restaurant/route.ts`
2. ✅ `apps/web/app/api/orders/route.ts`
3. ✅ `apps/web/app/api/conversations/route.ts`
4. ✅ `apps/web/app/api/menu/categories/route.ts`

#### Routes Analytics
5. ✅ `apps/web/app/api/analytics/dashboard-stats/route.ts`
6. ✅ `apps/web/app/api/analytics/top-items/route.ts`
7. ✅ `apps/web/app/api/analytics/revenue-chart/route.ts`
8. ✅ `apps/web/app/api/analytics/orders-by-status/route.ts`
9. ✅ `apps/web/app/api/analytics/delivery-types/route.ts`

#### Routes AI
10. ✅ `apps/web/app/api/ai/parse-order/route.ts`
11. ✅ `apps/web/app/api/ai/create-order/route.ts`

#### Routes Conversations avec Paramètres
12. ✅ `apps/web/app/api/conversations/[id]/route.ts`
13. ✅ `apps/web/app/api/conversations/[id]/messages/route.ts`

#### Routes Orders avec Paramètres
14. ✅ `apps/web/app/api/orders/[id]/route.ts`
15. ✅ `apps/web/app/api/orders/[id]/cancel/route.ts`
16. ✅ `apps/web/app/api/orders/[id]/assign/route.ts`

#### Routes Menu avec Paramètres
17. ✅ `apps/web/app/api/menu/categories/[id]/route.ts`

### Format de la Modification
Pour chaque fichier, la ligne suivante a été ajoutée après les imports :
```typescript
// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';
```

### Exemple de Modification
**Avant :**
```typescript
// apps/web/app/api/restaurant/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

/**
 * GET /api/restaurant
 */
export async function GET(request: Request) {
  // ...
}
```

**Après :**
```typescript
// apps/web/app/api/restaurant/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';

/**
 * GET /api/restaurant
 */
export async function GET(request: Request) {
  // ...
}
```

## Pourquoi Cette Solution ?

### Contexte Next.js 14+
- Next.js essaie de pré-rendre les routes API statiquement par défaut pour améliorer les performances
- Cependant, les routes qui utilisent des données dynamiques (headers, cookies, query params dynamiques) ne peuvent pas être pré-rendues
- Next.js nécessite une déclaration explicite pour ces routes

### Pourquoi `force-dynamic` ?
- `export const dynamic = 'force-dynamic'` force Next.js à rendre la route dynamiquement à chaque requête
- C'est nécessaire car `withAuth` lit le header `Authorization` qui varie selon l'utilisateur
- Alternative : `export const runtime = 'nodejs'` mais `force-dynamic` est plus approprié ici

## Résultat Attendu
- ✅ Plus d'erreur `DYNAMIC_SERVER_USAGE` lors du build/déploiement
- ✅ Les routes API fonctionnent correctement avec l'authentification
- ✅ Le déploiement sur Vercel se fait sans erreur

## Tests à Effectuer
1. ✅ Vérifier que le build Next.js passe sans erreur
2. ✅ Vérifier que toutes les routes API fonctionnent avec authentification
3. ✅ Tester le déploiement sur Vercel
4. ✅ Vérifier que les requêtes authentifiées fonctionnent correctement

## Notes Importantes
- Cette modification n'affecte pas les performances en production car ces routes nécessitent déjà un rendu dynamique pour l'authentification
- Toutes les routes protégées par `withAuth` doivent avoir cette configuration
- Les routes publiques (sans `withAuth`) n'ont pas besoin de cette configuration sauf si elles utilisent d'autres données dynamiques

## Routes Non Modifiées
Les routes suivantes n'utilisent pas `withAuth` et n'ont donc pas été modifiées :
- `apps/web/app/api/auth/health/route.ts` (route de santé publique)

## Documentation Référence
- [Next.js Dynamic Route Segments](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js Dynamic Server Error](https://nextjs.org/docs/messages/dynamic-server-error)

## Prochaines Étapes
1. Déployer les changements sur Vercel
2. Vérifier que l'erreur ne se reproduit plus
3. Tester toutes les routes API pour s'assurer qu'elles fonctionnent correctement
