import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "./config";

/**
 * Cliente solo servidor con llave publishable para comprobaciones sin privilegios.
 * Las órdenes del visitante siguen en el navegador; no requieren un cliente de Supabase.
 */
export function createSupabaseClient(options: { persistSession?: boolean } = {}): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) return null;

  const persistSession = options.persistSession ?? true;
  return createClient(url, key, { auth: { persistSession, autoRefreshToken: persistSession } });
}
