import { expect, test, type Page } from "@playwright/test";

async function ask(page: Page, question: string) {
  await page.getByLabel("Tu pregunta", { exact: true }).fill(question);
  const pending = page.waitForResponse((r) => r.url().endsWith("/demo/api/ai") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  return pending;
}

test("current snapshot, persisted edits, two visitors and read-only privacy boundary", async ({ page, browser }) => {
  await page.goto("/demo/ia");
  await expect(page.getByText("30 órdenes ficticias")).toBeVisible();
  const first = await ask(page, "Dame un resumen de las órdenes");
  expect(first.request().postDataJSON().snapshot.orders).toHaveLength(30);
  expect((await first.json()).source).toBe("calculations");
  await expect(page.getByText("Resumen calculado · Sin IA")).toBeVisible();

  await page.getByLabel("Costo real (MXN)").fill("123456");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Las órdenes cambiaron.", { exact: false })).toBeVisible();
  const updated = await ask(page, "¿Cuál es el costo de OT-1001?");
  expect(updated.request().postDataJSON().snapshot.orders[0].actualCost).toBe(123456);
  expect((await updated.json()).answer).toContain("123,456");

  await page.reload();
  await expect(page.getByLabel("Costo real (MXN)")).toHaveValue("123,456.00");
  const otherContext = await browser.newContext();
  try {
    const other = await otherContext.newPage();
    await other.goto("http://127.0.0.1:3100/demo/ia");
    await expect(other.getByText("30 órdenes ficticias")).toBeVisible();
    const separate = await ask(other, "¿Cuál es el costo de OT-1001?");
    expect(separate.request().postDataJSON().snapshot.orders[0].actualCost).not.toBe(123456);
    const privateQuery = await ask(other, "Consulta mi información privada de Enfoca");
    expect((await privateQuery.json()).answer).toContain("No tengo acceso a Enfoca");
  } finally { await otherContext.close(); }
  await expect(page.getByLabel("Costo real (MXN)")).toHaveValue("123,456.00");
});

test("shows the retry time returned by the server", async ({ page }) => {
  await page.goto("/demo/operaciones");
  await expect(page.getByText("30 órdenes ficticias")).toBeVisible();
  await page.route("**/demo/api/ai", (route) => route.fulfill({
    status: 429, contentType: "application/json", headers: { "Retry-After": "120" },
    body: JSON.stringify({ error: "rate_limited", message: "Límite alcanzado" }),
  }));
  await ask(page, "Resume las órdenes");
  await expect(page.getByRole("alert")).toContainText("Intenta en 2 min.");
});

test("copies the complete answer and retries the same question with updated orders", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: async (value: string) => { (window as unknown as { copiedAnswer: string }).copiedAnswer = value; },
    } });
  });
  await page.route("**/demo/api/ai", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ source: "ai", answer: "Respuesta completa de prueba.", asOf: "2026-11-08T03:00:00Z" }),
  }));
  await page.goto("/demo/ia");
  await expect(page.getByText("30 órdenes ficticias")).toBeVisible();
  await ask(page, "¿Cuál es el costo de OT-1001?");
  await page.getByRole("button", { name: "Copiar respuesta" }).click();
  expect(await page.evaluate(() => (window as unknown as { copiedAnswer: string }).copiedAnswer)).toBe("Respuesta completa de prueba.");
  await page.getByLabel("Costo real (MXN)").fill("123456");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  const response = page.waitForResponse((r) => r.url().endsWith("/demo/api/ai") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Reintentar respuesta" }).click();
  const retried = (await response).request().postDataJSON();
  expect(retried.question).toBe("¿Cuál es el costo de OT-1001?");
  expect(retried.snapshot.orders[0].actualCost).toBe(123456);
});

test("shows the last two turns in a scrollable chat with suggestions beside the composer", async ({ page }) => {
  let count = 0;
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/demo/api/ai", async (route) => {
    count++;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
      source: "ai", answer: `Respuesta ${count}: **$1,500.00**. ${"Detalle ficticio. ".repeat(35)}`,
      asOf: "2026-11-08T03:00:00Z",
    }) });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/ia");
  const chat = page.getByRole("region", { name: "Conversación" });
  const form = page.locator("form").filter({ has: page.getByLabel("Tu pregunta") });
  await expect(form.getByRole("button", { name: "Retrasos" })).toBeVisible();
  for (const question of ["Primera pregunta", "Segunda pregunta", "Tercera pregunta"]) {
    await ask(page, question);
    await expect(chat.getByText(question, { exact: false })).toBeVisible();
  }
  await expect(chat.getByText("Primera pregunta", { exact: false })).toHaveCount(0);
  await expect(chat.getByText("Segunda pregunta", { exact: false })).toBeAttached();
  await expect(chat.getByText("Tercera pregunta", { exact: false })).toBeVisible();
  await expect(chat.locator('strong').filter({ hasText: "$1,500.00" })).toHaveCount(2);
  const metrics = await chat.evaluate((element) => ({ height: element.clientHeight, scrollHeight: element.scrollHeight, remaining: element.scrollHeight - element.scrollTop - element.clientHeight }));
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.height);
  expect(metrics.remaining).toBeLessThan(50);
  await expect(page.getByLabel("Tu pregunta")).toBeInViewport();
});
