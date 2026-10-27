import { connection, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/client";

const CACHE_MS = 60_000;

interface HealthBody {
  status: "ok";
  supabase: { configured: boolean; schemaReady: boolean };
}

let cached: { at: number; body: HealthBody } | null = null;

/** Comprueba que el despliegue responde y que Supabase está configurado y migrado (sin exponer secretos). */
export async function GET() {
  await connection();

  const now = Date.now();
  if (cached && now - cached.at < CACHE_MS) return NextResponse.json(cached.body);

  const supabase = createSupabaseClient({ persistSession: false });
  let schemaReady = false;

  if (supabase) {
    const { error } = await supabase.from("demo_sessions").select("owner_id").limit(1);
    // 42501: la tabla existe pero el rol anónimo no tiene permisos, que es lo esperado.
    schemaReady = !error || error.code === "42501";
  }

  const body: HealthBody = { status: "ok", supabase: { configured: Boolean(supabase), schemaReady } };
  cached = { at: now, body };
  return NextResponse.json(body);
}
