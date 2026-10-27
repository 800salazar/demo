"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./profile.module.css";

export function ClientLogosVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Load near the viewport, once, so native pauses remain under user control.
    const load = () => {
      video.preload = motionPreference.matches ? "metadata" : "auto";
      video.load();
      if (!motionPreference.matches) void video.play().catch(() => {
        // Native playback controls remain available if autoplay is blocked.
      });
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        load();
        observer.disconnect();
      }
    }, { rootMargin: "120px" });
    observer.observe(video);

    const onMotionChange = () => { if (motionPreference.matches) video.pause(); };
    motionPreference.addEventListener("change", onMotionChange);
    return () => {
      observer.disconnect();
      motionPreference.removeEventListener("change", onMotionChange);
      video.pause();
    };
  }, [src, failed]);

  return (
    <figure className={styles.clients} aria-label="Clientes de Salazar Consultores">
      <figcaption>Clientes</figcaption>
      {failed ? (
        <p className={styles.videoError}>El video no está disponible. <a href={src} target="_blank" rel="noopener noreferrer">Abrir video</a></p>
      ) : (
        <video ref={videoRef} src={src} className={styles.clientsVideo}
          aria-label="Logos de clientes de Salazar Consultores"
          controls muted loop playsInline preload="none" onError={() => setFailed(true)}>
          Tu navegador no permite reproducir este video. <a href={src}>Abrir video</a>.
        </video>
      )}
    </figure>
  );
}
