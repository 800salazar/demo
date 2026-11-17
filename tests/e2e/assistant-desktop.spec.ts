import { expect, test } from "@playwright/test";
for (const viewport of [{width:1440,height:900},{width:1366,height:768},{width:1280,height:720}]) {
  test(`keeps the full composer inside ${viewport.width}x${viewport.height} before and after scrolling`,async({page})=>{
    await page.setViewportSize(viewport);
    await page.goto('/demo/sistema');
    await expect(page.getByText('30 órdenes ficticias')).toBeVisible();
    const rail=page.getByRole('complementary',{name:'Asistente de la operación'});
    const microphone=page.getByRole('button',{name:'Dictar con micrófono',exact:true});
    for(const scroll of [0,500,0]) {
      await page.evaluate(y=>window.scrollTo(0,y),scroll);
      await expect.poll(async()=>{const box=await rail.boundingBox();return box?box.y+box.height:Infinity;}).toBeLessThanOrEqual(viewport.height-8);
      await expect(microphone).toBeInViewport({ratio:1});
      await expect(page.getByRole('button',{name:'Consultar',exact:true})).toBeInViewport({ratio:1});
      await expect(page.getByLabel('Tu pregunta',{exact:true})).toBeInViewport({ratio:1});
    }
  });
}
