import { connection } from "next/server";
import { CircleAlert, CircleCheck } from "lucide-react";
import { getAiConfig } from "@/lib/ai/config";
import { isRateLimitConfigured } from "@/lib/ai/rate-limit";

/** Se evalúa en cada solicitud para reflejar las variables de entorno reales del servidor. */
export async function AiStatus() {
  await connection();
  const available = getAiConfig().available && isRateLimitConfigured();

  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      {available ? (
        <CircleCheck className="size-5 shrink-0 text-green-600" aria-hidden />
      ) : (
        <CircleAlert className="size-5 shrink-0 text-amber-600" aria-hidden />
      )}
      {available ? "IA configurada" : "Modo de cálculos · IA no disponible"}
    </p>
  );
}
