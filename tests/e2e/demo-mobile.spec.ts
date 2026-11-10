import { expect, test } from "@playwright/test";

test("footer contacts stay on one compact row on desktop", async ({ page }) => {
  await page.goto("/demo");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("heading", { name: "Estamos para servirte" })).toBeVisible();
  await expect(footer.getByRole("link")).toHaveCount(5);
  await expect(footer).not.toContainText("Todos los datos son ficticios");
  const layout = await footer.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    rows: Array.from(element.querySelectorAll("address a"), (link) => link.getBoundingClientRect().y),
  }));
  expect(layout.height).toBeLessThan(100);
  expect(Math.max(...layout.rows) - Math.min(...layout.rows)).toBeLessThan(2);
  await expect(footer.getByRole("link", { name: "WhatsApp", exact: true })).toHaveAttribute("href", /wa\.me\/526141282123\?text=/);
});

test.describe("mobile error prevention", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("two views fit mobile and the footer uses two compact rows", async ({ page }) => {
    await page.goto("/demo/sistema");
    const operator = page.getByRole("tab", { name: "Operador", exact: true });
    const admin = page.getByRole("tab", { name: "Administrador", exact: true });
    await expect(operator).toHaveAttribute("aria-selected", "true");
    const box = await admin.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await admin.click();
    await expect(page.getByRole("heading", { name: "Configuración", exact: true })).toBeVisible();
    await operator.click();
    await expect(page.getByLabel("Costo real (MXN)")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link")).toHaveCount(3);
    await expect(footer.getByRole("link", { name: "Sitio web de Salazar Consultores" })).toHaveAttribute("href", "https://salazarconsultores.com/");
    const rows = await footer.locator("address a:visible").evaluateAll((links) => links.map((link) => link.getBoundingClientRect().y));
    expect(Math.max(...rows) - Math.min(...rows)).toBeLessThan(2);
  });

  test("editing requires a change and prevents completion with unfinished activities", async ({ page }) => {
    await page.goto("/demo/operaciones");
    const save = page.getByRole("button", { name: "Guardar cambios", exact: true });
    await expect(save).toBeDisabled();
    await expect(page.getByText("Editando OT-1001", { exact: true })).toBeVisible();
    const status = page.getByRole("combobox", { name: "Estado", exact: true });
    await expect(status.locator("option:disabled")).toContainText("actividades pendientes");
    const cost = page.getByLabel("Costo real (MXN)");
    await cost.fill("123456");
    await expect(save).toBeEnabled();
    expect(await cost.evaluate((element) => getComputedStyle(element).fontSize)).toBe("16px");
    await save.click();
    await expect(page.getByText("OT-1001 actualizada.", { exact: false })).toBeVisible();
    await expect(save).toBeDisabled();
    await page.getByRole("button", { name: "Restablecer demo", exact: true }).click();
    const confirmation = page.getByRole("alertdialog");
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole("button", { name: "Cancelar", exact: true }).click();
    await expect(cost).toHaveValue("123,456.00");
  });
});
