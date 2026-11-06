import { getWhatsAppUrl } from "@/lib/whatsapp";
import { SalazarLogo } from "@/components/shared/salazar-logo";
import styles from "@/components/layout/demo-theme.module.css";

export function ContactCta() {
  return (
    <section className={styles.contact}>
      <SalazarLogo variant="white" className={styles.contactLogo} />
      <h2>
        ¿Qué proceso quieres mejorar?
      </h2>
      <a data-guide="demo-contact" className={styles.contactWhatsApp} href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
        <span aria-hidden>💬</span><span>WhatsApp</span>
      </a>
    </section>
  );
}
