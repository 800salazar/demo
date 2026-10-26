import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con la llave pública (publishable). Devuelve `null` si las variables no están
 * configuradas, para que la demostración siga funcionando solo con almacenamiento local.
 * Las referencias a `process.env.NEXT_PUBLIC_*` deben ser literales para que Next las incluya en el navegador.
 */
export function createSupabaseClient(options: { persistSession?: boolean } = {}): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const persistSession = options.persistSession ?? true;
  return createClient(url, key, { auth: { persistSession, autoRefreshToken: persistSession } });
}
