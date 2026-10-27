"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Local pulse-to-content reveal, following the public description of
 * transitions.dev's "Skeleton loader and reveal". No upstream code was imported.
 * Source: https://transitions.dev/detail.html?t=skeleton-loader-and-reveal
 * Uses real hydration / media readiness; never waits for a decorative timer.
 */
export function SkeletonReveal({
  children, skeleton, loaded, className = "",
}: {
  children: ReactNode;
  skeleton: ReactNode;
  loaded?: boolean;
  className?: string;
}) {
  const hydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const ready = loaded ?? hydrated;

  return (
    <div className={`t-skeleton-reveal ${className}`} data-ready={ready} aria-busy={!ready}>
      <div className="t-skeleton-placeholder" aria-hidden="true">{skeleton}</div>
      <div className="t-skeleton-content">{children}</div>
    </div>
  );
}
