import { expect, test } from "@playwright/test";

test("chooses a folio and sends it only after any pending edit is resolved", async ({ page }) => {
  const questions: string[] = [];
  await page.route("**/demo/api/ai", async (route) => {
    questions.push(route.request().postDataJSON().question);
    await route.fulfill({ json: { source: "ai", answer: "Revisa las actividades pendientes.", asOf: new Date().toISOString() } });
  });
  await page.goto("/demo/sistema");
  await page.getByLabel("Tu pregunta", { exact: true }).fill("Mi borrador");
  await page.getByLabel("Costo real (MXN)").fill("123456");
  const suggestions = page.getByRole("button", { name: "Sugerencias", exact: true });
  async function chooseOrder() {
    await suggestions.click();
    await page.getByRole("button", { name: "Consultar una orden", exact: true }).click();
    await page.getByRole("dialog", { name: "Elige una orden" }).getByRole("button", { name: /^OT-1002/ }).click();
  }
  await chooseOrder();
  await page.getByRole("button", { name: "Seguir editando" }).click();
  expect(questions).toHaveLength(0);
  await expect(page.getByLabel("Costo real (MXN)")).toHaveValue("123,456.00");
  await chooseOrder();
  await page.getByRole("button", { name: "Descartar cambios" }).click();
  await expect.poll(() => questions).toEqual(["Analiza OT-1002: estado, costos, observaciones y actividades pendientes. ¿Qué debo revisar?"]);
  await expect(page.getByRole("combobox", { name: "Orden de trabajo" })).toHaveValue(/^OT-1002/);
  await expect(page.getByLabel("Tu pregunta", { exact: true })).toHaveValue("Mi borrador");
});

test("offers five cases and guides adding or editing a status through the built-in help", async ({ page }) => {
  await page.goto("/demo/sistema");
  await page.getByRole("button", { name: "Sugerencias", exact: true }).click();
  const menu = page.getByRole("dialog", { name: "Sugerencias de uso" });
  await expect(menu.getByRole("button")).toHaveCount(6);
  await expect(menu.getByRole("button", { name: "Revisar el cierre de una orden" })).toBeVisible();
  await expect(menu.getByRole("button", { name: "Descargar reporte de Dirección" })).toBeVisible();
  await menu.getByRole("button", { name: "Agregar o editar un estado" }).click();
  await expect(page.getByRole("tab", { name: "Administrador" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Ayuda del sistema", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Muéstrame cómo" }).click();
  const guide = page.getByRole("dialog", { name: "Agrega un estado" });
  await expect(page.getByRole("button", { name: "Agregar estado" })).toHaveAttribute("aria-describedby", "guide-description");
  await page.getByRole("button", { name: "Agregar estado" }).click();
  await expect(page.getByLabel("Nombre de estado")).toBeVisible();
  await guide.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.getByRole("button", { name: "Editar estado 1" })).toHaveAttribute("aria-describedby", "guide-description");
});

for (const mobile of [false, true]) {
  test(`guides department analysis on ${mobile ? "mobile" : "desktop"}`, async ({ page }) => {
    if (mobile) await page.setViewportSize({ width: 320, height: 640 });
    const questions: string[] = [];
    await page.route("**/demo/api/ai", async (route) => {
      questions.push(route.request().postDataJSON().question);
      await route.fulfill({ json: { source: "ai", answer: "Costos de Mantenimiento por orden.", asOf: new Date().toISOString() } });
    });
    await page.goto("/demo/sistema");
    if (mobile) await page.getByRole("button", { name: "Asistente IA", exact: true }).click();
    await page.getByRole("button", { name: "Sugerencias", exact: true }).click();
    await page.getByRole("button", { name: "Analizar costos de Mantenimiento" }).click();
    await expect(page.getByRole("tab", { name: "Dirección" })).toHaveAttribute("aria-selected", "true");
    const department = page.getByRole("button", { name: /^Mantenimiento: .*Ver desglose/ });
    await expect(department).toHaveAttribute("aria-describedby", "guide-description");
    await department.click();
    const analyze = page.getByRole("button", { name: "Analizar con IA", exact: true });
    await expect(analyze).toHaveAttribute("aria-describedby", "guide-description");
    await expect(page.locator("[data-guide-spotlight]")).toBeVisible();
    expect(questions).toHaveLength(0);
    await analyze.click();
    await expect(page.getByRole("dialog", { name: "Analiza los costos con IA" })).toHaveCount(0);
    await expect.poll(() => questions).toEqual(["Analiza los costos de Mantenimiento. ¿Qué órdenes explican su costo y cuáles requieren atención?"]);
    await expect(page.getByText("IA · Verifica antes de decidir", { exact: false })).toBeVisible();
  });
}
