"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, CircleHelp, Crosshair, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResetDemoButton } from "@/components/showroom/reset-demo-button";
import { guideStepUrl, guides, type GuideAction, type GuideId, type GuideStep } from "@/lib/guide/steps";
import { demoRoutes } from "@/config/routes";
import { cn } from "@/lib/utils";
import styles from "./demo-guide.module.css";

type Run = { guide: GuideId; index: number; completed: number[] };
type GuideContextValue = { start: (guide?: GuideId, opener?: HTMLElement) => void; active: boolean };
const GuideContext = createContext<GuideContextValue | null>(null);

export function useGuide() {
  const context = useContext(GuideContext);
  if (!context) throw new Error("La guía requiere DemoGuideProvider.");
  return context;
}

type GuideStartButtonProps = Pick<ComponentProps<typeof Button>, "variant" | "size" | "className"> & {
  guide?: GuideId; children?: ReactNode; attention?: boolean; withReset?: boolean;
};

export function GuideStartButton({ guide, children = "Guía de uso", attention, withReset, className, ...props }: GuideStartButtonProps) {
  const { start, active } = useGuide();
  const button = <Button {...props} data-guide-launcher onClick={() => start(guide)} disabled={active}
    className={cn(className, attention && styles.attention)}><CircleHelp aria-hidden />{children}</Button>;
  return withReset ? (
    <div className={styles.startControls}>
      {button}
      <ResetDemoButton variant="ghost" disabled={active} />
    </div>
  ) : button;
}

export function GuideHelpButton() {
  const { start, active } = useGuide();
  const pathname = usePathname();
  const [showHint, setShowHint] = useState(false);
  const isHome = pathname.replace(/\/+$/, "") === demoRoutes.home;

  useEffect(() => {
    if (active) return;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const show = () => {
      if (document.hidden) return;
      setShowHint(true);
      hide = setTimeout(() => setShowHint(false), 6000);
    };
    const first = setTimeout(show, 4000);
    const repeat = setInterval(show, 90000);
    return () => { clearTimeout(first); clearInterval(repeat); if (hide) clearTimeout(hide); };
  }, [active]);

  return (
    <>
      <div className={cn(styles.floatingGuide, active && styles.floatingGuideActive)}>
        <Button data-guide-launcher variant="outline" className={cn(styles.attention, styles.floatingButton)} aria-label="Guía de uso" onClick={() => start(isHome ? "full" : undefined)} disabled={active}>
          <CircleHelp aria-hidden /><span className={styles.floatingLabel}>Guía de uso</span>
        </Button>
        {showHint && !active && <span className={styles.guideHint} aria-hidden>Estoy aquí para ayudarte</span>}
      </div>
      {!isHome && <div className={styles.launcher}><ResetDemoButton variant="ghost" disabled={active} /></div>}
    </>
  );
}

export function DemoGuideProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [run, setRun] = useState<Run | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const restoreFocus = useRef(false);
  const steps: GuideStep[] = run ? guides[run.guide] : [];
  const step = run ? steps[run.index] : undefined;

  const clearGuide = useCallback((restore: boolean) => {
    window.dispatchEvent(new CustomEvent("salazar:guide-target", { detail: null }));
    restoreFocus.current = restore;
    setRun(null);
  }, []);

  const close = useCallback(() => clearGuide(true), [clearGuide]);

  useEffect(() => {
    if (run || !restoreFocus.current) return;
    let frame = 0;
    let attempts = 0;
    function focusLauncher() {
      // Wait for the launcher to reappear after its visibility transition.
      // Next can retain old route DOM inside a hidden Activity; connected is not enough.
      const opener = returnFocus.current;
      const available = (element: HTMLElement | null) => element?.isConnected && element.getClientRects().length > 0 && !element.closest("[hidden],[inert]") && !element.matches(":disabled") && getComputedStyle(element).visibility === "visible";
      const target = available(opener) ? opener : Array.from(document.querySelectorAll<HTMLElement>("[data-guide-launcher]")).find(available);
      if (target) {
        target.focus({ preventScroll: true });
        restoreFocus.current = false;
      } else if (++attempts < 120) frame = requestAnimationFrame(focusLauncher);
    }
    frame = requestAnimationFrame(focusLauncher);
    return () => cancelAnimationFrame(frame);
  }, [run]);

  function start(guide: GuideId = "full", opener?: HTMLElement) {
    returnFocus.current = opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setRun({ guide, index: 0, completed: [] });
    const first = guides[guide][0];
    router.push(guideStepUrl(first), { scroll: false });
  }

  function move(index: number) {
    if (!run) return;
    if (index >= steps.length) {
      close();
      return;
    }
    setRun({ ...run, index });
    const next = steps[index];
    if (next) router.push(guideStepUrl(next), { scroll: false });
  }

  useEffect(() => {
    if (!run) return;
    const action = (event: Event) => {
      const detail = (event as CustomEvent<GuideAction>).detail;
      if (pathname !== step?.path || detail !== step.action) return;
      if (step.onAction === "close") {
        clearGuide(false);
        return;
      }
      if (step.onAction === "next") {
        setRun({ ...run, index: run.index + 1 });
        return;
      }
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
  }, [run, step, pathname, close, clearGuide]);

  return (
    <GuideContext.Provider value={{ start, active: Boolean(run) }}>
      {children}
      {run && step && <GuideOverlay key={`${run.guide}:${run.index}`} step={step} onRoute={pathname === step.path}
        index={run.index} total={steps.length} completed={run.completed.includes(run.index)}
        onClose={close} onBack={() => move(run.index - 1)} onNext={() => move(run.index + 1)} />}
    </GuideContext.Provider>
  );
}

type OverlayProps = {
  step: GuideStep; onRoute: boolean; index: number; total: number; completed: boolean;
  onClose: () => void; onBack: () => void; onNext: () => void;
};
type View = { top: number; left: number; width: number; height: number; panelHeight: number; rect: DOMRect | null; expanded: boolean; fixed: boolean };

function bottomMargin(width: number, height: number) {
  return width >= 768 && height >= 700 ? height * 0.22 : 24;
}

function GuideOverlay({ step, onRoute, index, total, completed, onClose, onBack, onNext }: OverlayProps) {
  const panel = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLElement | null>(null);
  const [view, setView] = useState<View>({ top: 0, left: 0, width: 390, height: 800, panelHeight: 260, rect: null, expanded: false, fixed: false });
  const [missing, setMissing] = useState(false);
  const [highlightCount, setHighlightCount] = useState(1);

  function revealTarget(focus = false) {
    const element = target.current;
    if (!element) return;
    const viewport = window.visualViewport;
    const height = viewport?.height ?? window.innerHeight;
    const width = viewport?.width ?? window.innerWidth;
    const panelHeight = panel.current?.getBoundingClientRect().height ?? 260;
    const rect = element.getBoundingClientRect();
    const available = Math.max(0, height - panelHeight - bottomMargin(width, height));
    const space = Math.max(88, (available - Math.min(rect.height, 120)) / 2);
    if (!element.closest("[data-guide-fixed]")) window.scrollBy({ top: rect.top - space - (viewport?.offsetTop ?? 0), behavior: "instant" });
    if (focus) {
      const control = element.matches("button,input,select,textarea,a[href]") ? element
        : element.querySelector<HTMLElement>("button:not(:disabled),input,select,textarea,a[href]") ?? element;
      control.focus({ preventScroll: true });
    }
  }

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("salazar:guide-target", { detail: step?.target }));
    panel.current?.focus({ preventScroll: true });
    let frame = 0;
    let previousDescription: string | null = null;
    let previousTabIndex: string | null = null;
    let expandedElement: HTMLElement | null = null;
    const resize = new ResizeObserver(() => schedule());
    function detach() {
      if (expandedElement) resize.unobserve(expandedElement);
      expandedElement = null;
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
      const expanded = found?.querySelector<HTMLElement>("[data-guide-expand]") ?? null;
      if (expanded !== expandedElement) {
        if (expandedElement) resize.unobserve(expandedElement);
        expandedElement = expanded;
        if (expanded) {
          resize.observe(expanded);
          // Leave as much room as possible for the open list above the guide.
          const top = found!.getBoundingClientRect().top;
          const desiredTop = (viewport?.offsetTop ?? 0) + 88;
          if (top > desiredTop) window.scrollBy({ top: top - desiredTop, behavior: "instant" });
        }
      }
      const targetRect = found?.getBoundingClientRect() ?? null;
      const expandedRect = expanded?.getBoundingClientRect();
      const rect = targetRect && expandedRect ? DOMRect.fromRect({
        x: Math.min(targetRect.left, expandedRect.left), y: Math.min(targetRect.top, expandedRect.top),
        width: Math.max(targetRect.right, expandedRect.right) - Math.min(targetRect.left, expandedRect.left),
        height: Math.max(targetRect.bottom, expandedRect.bottom) - Math.min(targetRect.top, expandedRect.top),
      }) : targetRect;
      const next: View = {
        top: viewport?.offsetTop ?? 0, left: viewport?.offsetLeft ?? 0,
        width: viewport?.width ?? window.innerWidth, height: viewport?.height ?? window.innerHeight,
        panelHeight: panel.current?.getBoundingClientRect().height ?? 260,
        rect, expanded: Boolean(expanded), fixed: Boolean(found?.closest("[data-guide-fixed]")),
      };
      setView((old) => old.top === next.top && old.left === next.left && old.width === next.width && old.height === next.height
        && old.panelHeight === next.panelHeight && old.fixed === next.fixed && old.expanded === next.expanded && old.rect?.x === next.rect?.x && old.rect?.y === next.rect?.y
        && old.rect?.width === next.rect?.width && old.rect?.height === next.rect?.height ? old : next);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(measure); }
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "data-state", "data-open"] });
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

  const margin = bottomMargin(view.width, view.height);
  const panelWidth = Math.min(480, view.width - 24);
  const panelLeft = view.left + (view.width - panelWidth) / 2;
  const intersectsX = Boolean(view.rect && view.rect.right + 12 > panelLeft && view.rect.left - 12 < panelLeft + panelWidth);
  const defaultTop = view.top + Math.max(12, view.height - view.panelHeight - margin);
  // The assistant's composer cannot be moved with page scrolling. Put its guide above it.
  const aboveTarget = view.rect ? view.rect.top - view.panelHeight - 18 : 0;
  const panelTop = view.fixed && intersectsX && view.rect && aboveTarget >= view.top + 12
    ? Math.min(defaultTop, aboveTarget) : defaultTop;
  const panelAboveTarget = Boolean(view.fixed && view.rect && panelTop + view.panelHeight <= view.rect.top - 12);
  const hidePanel = Boolean(view.expanded && view.rect && view.rect.bottom + 12 > panelTop);
  const ringTop = view.rect ? Math.max(view.top + (view.fixed ? 6 : 76), view.rect.top - 6) : 0;
  const ringBottom = view.rect ? Math.min(hidePanel || !intersectsX || panelAboveTarget ? view.top + view.height - 6 : panelTop - 12, view.rect.bottom + 6) : 0;
  const ringLeft = view.rect ? Math.max(view.left + 6, view.rect.left - 6) : 0;
  const ringRight = view.rect ? Math.min(view.left + view.width - 6, view.rect.right + 6) : 0;
  const ready = Boolean(view.rect && onRoute);

  return (
    <>
      <div className={styles.spacer} style={{ "--guide-space": `${view.panelHeight + margin + 24}px` } as CSSProperties} aria-hidden />
      <div className={styles.layer}>
        {ringBottom > ringTop && ringRight > ringLeft && <div data-guide-spotlight className={styles.spotlight} aria-hidden
          style={{ top: ringTop, left: ringLeft, width: ringRight - ringLeft, height: ringBottom - ringTop }}>
          {highlightCount > 0 && <span key={highlightCount} className={styles.spotlightPulse} />}
        </div>}
        <div ref={panel} data-demo-guide-panel className={`${styles.panel} ${view.height < 480 ? styles.compact : ""}`} role="dialog" aria-modal="false" aria-hidden={hidePanel || undefined}
          aria-labelledby="guide-title" aria-describedby="guide-description" tabIndex={-1}
          style={{ visibility: hidePanel ? "hidden" : undefined, top: panelTop, left: panelLeft, width: panelWidth, maxHeight: view.height - 24 }}>
          <div className={styles.heading}>
            <p className={styles.counter}>{`Guía · ${index + 1} de ${total}`}</p>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar guía"><X aria-hidden /></Button>
          </div>
          <h2 id="guide-title">{step?.title}</h2>
          <p id="guide-description" className={styles.description}>{step?.description}</p>
          <progress className={styles.progress} value={index + 1} max={total} aria-label="Avance de la guía" />
          <p role="status" className={styles.status}>
            {completed ? "Listo. Puedes continuar." : !ready ? missing ? "Control no disponible. Puedes omitir este paso." : "Buscando el control…" : step.action ? "Realiza la acción o elige Omitir." : ""}
          </p>
          <div className={styles.actions}>
            <div>
              <Button variant="outline" size="icon" onClick={onBack} disabled={index === 0} aria-label="Paso anterior"><ArrowLeft aria-hidden /></Button>
              <Button variant="outline" size="icon" onClick={() => { revealTarget(true); setHighlightCount((count) => count + 1); }} disabled={!ready} aria-label="Ir al control resaltado"><Crosshair aria-hidden /></Button>
            </div>
            <div>
              {((step.action && !completed) || !ready) && <Button variant="ghost" onClick={onNext}>Omitir</Button>}
              <Button onClick={onNext} disabled={!ready || Boolean(step.action && !completed)}>{index + 1 === total ? "Terminar" : "Siguiente"}</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
