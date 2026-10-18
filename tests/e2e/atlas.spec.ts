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
