import { ContactCta } from "@/components/showroom/contact-cta";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoRoutes } from "@/config/routes";
import { ResetDemoButton } from "@/components/showroom/reset-demo-button";
import { GuideStartButton } from "@/components/guide/demo-guide";
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
            <GuideStartButton guide="full" variant="outline" attention />
            <Button asChild variant="outline" className={styles.heroPrimary}><Link href={demoRoutes.workspace}>Abrir demo<ArrowRight aria-hidden /></Link></Button>
            <ResetDemoButton variant="ghost" />
          </div>
        </div>
        <ClientsVideo />
      </section>

      <ContactCta />
    </div>
  );
}
