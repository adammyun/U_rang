import { mkdir } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('yeoun_2:onboarding:v1', JSON.stringify({version:1,completed:true})));
  await mkdir('test-results/screenshots', {recursive:true});
});
async function openBoard(page: Page) {
  await page.getByRole('button', {name:/태화강 국가정원.*기억/}).click();
  const board = page.getByLabel('장소의 기억 미리보기');
  await expect(board.locator('.atlas-place-note')).toHaveCount(5);
  return board;
}
async function capture(page: Page, name: string, project: string) {
  await page.mouse.move(page.viewportSize()!.width-2, 85);
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => undefined)));
  });
  await page.screenshot({path:`test-results/screenshots/place-notes-${name}-${project}.png`,animations:'disabled'});
}

test('모든 장소 기억을 수평 글자의 포스트잇으로 펼치고 열 때마다 배치만 조금씩 달라진다',async({page},info)=>{
  const errors: string[]=[]; page.on('pageerror', e=>errors.push(e.message));
  await page.goto('./');
  const board=await openBoard(page);
  await expect(board.getByRole('button',{name:/닫기|이 장소의 다른 기억 보기/})).toHaveCount(0);
  const buttons=board.locator('.atlas-place-note-open');
  const layout=async()=>board.locator('.atlas-place-note').evaluateAll(els=>els.map(el=>el.getAttribute('style')));
  const first=await layout();
  const styles=await buttons.evaluateAll(els=>els.map(el=>({text:getComputedStyle(el).transform,paper:getComputedStyle(el,'::before').transform,angle:parseFloat(getComputedStyle(el).getPropertyValue('--note-tilt'))})));
  for(const style of styles){expect(style.text).toBe('none');expect(style.paper).not.toBe('none');expect(Math.abs(style.angle)).toBeLessThanOrEqual(2.2);}
  await expect(board.getByRole('button',{name:'선택한 기억 자세히 읽기'})).toBeEnabled();
  await capture(page,'open',info.project.name);
  const scroll=board.getByRole('region',{name:'장소의 기억 목록'});
  await buttons.last().scrollIntoViewIfNeeded();
  await expect(buttons.last()).toBeInViewport();
  expect(await layout()).toEqual(first);
  await capture(page,'last',info.project.name);
  await page.keyboard.press('Escape');
  await expect(board).toBeHidden();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const reopened=await openBoard(page);
  expect(await layout()).not.toEqual(first);
  await capture(page,'reopen',info.project.name);
  // The side gutter is genuinely blank map space, not a hidden close control.
  if (info.project.name.startsWith('mobile')) await page.touchscreen.tap(5,140);
  else await page.mouse.click(5,140);
  await expect(reopened).toBeHidden();
  await expect(page.locator('.create-sheet')).toHaveCount(0);
  await expect(page.getByLabel('지도 메뉴',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await scroll.count()).toBe(0);
  expect(errors).toEqual([]);
});

test('포스트잇을 직접 읽고 뒤로 돌아오며 스크롤·거리뷰·지도 이동과 빈 화면 닫기를 유지한다',async({page},info)=>{
  await page.goto('./');
  const board=await openBoard(page);
  const last=board.locator('.atlas-place-note-open').last();
  const title=await last.locator('h3').innerText();
  await last.scrollIntoViewIfNeeded();
  const scroller=board.getByRole('region',{name:'장소의 기억 목록'});
  if(info.project.name.startsWith('mobile'))expect(await scroller.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  await last.click();
  const detail=page.getByRole('dialog',{name:'기억 상세'});
  await expect(detail.getByRole('heading',{level:2})).toHaveText(title);
  await capture(page,'detail',info.project.name);
  await detail.getByRole('button',{name:'뒤로가기'}).click();
  await expect(board).toBeVisible();
  await expect(board.locator('.atlas-place-note')).toHaveCount(5);
  await page.route('https://oapi.map.naver.com/**',route=>route.abort());
  await board.getByRole('button',{name:'거리뷰',exact:true}).click();
  const panorama=page.locator('.panorama-dialog');
  await expect(panorama).toBeVisible();
  await panorama.getByRole('button',{name:'거리뷰 닫기'}).click();
  await expect(board).toBeVisible();
  await board.getByRole('button',{name:'지도에서 이 장소 보기'}).click();
  await expect(board).toBeHidden();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await capture(page,'map',info.project.name);
});

test('움직임 줄이기에서도 포스트잇 상세를 읽고 Escape로 지도에 복귀한다',async({page})=>{
  await page.goto('./');
  const board=await openBoard(page);
  await expect(board.getByRole('button',{name:'선택한 기억 자세히 읽기'})).toBeEnabled();
  await page.emulateMedia({reducedMotion:'reduce'});
  await board.getByRole('button',{name:'선택한 기억 자세히 읽기'}).click();
  await expect(page.getByRole('dialog',{name:'기억 상세'})).toBeVisible();
  await expect(page.getByRole('dialog',{name:'기억 상세'}).getByRole('heading',{level:2})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog',{name:'기억 상세'})).toBeHidden();
  // Closing a detail returns to the map. No stale board or write form remains.
  await expect(board).toBeHidden();
  await expect(page.locator('.create-sheet')).toHaveCount(0);
});
