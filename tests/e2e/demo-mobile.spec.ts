import { expect, test } from "@playwright/test";

test("footer contacts stay on one compact row on desktop", async ({ page }) => {
  await page.goto("/demo");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("heading", { name: "Estamos para servirte" })).toBeVisible();
  await expect(footer.getByRole("link")).toHaveCount(4);
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

  test("menu fits the screen, makes the current module explicit and closes after navigation", async ({ page }) => {
    await page.goto("/demo");
    const open = page.getByRole("button", { name: "Abrir menú" });
    const openBox = await open.boundingBox();
    expect(openBox!.width).toBeGreaterThanOrEqual(44);
    expect(openBox!.height).toBeGreaterThanOrEqual(44);
    await open.click();
    const menu = page.getByRole("dialog", { name: "Menú", exact: true });
    await expect(menu).toBeVisible();
    const menuBox = await menu.boundingBox();
    expect(menuBox!.width).toBeLessThanOrEqual(320);
    expect(menuBox!.height).toBeLessThanOrEqual(640);
    const current = menu.getByRole("link", { name: "Inicio", exact: true });
    await expect(current).toHaveAttribute("aria-current", "page");
    const surface = await menu.evaluate((element) => getComputedStyle(element).backgroundImage);
    const selected = await current.evaluate((element) => getComputedStyle(element).backgroundImage);
    expect(surface).toContain("linear-gradient");
    expect(selected).toContain("linear-gradient");
    expect(surface).not.toBe(selected);
    await menu.getByRole("link", { name: "Operaciones", exact: false }).click();
    await expect(page).toHaveURL(/\/demo\/operaciones$/);
    await expect(menu).not.toBeVisible();
    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(horizontalOverflow).toBe(false);
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
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await page.getByRole("dialog", { name: "Menú", exact: true }).getByRole("button", { name: "Restablecer demo" }).click();
    const confirmation = page.getByRole("alertdialog");
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole("button", { name: "Cancelar", exact: true }).click();
    await page.getByRole("button", { name: "Cerrar menú", exact: true }).click();
    await expect(cost).toHaveValue("123456");
  });
});
