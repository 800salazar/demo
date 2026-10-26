import { siteConfig } from "@/config/site";

/**
 * El número viene de `NEXT_PUBLIC_WHATSAPP_NUMBER` (formato internacional, solo dígitos, p. ej. 521XXXXXXXXXX).
 * Sin número, WhatsApp abre el mensaje y deja elegir el contacto; nunca se inventa uno.
 */
export function getWhatsAppUrl(): string {
  const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  const text = encodeURIComponent(siteConfig.whatsappMessage);
  return `https://wa.me/${digits}?text=${text}`;
}
