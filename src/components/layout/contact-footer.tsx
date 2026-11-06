import { SalazarLogo } from "@/components/shared/salazar-logo";
import { siteConfig } from "@/config/site";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import styles from "./demo-theme.module.css";

export function ContactFooter() {
  return (
    <footer className={styles.footer} aria-labelledby="demo-contact-title">
      <div className={styles.footerIdentity}>
        <SalazarLogo variant="black" className={styles.footerLogo} />
        <h2 id="demo-contact-title">Estamos para servirte</h2>
      </div>
      <address className={styles.footerLinks}>
        <a href={`mailto:${siteConfig.email}`}><span aria-hidden>📩</span><span>{siteConfig.email}</span></a>
        <a href={`tel:${siteConfig.phone}`}><span aria-hidden>📞</span><span>{siteConfig.phoneLabel}</span></a>
        <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer"><span aria-hidden>💬</span><span>WhatsApp</span></a>
        <a href={siteConfig.website} target="_blank" rel="noopener noreferrer"><span aria-hidden>🌐</span><span>{siteConfig.websiteLabel}</span></a>
      </address>
    </footer>
  );
}
