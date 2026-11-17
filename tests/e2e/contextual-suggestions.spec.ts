import { expect, test } from "@playwright/test";

test("suggestions change with the response and send full prompts with history while preserving typed text", async ({ page }) => {
  const requests: { question: string; history: { question: string; answer: string }[] }[] = [];
  const detail = "Analiza los costos de Mantenimiento: compara presupuesto y costo real, identifica las órdenes con sobrecosto y cita sus folios. Prioriza una revisión basada en observaciones, sin inventar causas.";
  await page.route("**/demo/api/ai", async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ json: { source: "ai", answer: requests.length === 1 ? "Revisa el costo real de Mantenimiento." : "Compara las órdenes con sobrecosto de Mantenimiento.", asOf: new Date().toISOString(), draft: null,
      suggestions: requests.length === 1 ? [
        { label: "Analizar Mantenimiento", question: detail },
        { label: "Comparar áreas", question: "Compara los costos de Mantenimiento con los demás departamentos y cita las órdenes que explican las diferencias." },
      ] : [{ label: "Revisar sobrecostos", question: "Revisa las órdenes con sobrecosto de Mantenimiento. Indica folios, importes y una acción concreta para cada una basada en las observaciones." }],
    } });
  });
  await page.goto("/demo/sistema");
  const suggestions = page.locator('[data-guide="ai-suggestions"]');
  await expect(suggestions.getByRole("button")).toHaveCount(3);
  await page.getByLabel("Tu pregunta", { exact: true }).fill("Investiga costos de Mantenimiento");
  await page.getByLabel("Tu pregunta", { exact: true }).press("Enter");
  await expect(suggestions.getByRole("button")).toHaveCount(2);
  await expect(suggestions.getByRole("button", { name: "Retrasos", exact: true })).toHaveCount(0);
  await page.getByLabel("Tu pregunta", { exact: true }).fill("Mi siguiente pregunta sin enviar");
  await suggestions.getByRole("button", { name: "Analizar Mantenimiento", exact: true }).click();
  await expect(suggestions.getByRole("button")).toHaveCount(1);
  await expect(suggestions.getByRole("button", { name: "Revisar sobrecostos" })).toBeEnabled();
  expect(requests[1].question).toBe(detail);
  expect(requests[1].history).toEqual([{ question: "Investiga costos de Mantenimiento", answer: "Revisa el costo real de Mantenimiento." }]);
  await expect(page.getByLabel("Tu pregunta", { exact: true })).toHaveValue("Mi siguiente pregunta sin enviar");
  await page.getByRole("tab", { name: "Dirección", exact: true }).click();
  await expect(suggestions.getByRole("button", { name: "Revisar sobrecostos" })).toBeVisible();
  await suggestions.getByRole("button", { name: "Revisar sobrecostos" }).focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => requests.length).toBe(3);
  expect(requests[2].history).toHaveLength(2);
});

test("a prepared request gets relevant suggestions instead of the initial fixed options", async ({ page }) => {
  await page.route("**/demo/api/ai", async route => {
    await route.fulfill({ json: { source: "ai", answer: "Completa responsable y fecha.", asOf: new Date().toISOString(), draft: {
      title: "Revisar sensor", departmentId: null, categoryId: null, priorityId: null, assignee: null, dueDate: null, estimatedCost: null, description: null,
    }, suggestions: [
      { label: "Revisar pendientes", question: "Revisa qué datos faltan en el borrador de Revisar sensor y qué debo verificar antes de guardarlo. No inventes datos ni crees la orden." },
      { label: "Nueva solicitud", question: "Prepara una nueva solicitud desde cero sin reutilizar datos del borrador anterior. Pregúntame qué necesito resolver. No guardes ninguna orden." },
    ] } });
  });
  await page.goto("/demo/sistema");
  await page.getByLabel("Tu pregunta", { exact: true }).fill("Prepara una solicitud para revisar sensor");
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  await expect(page.locator('[data-guide="new-order"]')).toBeVisible();
  const suggestions = page.locator('[data-guide="ai-suggestions"]');
  await expect(suggestions.getByRole("button")).toHaveCount(2);
  await expect(suggestions.getByRole("button", { name: "Nueva solicitud", exact: true })).toBeVisible();
  await expect(page.getByText("30 órdenes ficticias")).toBeVisible();
});

test("mobile suggestions fit the panel and invalid response suggestions use a contextual fallback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/demo/api/ai", async route => {
    const request = route.request().postDataJSON();
    await route.fulfill({ json: { source: "calculations", answer: "Resumen calculado de los costos.", asOf: new Date().toISOString(), suggestions: [{ label: "Inválida", question: "x".repeat(301) }],
    } });
    expect(request.question).toContain("costos");
  });
  await page.goto("/demo/sistema");
  await page.getByRole("button", { name: "Asistente IA", exact: true }).click();
  await page.getByLabel("Tu pregunta", { exact: true }).fill("Analiza costos");
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  const suggestions = page.locator('[data-guide="ai-suggestions"]');
  await expect(suggestions.getByRole("button", { name: "Comparar áreas", exact: true })).toBeVisible();
  await expect(suggestions.getByRole("button", { name: "Inválida" })).toHaveCount(0);
  await expect(suggestions.getByRole("button").first()).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});
