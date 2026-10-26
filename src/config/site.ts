import {
  ClipboardList,
  Compass,
  House,
  Plug,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const siteConfig = {
  name: "Salazar Consultores",
  tagline: "Soluciones empresariales",
  title: "Salazar Demo — Soluciones empresariales",
  description:
    "Demostración interactiva de software empresarial a la medida: sistemas autoadministrables, control de operaciones e inteligencia artificial aplicada a tus datos.",
  whatsappMessage: "Hola, vi la demostración de Salazar Consultores y me gustaría platicar sobre mi proyecto.",
} as const;

export interface DemoModule {
  number: 1 | 2 | 3;
  href: string;
  navLabel: string;
  title: string;
  description: string;
  cta: string;
  icon: LucideIcon;
}

export const demoModules: DemoModule[] = [
  {
    number: 1,
    href: "/administracion",
    navLabel: "Autoadministración",
    title: "Sistemas autoadministrables",
    description: "Realiza cambios sencillos sin depender de un desarrollador.",
    cta: "Probar administración",
    icon: SlidersHorizontal,
  },
  {
    number: 2,
    href: "/operaciones",
    navLabel: "Operaciones",
    title: "Control de operaciones",
    description: "Organiza procesos, controla actividades y consulta resultados en tiempo real.",
    cta: "Explorar sistema",
    icon: ClipboardList,
  },
  {
    number: 3,
    href: "/ia",
    navLabel: "IA empresarial",
    title: "Inteligencia artificial empresarial",
    description: "Convierte la información de tu empresa en respuestas útiles para tomar decisiones.",
    cta: "Probar análisis con IA",
    icon: Sparkles,
  },
];

export interface NavItem {
  href: string;
  label: string;
  demoNumber?: DemoModule["number"];
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/recorrido", label: "Recorrido de 3 minutos", icon: Compass },
  ...demoModules.map((module) => ({
    href: module.href,
    label: module.navLabel,
    demoNumber: module.number,
    icon: module.icon,
  })),
  { href: "/integraciones", label: "Integraciones", icon: Plug },
];
