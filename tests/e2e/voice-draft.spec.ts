import { expect, test } from "@playwright/test";

async function dictation(page: import("@playwright/test").Page, mode: "success" | "denied" | "unsupported" = "success") {
  await page.addInitScript(mode => {
    class Recognition {
      lang = ""; continuous = false; interimResults = false;
      onresult?: (event: unknown) => void; onerror?: (event: unknown) => void; onend?: () => void;
      start() {
        if (mode === "denied") { this.onerror?.({ error: "not-allowed" }); this.onend?.(); return; }
        this.onresult?.({ results: [{ 0: { transcript: "Crea una solicitud para revisar sensor" }, isFinal: true }] });
      }
      stop() { this.onend?.(); }
      abort() { this.onend?.(); }
    }
    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: mode === "unsupported" ? undefined : Recognition });
    Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: undefined });
  }, mode);
}

test("dictation preserves typed text, never submits automatically and stops on command", async ({ page }) => {
  await dictation(page);
  await page.goto("/demo/sistema");
  await page.getByLabel("Tu pregunta", { exact: true }).fill("Por favor:");
  await page.getByRole("button", { name: "Dictar con micrófono" }).click();
  await expect(page.getByLabel("Tu pregunta", { exact: true })).toHaveValue("Por favor: Crea una solicitud para revisar sensor");
  await expect(page.getByRole("button", { name: "Consultar", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Copiar respuesta" })).toHaveCount(0);
  await page.getByRole("button", { name: "Detener dictado" }).click();
  await expect(page.getByRole("button", { name: "Consultar", exact: true })).toBeEnabled();
});

for (const mode of ["denied", "unsupported"] as const) {
  test(`explains microphone ${mode} without losing the draft`, async ({ page }) => {
    await dictation(page, mode);
    await page.goto("/demo/sistema");
    await page.getByLabel("Tu pregunta", { exact: true }).fill("Mi solicitud");
    await page.getByRole("button", { name: "Dictar con micrófono" }).click();
    await expect(page.locator("#voice-status")).toContainText(mode === "denied" ? "Permite el acceso" : "no está disponible");
    await expect(page.getByLabel("Tu pregunta", { exact: true })).toHaveValue("Mi solicitud");
    await expect(page.getByRole("button", { name: "Consultar", exact: true })).toBeEnabled();
  });
}

test("AI prefills a draft, leaves unknown fields blank and requires manual review before creation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/demo/api/ai", async route => {
    const { draftContext } = route.request().postDataJSON();
    await route.fulfill({ json: { source: "ai", answer: "Completa responsable y fecha y revisa el borrador.", asOf: new Date().toISOString(), draft: {
      title: "Revisar sensor", departmentId: draftContext.departments[1].id, categoryId: draftContext.categories[0].id,
      priorityId: draftContext.priorities[0].id, assignee: null, dueDate: null, estimatedCost: 1500, description: "Sensor de estación 4",
    } } });
  });
  await page.goto("/demo/sistema?vista=direccion");
  await page.getByLabel("Tu pregunta", { exact: true }).fill("Crea una solicitud para revisar sensor con presupuesto de 1500");
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  const form = page.locator('[data-guide="new-order"]');
  await expect(form).toBeVisible();
  await expect(form.getByLabel("¿Qué necesitas resolver?")).toHaveValue("Revisar sensor");
  await expect(form.getByLabel("Presupuesto (MXN)")).toHaveValue("1,500.00");
  await expect(form.getByLabel("Responsable", { exact: true })).toHaveValue("");
  await expect(form.locator('input[type="date"]')).toHaveValue("");
  await expect(page.getByText("30 órdenes ficticias")).toBeVisible();
  await form.getByLabel("Responsable", { exact: true }).fill("Ana Torres");
  await form.locator('input[type="date"]').fill("2026-12-20");
  await form.getByRole("button", { name: "Crear solicitud", exact: true }).click();
  await expect(form).toBeVisible();
  await form.getByLabel("Revisé los datos de la solicitud").check();
  await form.getByRole("button", { name: "Crear solicitud", exact: true }).click();
  await expect(page.getByText("Editando OT-1031", { exact: true })).toBeVisible();
  await expect(page.getByText("31 órdenes ficticias")).toBeVisible();
});

test("a rejected proposal preserves a manual request", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/demo/api/ai", async route => {
    const { draftContext } = route.request().postDataJSON();
    expect(draftContext.draft.title).toBe("Solicitud manual");
    await route.fulfill({ json: { source: "ai", answer: "Propuesta", asOf: new Date().toISOString(), draft: {
      ...draftContext.draft, title: "Propuesta nueva",
    } } });
  });
  await page.goto("/demo/sistema");
  await page.getByRole("button", { name: "Nueva solicitud", exact: true }).click();
  await page.getByLabel("¿Qué necesitas resolver?").fill("Solicitud manual");
  page.on("dialog", dialog => dialog.dismiss());
  await page.getByLabel("Tu pregunta", { exact: true }).fill("Cambia el título del borrador a Propuesta nueva");
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Revisar borrador" })).toBeVisible();
  await expect(page.getByLabel("¿Qué necesitas resolver?")).toHaveValue("Solicitud manual");
  await expect(page.getByText("30 órdenes ficticias")).toBeVisible();
});

test("mobile dictation stops when the panel closes and keeps its text", async ({ page }) => {
  await dictation(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/sistema");
  await page.getByRole("button", { name: "Asistente IA", exact: true }).click();
  await page.getByRole("button", { name: "Dictar con micrófono" }).click();
  await expect(page.getByRole("button", { name: "Detener dictado" })).toBeVisible();
  await page.getByRole("button", { name: "Volver a la operación" }).click();
  await page.getByRole("button", { name: "Asistente IA", exact: true }).click();
  await expect(page.getByRole("button", { name: "Dictar con micrófono" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByLabel("Tu pregunta", { exact: true })).toHaveValue("Crea una solicitud para revisar sensor");
  await expect(page.getByRole("button", { name: "Consultar", exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});
