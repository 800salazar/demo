"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUpRight, Check, ChevronDown, Copy, FileSpreadsheet, GraduationCap, Lightbulb } from "lucide-react";
import { businessAuditPrompt, buildBusinessIdeaPrompt, type BusinessIdea } from "@/lib/conference/prompts";
import styles from "./conference.module.css";

type Path = "audit" | "idea";
type CopyState = "idle" | "copying" | "copied" | "manual";

const assistants = [
  { name: "ChatGPT", href: "https://chatgpt.com/" },
  { name: "Claude", href: "https://claude.ai/" },
  { name: "Gemini", href: "https://gemini.google.com/" },
  { name: "Copilot", href: "https://copilot.microsoft.com/" },
];

export function ConferenceToolkit() {
  const [path, setPath] = useState<Path | null>(null);
  const [idea, setIdea] = useState<BusinessIdea>({ product: "", location: "", budget: "" });
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const manualText = useRef<HTMLTextAreaElement>(null);
  const pathContent = useRef<HTMLDivElement>(null);
  const copyVersion = useRef(0);
  const prompt = path === "audit" ? businessAuditPrompt : buildBusinessIdeaPrompt(idea);

  useEffect(() => {
    if (!path) return;
    pathContent.current?.focus({ preventScroll: true });
    pathContent.current?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, [path]);

  useEffect(() => {
    if (copyState === "manual") {
      manualText.current?.focus();
      manualText.current?.select();
    }
  }, [copyState]);

  function selectPath(next: Path) {
    copyVersion.current += 1;
    setPath(next);
    setCopyState("idle");
  }

  function updateIdea(field: keyof BusinessIdea, value: string) {
    copyVersion.current += 1;
    setIdea((current) => ({ ...current, [field]: value }));
    setCopyState("idle");
  }

  async function copyPrompt() {
    const version = ++copyVersion.current;
    setCopyState("copying");
    try {
      await navigator.clipboard.writeText(prompt);
      if (version === copyVersion.current) setCopyState("copied");
    } catch {
      if (version === copyVersion.current) setCopyState("manual");
    }
  }

  function submitIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    // Native required validation handles empty fields. Also reject whitespace
    // so the copied prompt never contains unanswered placeholders.
    for (const field of ["product", "location", "budget"] as const) {
      const input = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement;
      input.setCustomValidity(idea[field].trim() ? "" : "Escribe este dato para preparar tu prompt.");
      if (!input.reportValidity()) return;
    }
    void copyPrompt();
  }

  const copyButton = (
    <button type={path === "idea" ? "submit" : "button"} className={styles.copyButton}
      disabled={copyState === "copying"} onClick={path === "audit" ? () => void copyPrompt() : undefined}>
      {copyState === "copied" ? <Check size={19} aria-hidden="true" /> : <Copy size={19} aria-hidden="true" />}
      {copyState === "copying" ? "Copiando…" : copyState === "copied" ? "¡Copiado!" : "Copiar prompt"}
    </button>
  );

  return (
    <section id="conferencia" className={styles.toolkit} aria-labelledby="conference-title">
      <p className={styles.eyebrow}><GraduationCap size={17} aria-hidden="true" /> RECURSO DE LA CONFERENCIA</p>
      <h2 id="conference-title">Emprende <span>con IA.</span></h2>
      <p className={styles.intro}>Elige un camino. Copia y pega en tu IA.</p>

      <div className={styles.pathChoices} role="group" aria-label="Elige tu punto de partida">
        <button type="button" className={`${styles.pathCard} ${styles.auditCard}`}
          aria-pressed={path === "audit"} aria-controls="conference-content" onClick={() => selectPath("audit")}>
          <FileSpreadsheet size={23} aria-hidden="true" />
          <span className={styles.choiceCopy}><strong>Ya tengo avances</strong><span>Excel, Canvas o notas.</span></span>
          {path === "audit" ? <Check size={17} aria-hidden="true" /> : <ArrowDown size={17} aria-hidden="true" />}
        </button>
        <button type="button" className={`${styles.pathCard} ${styles.ideaCard}`}
          aria-pressed={path === "idea"} aria-controls="conference-content" onClick={() => selectPath("idea")}>
          <Lightbulb size={23} aria-hidden="true" />
          <span className={styles.choiceCopy}><strong>Solo tengo una idea</strong><span>Aún no tengo números.</span></span>
          {path === "idea" ? <Check size={17} aria-hidden="true" /> : <ArrowDown size={17} aria-hidden="true" />}
        </button>
      </div>

      <div id="conference-content" ref={pathContent} tabIndex={-1} className={path ? styles.pathContent : undefined}>
        {path ? <a href="#conferencia" className={styles.changePath}>↑ Elegir otro camino</a> : null}
        {path === "audit" ? (
          <div>
            <h3>Revisa tu proyecto.</h3>
            <ol className={styles.instructions}>
              <li>Copia el prompt.</li>
              <li>Abre tu IA y <strong>adjunta tus archivos</strong>.</li>
              <li>Pégalo y envíalo.</li>
            </ol>
            <details className={styles.documents}>
              <summary>¿Qué archivos puedo subir? <ChevronDown size={16} aria-hidden="true" /></summary>
              <ul>
                <li><strong>Costos y precios:</strong> tu Excel o tabla de costos y venta.</li>
                <li><strong>Canvas:</strong> foto o PDF de tu modelo de negocio.</li>
                <li><strong>Presentación:</strong> tu idea en 5 a 10 diapositivas.</li>
                <li><strong>Entrevistas:</strong> notas de posibles clientes.</li>
              </ul>
              <p>Con uno basta. PDF, Excel o imágenes legibles.</p>
            </details>
            <div className={styles.copyBar}>{copyButton}</div>
          </div>
        ) : path === "idea" ? (
          <form onSubmit={submitIdea}>
            <h3>Completa estos 3 datos.</h3>
            <div className={styles.fields}>
              <label htmlFor="conference-product">¿Qué quieres vender?
                <textarea id="conference-product" name="product" placeholder="Ej. Snacks saludables para mis compañeros" rows={2}
                  required maxLength={500} value={idea.product} onChange={(event) => { event.target.setCustomValidity(""); updateIdea("product", event.target.value); }} />
              </label>
              <label htmlFor="conference-location">¿En qué ciudad o zona?
                <input id="conference-location" name="location" placeholder="Ej. Mi universidad en Chihuahua" required maxLength={150}
                  value={idea.location} onChange={(event) => { event.target.setCustomValidity(""); updateIdea("location", event.target.value); }} />
              </label>
              <label htmlFor="conference-budget">¿Cuánto puedes invertir hoy?
                <input id="conference-budget" name="budget" placeholder="Ej. $500 MXN (también puede ser $0)" required maxLength={100}
                  value={idea.budget} onChange={(event) => { event.target.setCustomValidity(""); updateIdea("budget", event.target.value); }} />
              </label>
            </div>
            <div className={styles.copyBar}>{copyButton}</div>
          </form>
        ) : null}

        <p className={styles.copyFeedback} role="status" aria-live="polite">
          {copyState === "copied" ? "Listo. Abre tu IA favorita y pega el texto." : copyState === "manual" ? "Tu navegador no permitió copiar. Selecciona el texto de abajo y elige Copiar." : ""}
        </p>
        {copyState === "manual" ? <textarea ref={manualText} className={styles.manualText} aria-label="Prompt para copiar manualmente" readOnly value={prompt} rows={8} /> : null}
        {path ? <details className={styles.promptPreview}><summary>Ver el prompt completo <ChevronDown size={16} aria-hidden="true" /></summary><pre>{prompt}</pre></details> : null}
      </div>

      <div className={styles.assistants} aria-label="Abrir tu IA favorita">
        <div>{assistants.map((assistant) => <a key={assistant.name} href={assistant.href} target="_blank" rel="noopener noreferrer">{assistant.name}<ArrowUpRight size={13} aria-hidden="true" /></a>)}</div>
        {path === "audit" ? <p>Elige una IA que permita adjuntar archivos.</p> : null}
      </div>
    </section>
  );
}
