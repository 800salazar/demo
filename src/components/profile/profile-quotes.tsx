"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, Quote } from "lucide-react";
import styles from "./profile.module.css";

const bayer = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

export function ProfileQuotes({ quotes }: { quotes: readonly string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const textRef = useRef<HTMLParagraphElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const quote = quotes[index % quotes.length] ?? "";

  useEffect(() => {
    if (paused || reduceMotion || quotes.length < 2) return;
    const timer = window.setTimeout(() => setIndex((value) => (value + 1) % quotes.length), Math.max(8500, quote.length * 90));
    return () => window.clearTimeout(timer);
  }, [index, paused, quote, quotes.length, reduceMotion]);

  useEffect(() => {
    const text = textRef.current;
    const canvas = canvasRef.current;
    if (!text || !canvas || reduceMotion) return;
    let frame = 0;
    let cancelled = false;
    const render = () => {
      if (cancelled) return;
      const width = text.clientWidth;
      const height = text.clientHeight;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const context = canvas.getContext("2d");
      const mask = document.createElement("canvas");
      mask.width = canvas.width = Math.ceil(width * dpr);
      mask.height = canvas.height = Math.ceil(height * dpr);
      const maskContext = mask.getContext("2d");
      if (!context || !maskContext) return;
      const computed = window.getComputedStyle(text);
      const fontSize = parseFloat(computed.fontSize);
      const lineHeight = parseFloat(computed.lineHeight) || fontSize * 1.6;
      maskContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      maskContext.font = `${computed.fontStyle} ${computed.fontWeight} ${fontSize}px ${computed.fontFamily}`;
      maskContext.textBaseline = "top";
      maskContext.fillStyle = "white";
      let line = "";
      let lineIndex = 0;
      for (const word of quote.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && maskContext.measureText(candidate).width > width) {
          maskContext.fillText(line, 0, lineIndex++ * lineHeight + (lineHeight - fontSize) / 2);
          line = word;
        } else line = candidate;
      }
      maskContext.fillText(line, 0, lineIndex * lineHeight + (lineHeight - fontSize) / 2);
      text.style.opacity = "0.3";
      const started = performance.now();
      const draw = (now: number) => {
        const progress = Math.min((now - started) / 1500, 1);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, width, height);
        context.globalCompositeOperation = "source-over";
        context.fillStyle = "#78aaff";
        const size = 3;
        const columns = Math.ceil(width / size);
        const rows = Math.ceil(height / size);
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < columns; x++) {
            const position = (y * columns + x) / (columns * rows);
            const coverage = Math.max(0, Math.min(1, (progress * 1.55 - position) / 0.55));
            if (coverage > (bayer[(y & 7) * 8 + (x & 7)] + 0.5) / 64) context.fillRect(x * size, y * size, size, size);
          }
        }
        context.globalCompositeOperation = "destination-in";
        context.drawImage(mask, 0, 0, width, height);
        context.globalCompositeOperation = "source-over";
        if (progress < 1) frame = requestAnimationFrame(draw);
        else { context.clearRect(0, 0, width, height); text.style.opacity = ""; }
      };
      frame = requestAnimationFrame(draw);
    };
    void document.fonts.ready.then(render);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      text.style.opacity = "";
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [quote, reduceMotion]);

  if (!quotes.length) return null;
  const change = (offset: number) => setIndex((value) => (value + offset + quotes.length) % quotes.length);
  return (
    <section className={styles.profileQuotes} aria-label="Frases favoritas">
      <div className={styles.quoteHeading}><Quote size={15} aria-hidden="true" /><span>Frases que me inspiran</span></div>
      <div className={styles.quoteTextWrap}>
        <p ref={textRef} className={styles.quoteText}>{quote}</p>
        <canvas ref={canvasRef} className={styles.quoteCanvas} aria-hidden="true" />
      </div>
      <div className={styles.quoteControls}>
        <span aria-hidden="true">{index + 1} / {quotes.length}</span>
        <div>
          <button type="button" onClick={() => change(-1)} aria-label="Frase anterior"><ChevronLeft size={16} aria-hidden="true" /></button>
          {!reduceMotion && <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Reanudar frases" : "Pausar frases"}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button>}
          <button type="button" onClick={() => change(1)} aria-label="Frase siguiente"><ChevronRight size={16} aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  );
}
