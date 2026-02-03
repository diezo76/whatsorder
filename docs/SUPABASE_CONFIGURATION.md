# Configuration Supabase - Whataybo

## Vue d'ensemble

Supabase est utilisé **uniquement pour Realtime** dans Whataybo. La base de données principale utilise **Prisma + PostgreSQL** (via `DATABASE_URL`).

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Whataybo                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Next.js)                                     │
│  ├── Supabase Client (Realtime uniquement)              │
│  │   └── Conversations & Messages temps réel           │
│  │                                                       │
│  └── API Routes                                         │
│      └── Appels vers Backend Express                    │
│                                                          │
│  Backend (Express)                                      │
│  └── Prisma Client                                      │
│      └── PostgreSQL (DATABASE_URL)                     │
│          └── Toutes les données (Restaurants, Orders,   │
│              Users, etc.)                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Variables d'environnement requises

### Frontend (`apps/web/.env.local`)

```env
# Supabase Realtime (pour conversations et messages)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# URL de l'application (pour les emails et liens)
NEXT_PUBLIC_APP_URL=https://www.whataybo.com
# ou en développement:
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (`apps/api/.env`)

```env
# Base de données principale (PostgreSQL via Prisma)
DATABASE_URL=postgresql://user:password@host:5432/database

# Email (optionnel, pour les confirmations)
RESEND_API_KEY=votre_cle_resend
EMAIL_FROM=noreply@whataybo.com

# Frontend URL (pour les liens dans les emails)
FRONTEND_URL=https://www.whataybo.com
```

## Configuration Supabase

### 1. Créer un projet Supabase

1. Aller sur https://supabase.com
2. Créer un nouveau projet
3. Récupérer l'URL et la clé anonyme dans **Settings > API**

### 2. Activer Realtime

1. Aller dans **Database > Replication**
2. Activer Realtime pour les tables suivantes :
   - `Conversation` (ou `conversations`)
   - `Message` (ou `messages`)

### 3. Configuration RLS (Row Level Security)

Les tables Supabase doivent avoir RLS activé pour la sécurité. Cependant, comme nous utilisons Prisma pour la base de données principale, les tables Supabase peuvent être en lecture seule ou avec des politiques RLS appropriées.

**Note** : Si vous utilisez Supabase uniquement pour Realtime et que vos données sont dans PostgreSQL via Prisma, vous pouvez créer des tables vides dans Supabase juste pour Realtime, ou synchroniser les données.

## Utilisation dans le code

### Client Supabase (Frontend)

```typescript
// apps/web/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: false, // On utilise notre propre auth JWT
  },
});
```

### Hooks Realtime

Les hooks suivants utilisent Supabase Realtime :

- `apps/web/hooks/useRealtimeConversations.ts` - Écoute les nouvelles conversations
- `apps/web/hooks/useRealtimeMessages.ts` - Écoute les nouveaux messages

### Exemple d'utilisation

```typescript
import { supabase } from '@/lib/supabase/client';

// S'abonner aux changements de conversations
const channel = supabase
  .channel(`conversations:${restaurantId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'Conversation',
    filter: `restaurantId=eq.${restaurantId}`,
  }, (payload) => {
    console.log('Nouvelle conversation:', payload.new);
  })
  .subscribe();
```

## Vérification de la connexion

### Test manuel

1. Vérifier que les variables d'environnement sont définies :
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. Tester la connexion dans le navigateur (console) :
   ```javascript
   import { supabase } from '@/lib/supabase/client';
   console.log('Supabase URL:', supabase.supabaseUrl);
   ```

3. Vérifier que Realtime fonctionne :
   - Ouvrir le dashboard Supabase
   - Aller dans **Database > Replication**
   - Vérifier que les tables sont activées pour Realtime

## Dépannage

### Erreur : "Missing Supabase environment variables"

**Solution** : Vérifier que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont définies dans `.env.local` (frontend).

### Erreur : "CHANNEL_ERROR" ou "TIMED_OUT"

**Solution** :
1. Vérifier que Realtime est activé dans Supabase Dashboard
2. Vérifier que les tables existent dans Supabase
3. Vérifier que RLS n'est pas trop restrictif

### Les données ne se synchronisent pas

**Rappel** : Supabase est utilisé uniquement pour Realtime. Les données principales sont dans PostgreSQL via Prisma. Si vous avez besoin de synchroniser les données, vous devez :
1. Créer les tables dans Supabase (même schéma que Prisma)
2. Utiliser des triggers PostgreSQL ou des webhooks pour synchroniser

## Notes importantes

1. **Supabase n'est PAS la base de données principale** : Toutes les données (Restaurants, Users, Orders, etc.) sont dans PostgreSQL via Prisma.

2. **Realtime uniquement** : Supabase est utilisé uniquement pour les mises à jour en temps réel des conversations et messages.

3. **Auth séparée** : L'authentification utilise JWT (pas Supabase Auth).

4. **Variables d'environnement** : Les clés Supabase doivent être publiques (`NEXT_PUBLIC_*`) car elles sont utilisées côté client.

## Migration depuis une configuration complète Supabase

Si vous migrez depuis une configuration où Supabase était la base de données principale :

1. Garder Supabase uniquement pour Realtime
2. Migrer toutes les données vers PostgreSQL
3. Utiliser Prisma pour toutes les opérations CRUD
4. Synchroniser uniquement les tables nécessaires pour Realtime (Conversation, Message)
