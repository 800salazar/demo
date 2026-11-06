"use client";

import { useEffect, useRef, useState } from "react";
import { brandMedia } from "@/config/brand";
import styles from "@/components/layout/demo-theme.module.css";

/** Square, direct Storage playback. Respect reduced motion and never restart a user's pause. */
export function ClientsVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!preference.matches) void video.play().catch(() => {
      // Native controls remain available when autoplay is blocked.
    });
    const onMotionChange = () => { if (preference.matches) video.pause(); };
    preference.addEventListener("change", onMotionChange);
    return () => {
      preference.removeEventListener("change", onMotionChange);
      video.pause();
    };
  }, [failed]);

  return (
    <figure className={styles.clientsFigure}>
      <div className={styles.videoFrame}>
        {failed ? (
          <div className={styles.videoFallback}>
            <p>Conoce a nuestros clientes.</p>
            <a href={brandMedia.clientLogosVideo} target="_blank" rel="noopener noreferrer">Abrir video de clientes</a>
          </div>
        ) : (
          <video ref={videoRef} src={brandMedia.clientLogosVideo} width={720} height={720}
            className={styles.clientsVideo} aria-label="Clientes de Salazar Consultores"
            controls muted loop playsInline preload="metadata" onError={() => setFailed(true)}>
            Tu navegador no permite reproducir el video. <a href={brandMedia.clientLogosVideo}>Abrir video de clientes</a>.
          </video>
        )}
      </div>
      <figcaption>Nuestros clientes</figcaption>
    </figure>
  );
}
