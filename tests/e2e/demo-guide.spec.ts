import { expect, test } from "@playwright/test";

test("Salazar icons are declared on both pages and at the conventional favicon URL", async ({ page, request }) => {
  const favicon = await request.get("/favicon.ico", { maxRedirects: 0 });
  expect(favicon.status()).toBe(308);
  expect(favicon.headers().location).toMatch(/\/landing\/icon\.png\?v=salazar-/);
  for (const path of ["/", "/demo"]) {
    await page.goto(path);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", /\/landing\/icon\.png\?v=salazar-/);
    await expect(page.locator('link[rel="shortcut icon"]')).toHaveAttribute("href", /\/landing\/icon\.png\?v=salazar-/);
  }
});

test("the full guide follows real saves and sends only a visitor-initiated query", async ({ page }) => {
  let requests = 0;
  page.on("request", (request) => { if (request.url().endsWith("/demo/api/ai")) requests++; });
  await page.goto("/demo");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Sin registro", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Tu demo en cifras", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Conecta tus sistemas", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Explorar demos", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Recorrido de 3 minutos", exact: true })).toHaveCount(0);
  const launcher = page.getByRole("button", { name: "Guía de uso", exact: true });
  const initialTop = (await launcher.boundingBox())!.y;
  const reset = page.getByRole("button", { name: "Restablecer demo", exact: true });
  const resetTop = (await reset.boundingBox())!.y;
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect.poll(async () => Math.abs((await launcher.boundingBox())!.y - initialTop)).toBeLessThan(5);
  expect((await reset.boundingBox())!.y).toBeLessThan(resetTop);
  await launcher.click();
  let guide = page.getByRole("dialog");
  await expect(page).toHaveURL(/\/demo\/administracion$/);
  await expect(guide.getByRole("heading", { name: "Identifica la urgencia" })).toBeVisible();
  await expect(page.locator("[data-guide-spotlight]")).toBeVisible();
  await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(page).toHaveURL(/\/demo\/operaciones$/);
  await expect(guide.getByRole("heading", { name: "Elige una orden" })).toBeVisible();
  await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(guide.getByRole("heading", { name: "Prueba un cambio" })).toBeVisible();
  await guide.getByRole("button", { name: "Ir al control resaltado" }).click();
  await expect(page.getByLabel("Costo real (MXN)")).toBeFocused();
  await page.getByLabel("Costo real (MXN)").fill("123456");
  await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(guide.getByRole("button", { name: "Siguiente", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Guardar cambios", exact: true }).click();
  await expect(guide.getByText("Listo. Puedes continuar.", { exact: true })).toBeVisible();
  await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(guide.getByRole("heading", { name: "Comprueba el resultado" })).toBeVisible();
  await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(page).toHaveURL(/\/demo\/ia$/);
  await expect(guide.getByRole("heading", { name: "Haz una consulta" })).toBeVisible();
  expect(requests).toBe(0);
  const response = page.waitForResponse((response) => response.url().endsWith("/demo/api/ai"));
  await page.getByRole("button", { name: "Sobrecostos", exact: true }).click();
  expect((await response).request().postDataJSON().snapshot.orders[0].actualCost).toBe(123456);
  await expect(guide.getByText("Listo. Puedes continuar.", { exact: true })).toBeVisible();
  await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(guide.getByRole("heading", { name: "Revisa el análisis" })).toBeVisible();
  await expect(page.locator('[data-guide="ai-answer"]')).toBeVisible();
  await guide.getByRole("button", { name: "Terminar", exact: true }).click();
  guide = page.getByRole("dialog");
  await guide.getByRole("button", { name: "La guía fue útil", exact: true }).click();
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem("salazar-demo:guide-feedback")))!)).toMatchObject({ useful: true });
  await guide.getByRole("button", { name: "Finalizar", exact: true }).click();
  await expect(guide).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Guía de uso", exact: true })).toBeFocused();
  expect(requests).toBe(1);
});

test.describe("guide on a small phone", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("can skip actions, go back, exit with Escape and repeat without changing data", async ({ page }) => {
    await page.goto("/demo/operaciones");
    const cost = page.getByLabel("Costo real (MXN)");
    await expect(cost).not.toHaveValue("");
    const initial = await cost.inputValue();
    const help = page.getByRole("button", { name: "Guía de uso", exact: true });
    await help.click();
    const guide = page.getByRole("dialog");
    await expect(guide.getByRole("heading", { name: "Elige una orden" })).toBeVisible();
    const panel = await guide.boundingBox();
    expect(panel!.x).toBeGreaterThanOrEqual(0);
    expect(panel!.x + panel!.width).toBeLessThanOrEqual(320);
    expect(panel!.y + panel!.height).toBeLessThanOrEqual(640);
    await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
    await guide.getByRole("button", { name: "Paso anterior" }).click();
    await expect(guide.getByRole("heading", { name: "Elige una orden" })).toBeVisible();
    await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
    await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
    await expect(guide.getByRole("button", { name: "Siguiente", exact: true })).toBeDisabled();
    await guide.getByRole("button", { name: "Omitir", exact: true }).click();
    await expect(guide.getByRole("heading", { name: "Comprueba el resultado" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(guide).toHaveCount(0);
    await expect(cost).toHaveValue(initial);
    await expect(help).toBeFocused();
    await help.click();
    await expect(guide.getByRole("heading", { name: "Elige una orden" })).toBeVisible();
    await guide.getByRole("button", { name: "Cerrar guía" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  });
});
