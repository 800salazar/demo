"use client";

import { createContext, useContext, useEffect, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, CircleHelp, Crosshair, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { guideForPath, guides, type GuideAction, type GuideId, type GuideStep } from "@/lib/guide/steps";
import { demoRoutes } from "@/config/routes";
import { cn } from "@/lib/utils";
import styles from "./demo-guide.module.css";

type Run = { guide: GuideId; index: number; completed: number[] };
type GuideContextValue = { start: (guide?: GuideId) => void; active: boolean };
const GuideContext = createContext<GuideContextValue | null>(null);

function useGuide() {
  const context = useContext(GuideContext);
  if (!context) throw new Error("La guía requiere DemoGuideProvider.");
  return context;
}

type GuideStartButtonProps = Pick<ComponentProps<typeof Button>, "variant" | "size" | "className"> & {
  guide?: GuideId; children?: ReactNode; attention?: boolean;
};

export function GuideStartButton({ guide, children = "Guía de uso", attention, className, ...props }: GuideStartButtonProps) {
  const { start, active } = useGuide();
  return <Button {...props} data-guide-launcher onClick={() => start(guide)} disabled={active}
    className={cn(className, attention && styles.attention)}><Play aria-hidden />{children}</Button>;
}

export function GuideHelpButton() {
  const { start, active } = useGuide();
  const pathname = usePathname();
  if (pathname.replace(/\/+$/, "") === demoRoutes.home) return null;
  return (
    <div className={styles.launcher}>
      <Button data-guide-launcher variant="outline" onClick={() => start()} disabled={active} aria-label="Guía de uso de esta pantalla">
        <CircleHelp aria-hidden />Guía de uso
      </Button>
    </div>
  );
}

export function DemoGuideProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [run, setRun] = useState<Run | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const steps: GuideStep[] = run ? guides[run.guide] : [];
  const step = run ? steps[run.index] : undefined;

  function close() {
    setRun(null);
    requestAnimationFrame(() => {
      // Next can retain old route DOM inside a hidden Activity; connected is not enough.
      const opener = returnFocus.current;
      const visible = opener?.isConnected && opener.getClientRects().length > 0 && !opener.closest("[hidden],[inert]") && !opener.matches(":disabled");
      const target = visible ? opener : document.querySelector<HTMLElement>("[data-guide-launcher]");
      target?.focus({ preventScroll: true });
    });
  }

  function start(guide = guideForPath(pathname)) {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setRun({ guide, index: 0, completed: [] });
    const first = guides[guide][0];
    if (pathname !== first.path) router.push(first.path);
  }

  function move(index: number) {
    if (!run) return;
    setRun({ ...run, index });
    const next = steps[index];
    if (next && pathname !== next.path) router.push(next.path);
  }

  useEffect(() => {
    if (!run) return;
    const action = (event: Event) => {
      const detail = (event as CustomEvent<GuideAction>).detail;
      if (pathname !== step?.path || detail !== step.action) return;
      setRun((current) => current && !current.completed.includes(current.index)
        ? { ...current, completed: [...current.completed, current.index] } : current);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    const navigate = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (anchor && !anchor.getAttribute("href")?.startsWith("#")) close();
    };
    window.addEventListener("salazar:guide-action", action);
    window.addEventListener("keydown", escape);
    window.addEventListener("popstate", close);
    document.addEventListener("click", navigate);
    return () => {
      window.removeEventListener("salazar:guide-action", action);
      window.removeEventListener("keydown", escape);
      window.removeEventListener("popstate", close);
      document.removeEventListener("click", navigate);
    };
  }, [run, step, pathname]);

  return (
    <GuideContext.Provider value={{ start, active: Boolean(run) }}>
      {children}
      {run && <GuideOverlay key={`${run.guide}:${run.index}`} step={step} onRoute={pathname === step?.path}
        index={run.index} total={steps.length} completed={run.completed.includes(run.index)}
        onClose={close} onBack={() => move(run.index - 1)} onNext={() => move(run.index + 1)} />}
    </GuideContext.Provider>
  );
}

type OverlayProps = {
  step?: GuideStep; onRoute: boolean; index: number; total: number; completed: boolean;
  onClose: () => void; onBack: () => void; onNext: () => void;
};
type View = { top: number; left: number; width: number; height: number; panelHeight: number; rect: DOMRect | null };

function GuideOverlay({ step, onRoute, index, total, completed, onClose, onBack, onNext }: OverlayProps) {
  const panel = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLElement | null>(null);
  const [view, setView] = useState<View>({ top: 0, left: 0, width: 390, height: 800, panelHeight: 260, rect: null });
  const [missing, setMissing] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const finished = !step;

  function revealTarget(focus = false) {
    const element = target.current;
    if (!element) return;
    const viewport = window.visualViewport;
    const height = viewport?.height ?? window.innerHeight;
    const panelHeight = panel.current?.getBoundingClientRect().height ?? 260;
    const rect = element.getBoundingClientRect();
    const space = Math.max(88, (height - panelHeight - Math.min(rect.height, 120)) / 2);
    window.scrollBy({ top: rect.top - space - (viewport?.offsetTop ?? 0), behavior: "instant" });
    if (focus) {
      const control = element.matches("button,input,select,textarea,a[href]") ? element
        : element.querySelector<HTMLElement>("button:not(:disabled),input,select,textarea,a[href]") ?? element;
      control.focus({ preventScroll: true });
    }
  }

  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
    let frame = 0;
    let previousDescription: string | null = null;
    let previousTabIndex: string | null = null;
    const resize = new ResizeObserver(() => schedule());
    function detach() {
      if (!target.current) return;
      resize.unobserve(target.current);
      if (previousDescription === null) target.current.removeAttribute("aria-describedby");
      else target.current.setAttribute("aria-describedby", previousDescription);
      if (previousTabIndex === null) target.current.removeAttribute("tabindex");
      else target.current.setAttribute("tabindex", previousTabIndex);
      target.current = null;
    }
    function measure() {
      frame = 0;
      const found = step && onRoute
        ? Array.from(document.querySelectorAll<HTMLElement>(`[data-guide="${step.target}"]`)).find((element) => element.getClientRects().length > 0) ?? null
        : null;
      if (found !== target.current) {
        detach();
        target.current = found;
        if (found) {
          previousDescription = found.getAttribute("aria-describedby");
          previousTabIndex = found.getAttribute("tabindex");
          found.setAttribute("aria-describedby", [previousDescription, "guide-description"].filter(Boolean).join(" "));
          if (!found.matches("button,input,select,textarea,a[href],[tabindex]")) found.tabIndex = -1;
          resize.observe(found);
          revealTarget();
        }
      }
      const viewport = window.visualViewport;
      const next: View = {
        top: viewport?.offsetTop ?? 0, left: viewport?.offsetLeft ?? 0,
        width: viewport?.width ?? window.innerWidth, height: viewport?.height ?? window.innerHeight,
        panelHeight: panel.current?.getBoundingClientRect().height ?? 260,
        rect: found?.getBoundingClientRect() ?? null,
      };
      setView((old) => old.top === next.top && old.left === next.left && old.width === next.width && old.height === next.height
        && old.panelHeight === next.panelHeight && old.rect?.x === next.rect?.x && old.rect?.y === next.rect?.y
        && old.rect?.width === next.rect?.width && old.rect?.height === next.rect?.height ? old : next);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(measure); }
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { childList: true, subtree: true });
    if (panel.current) resize.observe(panel.current);
    const viewportResize = () => { revealTarget(); schedule(); };
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", viewportResize);
    window.visualViewport?.addEventListener("resize", viewportResize);
    window.visualViewport?.addEventListener("scroll", schedule);
    const timeout = window.setTimeout(() => { if (!target.current && step) setMissing(true); }, 6000);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      mutations.disconnect();
      resize.disconnect();
      detach();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", viewportResize);
      window.visualViewport?.removeEventListener("resize", viewportResize);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, [step, onRoute]);

  function rate(useful: boolean) {
    setFeedback(useful);
    try { localStorage.setItem("salazar-demo:guide-feedback", JSON.stringify({ useful, at: new Date().toISOString() })); } catch { /* Help also works without storage. */ }
  }

  const panelTop = view.top + Math.max(12, view.height - view.panelHeight - 12);
  const ringTop = view.rect ? Math.max(view.top + 76, view.rect.top - 6) : 0;
  const ringBottom = view.rect ? Math.min(panelTop - 12, view.rect.bottom + 6) : 0;
  const ringLeft = view.rect ? Math.max(view.left + 6, view.rect.left - 6) : 0;
  const ringRight = view.rect ? Math.min(view.left + view.width - 6, view.rect.right + 6) : 0;
  const ready = Boolean(view.rect && onRoute);

  return (
    <>
      <div className={styles.spacer} style={{ "--guide-space": `${view.panelHeight + 36}px` } as CSSProperties} aria-hidden />
      <div className={styles.layer}>
        {ringBottom > ringTop && ringRight > ringLeft && <div data-guide-spotlight className={styles.spotlight} aria-hidden
          style={{ top: ringTop, left: ringLeft, width: ringRight - ringLeft, height: ringBottom - ringTop }} />}
        <div ref={panel} className={`${styles.panel} ${view.height < 480 ? styles.compact : ""}`} role="dialog" aria-modal="false"
          aria-labelledby="guide-title" aria-describedby="guide-description" tabIndex={-1}
          style={{ top: panelTop, left: view.left + Math.max(12, view.width - 372), width: Math.min(360, view.width - 24), maxHeight: view.height - 24 }}>
          <div className={styles.heading}>
            <p className={styles.counter}>{finished ? "Recorrido completado" : `Guía · ${index + 1} de ${total}`}</p>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar guía"><X aria-hidden /></Button>
          </div>
          <h2 id="guide-title">{step?.title ?? "Ya puedes explorar"}</h2>
          <p id="guide-description" className={styles.description}>{step?.description ?? "La ayuda sigue disponible en cada pantalla."}</p>
          {!finished && <progress className={styles.progress} value={index + 1} max={total} aria-label="Avance de la guía" />}
          {!finished && <p role="status" className={styles.status}>
            {completed ? "Listo. Puedes continuar." : !ready ? missing ? "Control no disponible. Puedes omitir este paso." : "Buscando el control…" : step.action ? "Realiza la acción o elige Omitir." : ""}
          </p>}
          {finished ? <>
            <p className={styles.description}>{feedback === null ? "¿Te fue útil?" : "Gracias por tu opinión."}</p>
            <div className={styles.actions}>
              <div>
                <Button variant="outline" onClick={() => rate(true)} disabled={feedback !== null} aria-label="La guía fue útil">Sí</Button>
                <Button variant="outline" onClick={() => rate(false)} disabled={feedback !== null} aria-label="La guía no fue útil">No</Button>
              </div>
              <Button onClick={onClose}>Finalizar</Button>
            </div>
          </> : <div className={styles.actions}>
            <div>
              <Button variant="outline" size="icon" onClick={onBack} disabled={index === 0} aria-label="Paso anterior"><ArrowLeft aria-hidden /></Button>
              <Button variant="outline" size="icon" onClick={() => revealTarget(true)} disabled={!ready} aria-label="Ir al control resaltado"><Crosshair aria-hidden /></Button>
            </div>
            <div>
              {((step.action && !completed) || !ready) && <Button variant="ghost" onClick={onNext}>Omitir</Button>}
              <Button onClick={onNext} disabled={!ready || Boolean(step.action && !completed)}>{index + 1 === total ? "Terminar" : "Siguiente"}</Button>
            </div>
          </div>}
        </div>
      </div>
    </>
  );
}
