"use client";

import { useEffect, useRef, useState, useImperativeHandle, type Ref, type FormEvent } from "react";
import { Copy, LoaderCircle, RotateCw, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { GuideStartButton } from "@/components/guide/demo-guide";
import { isProductHelpId, productHelp, type ProductHelpId } from "@/lib/ai/product-help";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOperationalSnapshot } from "@/lib/ai/analysis";
import { demoRoutes } from "@/config/routes";
import { MAX_QUESTION_LENGTH } from "@/lib/ai/limits";
import { getSnapshot } from "@/lib/demo/store";
import { useDemoData } from "@/lib/demo/use-demo-data";
import { notifyGuideAction } from "@/lib/guide/steps";
import { answerParts, plainAnswer } from "@/lib/ai/answer-format";
import { draftCatalogs, validateDraft, type OrderDraft } from "@/lib/ai/order-draft";
import { initialSuggestions, fallbackSuggestions, readSuggestions, type Suggestion } from "@/lib/ai/suggestions";
import { VoiceInput } from "./voice-input";
import styles from "./operational-assistant.module.css";


type Answer = {
  question: string; answer: string; source: "ai" | "calculations" | "help"; helpId?: ProductHelpId;
  draft?: OrderDraft | null; suggestions: Suggestion[];
  reason?: string; asOf: string; snapshot: string; id: number;
};

function TypedAnswer({ text }: { text: string }) {
  const [visible, setVisible] = useState(0);
  const plain = plainAnswer(text);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const characters = typeof Intl.Segmenter === "function"
      ? Array.from(new Intl.Segmenter("es-MX", { granularity: "grapheme" }).segment(plain), (part) => part.segment)
      : Array.from(plain);
    let frame = 0;
    let start: number | undefined;
    const duration = Math.min(4000, Math.max(600, characters.length * 12));
    function tick(time: number) {
      start ??= time;
      const count = Math.min(characters.length, Math.ceil((time - start) / duration * characters.length));
      setVisible(characters.slice(0, count).join("").length);
      if (count < characters.length) frame = requestAnimationFrame(tick);
    }
    function updatePreference() {
      cancelAnimationFrame(frame);
      if (preference.matches) setVisible(plain.length);
      else { start = undefined; frame = requestAnimationFrame(tick); }
    }
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => { cancelAnimationFrame(frame); preference.removeEventListener("change", updatePreference); };
  }, [plain]);

  const parts = answerParts(text);
  return <>
    <span className="sr-only">{plain}</span>
    <span aria-hidden>{parts.map((part, index) => {
      const offset = parts.slice(0, index).reduce((sum, item) => sum + item.text.length, 0);
      const portion = part.text.slice(0, Math.max(0, visible - offset));
      return part.bold ? <strong key={index}>{portion}</strong> : <span key={index}>{portion}</span>;
    })}</span>
  </>;
}

export type AssistantControl = { askQuestion: (text: string) => void };

export function OperationalAssistant({ controlRef, getDraft, onPrepare }: { controlRef?: Ref<AssistantControl>; getDraft?: () => OrderDraft | null; onPrepare?: (draft: OrderDraft) => boolean }) {
  const input = useRef<HTMLTextAreaElement>(null);
  const data = useDemoData();
  const [listening, setListening] = useState(false);
  const [question, setQuestion] = useState("");
  useImperativeHandle(controlRef, () => ({ askQuestion(text) {
    if (controller.current) { toast.info("Espera a que termine la consulta actual."); return; }
    void ask(text.slice(0, MAX_QUESTION_LENGTH), false);
  } }));

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const answerId = useRef(0);
  const conversation = useRef<HTMLDivElement>(null);
  const conversationContent = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLFormElement>(null);
  const followLatest = useRef(true);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    const container = conversation.current;
    const content = conversationContent.current;
    if (!container || !content) return;
    const observer = new ResizeObserver(() => {
      if (!container.getClientRects().length) return;
      if (followLatest.current) container.scrollTop = container.scrollHeight;

    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const container = conversation.current;
    if (container && followLatest.current) container.scrollTop = container.scrollHeight;
  }, [answers, pendingQuestion]);
  const suggestions = answers.at(-1)?.suggestions ?? initialSuggestions;
  const currentSnapshot = data ? JSON.stringify(getOperationalSnapshot(data)) : null;

  async function ask(text: string, clearDraft = true) {
    if (controller.current) return;
    // Read at click time, including edits made after a previous answer.
    const current = getSnapshot();
    if (!current || text.trim().length < 3) return;
    const snapshot = getOperationalSnapshot(current);
    const abortController = new AbortController();
    controller.current = abortController;
    followLatest.current = true;
    setBusy(true);
    setPendingQuestion(text);
    setError("");
    if (clearDraft) setQuestion("");
    try {
      const response = await fetch(demoRoutes.aiApi, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, snapshot, history: answers.map(({ question, answer }) => ({ question, answer })), ...(onPrepare ? { draftContext: { ...draftCatalogs(current), draft: getDraft?.() ?? null } } : {}) }),
        signal: abortController.signal,
      });
      const result = await response.json();
      if (!response.ok) {
        const retry = Number(response.headers.get("Retry-After"));
        throw new Error(response.status === 429 && retry > 0
          ? `Se alcanzó el límite de consultas. Intenta en ${Math.ceil(retry / 60)} min.`
          : result.message || "No se pudo completar la consulta.");
      }
      if (typeof result.answer !== "string" || !["ai", "calculations", "help"].includes(result.source)) {
        throw new Error("El asistente devolvió una respuesta inválida.");
      }
      if (result.draft) {
        if (result.source !== "ai") throw new Error("El borrador requiere una respuesta de IA.");
        result.draft = validateDraft(result.draft, { ...draftCatalogs(getSnapshot() ?? current), draft: null });
        onPrepare?.(result.draft);
      }
      const generatedSuggestions = readSuggestions(result.suggestions, text);
      result.suggestions = generatedSuggestions.length ? generatedSuggestions : fallbackSuggestions(text, snapshot, result.draft ?? getDraft?.());
      const next = { ...result, question: text, snapshot: JSON.stringify(snapshot), id: ++answerId.current } as Answer;
      setAnswers((previous) => [...previous.slice(-1), next]);
      notifyGuideAction("answer-ready");
    } catch (cause) {
      if (!abortController.signal.aborted) {
        setError(cause instanceof Error ? cause.message : "No se pudo conectar. Intenta de nuevo.");
        if (clearDraft) setQuestion(text);
        else toast.error("No se pudo completar la consulta. Intenta nuevamente.");
      }
    } finally {
      controller.current = null;
      setBusy(false);
      setPendingQuestion("");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  async function copyAnswer(text: string) {
    try {
      await navigator.clipboard.writeText(plainAnswer(text));
      toast.success("Respuesta copiada");
    } catch {
      toast.error("No se pudo copiar. Selecciona el texto para copiarlo.");
    }
  }

  return (
    <Card className={styles.assistantCard}>
      <CardHeader className={styles.assistantHeader}>
        <CardTitle role="heading" aria-level={2} className={styles.assistantTitle}>
          <span className={styles.aiIcon} aria-hidden><Sparkles className="size-5" /></span>
          Asistente IA de producción
        </CardTitle>
        <CardDescription>
          Consulta órdenes · Prepara solicitudes para revisar
        </CardDescription>
      </CardHeader>
      <CardContent className={styles.assistantContent}>
        <div className={styles.chatWindow}>
        <div ref={conversation} className={styles.conversation} role="region" aria-label="Conversación" tabIndex={answers.length ? 0 : undefined}
          onScroll={(event) => {
            const element = event.currentTarget;
            followLatest.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
          }}>
          <div ref={conversationContent} className={styles.conversationContent}>
          {!answers.length && !pendingQuestion && <div className={styles.emptyChat}><span className={styles.emptyIcon} aria-hidden><Sparkles /></span><p>¿Qué quieres saber?</p></div>}
          {(busy ? answers.slice(-1) : answers).map((answer, index, shown) => {
            const previous = busy || index < shown.length - 1;
            const changed = answer.source !== "help" && currentSnapshot !== null && answer.snapshot !== currentSnapshot;
            return <div key={answer.id} className={previous ? styles.previousTurn : styles.currentTurn}>
              <div className={styles.questionBubble}><span className="sr-only">Tu pregunta: </span>{answer.question}</div>
              <div data-guide={!previous ? "ai-answer" : undefined} className={styles.aiAnswer}>
                <p className={styles.source}>
                  {answer.source === "help" ? "Ayuda del sistema" : answer.source === "ai" ? "IA · Verifica antes de decidir" : "Resumen calculado · Sin IA"}
                  {" · "}{new Date(answer.asOf).toLocaleString("es-MX", { timeZone: "America/Chihuahua" })}
                </p>
                {changed && <p role="status" className="rounded-lg bg-amber-100 p-3 text-sm text-amber-950">Las órdenes cambiaron. Consulta de nuevo para actualizar.</p>}
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed"><TypedAnswer text={answer.answer} /></p>
                {answer.draft && <Button type="button" className={styles.helpAction} disabled={busy} onClick={() => { try { onPrepare?.(answer.draft!); } catch { setError("Las opciones del borrador cambiaron. Consulta de nuevo."); } }}>Revisar borrador</Button>}
                {isProductHelpId(answer.helpId) && <GuideStartButton guide={productHelp[answer.helpId].guide} variant="outline" className={styles.helpAction}>{productHelp[answer.helpId].label}</GuideStartButton>}
                <div className="flex items-center justify-end gap-1">
                  <Button type="button" variant="ghost" size="icon" className={styles.responseAction} aria-label="Copiar respuesta" title="Copiar respuesta" onClick={() => void copyAnswer(answer.answer)}><Copy aria-hidden /></Button>
                  <Button type="button" variant="ghost" size="icon" className={styles.responseAction} aria-label="Reintentar respuesta" title="Reintentar respuesta" disabled={!data || busy} onClick={() => void ask(answer.question, false)}><RotateCw aria-hidden /></Button>
                </div>
              </div>
            </div>;
          })}
          {pendingQuestion && <div className={styles.currentTurn}>
            <div className={styles.questionBubble}><span className="sr-only">Tu pregunta: </span>{pendingQuestion}</div>
            <p className={styles.waiting} role="status"><LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />Analizando…</p>
          </div>}
          </div>
        </div>
        <div className="sr-only" role="status" aria-live="polite">{!busy && answers.length > 0 ? plainAnswer(answers[answers.length - 1].answer) : ""}</div>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <form ref={composer} onSubmit={submit} className={styles.composer}>
          <div data-guide="ai-suggestions" className={styles.suggestions} aria-label="Preguntas sugeridas">
            {suggestions.map(({ label, question: suggestedQuestion }) => (
              <Button key={label} type="button" variant="outline" size="sm" className={styles.suggestion} title={suggestedQuestion} disabled={!data || busy || listening} onClick={() => void ask(suggestedQuestion, false)}>
                {label}
              </Button>
            ))}
          </div>
          <label htmlFor="operational-question" className="sr-only">Tu pregunta</label>
          <textarea ref={input} id="operational-question" value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="Pregunta o dicta una nueva solicitud…" required minLength={3} maxLength={MAX_QUESTION_LENGTH}
            rows={2} disabled={busy || listening} className={styles.messageInput} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={styles.composerMeta}>{data ? `${data.orders.length} órdenes ficticias` : "Cargando órdenes…"} · {question.length}/{MAX_QUESTION_LENGTH}</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="submit" className={styles.sendButton} disabled={!data || busy || listening || question.trim().length < 3}>
              {busy ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <Send className="size-4" aria-hidden />}
              {busy ? "Analizando…" : "Consultar"}
            </Button>
            <VoiceInput value={question} onChange={setQuestion} disabled={!data || busy} onListeningChange={setListening} className={styles.sendButton} />
            </div>
          </div>
        </form>
        </div>
      </CardContent>
    </Card>
  );
}
