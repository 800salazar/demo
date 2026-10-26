import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function ContactCta() {
  return (
    <section className="rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-10">
      <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-balance">
        ¿Tienes un proceso que te gustaría mejorar?
      </h2>
      <p className="mt-2 max-w-xl text-pretty text-primary-foreground/80">
        En Salazar Consultores desarrollamos soluciones adaptadas a las necesidades de tu empresa.
      </p>
      <Button asChild size="lg" variant="secondary" className="mt-6">
        <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
          <MessageCircle data-icon="inline-start" aria-hidden />
          Platiquemos sobre tu proyecto
        </a>
      </Button>
    </section>
  );
}
