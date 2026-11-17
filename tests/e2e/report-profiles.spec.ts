import { expect, test } from "@playwright/test";

for (const view of ["operador", "administrador", "direccion"] as const) {
  for (const days of [7, 14] as const) {
    test(`downloads the ${view} report for ${days} days only after selecting a period`, async ({ page }) => {
      const downloads: string[] = [];
      page.on("download", download => downloads.push(download.suggestedFilename()));
      await page.goto(`/demo/sistema?vista=${view}`);
      await expect(page.getByText("30 órdenes ficticias")).toBeVisible();
      await page.getByRole("button", { name: "Reporte PDF", exact: true }).click();
      const menu = page.getByRole("menu", { name: "Periodo del reporte" });
      await expect(menu).toBeVisible();
      await expect(menu.getByRole("menuitem")).toHaveCount(2);
      expect(downloads).toEqual([]);
      const download = page.waitForEvent("download");
      await menu.getByRole("menuitem", { name: `Últimos ${days} días`, exact: true }).click();
      expect((await download).suggestedFilename()).toBe(`salazar-reporte-${view}-${days}-dias.pdf`);
      await expect(menu).not.toBeVisible();
    });
  }
}

test("the period menu supports keyboard, dismissal and the current mobile profile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/sistema");
  await page.getByRole("tab", { name: "Administrador", exact: true }).click();
  const button = page.getByRole("button", { name: "Reporte PDF", exact: true });
  await button.focus(); await page.keyboard.press("Enter");
  const menu = page.getByRole("menu", { name: "Periodo del reporte" });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible(); await expect(button).toBeFocused();
  await page.keyboard.press("Enter"); await page.keyboard.press("ArrowDown");
  await expect(menu.getByRole("menuitem").last()).toBeFocused();
  await expect(menu).toBeInViewport();
  const download = page.waitForEvent("download"); await page.keyboard.press("Enter");
  expect((await download).suggestedFilename()).toBe("salazar-reporte-administrador-14-dias.pdf");
});
