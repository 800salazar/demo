/** Assets selected by the owner in the shared project's landing bucket. */
const landingAssetBase = "https://acwlzsofiqdaxmwpyczu.supabase.co/storage/v1/object/public/landing";

export const profileAssets = {
  photo: `${landingAssetBase}/yo.jpeg`,
  icon: `${landingAssetBase}/icon.png`,
  logoBlue: `${landingAssetBase}/logonew2025-azul.png`,
  logoWhite: `${landingAssetBase}/logonew2025-blanco.png`,
  logoBlack: `${landingAssetBase}/logonew2025-negro.png`,
} as const;

/** Video is served directly by the browser, outside Next.js image optimization. */
export const profileMedia = {
  clientLogosVideo: `${landingAssetBase}/animo-stairway-720p.webm`,
} as const;

/** Public content for salazar.red/. Keep the landing concise and outcome-led. */
export const profile = {
  name: "Adán Salazar",
  initials: "AS",
  position: "Gerente general",
  company: "Salazar Consultores",
  location: "Chihuahua, México",
  description: "Adán Salazar. Software a la medida, automatización e inteligencia artificial para empresas.",
  linkedin: "https://www.linkedin.com/in/adansalazarr",
  website: "https://salazarconsultores.com/",
  photo: profileAssets.photo as string | null,
  skills: [
    "Visión de negocio", "Gestión de proyectos", "Liderazgo de equipos",
    "Análisis de procesos", "Transformación digital", "Automatización e IA",
  ],
  specialties: [
    { title: "Software a la medida", description: "Centraliza tu operación en un sistema que se adapta a tu empresa." },
    { title: "Automatización e IA", description: "Reduce tareas repetitivas y aprovecha mejor tus datos." },
    { title: "Estrategia digital", description: "Define qué resolver primero y cómo llevarlo a la práctica." },
  ],
} as const;

export const companySocialLinks = [
  { network: "facebook", label: "Facebook de Salazar Consultores", href: "https://www.facebook.com/salcon.ia" },
  { network: "instagram", label: "Instagram de Salazar Consultores", href: "https://www.instagram.com/salcon.ia" },
  { network: "linkedin", label: "LinkedIn de Salazar Consultores", href: "https://www.linkedin.com/company/salcon.ia" },
] as const;

export const profileNavigation = [
  { id: "conferencia", label: "Conferencia" },
  { id: "inicio", label: "Perfil" },
  { id: "especialidades", label: "Qué hago" },
  { id: "contacto", label: "Contacto" },
] as const;

