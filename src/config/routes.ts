/** The domain root belongs to the independent landing; the showroom lives entirely under /demo. */
export const demoRoutes = {
  home: "/demo",
  administration: "/demo/administracion",
  operations: "/demo/operaciones",
  ai: "/demo/ia",
  tour: "/demo/recorrido",
  integrations: "/demo/integraciones",
  aiApi: "/demo/api/ai",
  healthApi: "/demo/api/health",
} as const;

export const legacyDemoRedirects = [
  { source: "/administracion", destination: demoRoutes.administration, permanent: false },
  { source: "/operaciones", destination: demoRoutes.operations, permanent: false },
  { source: "/ia", destination: demoRoutes.ai, permanent: false },
  { source: "/recorrido", destination: demoRoutes.tour, permanent: false },
  { source: "/integraciones", destination: demoRoutes.integrations, permanent: false },
  { source: "/api/ai", destination: demoRoutes.aiApi, permanent: false },
  { source: "/api/health", destination: demoRoutes.healthApi, permanent: false },
];

export function isActiveDemoRoute(pathname: string, href: string): boolean {
  const current = pathname.replace(/\/+$/, "") || "/";
  return current === href || (href !== demoRoutes.home && current.startsWith(`${href}/`));
}
