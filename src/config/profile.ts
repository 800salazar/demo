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
  name: "Adán Sebastián Salazar",
  initials: "AS",
  position: "",
  company: "Salazar Consultores",
  location: "Chihuahua, México",
  description: "Adán Salazar. Software a la medida, automatización e inteligencia artificial para empresas.",
  linkedin: "https://www.linkedin.com/in/adansalazarr",
  email: "adans@adan.mx",
  website: "https://salazarconsultores.com/",
  photo: profileAssets.photo as string | null,
  summary: "Tecnología y estrategia para empresas.",
  education: { institution: "Tec de Monterrey", degree: "ITC", period: "2018–2024" },
  skills: ["Visión de negocio", "Gestión de proyectos", "Transformación digital"],
  languages: ["Español (nativo)", "Inglés"],
  favoriteQuotes: [
    "No tengo que resolverlo todo hoy. Solo tengo que no olvidarme de mí.",
    "Hoy hice lo mejor que pude. Mañana no empiezo desde cero, empiezo desde la experiencia.",
    "No vas a encontrar una vida feliz, tu la haces",
    "Your energy is your currency",
    "Tu enemigo más grande es una mente sin control",
    "You look just how you feel and you feel just how you look",
    "You’re so in your head you can’t even enjoy where you are",
    "C'est la vie",
    "You miss 100% of the shots you don’t take",
    "Action speaks louder than dreams - make it happen",
  ],
  specialties: [
    { title: "Organiza tu negocio", description: "Controla tus ventas, clientes e inventario desde un sistema hecho para ti." },
    { title: "Ahorra tiempo", description: "Automatiza tareas y responde más rápido a tus clientes con ayuda de la IA." },
    { title: "Atrae más clientes", description: "Da a conocer tu negocio con una página web, redes sociales y publicidad digital." },
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

