import { ContactCta } from "@/components/showroom/contact-cta";
import { DemoCard } from "@/components/showroom/demo-card";
import { ResetDemoButton } from "@/components/showroom/reset-demo-button";
import { demoModules } from "@/config/site";
import { SalazarLogo } from "@/components/shared/salazar-logo";
import { ClientsVideo } from "@/components/showroom/clients-video";
import styles from "@/components/layout/demo-theme.module.css";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className={styles.hero} aria-labelledby="showroom-title">
        <div className={styles.heroCopy}>
          <SalazarLogo variant="white" className={styles.heroLogo} eager />
          <h1 id="showroom-title">Software que se adapta <span>a tu empresa.</span></h1>
          <p className={styles.heroDescription}>
            Menos errores. Más control.
          </p>
          <div className={styles.heroActions}>
            <ResetDemoButton variant="ghost" />
          </div>
        </div>
        <ClientsVideo />
      </section>

      <section id="demos" aria-labelledby="demos-title" className={styles.sectionAnchor}>
        <div className={styles.sectionHeading}>
          <h2 id="demos-title">Explora los demos</h2>
        </div>
        <div data-guide="demo-modules" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demoModules.map((module) => (
            <DemoCard
              key={module.href}
              module={module}
              className={module.number === 3 ? "md:col-span-2 xl:col-span-1" : undefined}
            />
          ))}
        </div>
      </section>

      <ContactCta />
    </div>
  );
}
