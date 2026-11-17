import { expect, test } from "@playwright/test";
import { writeFileSync } from "node:fs";

test.skip(process.env.RUN_LIVE_AI !== "1", "Requiere RUN_LIVE_AI=1 y un servidor con IA real configurada.");

test("real NVIDIA costs, draft and follow-up with manual save boundary", async ({ page }, testInfo) => {
  test.setTimeout(100000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo/sistema');
  await expect(page.getByText('30 órdenes ficticias')).toBeVisible();
  const results: unknown[]=[];
  async function ask(question: string) {
    const started=Date.now();
    const pending=page.waitForResponse(r=>r.url().endsWith('/demo/api/ai')&&r.request().method()==='POST',{timeout:40000});
    await page.getByLabel('Tu pregunta',{exact:true}).fill(question);
    await page.getByRole('button',{name:'Consultar',exact:true}).click();
    const response=await pending;const result=await response.json();
    results.push({question,status:response.status(),ms:Date.now()-started,...result});
    writeFileSync(testInfo.outputPath('live-ai-results.json'),JSON.stringify(results,null,2));
    expect(result.source,JSON.stringify({reason:result.reason})).toBe('ai');
    expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
    return result;
  }
  const costs=await ask('Analiza los costos de Mantenimiento. Cita las órdenes con sobrecosto y recomienda qué revisar primero.');
  expect(costs.draft).toBeNull();
  const draft=await ask('Prepara una nueva solicitud: revisar sensor de línea 2 en Mantenimiento, tipo correctivo, prioridad alta, responsable Ana Torres, presupuesto 1500 pesos, compromiso 2026-12-20.');
  expect(draft.draft).toMatchObject({departmentId:'dept-mantenimiento',categoryId:'cat-correctivo',priorityId:'prio-alto',assignee:'Ana Torres',estimatedCost:1500,dueDate:'2026-12-20'});
  await expect(page.locator('[data-guide="new-order"]')).toBeVisible();
  await expect(page.getByText('30 órdenes ficticias')).toBeVisible();
  page.on('dialog',dialog=>dialog.accept());
  const updated=await ask('En el borrador actual cambia solo el presupuesto a 1800 pesos y conserva los demás datos.');
  expect(updated.draft).toMatchObject({assignee:'Ana Torres',estimatedCost:1800,dueDate:'2026-12-20',departmentId:'dept-mantenimiento'});
  await expect(page.getByText('30 órdenes ficticias')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('live-ai-desktop.png')});
});
