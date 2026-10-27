import { expect, test } from "@playwright/test";
import { businessAuditPrompt } from "../../src/lib/conference/prompts";

test("students can choose the audit path and copy its complete prompt", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const toolkit = page.getByRole("region", { name: "Emprende con IA.", exact: true });
  await expect(toolkit).toBeVisible();
  // A transformed CSS Module with no exports leaves className empty and the UI unstyled.
  await expect(toolkit).toHaveAttribute("class", /\S+/);
  await expect(toolkit).not.toHaveCSS("padding", "0px");
  await expect(toolkit.getByRole("button", { name: "Copiar prompt", exact: true })).toHaveCount(0);
  await toolkit.getByRole("button", { name: /Ya tengo avances/ }).click();
  await expect(toolkit.getByRole("button", { name: /Ya tengo avances/ })).toHaveAttribute("aria-pressed", "true");
  await expect(toolkit.getByRole("button", { name: /Solo tengo una idea/ })).toHaveAttribute("aria-pressed", "false");
  await toolkit.getByText("¿Qué archivos puedo subir?", { exact: false }).click();
  await expect(toolkit.getByText("Costos y precios:", { exact: true })).toBeVisible();
  await toolkit.getByRole("button", { name: "Copiar prompt", exact: true }).click();
  await expect(toolkit.getByRole("status")).toHaveText("Listo. Abre tu IA favorita y pega el texto.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(businessAuditPrompt);
});

test("mobile students copy their three answers and can return to the other path", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: /Solo tengo una idea/ }).click();
  await page.getByLabel("¿Qué quieres vender?").fill("   ");
  await page.getByLabel("¿En qué ciudad o zona?").fill("Chihuahua, mi universidad");
  await page.getByLabel("¿Cuánto puedes invertir hoy?").fill("0 MXN");
  await page.getByRole("button", { name: "Copiar prompt", exact: true }).click();
  await expect(page.getByLabel("¿Qué quieres vender?")).toBeFocused();
  await expect(page.getByRole("status")).toBeEmpty();

  await page.getByLabel("¿Qué quieres vender?").fill("  Snacks saludables  ");
  await page.getByRole("button", { name: "Copiar prompt", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Listo.");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Lo que quiero vender: Snacks saludables\n");
  expect(copied).toContain("Ciudad o entorno donde quiero empezar: Chihuahua, mi universidad");
  expect(copied).toContain("Dinero máximo que puedo invertir hoy: 0 MXN");
  expect(copied).not.toContain("[Escribe");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.getByRole("button", { name: /Ya tengo avances/ }).click();
  await expect(page.getByLabel("¿Qué quieres vender?")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Copiar prompt", exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("salazar-demo:data"))).toBeNull();
});

test("clipboard rejection offers selectable text without reporting success", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => { throw new Error("Clipboard permission denied"); } },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Ya tengo avances/ }).click();
  await page.getByRole("button", { name: "Copiar prompt", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Tu navegador no permitió copiar.");
  await expect(page.getByRole("button", { name: "¡Copiado!", exact: true })).toHaveCount(0);
  const manual = page.getByRole("textbox", { name: "Prompt para copiar manualmente" });
  await expect(manual).toHaveValue(businessAuditPrompt);
  await expect(manual).toBeFocused();
});
