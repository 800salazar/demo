import {
  ClipboardList,
  House,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { demoRoutes } from "./routes";

export const siteConfig = {
  name: "Salazar Consultores",
  tagline: "Soluciones empresariales",
  title: "Salazar Demo — Soluciones empresariales",
  description:
    "Demostración interactiva de software empresarial a la medida: sistemas autoadministrables, control de operaciones e inteligencia artificial aplicada a tus datos.",
  email: "info@800salazar.com",
  phone: "8007252927",
  phoneLabel: "800-725-2927",
  website: "https://salazarconsultores.com/",
  websiteLabel: "SalazarConsultores.com",
  whatsappNumber: "526141282123",
  whatsappMessage: "Quiero conocer más de software de Salazar Consultores",
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
    href: demoRoutes.administration,
    navLabel: "Autoadministración",
    title: "Sistemas autoadministrables",
    description: "Consulta las prioridades de tus órdenes.",
    cta: "Ver configuración",
    icon: SlidersHorizontal,
  },
  {
    number: 2,
    href: demoRoutes.operations,
    navLabel: "Operaciones",
    title: "Control de operaciones",
    description: "Ajusta órdenes y consulta costos.",
    cta: "Ver órdenes",
    icon: ClipboardList,
  },
  {
    number: 3,
    href: demoRoutes.ai,
    navLabel: "IA empresarial",
    title: "IA empresarial",
    description: "Detecta retrasos y sobrecostos con tus datos.",
    cta: "Consultar asistente",
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
  { href: demoRoutes.home, label: "Inicio", icon: House },
  ...demoModules.map((module) => ({
    href: module.href,
    label: module.navLabel,
    demoNumber: module.number,
    icon: module.icon,
  })),
];
