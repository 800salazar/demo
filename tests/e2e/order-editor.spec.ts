import { expect, test } from "@playwright/test";

for (const path of ["/demo/operaciones", "/demo/ia"]) {
  test(`editor de órdenes y formato en ${path}`, async ({ page }) => {
    await page.goto(path);
    const search = page.getByRole("combobox", { name: "Orden de trabajo" });
    await search.click();
    await expect(page.getByRole("listbox", { name: "Órdenes de trabajo" })).toBeVisible();
    await search.fill("OT-1002");
    await page.getByRole("option", { name: /OT-1002/ }).click();
    await expect(page.getByText("Editando OT-1002", { exact: true })).toBeVisible();

    const cost = page.getByLabel("Costo real (MXN)");
    await cost.fill("123456.78");
    await expect(cost).toHaveValue("123,456.78");
    const date = page.getByLabel("Fecha compromiso");
    await date.fill("2026-12-05");
    await expect(page.getByText("05 dic 2026", { exact: true })).toBeVisible();
    const status = page.getByRole("combobox", { name: "Estado", exact: true });
    await status.selectOption({ label: "Pendiente" });
    await expect(status).toHaveClass(/bg-slate-100/);
    await status.selectOption({ label: "En proceso" });
    await expect(status).toHaveClass(/bg-blue-100/);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await page.reload();
    await search.click();
    await search.fill("OT-1002");
    await page.getByRole("option", { name: /OT-1002/ }).click();
    await expect(cost).toHaveValue("123,456.78");
    await expect(date).toHaveValue("2026-12-05");
    await expect(status).toHaveValue("st-proceso");
  });
}
