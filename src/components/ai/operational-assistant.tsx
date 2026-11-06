"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { LoaderCircle, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOperationalSnapshot } from "@/lib/ai/analysis";
import { demoRoutes } from "@/config/routes";
import { MAX_QUESTION_LENGTH } from "@/lib/ai/limits";
import { getSnapshot } from "@/lib/demo/store";
import { useDemoData } from "@/lib/demo/use-demo-data";
import { notifyGuideAction } from "@/lib/guide/steps";

const suggestions = [
  { label: "Retrasos", question: "¿Qué órdenes están retrasadas y cuáles debo revisar primero?" },
  { label: "Sobrecostos", question: "¿Qué departamento tiene mayor costo y qué órdenes superan su presupuesto?" },
  { label: "Resumen", question: "Dame un resumen de las órdenes y tres recomendaciones." },
];

type Answer = {
  question: string; answer: string; source: "ai" | "calculations";
  reason?: string; asOf: string; snapshot: string;
};

const fallbackMessages: Record<string, string> = {
  ai_not_configured: "IA sin configurar.",
  quota_unavailable: "IA temporalmente pausada.",
  ai_empty: "La IA no devolvió contenido.",
  ai_error: "La IA no pudo responder.",
};

export function OperationalAssistant() {
  const data = useDemoData();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const changed = answer && data && answer.snapshot !== JSON.stringify(getOperationalSnapshot(data));

  async function ask(text: string) {
    if (controller.current) return;
    // Read at click time, including edits made after a previous answer.
    const current = getSnapshot();
    if (!current || text.trim().length < 3) return;
    const snapshot = getOperationalSnapshot(current);
    const abortController = new AbortController();
    controller.current = abortController;
    setBusy(true);
    setError("");
    setQuestion(text);
    try {
      const response = await fetch(demoRoutes.aiApi, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, snapshot }),
        signal: abortController.signal,
      });
      const result = await response.json();
      if (!response.ok) {
        const retry = Number(response.headers.get("Retry-After"));
        throw new Error(response.status === 429 && retry > 0
          ? `Se alcanzó el límite de consultas. Intenta en ${Math.ceil(retry / 60)} min.`
          : result.message || "No se pudo completar la consulta.");
      }
      if (typeof result.answer !== "string" || !["ai", "calculations"].includes(result.source)) {
        throw new Error("El asistente devolvió una respuesta inválida.");
      }
      setAnswer({ ...result, question: text, snapshot: JSON.stringify(snapshot) });
      notifyGuideAction("answer-ready");
    } catch (cause) {
      if (!abortController.signal.aborted) {
        setError(cause instanceof Error ? cause.message : "No se pudo conectar. Intenta de nuevo.");
      }
    } finally {
      controller.current = null;
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-primary" aria-hidden />Asistente de producción</CardTitle>
        <CardDescription>
          Analiza tus órdenes actuales. Solo lectura.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div data-guide="ai-suggestions" className="flex flex-wrap gap-2" aria-label="Preguntas sugeridas">
          {suggestions.map(({ label, question: suggestedQuestion }) => (
            <Button key={label} variant="outline" className="h-auto max-w-full whitespace-normal text-left" disabled={!data || busy} onClick={() => void ask(suggestedQuestion)}>
              {label}
            </Button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-3">
          <label htmlFor="operational-question" className="block text-sm font-medium">Tu pregunta</label>
          <textarea id="operational-question" value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="¿Qué cambió en OT-1001?" required minLength={3} maxLength={MAX_QUESTION_LENGTH}
            rows={3} disabled={busy} className="w-full rounded-lg border bg-background p-3 text-sm focus-visible:outline-2 focus-visible:outline-ring" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{data ? `${data.orders.length} órdenes ficticias` : "Cargando órdenes…"} · {question.length}/{MAX_QUESTION_LENGTH}</p>
            <Button type="submit" disabled={!data || busy || question.trim().length < 3}>
              {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
              {busy ? "Analizando…" : "Consultar"}
            </Button>
          </div>
        </form>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div aria-live="polite" aria-busy={busy}>
          {answer && (
            <div data-guide="ai-answer" className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-semibold">{answer.question}</p>
              <p className="text-xs font-medium text-muted-foreground">
                {answer.source === "ai" ? "IA · Verifica antes de decidir" : "Resumen calculado · Sin IA"}
                {" · "}{new Date(answer.asOf).toLocaleString("es-MX", { timeZone: "America/Chihuahua" })}
              </p>
              {answer.source === "calculations" && <p className="text-sm text-muted-foreground">{fallbackMessages[answer.reason ?? ""]}</p>}
              {changed && <p role="status" className="rounded-lg bg-amber-100 p-3 text-sm text-amber-950">Las órdenes cambiaron. Consulta de nuevo para actualizar.</p>}
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{answer.answer}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
