import { expect, test } from "@playwright/test";

test("el desglose aparece al pasar el cursor y refleja los importes", async ({ page }) => {
  await page.goto("/demo/operaciones");
  const bar = page.getByRole("button", { name: /Ver desglose/ }).first();
  await expect(bar).toBeVisible();
  await expect(bar).toContainText(/\$[\d,]+\.\d{2}/);
  await bar.hover();
  const detail = page.getByRole("dialog", { name: /Desglose de/ });
  await expect(detail).toBeVisible();
  await expect(detail.getByText(/Total: \$/)).toBeVisible();
  await expect(detail.locator("li").first()).toContainText(/OT-\d+/);
  await expect(detail.locator("li").first()).toContainText(/\$[\d,]+\.\d{2}/);
});

test("el desglose se puede abrir y cerrar en móvil", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3100/demo/ia");
    await page.getByRole("button", { name: /Ver desglose/ }).first().tap();
    const detail = page.getByRole("dialog", { name: /Desglose de/ });
    await expect(detail).toBeVisible();
    const box = await detail.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    await detail.getByRole("button", { name: "Cerrar desglose" }).tap();
    await expect(detail).not.toBeVisible();
  } finally { await context.close(); }
});
