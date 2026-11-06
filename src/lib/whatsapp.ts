import { siteConfig } from "@/config/site";

/** Public commercial destination and message confirmed by the owner; shared by all demo links. */
export function getWhatsAppUrl(): string {
  const text = encodeURIComponent(siteConfig.whatsappMessage);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`;
}
