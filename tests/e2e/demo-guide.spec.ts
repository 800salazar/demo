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

test("the unified guide follows edits, AI, administrator configuration and return to operator", async ({ page }) => {
  let requests = 0;
  page.on("request", (request) => { if (request.url().endsWith("/demo/api/ai")) requests++; });
  await page.goto("/demo");
  const launchers = page.getByRole("button", { name: "Guía de uso", exact: true });
  await expect(launchers).toHaveCount(2);
  await launchers.last().click();
  const guide = page.getByRole("dialog");
  await expect(page).toHaveURL(/\/demo\/sistema\?vista=operador$/);
  await expect(guide.getByRole("heading", { name: "Elige una orden" })).toBeVisible();
  await page.getByRole("combobox", { name: "Orden de trabajo" }).click();
  const options = page.getByRole("listbox", { name: "Órdenes de trabajo" });
  await expect(options).toBeVisible();
  await expect.poll(async () => {
    const ring = await page.locator("[data-guide-spotlight]").boundingBox();
    const list = await options.boundingBox();
    const viewportHeight = await page.evaluate(() => window.visualViewport?.height ?? window.innerHeight);
    return ring && list ? ring.y + ring.height - Math.min(list.y + list.height, viewportHeight - 6) : -Infinity;
  }).toBeGreaterThanOrEqual(-1);
  await options.getByRole("option").first().click();
  await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(guide.getByRole("heading", { name: "Prueba un cambio" })).toBeVisible();
  await page.getByLabel("Costo real (MXN)").fill("123456");
  await page.getByRole("button", { name: "Guardar cambios", exact: true }).click();
  await expect(guide.getByText("Listo. Puedes continuar.", { exact: true })).toBeVisible();
  await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
  expect(requests).toBe(0);
  const response = page.waitForResponse((response) => response.url().endsWith("/demo/api/ai"));
  await page.getByRole("button", { name: "Sobrecostos", exact: true }).click();
  expect((await response).request().postDataJSON().snapshot.orders[0].actualCost).toBe(123456);
  await expect(guide.getByText("Listo. Puedes continuar.", { exact: true })).toBeVisible();
  await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
  await page.getByRole("tab", { name: "Administrador", exact: true }).click();
  await expect(guide.getByText("Listo. Puedes continuar.", { exact: true })).toBeVisible();
  await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(guide.getByRole("heading", { name: "Revisa los costos" })).toBeVisible();
  await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
  await page.getByLabel("Estado 1 color", { exact: true }).selectOption("violet");
  await page.getByRole("button", { name: "Guardar estado 1", exact: true }).click();
  await expect(guide.getByText("Listo. Puedes continuar.", { exact: true })).toBeVisible();
  await guide.getByRole("button", { name: "Siguiente", exact: true }).click();
  await page.getByRole("tab", { name: "Operador", exact: true }).click();
  await expect(guide.getByText("Listo. Puedes continuar.", { exact: true })).toBeVisible();
  await guide.getByRole("button", { name: "Terminar", exact: true }).click();
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
    await expect(help.getByText("Guía de uso")).toBeHidden();
    await expect(help.locator("svg")).toBeVisible();
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
    await expect(guide.getByRole("button", { name: "Siguiente", exact: true })).toBeDisabled();
    await guide.getByRole("button", { name: "Omitir", exact: true }).click();
    await expect(guide.getByRole("heading", { name: "Pregunta a la IA" })).toBeVisible();
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
