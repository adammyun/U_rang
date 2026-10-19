import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('yeoun_2:onboarding:v1', JSON.stringify({ version: 1, completed: true })));
});

async function loginAndOpenForm(page: import('@playwright/test').Page) {
  await page.goto('./');
  await page.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
  await page.getByRole('button', { name: '로컬 시연 세션 시작' }).click();
  await page.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
  await page.getByRole('button', { name: '이 위치 선택' }).click();
  return page.locator('.create-sheet');
}

test('사진 5장과 긴 기억을 읽고 키보드로 지도로 복귀한다', async ({ page }, info) => {
  test.setTimeout(75_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const form = await loginAndOpenForm(page);
  await form.locator('#memory-title').fill('태화강에 두고 온 다섯 장의 순간');
  await form.locator('#memory-content').fill('해가 지는 강변을 따라 걷다가 잠깐 멈췄다. 바람이 버드나무 잎을 스치고, 강물 위로 느린 빛이 흘렀다.\n\n' + ('눈앞의 풍경을 오래 기억하고 싶어서 한 장씩 사진을 남겼다. 과제 검증용으로 작성한 가상의 기록이다.\n\n').repeat(60));
  const buffer = await readFile(path.join(process.cwd(), 'docs/design/immersive-spatial/assets/taehwagang-memory.png'));
  await form.locator('input[type=file]').setInputFiles(Array.from({ length: 5 }, (_, i) => ({ name: `fictional-test-${i}.png`, mimeType: 'image/png', buffer })));
  await expect(form.locator('.memory-image-previews img')).toHaveCount(5);
  await form.locator('label[for="visibility-public"]').click();
  await form.getByRole('button', { name: '기억 남기기' }).click();
  const detail = page.getByRole('dialog', { name: '기억 상세' });
  await expect(detail).toBeVisible();
  await expect(detail.locator('.spatial-detail-gallery img')).toHaveCount(4);
  await expect(detail.locator('.spatial-detail-hero img')).toBeVisible();
  await expect(page.locator('[data-sonner-toast]')).toBeHidden({ timeout: 6000 });
  const screenshotDirectory = path.join(process.cwd(), 'test-results/screenshots');
  await mkdir(screenshotDirectory, { recursive: true });
  await page.screenshot({ path: path.join(screenshotDirectory, `atlas-photo-detail-${info.project.name}.png`), animations: 'disabled' });
  const scroll = detail.getByLabel('기억 상세 내용', { exact: true });
  expect(await scroll.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  await detail.getByRole('button', { name: '지도에서 보기' }).scrollIntoViewIfNeeded();
  await expect(detail.getByRole('button', { name: '지도에서 보기' })).toBeInViewport();
  await expect(detail.getByRole('button', { name: '기억 닫기' })).toBeInViewport();
  await detail.getByRole('button', { name: '기억 닫기' }).focus();
  await page.keyboard.press('Tab');
  expect(await detail.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(detail).toBeHidden();
  await expect(page.getByLabel('지도 메뉴')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('비공개 글 기록은 공개 스탬프에 나타나지 않고 내 기억에서만 보인다', async ({ page }, info) => {
  const form = await loginAndOpenForm(page);
  const title = `나만의 가상 비공개 기록 ${info.project.name}`;
  await form.locator('#memory-title').fill(title);
  await form.locator('#memory-content').fill('공개 지도와 공개 탐색 목록에 보이면 안 되는 테스트 기록입니다.');
  await form.locator('label[for="visibility-private"]').click();
  await form.getByRole('button', { name: '기억 남기기' }).click();
  await expect(page.getByRole('dialog', { name: '기억 상세' })).toBeVisible();
  await page.getByRole('button', { name: '기억 닫기' }).click();
  await expect(page.getByRole('button', { name: title, exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '탐색', exact: true }).click();
  await expect(page.getByLabel('주변의 공개 기억').getByText(title)).toHaveCount(0);
  await page.getByRole('button', { name: '탐색 닫기' }).click();
  await page.getByLabel('지도 메뉴').getByRole('link', { name: '내 기억' }).click();
  if (info.project.name.startsWith('mobile')) await page.getByRole('button', { name: '내 기억 목록 펼치기' }).click();
  await expect(page.getByLabel('내 기억 목록').getByText(title)).toBeVisible();
});

test('현재 위치와 움직임 줄이기 및 같은 장소의 다음 기억이 동작한다', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ longitude: 129.2903, latitude: 35.5502 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.getByRole('button', { name: '현재 위치로 이동' }).click();
  await expect(page.getByLabel('현재 위치', { exact: true })).toBeVisible();
  await expect(page.locator('.atlas-pointer-ring')).toBeHidden();
  await page.getByRole('button', { name: /태화강 국가정원.*기억/ }).click();
  await page.getByRole('button', { name: '선택한 기억 자세히 읽기' }).click();
  const detail = page.getByRole('dialog', { name: '기억 상세' });
  await expect(detail).toBeVisible();
  const firstTitle = await detail.getByRole('heading', { level: 2 }).innerText();
  await expect(detail.getByRole('button', { name: '이 장소의 다음 기억' })).toBeEnabled();
  await detail.getByRole('button', { name: '이 장소의 다음 기억' }).click();
  await expect(detail.getByRole('heading', { level: 2 })).not.toHaveText(firstTitle);
  expect(await detail.locator('.spatial-detail-content').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await page.keyboard.press('Escape');
  await expect(detail).toBeHidden();
});

test('첫 사용자 안내 열 단계가 새 배치에서 화면 안에 표시된다', async ({ page }) => {
  await page.goto('./?tutorial=1');
  const panel = page.locator('.tour-panel');
  await expect(panel).toBeVisible();
  for (let index = 1; index <= 10; index++) {
    await expect(panel.locator('.tour-progress')).toHaveText(`${index} / 10`);
    const bounds = await panel.boundingBox();
    const viewport = page.viewportSize();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport!.width + 1);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport!.height + 1);
    await panel.locator('.tour-next').click();
  }
  await expect(panel).toBeHidden();
  await expect(page.getByLabel('지도 메뉴')).toBeVisible();
});

test('키보드 건너뛰기가 hash 경로를 깨뜨리지 않고 실제 목록을 연다', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: '공개 기억 목록으로 건너뛰기' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('주변의 공개 기억')).toBeVisible();
  await expect(page.getByLabel('주변의 공개 기억')).toBeFocused();
  await expect(page).not.toHaveURL(/#public-memory-list/);
  await page.getByRole('button', { name: '탐색 닫기' }).click();
  await expect(page.getByLabel('지도 메뉴')).toBeVisible();
});

test('울산 라인 지도와 상세 지도는 같은 기억 앵커를 사용한다', async ({ page }, info) => {
  await page.goto('./');
  await expect(page.getByRole('img', { name: '울산 주요 도로와 하천의 라인 지도' })).toBeVisible();
  await expect(page).toHaveTitle('유랑 — 기억이 머무는 지도');
  await expect(page.locator('.spatial-intro h1')).toHaveText('기억은이곳에');
  await expect(page.locator('.eyebrow,.spatial-eyebrow')).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('400 20px "Yurang Sans"', '유랑'))).toBe(true);
  const marker = page.locator('.atlas-stamp').first();
  const position = await marker.boundingBox();
  const label = await marker.getAttribute('aria-label');
  await page.getByRole('button', { name: /^지도 조정 열기/ }).click();
  const sheet = page.getByRole('dialog');
  await expect(sheet.getByRole('navigation', { name: '기억 보기 전환' })).toBeVisible();
  await expect(sheet.getByRole('link', { name: '모두의 기억 보기' })).toHaveAttribute('aria-current', 'page');
  await page.screenshot({ path: `test-results/screenshots/yurang-adjust-${info.project.name}.png`, animations: 'disabled' });
  await sheet.getByRole('button', { name: '의미 있는 순간', exact: true }).scrollIntoViewIfNeeded();
  await expect(sheet.getByRole('button', { name: '의미 있는 순간', exact: true })).toBeInViewport();
  await sheet.getByRole('button', { name: '의미 있는 순간', exact: true }).click();
  await expect(sheet.getByRole('button', { name: '의미 있는 순간', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await sheet.getByRole('button', { name: '초기화' }).click();
  await sheet.getByRole('button', { name: /^상세/ }).click();
  await sheet.getByRole('button', { name: '지도 조정 닫기' }).click();
  await expect(page.locator('.ulsan-line-map')).toBeHidden();
  await expect(page.locator('.raster-map.detail-mode > img').first()).toBeVisible();
  const same = page.getByRole('button', { name: label!, exact: true });
  const next = await same.boundingBox();
  expect(Math.abs(position!.x - next!.x)).toBeLessThan(1);
  expect(Math.abs(position!.y - next!.y)).toBeLessThan(1);
  await page.getByRole('button', { name: /^지도 조정 열기/ }).click();
  await page.getByRole('button', { name: /^간결/ }).click();
  await page.getByRole('button', { name: '지도 조정 닫기' }).click();
  await expect(page.locator('.ulsan-line-map')).toBeVisible();
  await expect(page.locator('.raster-map > img')).toHaveCount(0);
  await page.screenshot({ path: `test-results/screenshots/yurang-main-${info.project.name}.png`, animations: 'disabled' });
});

test('조정의 기억 전환은 로그인 경계와 공개 필터를 유지한다', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /^지도 조정 열기/ }).click();
  await page.getByRole('link', { name: '내 기억만 보기' }).click();
  await expect(page.getByRole('button', { name: '로컬 시연 세션 시작' })).toBeVisible();
  await page.getByRole('button', { name: '로컬 시연 세션 시작' }).click();
  await expect(page).toHaveURL(/#\/my-map/);
  await expect(page.getByLabel('내 기억 목록', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^지도 조정 열기/ }).click();
  await expect(page.getByRole('link', { name: '내 기억만 보기' })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: '평온', exact: true }).click();
  await expect(page.getByRole('link', { name: '모두의 기억 보기' })).toHaveAttribute('href', /emotion=peaceful/);
  await page.getByRole('link', { name: '모두의 기억 보기' }).click();
  await expect(page.getByLabel('감정으로 기억 탐색').getByRole('button', { name: '평온' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.ulsan-line-map')).toBeVisible();
  await expect(page.getByLabel('지도 메뉴')).toBeVisible();
});

test('라인 데이터 실패와 울산 밖 현재 위치에서는 raster 호환 지도를 유지한다', async ({ page, context }) => {
  await page.route('**/maps/ulsan-lines.geojson*', (route) => route.fulfill({ status: 404, body: '' }));
  await page.goto('./');
  await expect(page.locator('.raster-map > img').first()).toBeVisible();
  await expect(page.locator('.ulsan-line-map')).toHaveCount(0);
  await page.unroute('**/maps/ulsan-lines.geojson*');
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ longitude: 129.0, latitude: 35.7 });
  await page.reload();
  await expect(page.locator('.ulsan-line-map')).toBeVisible();
  await page.getByRole('button', { name: '현재 위치로 이동' }).click();
  await expect(page.getByLabel('현재 위치', { exact: true })).toBeVisible();
  await expect(page.locator('.ulsan-line-map')).toBeHidden();
  await expect(page.locator('.raster-map > img').first()).toBeVisible();
});

test('높이가 낮은 화면에서도 조정의 마지막 선택과 적용 버튼이 겹치지 않는다', async ({ page }, info) => {
  await page.setViewportSize(info.project.name.startsWith('mobile') ? { width: 390, height: 667 } : { width: 1280, height: 720 });
  await page.goto('./');
  await page.getByRole('button', { name: /^지도 조정 열기/ }).click();
  const sheet = page.getByRole('dialog');
  const last = sheet.getByRole('button', { name: '의미 있는 순간', exact: true });
  await last.scrollIntoViewIfNeeded();
  await last.click();
  await expect(last).toHaveAttribute('aria-pressed', 'true');
  const lastBounds = await last.boundingBox();
  const apply = sheet.getByRole('button', { name: '지도에 적용' });
  const applyBounds = await apply.boundingBox();
  expect(lastBounds!.y + lastBounds!.height).toBeLessThanOrEqual(applyBounds!.y);
  await expect(apply).toBeInViewport();
  await expect(sheet.getByRole('button', { name: '지도 조정 닫기' })).toBeInViewport();
  await page.screenshot({ path: `test-results/screenshots/yurang-short-adjust-${info.project.name}.png`, animations: 'disabled' });
  await apply.click();
  await expect(sheet).toBeHidden();
});

function luminance(css: string) {
  const channels = css.match(/[\d.]+/g)!.slice(0,3).map(Number).map((v) => v / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}

test('지도 컨트롤 아이콘이 중앙 정렬되고 조정·작성·로그인이 어두운 테마를 공유한다', async ({ page }, info) => {
  await page.goto('./');
  const controls = page.locator('.map-zoom button');
  for (const button of await controls.all()) {
    const b = await button.boundingBox(); const icon = await button.locator('svg').boundingBox();
    expect(b!.width).toBe(44); expect(b!.height).toBe(44);
    expect(Math.abs((b!.x + b!.width / 2) - (icon!.x + icon!.width / 2))).toBeLessThan(1);
    expect(Math.abs((b!.y + b!.height / 2) - (icon!.y + icon!.height / 2))).toBeLessThan(1);
  }
  await page.getByRole('button', { name: /^지도 조정 열기/ }).click();
  const sheet = page.getByRole('dialog');
  const colors = await sheet.evaluate(el => ({ bg: getComputedStyle(el).backgroundColor, fg: getComputedStyle(el).color }));
  expect(luminance(colors.bg)).toBeLessThan(.2);
  expect((luminance(colors.fg) + .05) / (luminance(colors.bg) + .05)).toBeGreaterThan(4.5);
  await sheet.getByRole('button', { name: '지도 조정 닫기' }).click();
  await page.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
  expect(luminance(await page.locator('.auth-card').evaluate(el => getComputedStyle(el).backgroundColor))).toBeLessThan(.2);
  await page.getByRole('button', { name: '로컬 시연 세션 시작' }).click();
  await page.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
  await page.getByRole('button', { name: '이 위치 선택' }).click();
  const form = page.locator('.create-sheet');
  expect(luminance(await form.evaluate(el => getComputedStyle(el).backgroundColor))).toBeLessThan(.2);
  expect(luminance(await form.locator('textarea').evaluate(el => getComputedStyle(el).backgroundColor))).toBeLessThan(.2);
  await page.screenshot({path:`test-results/screenshots/graphite-form-${info.project.name}.png`,animations:'disabled'});
});

test('긴 감정 이름은 한 줄로 읽히며 상세와 제목은 고딕으로 표시된다', async ({ page }, info) => {
  await page.goto('./');
  await page.getByRole('button', {name:'골목의 작은 불빛',exact:true}).click();
  await page.getByRole('button', {name:'선택한 기억 자세히 읽기'}).click();
  const detail = page.getByRole('dialog',{name:'기억 상세'});
  const emotion = detail.locator('.atlas-no-photo strong');
  await expect(emotion).toHaveText('의미 있는 순간');
  const metrics = await emotion.evaluate(el=>({height:el.getBoundingClientRect().height,line:parseFloat(getComputedStyle(el).lineHeight),width:el.clientWidth,scroll:el.scrollWidth}));
  expect(metrics.height).toBeLessThanOrEqual(metrics.line + 1);
  expect(metrics.scroll).toBeLessThanOrEqual(metrics.width + 1);
  expect(await detail.getByRole('heading').evaluate(el=>getComputedStyle(el).fontFamily)).toContain('Yurang Sans');
  await page.screenshot({path:`test-results/screenshots/graphite-meaningful-${info.project.name}.png`,animations:'disabled'});
});

test('울산 5개 구군 경계와 확대 시 동·도로명을 표시한다', async ({ page }, info) => {
  await page.goto('./');
  const map = page.locator('.ulsan-line-map');
  await expect(map.locator('[data-district]')).toHaveCount(5);
  expect((await map.locator('.ulsan-line-boundary').getAttribute('d'))!.length).toBeGreaterThan(100);
  expect(await map.locator('.ulsan-label-district').count()).toBeGreaterThan(0);
  await page.getByRole('combobox',{name:'장소 이름'}).fill('성남동');
  await page.getByRole('option',{name:/성남동 문화의거리/}).click();
  await expect(page.getByText('이곳에 기억 남기기')).toBeVisible();
  await expect.poll(()=>map.locator('.ulsan-label-neighborhood,.ulsan-label-road').count()).toBeGreaterThan(0);
  await page.screenshot({path:`test-results/screenshots/graphite-neighborhood-${info.project.name}.png`,animations:'disabled'});
});
