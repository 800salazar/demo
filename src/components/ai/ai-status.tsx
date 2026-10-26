import { connection } from "next/server";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAiConfig } from "@/lib/ai/config";

/** Se evalúa en cada solicitud para reflejar las variables de entorno reales del servidor. */
export async function AiStatus() {
  await connection();
  const { available } = getAiConfig();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {available ? (
            <CircleCheck className="size-5 text-green-600" aria-hidden />
          ) : (
            <CircleAlert className="size-5 text-amber-600" aria-hidden />
          )}
          {available ? "Asistente de IA disponible" : "Asistente de IA no disponible"}
        </CardTitle>
        <CardDescription>
          {available
            ? "Las respuestas se generan en el servidor a partir de métricas calculadas con los datos de la demostración."
            : "Falta configurar OPENAI_API_KEY y OPENAI_MODEL en el servidor. El dashboard con cálculos reales seguirá disponible; no se simulan respuestas de inteligencia artificial."}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
