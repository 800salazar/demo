"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_QUESTION_LENGTH } from "@/lib/ai/limits";

type Recognition = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
type VoiceWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

export function VoiceInput({ value, onChange, disabled, onListeningChange, className }: {
  value: string; onChange: (value: string) => void; disabled: boolean;
  onListeningChange: (listening: boolean) => void; className?: string;
}) {
  const recognition = useRef<Recognition | null>(null);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const stop = () => recognition.current?.abort();
    const hide = () => { if (document.hidden) stop(); };
    window.addEventListener("pagehide", stop);
    window.addEventListener("salazar:stop-dictation", stop);
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.removeEventListener("pagehide", stop);
      window.removeEventListener("salazar:stop-dictation", stop);
      document.removeEventListener("visibilitychange", hide);
      const current = recognition.current;
      if (current) { current.onresult = null; current.onerror = null; current.onend = null; current.abort(); }
    };
  }, []);
  useEffect(() => { if (disabled) recognition.current?.abort(); }, [disabled]);
  function toggle() {
    if (recognition.current) { recognition.current.stop(); return; }
    const browser = window as VoiceWindow;
    const Constructor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Constructor) { setMessage("El dictado no está disponible en este navegador. Puedes escribir tu solicitud."); return; }
    const current = new Constructor();
    recognition.current = current;
    current.lang = "es-MX";
    current.continuous = true;
    current.interimResults = true;
    const prefix = value.trimEnd();
    let heard = false;
    let failed = false;
    let reachedLimit = false;
    current.onresult = event => {
      const transcript = Array.from(event.results, result => result[0].transcript).join(" ").trim();
      heard ||= !!transcript;
      const next = [prefix, transcript].filter(Boolean).join(" ");
      onChange(next.slice(0, MAX_QUESTION_LENGTH));
      if (next.length >= MAX_QUESTION_LENGTH) { reachedLimit = true; setMessage("Se alcanzó el límite de texto. Revisa y envía el mensaje para continuar."); current.stop(); }
    };
    current.onerror = event => {
      failed = true;
      setMessage(event.error === "not-allowed" || event.error === "service-not-allowed"
        ? "Permite el acceso al micrófono en tu navegador para dictar."
        : event.error === "audio-capture" ? "No se encontró un micrófono disponible."
        : event.error === "no-speech" ? "No se detectó voz. Intenta de nuevo."
        : event.error === "aborted" ? "Dictado detenido. Revisa el texto antes de enviarlo."
        : "No se pudo completar el dictado. Revisa la conexión o escribe tu solicitud.");
    };
    current.onend = () => {
      recognition.current = null; setListening(false); onListeningChange(false);
      if (!failed && !reachedLimit) setMessage(heard ? "Dictado listo. Revisa el texto y pulsa Consultar." : "No se detectó voz. Intenta de nuevo.");
    };
    try {
      setListening(true); onListeningChange(true);
      setMessage("Escuchando… Pulsa detener al terminar.");
      current.start();
    } catch {
      recognition.current = null; setListening(false); onListeningChange(false);
      setMessage("No se pudo iniciar el micrófono. Intenta de nuevo.");
    }
  }
  return <>
    <Button type="button" size="icon" className={className} disabled={disabled} aria-label={listening ? "Detener dictado" : "Dictar con micrófono"} title={listening ? "Detener dictado" : "Dictar con micrófono"} aria-pressed={listening} aria-describedby="voice-status" onClick={toggle}>
      {listening ? <Square aria-hidden /> : <Mic aria-hidden />}
    </Button>
    <span id="voice-status" role="status" className="basis-full text-xs">{message}</span>
  </>;
}
