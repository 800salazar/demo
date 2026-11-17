import { expect, test } from "@playwright/test";

for (const [title, singular] of [["Departamentos", "departamento"], ["Tipos de solicitud", "tipo de solicitud"], ["Estados", "estado"], ["Prioridades", "prioridad"]] as const) {
  test(`adds, edits and confirms deletion of an unused ${singular}`, async ({ page }) => {
    await page.goto('/demo/sistema?vista=administrador');
    const card=page.locator('[data-slot="card"]').filter({has:page.getByRole('heading',{name:title,exact:true})});
    await card.getByRole('button',{name:`Agregar ${singular}`,exact:true}).click();
    await card.getByLabel(`Nombre de ${singular}`,{exact:true}).fill('Opción de prueba');
    if(singular==='estado') await card.getByLabel('Comportamiento del estado').selectOption('in_progress');
    await card.getByRole('button',{name:'Agregar opción',exact:true}).click();
    await expect(card.getByText('Opción de prueba',{exact:true})).toBeVisible();
    await card.getByRole('button',{name:/^Editar /}).last().click();
    await card.getByRole('textbox').fill('Opción corregida');
    await card.getByRole('button',{name:/^Guardar/}).click();
    await expect(card.getByText('Opción corregida',{exact:true})).toBeVisible();
    await card.getByRole('button',{name:`Eliminar ${singular} Opción corregida`,exact:true}).click();
    const dialog=page.getByRole('alertdialog');
    await expect(dialog).toContainText('0 órdenes');
    await dialog.getByRole('button',{name:'Cancelar',exact:true}).click();
    await expect(card.getByText('Opción corregida',{exact:true})).toBeVisible();
    await card.getByRole('button',{name:`Eliminar ${singular} Opción corregida`,exact:true}).click();
    await dialog.getByRole('button',{name:'Confirmar eliminación',exact:true}).click();
    await expect(card.getByText('Opción corregida',{exact:true})).toHaveCount(0);
  });
}

test('retires a priority for new requests while keeping it in existing orders across reload',async({page})=>{
  await page.goto('/demo/sistema?vista=administrador');
  await page.getByRole('button',{name:'Eliminar prioridad Alto',exact:true}).click();
  const dialog=page.getByRole('alertdialog');
  await expect(dialog.getByRole('button',{name:'Confirmar eliminación'})).toBeDisabled();
  await dialog.getByLabel('Conservar en las anteriores; retirar de nuevas asignaciones').check();
  await dialog.getByRole('button',{name:'Confirmar eliminación'}).click();
  const row=page.getByRole('row').filter({hasText:'OT-1001'});
  await expect(row).toContainText('Alto');
  await page.reload();
  await expect(row).toContainText('Alto');
  await page.getByRole('tab',{name:'Operador',exact:true}).click();
  await page.getByRole('button',{name:'Nueva solicitud',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Prioridad',exact:true}).locator('option').filter({hasText:'Alto'})).toHaveCount(0);
});

test('requires a replacement and updates existing department references',async({page})=>{
  await page.goto('/demo/sistema?vista=administrador');
  await page.getByRole('button',{name:'Eliminar departamento Mantenimiento',exact:true}).click();
  const dialog=page.getByRole('alertdialog');
  await dialog.getByLabel('Sustituir también en las órdenes existentes').check();
  await expect(dialog.getByRole('button',{name:'Confirmar eliminación'})).toBeDisabled();
  await dialog.getByLabel('Sustituir por').selectOption({label:'Producción'});
  await dialog.getByRole('button',{name:'Confirmar eliminación'}).click();
  const row=page.getByRole('row').filter({hasText:'OT-1001'});
  await expect(row).toContainText('Producción');
  await expect(row.getByText('Mantenimiento',{exact:true})).toHaveCount(0);
  await page.reload();await expect(row).toContainText('Producción');
});

test('blocks bulk completion when mandatory activities remain',async({page})=>{
  await page.goto('/demo/sistema?vista=administrador');
  await page.getByRole('button',{name:'Eliminar estado En proceso',exact:true}).click();
  const dialog=page.getByRole('alertdialog');
  await dialog.getByLabel('Sustituir también en las órdenes existentes').check();
  await dialog.getByLabel('Sustituir por').selectOption({label:'Completada · Completada'});
  await dialog.getByRole('button',{name:'Confirmar eliminación'}).click();
  await expect(dialog.getByRole('alert')).toContainText('actividades obligatorias');
  await dialog.getByRole('button',{name:'Cancelar',exact:true}).click();
  await expect(page.getByRole('row').filter({hasText:'OT-1001'})).toContainText('En proceso');
});

test('catalog actions and confirmation fit a phone and return focus on Escape',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/demo/sistema?vista=administrador');
  const remove=page.getByRole('button',{name:'Eliminar prioridad Alto',exact:true});
  await remove.scrollIntoViewIfNeeded();
  const size=await remove.boundingBox();expect(size!.width).toBeGreaterThanOrEqual(44);expect(size!.height).toBeGreaterThanOrEqual(44);
  await remove.click();
  const dialog=page.getByRole('alertdialog');
  await expect(dialog).toBeInViewport({ratio:1});
  await dialog.getByLabel('Sustituir también en las órdenes existentes').check();
  await dialog.getByLabel('Sustituir por').selectOption({label:'Medio'});
  const confirmSize=await dialog.getByRole('button',{name:'Confirmar eliminación'}).boundingBox();expect(confirmSize!.height).toBeGreaterThanOrEqual(44);
  await page.screenshot({path:testInfo.outputPath('catalog-mobile.png')});
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();await expect(remove).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});
