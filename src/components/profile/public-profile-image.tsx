"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { SkeletonReveal } from "@/components/motion/skeleton-reveal";
import styles from "./profile.module.css";

/** Public assets only; never send a Supabase key or create signed URLs here. */
export function PublicProfileImage({
  src, alt, className, sizes, eager = false, children,
}: {
  src: string;
  alt: string;
  className: string;
  sizes: string;
  eager?: boolean;
  children: ReactNode;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  return (
    <SkeletonReveal loaded={state !== "loading"} className={styles.mediaFrame}
      skeleton={<span className={`t-skeleton-block ${styles.mediaSkeleton}`} />}>
      {state === "failed" ? children : <Image src={src} alt={alt} fill sizes={sizes} className={className}
        loading={eager ? "eager" : "lazy"} onLoad={() => setState("loaded")} onError={() => setState("failed")} />}
    </SkeletonReveal>
  );
}
