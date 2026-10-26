import {mkdir} from 'node:fs/promises';
import {expect,test,type Page} from '@playwright/test';
import {fakePanorama} from './helpers/panorama';
import {focusSeongnam} from './helpers/place';
async function open(page:Page){
 await page.addInitScript(()=>localStorage.setItem('yeoun_2:onboarding:v1',JSON.stringify({version:1,completed:true})));
 await fakePanorama(page);await page.goto('./');await focusSeongnam(page);
 await page.getByRole('button',{name:'골목의 작은 불빛',exact:true}).click();
 await page.getByRole('button',{name:'선택한 기억 자세히 읽기'}).click();
 await page.getByRole('dialog',{name:'기억 상세'}).getByRole('button',{name:'거리뷰',exact:true}).click();
 const viewer=page.locator('.panorama-dialog'),pin=viewer.getByRole('button',{name:'거리뷰 댓글 지점 1',exact:true});
 await expect(pin).toBeVisible();await pin.click();await expect(viewer.getByRole('tooltip')).toBeVisible();
 return {viewer,pin,stage:viewer.locator('.panorama-stage'),canvas:viewer.locator('.panorama-canvas')};
}
test('번호 없이 표시하며 팝업이 댓글 패널·안내·버튼을 피해 화면 안에 뜬다',async({page},info)=>{
 const {viewer,pin,stage}=await open(page);
 expect((await pin.innerText()).trim()).toBe('');await expect(pin.locator('svg')).toHaveCount(1);
 for(const pan of [0,-20,8]){
  await page.evaluate(pan=>(window as unknown as {__testPanorama:{setPov:(v:object)=>void}}).__testPanorama.setPov({pan,tilt:0,fov:90}),pan);
  const peek=viewer.getByRole('tooltip');await expect(peek).toBeVisible();
  const r=(await peek.boundingBox())!,bounds=(await stage.boundingBox())!;
  expect(r.x).toBeGreaterThanOrEqual(bounds.x+11);expect(r.y).toBeGreaterThanOrEqual(bounds.y+11);
  expect(r.x+r.width).toBeLessThanOrEqual(bounds.x+bounds.width-11);expect(r.y+r.height).toBeLessThanOrEqual(bounds.y+bounds.height-11);
  for(const block of await viewer.locator('.panorama-comments-panel,.panorama-comments-toggle,.panorama-comment-hint').all()){
   const b=(await block.boundingBox())!;
   expect(r.x+r.width<=b.x||b.x+b.width<=r.x||r.y+r.height<=b.y||b.y+b.height<=r.y).toBe(true);
  }
 }
 await mkdir('test-results/screenshots',{recursive:true});
 await page.screenshot({path:`test-results/screenshots/panorama-ux-popup-${info.project.name}.png`,animations:'disabled'});
});
test('SDK가 조작 중 이벤트를 보내지 않아도 드래그·터치·휠 동안 숨기고 최종 위치로 복원한다',async({page},info)=>{
 const {viewer,pin,stage,canvas}=await open(page);
 const peek=viewer.getByRole('tooltip'),before=(await pin.boundingBox())!;
 const box=(await canvas.boundingBox())!;
 await page.mouse.move(box.x+25,box.y+110);await page.mouse.down();await page.mouse.move(box.x+60,box.y+110);
 await expect(pin).toBeHidden();await expect(peek).toBeHidden();
 // A held gesture must not reveal after the quiet timer, even without SDK events.
 await page.waitForTimeout(320);await expect(pin).toBeHidden();
 await page.evaluate(()=>{const api=(window as unknown as {__testPanorama:{pov:object}}).__testPanorama;api.pov={pan:8,tilt:0,fov:75};});
 await page.mouse.up();await expect(pin).toBeVisible();await expect(peek).toBeVisible();
 expect(Math.abs((await pin.boundingBox())!.x-before.x)).toBeGreaterThan(10);
 await canvas.dispatchEvent('pointerdown',{pointerId:42,pointerType:'touch',isPrimary:true,button:0});
 await expect(pin).toBeHidden();
 await canvas.dispatchEvent('pointercancel',{pointerId:42,pointerType:'touch'});
 await expect(pin).toBeVisible();
 for(let i=0;i<3;i++){await canvas.dispatchEvent('wheel',{deltaY:120});await expect(pin).toBeHidden();await page.waitForTimeout(100);}
 await expect(peek).toBeHidden();
 await mkdir('test-results/screenshots',{recursive:true});
 await page.screenshot({path:`test-results/screenshots/panorama-ux-moving-${info.project.name}.png`,animations:'disabled'});
 await expect(pin).toBeVisible();await expect(peek).toBeVisible();
 await expect(stage).not.toHaveAttribute('data-panorama-moving','true');
 // Scrolling content outside the native canvas must not hide scene comments.
 await viewer.locator('.memory-comments-list').dispatchEvent('wheel',{deltaY:120});await expect(pin).toBeVisible();
 await viewer.getByRole('button',{name:'거리뷰 닫기'}).click();
 await expect(viewer).toHaveCount(0);await page.getByRole('dialog',{name:'기억 상세'}).getByRole('button',{name:'거리뷰',exact:true}).click();
 await expect(page.locator('.panorama-comment-point').first()).toBeVisible();
});
