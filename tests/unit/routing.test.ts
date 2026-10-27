import { describe, expect, it } from "vitest";
import { getRedirectUrl, unstable_getResponseFromNextConfig } from "next/experimental/testing/server";
import nextConfig from "../../next.config";
import { demoRoutes, isActiveDemoRoute } from "@/config/routes";

describe("salazar.red route boundaries", () => {
  it.each(["/", "/demo", "/demo/ia", "/demo/api/ai", "/demo/api/health", "/contacto", "/api/contacto"])(
    "leaves %s available without a redirect or loop", async (path) => {
      const response = await unstable_getResponseFromNextConfig({ url: `https://salazar.red${path}`, nextConfig });
      expect(getRedirectUrl(response)).toBeNull();
      expect(nextConfig.basePath).toBeUndefined();
    },
  );

  it.each([
    ["/administracion", "/demo/administracion"],
    ["/operaciones", "/demo/operaciones"],
    ["/ia", "/demo/ia"],
    ["/recorrido", "/demo/recorrido"],
    ["/integraciones", "/demo/integraciones"],
    ["/api/ai", "/demo/api/ai"],
    ["/api/health", "/demo/api/health"],
  ])("redirects legacy %s and preserves its query", async (source, destination) => {
    const response = await unstable_getResponseFromNextConfig({
      url: `https://salazar.red${source}?origen=compartido`, nextConfig,
    });
    expect(response.status).toBe(307);
    expect(getRedirectUrl(response)).toBe(`https://salazar.red${destination}?origen=compartido`);
  });

  it("marks demo home only at its own URL, including a trailing slash", () => {
    expect(isActiveDemoRoute("/demo", demoRoutes.home)).toBe(true);
    expect(isActiveDemoRoute("/demo/", demoRoutes.home)).toBe(true);
    expect(isActiveDemoRoute("/demo/ia", demoRoutes.home)).toBe(false);
    expect(isActiveDemoRoute("/", demoRoutes.home)).toBe(false);
  });

  it("matches nested modules at segment boundaries without selecting similarly named pages", () => {
    expect(isActiveDemoRoute("/demo/ia", demoRoutes.ai)).toBe(true);
    expect(isActiveDemoRoute("/demo/ia/historial", demoRoutes.ai)).toBe(true);
    expect(isActiveDemoRoute("/demo/ia-otra", demoRoutes.ai)).toBe(false);
  });
});
