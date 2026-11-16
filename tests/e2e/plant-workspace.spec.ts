import { expect, test } from "@playwright/test";

test("creates a request, prevents premature closure, and updates the shared table and AI snapshot", async ({ page }) => {
  let payload: { snapshot: { orders: { folio: string; title: string; requiredRemaining: number; statusId: string }[] } } | undefined;
  await page.route("**/demo/api/ai", async route => {
    payload = route.request().postDataJSON();
    await route.fulfill({ json: { source: "ai", answer: "La orden está completada.", asOf: new Date().toISOString() } });
  });
  await page.goto("/demo/sistema");
  await page.getByRole("button", { name: "Nueva solicitud" }).click();
  await page.getByLabel("¿Qué necesitas resolver?").fill("Revisar lector estación 4");
  await page.getByLabel("Responsable", { exact: true }).fill("Ana Torres");
  await page.getByRole("button", { name: "Crear solicitud", exact: true }).click();
  await expect(page.getByText("Editando OT-1031", { exact: true })).toBeVisible();
  const status = page.getByRole("combobox", { name: "Estado", exact: true });
  await expect(status.locator('option').filter({ hasText: "Completada" })).toBeDisabled();
  await page.getByLabel("Confirmar la solicitud con el responsable", { exact: true }).check();
  await page.getByLabel("Verificar el resultado antes del cierre", { exact: true }).check();
  await status.selectOption({ label: "Completada" });
  await page.getByRole("button", { name: "Guardar cambios", exact: true }).click();
  await page.getByLabel("Buscar en órdenes").fill("OT-1031");
  const row = page.getByRole("row").filter({ hasText: "OT-1031" });
  await expect(row).toContainText("Completada");
  await row.getByRole("button", { name: "Consultar OT-1031 con IA" }).click();
  await expect(page.getByRole("button", { name: "Copiar respuesta" })).toBeVisible();
  expect(payload!.snapshot.orders.at(-1)).toMatchObject({ folio: "OT-1031", requiredRemaining: 0 });
  await page.getByRole("tab", { name: "Dirección" }).click();
  await expect(page.getByRole("button", { name: "Copiar respuesta" })).toBeVisible();
});

test("right assistant remains in place, context is prepared, and PDF downloads", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demo/sistema?vista=direccion");
  const rail = page.getByRole("complementary", { name: "Asistente de la operación" });
  await expect(rail).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 500));
  const position = await rail.boundingBox();
  expect(position!.y).toBeGreaterThanOrEqual(0);
  expect(position!.y + position!.height).toBeLessThanOrEqual(900);
  await page.getByRole("region", { name: "Actividad diaria" }).getByRole("button").last().click();
  await page.getByRole("button", { name: "Analizar este día con IA" }).click();
  await expect(page.getByRole("region", { name: "Conversación" })).toContainText(/actividad del \d{4}-\d{2}-\d{2}/);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Reporte PDF" }).click();
  expect((await download).suggestedFilename()).toBe("salazar-reporte-operativo.pdf");
});

test("mobile assistant can open and close without losing its draft or overflowing", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/demo/sistema");
  const launcher = page.getByRole("button", { name: "Asistente IA", exact: true });
  await launcher.click();
  await page.getByLabel("Tu pregunta", { exact: true }).fill("Analiza mis órdenes actuales");
  await page.getByRole("button", { name: "Volver a la operación" }).click();
  await expect(launcher).toBeFocused();
  await page.getByRole("tab", { name: "Administrador", exact: true }).click();
  await launcher.click();
  await expect(page.getByLabel("Tu pregunta", { exact: true })).toHaveValue("Analiza mis órdenes actuales");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});

test("direction shows visible thresholds and switches activity periods", async ({ page }) => {
  await page.goto("/demo/sistema?vista=direccion");
  const metrics = page.getByLabel("Indicadores de Dirección");
  await expect(metrics).toContainText("Referencia: 29 o más");
  await expect(metrics).toContainText("límite de $300,000");
  await expect(metrics).toContainText("objetivo 100%");
  await page.getByRole("button", { name: "3 días", exact: true }).click();
  await expect(page.getByRole("region", { name: "Actividad diaria" }).getByRole("button")).toHaveCount(3);
  await page.getByRole("button", { name: "7 días", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Actividad · últimos 7 días" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Actividad diaria" }).getByRole("button")).toHaveCount(7);
  await page.getByRole("button", { name: "14 días", exact: true }).click();
  await expect(page.getByRole("region", { name: "Actividad diaria" }).getByRole("button")).toHaveCount(14);
});
