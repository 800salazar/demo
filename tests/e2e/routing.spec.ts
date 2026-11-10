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

test("one entry opens the shared workspace and navigation stays below /demo", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByRole("link", { name: "Abrir demo", exact: true })).toHaveCount(1);
  await expect(page.getByRole("group", { name: /Demo [123]/ })).toHaveCount(0);
  await page.getByRole("link", { name: "Abrir demo", exact: true }).click();
  await expect(page).toHaveURL(/\/demo\/sistema$/);
  await expect(page.getByRole("tab", { name: "Operador", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Inicio", exact: true }).click();
  await expect(page).toHaveURL(/\/demo$/);
});

for (const [path, view] of [["administracion", "administrador"], ["operaciones", "operador"], ["ia", "operador"]]) {
  test(`legacy ${path} opens its unified view`, async ({ page }) => {
    await page.goto(`/demo/${path}`);
    await expect(page).toHaveURL(new RegExp(`/demo/sistema\\?vista=${view}$`));
  });
}

test("legacy links lead to the relocated demo and its 404 stays in the demo", async ({ page }) => {
  await page.goto("/ia");
  await expect(page).toHaveURL(/\/demo\/sistema\?vista=operador$/);
  await page.goto("/demo/no-existe");
  await expect(page.getByRole("heading", { name: "No encontramos esta demostración" })).toBeVisible();
  await page.getByRole("link", { name: "Volver al demo" }).click();
  await expect(page).toHaveURL(/\/demo$/);
});
