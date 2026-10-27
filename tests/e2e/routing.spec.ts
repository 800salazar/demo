import { expect, test } from "@playwright/test";

test("domain root is independent and does not initialize demo data", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Adán Salazar · Estrategia digital y tecnología");
  await expect(page.locator("#contenido > .t-skeleton-reveal")).toHaveAttribute("aria-busy", "false");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Expertos en Soluciones Digitales");
  const navigation = page.getByRole("navigation", { name: "Perfil personal" });
  await expect(navigation.getByRole("link", { name: "Conferencia", exact: true })).toHaveAttribute("aria-current", "location");
  await navigation.getByRole("link", { name: "Contacto", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Conectemos ideas 💡", exact: true })).toBeInViewport();
  await expect(page.getByRole("link", { name: "Conectar con Adán Salazar en LinkedIn", exact: true })).toHaveAttribute("href", "https://www.linkedin.com/in/adansalazarr");
  await expect(page.locator('a[href^="/demo"]')).toHaveCount(0);
  await expect(page.getByText("Demostración de Salazar Consultores", { exact: false })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("salazar-demo:data"))).toBeNull();
});

test("demo navigation stays below /demo and marks only the current page", async ({ page }) => {
  await page.goto("/demo");
  const navigation = page.getByRole("navigation", { name: "Principal" });
  await expect(navigation.getByRole("link", { name: "Inicio", exact: true })).toHaveAttribute("aria-current", "page");
  for (const link of await navigation.getByRole("link").all()) {
    expect(await link.getAttribute("href")).toMatch(/^\/demo(?:\/|$)/);
  }
  await navigation.getByRole("link", { name: "IA empresarial", exact: false }).click();
  await expect(page).toHaveURL(/\/demo\/ia$/);
  await expect(navigation.getByRole("link", { name: "Inicio", exact: true })).not.toHaveAttribute("aria-current", "page");
  await expect(navigation.getByRole("link", { name: "IA empresarial", exact: false })).toHaveAttribute("aria-current", "page");
  await navigation.getByRole("link", { name: "Inicio", exact: true }).click();
  await expect(page).toHaveURL(/\/demo$/);
});

test("legacy links lead to the relocated demo and its 404 stays in the demo", async ({ page }) => {
  await page.goto("/ia");
  await expect(page).toHaveURL(/\/demo\/ia$/);
  await page.goto("/demo/no-existe");
  await expect(page.getByRole("heading", { name: "No encontramos esta demostración" })).toBeVisible();
  await page.getByRole("link", { name: "Volver al demo" }).click();
  await expect(page).toHaveURL(/\/demo$/);
});
