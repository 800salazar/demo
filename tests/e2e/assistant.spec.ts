import { expect, test, type Page } from "@playwright/test";

async function ask(page: Page, question: string) {
  await page.getByLabel("Tu pregunta", { exact: true }).fill(question);
  const pending = page.waitForResponse((r) => r.url().endsWith("/demo/api/ai") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  return pending;
}

test("current snapshot, persisted edits, two visitors and read-only privacy boundary", async ({ page, browser }) => {
  await page.goto("/demo/ia");
  await expect(page.getByText("30 órdenes ficticias de este navegador")).toBeVisible();
  const first = await ask(page, "Dame un resumen de las órdenes");
  expect(first.request().postDataJSON().snapshot.orders).toHaveLength(30);
  expect((await first.json()).source).toBe("calculations");
  await expect(page.getByText("Resumen calculado · Sin generación de IA")).toBeVisible();

  await page.getByLabel("Costo real (MXN)").fill("123456");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Las órdenes cambiaron desde esta respuesta.", { exact: false })).toBeVisible();
  const updated = await ask(page, "¿Cuál es el costo de OT-1001?");
  expect(updated.request().postDataJSON().snapshot.orders[0].actualCost).toBe(123456);
  expect((await updated.json()).answer).toContain("123,456");

  await page.reload();
  await expect(page.getByLabel("Costo real (MXN)")).toHaveValue("123456");
  const otherContext = await browser.newContext();
  try {
    const other = await otherContext.newPage();
    await other.goto("http://127.0.0.1:3100/demo/ia");
    await expect(other.getByText("30 órdenes ficticias de este navegador")).toBeVisible();
    const separate = await ask(other, "¿Cuál es el costo de OT-1001?");
    expect(separate.request().postDataJSON().snapshot.orders[0].actualCost).not.toBe(123456);
    const privateQuery = await ask(other, "Consulta mi información privada de Enfoca");
    expect((await privateQuery.json()).answer).toContain("No tengo acceso a Enfoca");
  } finally { await otherContext.close(); }
  await expect(page.getByLabel("Costo real (MXN)")).toHaveValue("123456");
});

test("shows the retry time returned by the server", async ({ page }) => {
  await page.goto("/demo/operaciones");
  await expect(page.getByText("30 órdenes ficticias de este navegador")).toBeVisible();
  await page.route("**/demo/api/ai", (route) => route.fulfill({
    status: 429, contentType: "application/json", headers: { "Retry-After": "120" },
    body: JSON.stringify({ error: "rate_limited", message: "Límite alcanzado" }),
  }));
  await ask(page, "Resume las órdenes");
  await expect(page.getByRole("alert")).toContainText("Intenta en 2 min.");
});
