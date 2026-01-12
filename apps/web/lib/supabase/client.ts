// apps/web/lib/supabase/client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Vérifier que les variables d'env existent
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Créer le client Supabase (singleton)
// Utiliser des valeurs par défaut pour permettre le build même si les variables ne sont pas définies
// La vérification se fera au runtime lors de l'utilisation
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10, // Limiter le débit (éviter spam)
      },
    },
    auth: {
      persistSession: false, // On utilise JWT custom
    },
  });
} else {
  // Créer un client factice pour permettre le build
  // Il sera remplacé au runtime si les variables sont définies
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: false,
    },
  });
}

// Fonction helper pour vérifier la configuration au runtime
export function checkSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables are not configured. Realtime features will not work.');
    return false;
  }
  return true;
}

// Types pour TypeScript
export type RealtimeChannel = ReturnType<typeof supabase.channel>;

export { supabase };
