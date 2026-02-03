/**
 * Supabase Client Configuration
 * 
 * Ce fichier configure les clients Supabase pour :
 * - Client-side (navigateur) avec la clé anonyme
 * - Server-side (API Routes) avec la clé service
 */

import { createClient } from '@supabase/supabase-js';

// Vérification des variables d'environnement
// Nettoyer les clés pour supprimer les espaces/nouvelles lignes parasites
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file.'
  );
}

/**
 * Client Supabase pour le côté client (navigateur)
 * Utilise la clé anonyme (publique)
 * 
 * Usage :
 * ```typescript
 * import { supabase } from '@/lib/supabase-client';
 * 
 * const { data, error } = await supabase
 *   .from('Restaurant')
 *   .select('*')
 *   .eq('slug', 'nile-bites')
 *   .single();
 * ```
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Client Supabase pour le côté serveur (API Routes)
 * Utilise la clé service (privée) qui bypass RLS
 * 
 * ⚠️ À utiliser UNIQUEMENT dans les API Routes (côté serveur)
 * 
 * Usage :
 * ```typescript
 * import { supabaseAdmin } from '@/lib/supabase-client';
 * 
 * export async function GET() {
 *   const { data, error } = await supabaseAdmin
 *     .from('User')
 *     .select('*');
 *   
 *   return Response.json({ data });
 * }
 * ```
 */
export const supabaseAdmin = (() => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Admin client will not be available.'
    );
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
})();

/**
 * Types helpers pour Supabase
 * 
 * Pour générer les types depuis votre schéma Supabase :
 * ```bash
 * npx supabase gen types typescript --project-id [PROJECT_ID] > lib/database.types.ts
 * ```
 * 
 * Puis importer :
 * ```typescript
 * import { Database } from '@/lib/database.types';
 * 
 * const supabase = createClient<Database>(url, key);
 * ```
 */

export default supabase;
