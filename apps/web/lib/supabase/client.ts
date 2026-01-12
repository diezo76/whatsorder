// apps/web/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

// Vérifier que les variables d'env existent
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Créer le client Supabase (singleton)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Limiter le débit (éviter spam)
    },
  },
  auth: {
    persistSession: false, // On utilise JWT custom
  },
});

// Types pour TypeScript
export type RealtimeChannel = ReturnType<typeof supabase.channel>;
