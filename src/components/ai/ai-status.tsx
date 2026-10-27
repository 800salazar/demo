import { connection } from "next/server";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAiConfig } from "@/lib/ai/config";
import { isRateLimitConfigured } from "@/lib/ai/rate-limit";

/** Se evalúa en cada solicitud para reflejar las variables de entorno reales del servidor. */
export async function AiStatus() {
  await connection();
  const available = getAiConfig().available && isRateLimitConfigured();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {available ? (
            <CircleCheck className="size-5 text-green-600" aria-hidden />
          ) : (
            <CircleAlert className="size-5 text-amber-600" aria-hidden />
          )}
          {available ? "Conexión de IA configurada" : "Modo de cálculos disponible"}
        </CardTitle>
        <CardDescription>
          {available
            ? "El asistente intentará analizar tus órdenes con IA. Si la conexión falla, mostrará un resumen calculado claramente identificado."
            : "Puedes consultar cifras de costos, retrasos y órdenes. El análisis con IA se habilitará al completar la configuración del servidor."}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
