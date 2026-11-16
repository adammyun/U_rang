import {mkdir} from 'node:fs/promises';
import {expect,test} from '@playwright/test';
import {focusSeongnam, waitForMapZoom} from './helpers/place';
import {fakePanorama} from './helpers/panorama';
import { emotions } from '../../src/features/memories/model';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('yeoun_2:onboarding:v1',JSON.stringify({version:1,completed:true})));
 await mkdir('test-results/screenshots',{recursive:true});
});

test('지도 확대에 따라 색 점, 사진 아이콘이 있는 글, 사진이 있는 글을 표시한다', async ({ page }, info) => {
 await page.goto('./');
 const stamps = page.locator('.atlas-stamp');
 const dots = page.locator('.atlas-stamp[data-marker-detail="dot"]');
 await expect(dots.first()).toBeVisible();
 await expect(stamps.locator('img,.atlas-stamp-face')).toHaveCount(0);
 expect(await dots.first().evaluate(el => getComputedStyle(el, '::after').backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
 await page.screenshot({path:`test-results/screenshots/marker-overview-${info.project.name}.png`,animations:'disabled'});

 await page.getByRole('combobox', { name: '장소 이름' }).fill('대왕암');
 await page.getByRole('option', { name: /^대왕암공원 / }).click();
 const stamp = page.locator('.atlas-stamp[data-memory-ids~="20000000-0000-4000-8000-000000000021"]');
 const visiblePaper = stamp.locator('.atlas-stamp-visual:not(.is-leaving)');
 const zoom = (amount: '확대' | '축소') => page.getByRole('button', { name: `지도 ${amount}`, exact: true }).click();
 await waitForMapZoom(page, 14.2);
 await expect(stamp).toHaveAttribute('data-marker-detail', 'note');
 await expect(visiblePaper.locator('.atlas-stamp-title')).toHaveText('바다 앞에서 약속한 다음 여행');
 await expect(stamp.locator('.atlas-stamp-photo-icon')).toBeVisible();
 await expect(stamps.locator('img')).toHaveCount(0);
 const compactHeight = (await stamp.boundingBox())!.height;
 await page.screenshot({path:`test-results/screenshots/marker-note-${info.project.name}.png`,animations:'disabled'});

 if (!info.project.name.startsWith('mobile')) {
   // Center the coastal memory before testing the zoom transitions.
   const { width, height } = page.viewportSize()!;
   await page.mouse.move(width / 2, height * .6);
   await page.mouse.down();
   await page.mouse.move(width / 2 - 110, height * .6, { steps: 10 });
   await page.mouse.up();
 }
 await zoom('확대'); await waitForMapZoom(page, 15.2);
 await page.evaluate(() => {
   const transitions = new Set<string>();
   document.addEventListener('animationstart', event => {
     const target = event.target;
     if (!(target instanceof HTMLElement) || !target.matches('.atlas-stamp-visual')) return;
     if (!target.closest('[data-memory-ids~="20000000-0000-4000-8000-000000000021"]')) return;
     transitions.add(`${target.dataset.stampVisual}:${event.animationName}`);
     document.documentElement.dataset.stampTransitions = [...transitions].join(' ');
   });
 });
 await zoom('확대'); await waitForMapZoom(page, 16.2);
 await expect(stamp).toHaveAttribute('data-marker-detail', 'photo');
 await expect(visiblePaper.locator('.atlas-stamp-title')).toHaveText('바다 앞에서 약속한 다음 여행');
 expect((await stamp.boundingBox())!.height).toBeGreaterThan(compactHeight * 2);
 await expect(page.locator('html')).toHaveAttribute('data-stamp-transitions', /note:atlas-stamp-disappear/);
 await expect(page.locator('html')).toHaveAttribute('data-stamp-transitions', /photo:atlas-stamp-appear/);
 expect(await stamp.evaluate(el => getComputedStyle(el).getPropertyValue('--stamp-color'))).toBe(emotions.excited.color);
 const image = stamp.locator('img');
 await expect(image).toBeInViewport();
 await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
 await page.screenshot({path:`test-results/screenshots/marker-photo-${info.project.name}.png`,animations:'disabled'});

 await zoom('축소'); await waitForMapZoom(page, 15.2);
 await expect(stamp).toHaveAttribute('data-marker-detail', 'note');
 await expect(page.locator('html')).toHaveAttribute('data-stamp-transitions', /photo:atlas-stamp-disappear/);
 await expect(page.locator('html')).toHaveAttribute('data-stamp-transitions', /note:atlas-stamp-appear/);
 await expect(stamps.locator('img')).toHaveCount(0);
 await stamp.click();
 const board = page.getByLabel('장소의 기억 미리보기');
 await expect(board).toBeVisible();
 await board.getByRole('button', { name: '선택한 기억 자세히 읽기' }).click();
 await expect(page.getByRole('dialog', { name: '기억 상세' })).toBeVisible();
});
test('테마별 점 윤곽을 유지하고 다른 장소의 기억 묶음을 한 번의 선택으로 펼친다', async ({ page }, info) => {
 await page.goto('./');
 await expect(page.locator('.ulsan-urban-layers')).toBeVisible();
 const memoryId = (id: number) => `20000000-0000-4000-8000-${String(id).padStart(12,'0')}`;
 const stampWith = (id: number) => page.locator(`.atlas-stamp[data-memory-ids~="${memoryId(id)}"]`);
 const west = stampWith(31);
 const garden = stampWith(8);
 const groupIds = await west.getAttribute('data-memory-ids');
 await expect(garden).toHaveAttribute('data-memory-ids', groupIds!);
 const anchor = (await west.boundingBox())!;
 const rims = new Set<string>();
 for (const mode of ['기본', '다크', '자세히', '기본']) {
   await page.getByRole('button', { name: /^지도 조정 열기/ }).click();
   await page.getByRole('dialog').getByRole('button', { name: new RegExp(`^${mode}`) }).click();
   await page.getByRole('button', { name: '지도 조정 닫기' }).click();
   if (mode === '자세히') {
     await expect.poll(() => page.locator('.raster-map.detail-mode > img').evaluateAll(
       tiles => tiles.some(tile => (tile as HTMLImageElement).naturalWidth > 0)
     )).toBe(true);
   } else await expect(page.locator('.ulsan-urban-layers')).toBeVisible();
   rims.add(await west.evaluate(el=>getComputedStyle(el).getPropertyValue('--atlas-dot-edge')));
   await expect(west).toHaveAttribute('data-marker-detail', 'dot');
   const next = (await west.boundingBox())!;
   expect(Math.abs(anchor.x - next.x)).toBeLessThan(1);
   expect(Math.abs(anchor.y - next.y)).toBeLessThan(1);
   await page.screenshot({path:`test-results/screenshots/marker-theme-${mode}-${info.project.name}.png`,animations:'disabled'});
 }
 expect(rims.size).toBe(3);
 await west.click();
 await expect(west).not.toHaveAttribute('data-memory-ids', new RegExp(memoryId(8)));
 const view = page.locator('.ulsan-line-map');
 // Let the flyTo settle before sending the next camera input.
 await expect.poll(() => view.evaluate(el => {
   const before = el.getAttribute('viewBox');
   return new Promise<boolean>(resolve => requestAnimationFrame(() =>
     requestAnimationFrame(() => resolve(el.getAttribute('viewBox') === before))));
 })).toBe(true);
 await expect(garden).toHaveAttribute('data-memory-count', '5');
 await expect(west).toHaveAttribute('data-memory-count', '1');
 await page.screenshot({path:`test-results/screenshots/marker-split-${info.project.name}.png`,animations:'disabled'});
 await page.getByRole('button', { name: '지도 축소', exact: true }).click();
 await expect(west).toHaveAttribute('data-memory-ids', groupIds!);
});

test('8가지 감정으로 탐색하고 지도 조작 시 태그가 접혀도 선택은 유지된다',async({page},info)=>{
 await page.goto('./');
 await expect(page.locator('.atlas-stamp').first()).toBeVisible();
 const picker=page.getByLabel('감정으로 기억 탐색');
 await picker.getByRole('button',{name:/감정 태그 펼치기/}).click();
 const tags=picker.getByRole('group',{name:'감정 선택'});
 await expect(tags.getByRole('button')).toHaveCount(8);
 for(const name of ['그리움','평온','사랑','행복','슬픔','설렘','외로움','의미 있는 순간'])await expect(tags.getByRole('button',{name,exact:true})).toHaveCount(1);
 const sad=tags.getByRole('button',{name:'슬픔',exact:true});await sad.scrollIntoViewIfNeeded();await sad.click();
 await expect(sad).toHaveAttribute('aria-pressed','true');await expect(page).toHaveURL(/emotion=sad/);
 await page.screenshot({path:`test-results/screenshots/density-emotions-${info.project.name}.png`,animations:'disabled'});
 await page.locator('.map-surface').first().dispatchEvent('wheel',{deltaY:100});
 await expect(tags).toBeHidden();
 await picker.getByRole('button',{name:/감정 태그 펼치기/}).click();
 await expect(picker.getByRole('button',{name:'슬픔',exact:true})).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('마이페이지에서 내 기억의 감정을 바로 수정하고 원래 지도를 유지한다',async({page},info)=>{
 await page.addInitScript(()=>localStorage.setItem('yeoun_2.pages.auth.v1','signed-in'));
 await page.goto('./');const map=page.getByLabel('울산 기억 지도. 기억 남기기 버튼으로 장소 선택을 시작하세요.',{exact:true});
 await map.evaluate(el=>el.setAttribute('data-density-map','retained'));
 await page.getByRole('button',{name:'마이페이지',exact:true}).click();
 const personal=page.getByRole('dialog',{name:'마이페이지'});
 await personal.getByRole('button',{name:'나만 간직한 골목의 저녁 감정 수정',exact:true}).click();
 const form=page.locator('.create-sheet');await expect(form).toBeVisible();
 await form.getByRole('combobox',{name:'그날의 감정'}).click();
 await page.getByRole('option',{name:'슬픔',exact:true}).click();
 await form.getByRole('button',{name:'변경 내용 저장하기',exact:true}).click();
 await expect(form).toHaveCount(0);await expect(personal).toBeVisible();
 await expect(personal.locator('.personal-memory-card').filter({hasText:'나만 간직한 골목의 저녁'})).toContainText('슬픔');
 await expect(map).toHaveAttribute('data-density-map','retained');
 await page.screenshot({path:`test-results/screenshots/density-personal-edit-${info.project.name}.png`,animations:'disabled'});
});
test('예시 댓글은 두 개씩 나타나고 표식·팝업이 회전과 줌에 함께 이동한다',async({page},info)=>{
 await fakePanorama(page);await page.goto('./');await focusSeongnam(page);
 await page.getByRole('button',{name:'골목의 작은 불빛',exact:true}).click();
 await page.getByRole('button',{name:'선택한 기억 자세히 읽기'}).click();
 await page.getByRole('dialog',{name:'기억 상세'}).getByRole('button',{name:'거리뷰',exact:true}).click();
 const viewer=page.locator('.panorama-dialog'),thread=viewer.getByRole('region',{name:'기억 댓글'});
 await expect(thread.locator('.memory-comment')).toHaveCount(2);
 await expect(thread.getByRole('button',{name:'내 댓글 삭제'})).toHaveCount(0);
 const pin=viewer.getByRole('button',{name:'거리뷰 댓글 지점 1',exact:true});await expect(pin).toBeVisible();
 const before=await pin.boundingBox();
 if(info.project.name.startsWith('mobile'))await pin.tap();else {await pin.hover();await pin.click();}
 await expect(viewer.getByRole('tooltip')).toContainText('골목');
 await page.evaluate(()=>{const api=(window as unknown as {__testPanorama:{setPov:(pov:{pan:number;tilt:number;fov:number})=>void}}).__testPanorama;api.setPov({pan:8,tilt:5,fov:75});});
 await expect(pin).toBeVisible();
 await expect.poll(async()=>Math.abs((await pin.boundingBox())!.x-before!.x)).toBeGreaterThan(10);
 await expect(viewer.getByRole('tooltip')).toBeVisible();
 const tooltip=await viewer.getByRole('tooltip').boundingBox(),hint=await viewer.locator('.panorama-comment-hint').boundingBox();
 expect(tooltip!.x+tooltip!.width<=hint!.x||hint!.x+hint!.width<=tooltip!.x||tooltip!.y+tooltip!.height<=hint!.y||hint!.y+hint!.height<=tooltip!.y).toBe(true);
 await page.screenshot({path:`test-results/screenshots/density-example-comments-${info.project.name}.png`,animations:'disabled'});
 await viewer.getByRole('button',{name:'거리뷰 닫기'}).click();
 await page.getByRole('dialog',{name:'기억 상세'}).getByRole('button',{name:'거리뷰',exact:true}).click();
 await expect(viewer.getByRole('region',{name:'기억 댓글'}).locator('.memory-comment')).toHaveCount(2);
});

test('마이페이지의 감정 메뉴 설정이 저장되고 새로고침 뒤에도 유지된다',async({page},info)=>{
 await page.addInitScript(()=>localStorage.setItem('yeoun_2.pages.auth.v1','signed-in'));
 await page.goto('./');await page.getByRole('button',{name:'마이페이지',exact:true}).click();
 const personal=page.getByRole('dialog',{name:'마이페이지'});
 await personal.getByText('감정 메뉴 설정',{exact:true}).click();
 const settings=personal.locator('.emotion-menu-settings');
 const options=settings.getByRole('checkbox');await expect(options).toHaveCount(8);
 for(const option of await options.all())await option.uncheck();
 await expect(settings.getByRole('button',{name:'감정 메뉴 저장',exact:true})).toBeDisabled();
 await settings.getByRole('checkbox',{name:'슬픔',exact:true}).check();
 await settings.getByRole('checkbox',{name:'의미 있는 순간',exact:true}).check();
 await settings.getByRole('button',{name:'감정 메뉴 저장',exact:true}).click();
 await expect(settings.getByRole('status')).toContainText('저장했어요');
 await page.screenshot({path:`test-results/screenshots/density-menu-settings-${info.project.name}.png`,animations:'disabled'});
 await page.getByRole('button',{name:'지도',exact:true}).click();
 await page.getByRole('button',{name:/감정 태그 펼치기/}).click();
 let tags=page.getByRole('group',{name:'감정 선택'});
 await expect(tags.getByRole('button')).toHaveCount(2);
 await expect(tags.getByRole('button',{name:'슬픔',exact:true})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:/감정 태그 펼치기/}).click();
 tags=page.getByRole('group',{name:'감정 선택'});await expect(tags.getByRole('button')).toHaveCount(2);
 await page.getByRole('button',{name:'마이페이지',exact:true}).click();
 await personal.getByText('감정 메뉴 설정',{exact:true}).click();
 await expect(settings.getByRole('checkbox',{name:'슬픔',exact:true})).toBeChecked();
 await expect(settings.getByRole('checkbox',{name:'행복',exact:true})).not.toBeChecked();
});
