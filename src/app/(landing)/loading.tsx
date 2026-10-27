import { LandingContentSkeleton } from "@/components/profile/landing-content-skeleton";
import styles from "@/components/profile/landing-content-skeleton.module.css";

export default function Loading() {
  return (
    <div className={styles.loadingPage} role="status" aria-label="Cargando contenido">
      <div className={styles.loadingInner}>
        <p className={styles.status}>Cargando contenido…</p>
        <LandingContentSkeleton />
      </div>
    </div>
  );
}
