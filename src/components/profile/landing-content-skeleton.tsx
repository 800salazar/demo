import styles from "./landing-content-skeleton.module.css";

export function LandingContentSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.panel}>
        <span className={`t-skeleton-block ${styles.eyebrow}`} />
        <span className={`t-skeleton-block ${styles.heading}`} />
        <span className={`t-skeleton-block ${styles.description}`} />
        <div className={styles.cards}>
          {[0, 1].map((card) => <div key={card}><span className={`t-skeleton-block ${styles.icon}`} /><span className={`t-skeleton-block ${styles.cardTitle}`} /><span className={`t-skeleton-block ${styles.cardLine}`} /></div>)}
        </div>
        <span className={`t-skeleton-block ${styles.footerLine}`} />
      </div>
      <div className={styles.nextPanel}><span className="t-skeleton-block" /><span className="t-skeleton-block" /></div>
    </div>
  );
}
