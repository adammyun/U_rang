import { mkdir } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

const mapLabel = '울산 기억 지도. 기억 남기기 버튼으로 장소 선택을 시작하세요.';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('yeoun_2:onboarding:v1', JSON.stringify({ version: 1, completed: true })));
  await mkdir('test-results/screenshots', { recursive: true });
});
async function login(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
  await page.getByRole('button', { name: '로컬 시연 세션 시작' }).click();
}
async function capture(page: Page, name: string, project: string) {
  await page.mouse.move(page.viewportSize()!.width - 10, 85);
  await page.screenshot({ path: `test-results/screenshots/navigation-${name}-${project}.png`, animations: 'disabled' });
}

test('지도·탐색·내 기억의 하단 메뉴가 같은 위치에 남고 일반 지도 클릭은 작성을 시작하지 않는다', async ({ page }, info) => {
  await login(page);
  const map = page.getByLabel(mapLabel);
  await map.click({ position: { x: 220, y: 360 }, force: true });
  await expect(page.getByRole('region', { name: '기억을 남길 장소 선택' })).toHaveCount(0);
  await expect(page.locator('.create-sheet')).toHaveCount(0);
  const nav = page.getByLabel('지도 메뉴', { exact: true });
  const labels = async () => nav.locator(':scope > :not(.memory-cta)').allTextContents();
  const initialLabels = (await labels()).map(t => t.trim());
  expect(initialLabels).toEqual(['지도', '탐색', '내 기억']);
  const initial = (await nav.boundingBox())!;
  for (const selector of ['.brand', '.spatial-intro']) {
    expect(await page.locator(selector).evaluate(el => getComputedStyle(el).textShadow)).not.toBe('none');
  }
  await expect(page.locator('.atlas-stamp').first()).toBeVisible();
  await expect(page.locator('.ulsan-urban-layers')).toBeVisible();
  await capture(page, 'main', info.project.name);
  await nav.getByRole('button', { name: '탐색', exact: true }).click();
  await expect(page.getByLabel('주변의 공개 기억')).toBeVisible();
  await expect(nav).toBeInViewport();
  expect((await nav.boundingBox())!.y).toBe(initial.y);
  const panel = (await page.getByLabel('주변의 공개 기억').boundingBox())!;
  expect(panel.y + panel.height).toBeLessThan(initial.y);
  if (info.project.name.startsWith('mobile')) await expect(page.getByRole('button', { name: '지도 확대', exact: true })).toBeHidden();
  await capture(page, 'explore', info.project.name);
  await nav.getByRole('link', { name: '내 기억', exact: true }).click();
  await expect(page).toHaveURL(/#\/my-map/);
  expect((await labels()).map(t => t.trim())).toEqual(initialLabels);
  expect((await nav.boundingBox())!.y).toBe(initial.y);
  await map.click({ position: { x: 220, y: 360 }, force: true });
  await expect(page.locator('.create-sheet')).toHaveCount(0);
  await expect(page.getByRole('region', { name: '기억을 남길 장소 선택' })).toHaveCount(0);
  await nav.getByRole('button', { name: '내 기억 목록 펼치기' }).click();
  await expect(page.getByLabel('내 기억 목록', { exact: true })).toBeVisible();
  await expect(nav).toBeInViewport();
  await page.getByRole('button', { name: '내 기억 목록 닫기' }).click();
  await nav.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
  await expect(page.getByRole('img', { name: '선택한 기억 위치' })).toBeVisible();
  await map.click({ position: { x: 200, y: 400 }, force: true });
  await expect(page.locator('.create-sheet')).toHaveCount(0);
  await page.getByRole('button', { name: '이 위치 선택' }).click();
  await expect(page.locator('.create-sheet')).toBeVisible();
  await page.getByRole('button', { name: '기록 닫기' }).click();
  await capture(page, 'mine', info.project.name);
  await nav.getByRole('link', { name: '탐색', exact: true }).click();
  await expect(page.getByLabel('주변의 공개 기억')).toBeVisible();
  await nav.getByRole('button', { name: '지도', exact: true }).click();
  await expect(page.getByLabel('주변의 공개 기억')).toBeHidden();
});

test('최대 확대와 반복 축소·드래그 후에도 울산 라인 지도가 유지된다', async ({ page }, info) => {
  test.setTimeout(65_000);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./');
  const line = page.locator('.ulsan-line-map');
  await expect(line).toBeVisible();
  const map = page.getByLabel(mapLabel);
  const camera = () => line.evaluate(el => {
    const [x,y,w,h] = el.getAttribute('viewBox')!.split(' ').map(Number);
    const sin = Math.sin(35.5384 * Math.PI / 180);
    const worldX = (x + w / 2) / 4096 + (129.3114 + 180) / 360 * 512;
    const worldY = (y + h / 2) / 4096 + (.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * 512;
    return { longitude: worldX / 512 * 360 - 180, latitude: Math.atan(Math.sinh(Math.PI * (1 - 2 * worldY / 512))) * 180 / Math.PI, zoom: Math.log2(el.clientWidth / w) + 12 };
  });
  for (let i = 0; i < 8; i++) { await page.getByRole('button', { name: '지도 확대', exact: true }).click(); await page.waitForTimeout(400); }
  await expect.poll(async () => (await camera()).zoom).toBeCloseTo(17, 1);
  await expect(line.locator('.ulsan-urban-layers')).toHaveAttribute('data-building-level', 'footprints');
  expect((await line.locator('.ulsan-urban-buildings').getAttribute('d'))!.length).toBeGreaterThan(100);
  // DOM paths existed even when WebKit painted a blank map. Confirm that the
  // building layer changes actual pixels in a stable central viewport crop.
  const viewport = page.viewportSize()!;
  const clip = { x: Math.floor(viewport.width / 2 - 100), y: Math.floor(viewport.height / 2 - 80), width: 200, height: 160 };
  await page.mouse.move(viewport.width - 10, 85);
  const visibleBuildings = await page.screenshot({ clip, animations: 'disabled' });
  const hiddenBuildings = await page.screenshot({ clip, animations: 'disabled', style: '.ulsan-urban-buildings { visibility: hidden !important; }' });
  const stableBackground = await page.screenshot({ clip, animations: 'disabled', style: '.ulsan-urban-buildings { visibility: hidden !important; }' });
  expect(hiddenBuildings.equals(stableBackground)).toBe(true);
  expect(visibleBuildings.equals(hiddenBuildings)).toBe(false);
  await capture(page, 'max-zoom', info.project.name);
  for (let i = 0; i < 10; i++) { await page.getByRole('button', { name: '지도 축소', exact: true }).click(); await page.waitForTimeout(400); }
  const width = page.viewportSize()!.width;
  for (const target of [{x:width-30,y:390},{x:30,y:390},{x:width/2,y:630},{x:width/2,y:130}]) {
    await map.dragTo(map, { sourcePosition: { x: width/2, y: 390 }, targetPosition: target, force: true });
    await page.waitForTimeout(400);
    const center = await camera();
    expect(center.longitude).toBeGreaterThanOrEqual(129.17);
    expect(center.longitude).toBeLessThanOrEqual(129.46);
    expect(center.latitude).toBeGreaterThanOrEqual(35.44);
    expect(center.latitude).toBeLessThanOrEqual(35.66);
    await expect(line).toBeVisible();
    await expect(page.locator('.raster-map > img')).toHaveCount(0);
  }
  await capture(page, 'min-zoom', info.project.name);
  expect(errors).toEqual([]);
});

test('첨부 사진 다섯 장은 작성과 상세에서 기울어진 세로 콜라주로 모두 확인한다', async ({ page }, info) => {
  test.setTimeout(60_000);
  await login(page);
  await page.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
  await page.getByRole('button', { name: '이 위치 선택' }).click();
  const form = page.locator('.create-sheet');
  await form.locator('#memory-title').fill('다섯 장으로 남긴 가상의 산책');
  await form.locator('#memory-content').fill('사진 스크롤을 확인하는 가상 기록입니다. 실제 개인 경험이 아닙니다.');
  const { readFile } = await import('node:fs/promises');
  const buffer = await readFile('docs/design/immersive-spatial/assets/taehwagang-memory.png');
  await form.locator('input[type=file]').setInputFiles(Array.from({ length: 5 }, (_, i) => ({ name: `fiction-${i}.png`, mimeType: 'image/png', buffer })));
  const previews = form.getByRole('region', { name: '첨부 사진 미리보기' });
  await expect(previews.locator('img')).toHaveCount(5);
  await previews.scrollIntoViewIfNeeded();
  expect(await previews.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  const transforms = await previews.locator('figure').evaluateAll(els => els.map(el => getComputedStyle(el).transform));
  expect(new Set(transforms).size).toBeGreaterThan(2);
  await previews.locator('figure').last().getByRole('button').scrollIntoViewIfNeeded();
  await expect(previews.locator('figure').last().getByRole('button')).toBeInViewport();
  expect(await previews.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await capture(page, 'photo-form', info.project.name);
  await form.getByRole('button', { name: '기억 남기기', exact: true }).click();
  const detail = page.getByRole('dialog', { name: '기억 상세' });
  await expect(detail).toBeVisible();
  const photos = detail.locator('.atlas-scene-photo-stack img');
  await expect(photos).toHaveCount(5);
  await expect(page.locator('[data-sonner-toast]')).toBeHidden({ timeout: 6000 });
  await capture(page, 'photo-reading', info.project.name);
  const scroll = detail.getByLabel('기억 상세 내용', { exact: true });
  await photos.last().scrollIntoViewIfNeeded();
  await expect(photos.last()).toBeInViewport();
  expect(await scroll.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await expect(detail.getByRole('button', { name: '기억 닫기' })).toBeInViewport();
  await capture(page, 'photo-detail', info.project.name);
  await detail.getByRole('button', { name: '지도에서 보기' }).scrollIntoViewIfNeeded();
  await expect(detail.getByRole('button', { name: '지도에서 보기' })).toBeInViewport();
});
