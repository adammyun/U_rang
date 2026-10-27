import { focusSeongnam } from './helpers/place';
import { mkdir, readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('yeoun_2:onboarding:v1', JSON.stringify({ version: 1, completed: true })));
  await mkdir('test-results/screenshots', { recursive: true });
});

async function chooseLocation(page: Page) {
  await page.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
  await page.getByRole('button', { name: '게스트로 시작' }).click();
  await page.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
}

test('지도 선은 확대해도 화면 두께를 유지하고 작성 핀은 아래를 향한다', async ({ page }, info) => {
  await page.goto('./');
  await page.locator('.ulsan-urban-layers').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await focusSeongnam(page);
  const map = page.locator('.ulsan-line-map');
  const road = map.locator('.ulsan-line-roads');
  const strokePixels = () => road.evaluate(el => parseFloat(getComputedStyle(el).strokeWidth) * (el as SVGGraphicsElement).getScreenCTM()!.a);
  await expect(road).toHaveCSS('vector-effect', 'none');
  expect(await strokePixels()).toBeCloseTo(1.35, 2);
  expect(await map.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(96, 118, 120)');
  await page.screenshot({ path: `test-results/screenshots/compat-map-${info.project.name}.png`, animations: 'disabled' });
  const marker = page.getByRole('button', { name: '골목의 작은 불빛', exact: true });
  const anchor = await marker.boundingBox();
  const geometry = await road.getAttribute('d');
  for (const [label, background] of [['다크', 'rgb(27, 35, 38)'], ['자세히', null], ['기본', 'rgb(96, 118, 120)']] as const) {
    await page.getByRole('button', { name: /^지도 조정 열기/ }).click();
    const option = page.getByRole('dialog').getByRole('button', { name: new RegExp(`^${label}`) });
    await option.click();
    await expect(option).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: '지도 조정 닫기' }).click();
    if (background) {
      await expect(map).toBeVisible();
      await expect(map).toHaveCSS('background-color', background);
      await expect(road).toHaveAttribute('d', geometry!);
      expect(await strokePixels()).toBeCloseTo(1.35, 2);
    } else {
      await expect(map).toBeHidden();
      await expect(page.locator('.raster-map.detail-mode > img').first()).toBeVisible();
    }
    const position = (await marker.boundingBox())!;
    expect(Math.abs(position.x - anchor!.x)).toBeLessThan(1);
    expect(Math.abs(position.y - anchor!.y)).toBeLessThan(1);
    await page.screenshot({ path: `test-results/screenshots/compat-mode-${label}-${info.project.name}.png`, animations: 'disabled' });
  }
  const previous = await map.getAttribute('viewBox');
  await page.getByRole('button', { name: '지도 확대', exact: true }).click();
  await expect.poll(() => map.getAttribute('viewBox')).not.toBe(previous);
  await expect.poll(strokePixels).toBeCloseTo(1.35, 2);
  const boundary = map.locator('.ulsan-line-boundary');
  expect(await boundary.evaluate(el => parseFloat(getComputedStyle(el).strokeWidth) * (el as SVGGraphicsElement).getScreenCTM()!.a)).toBeCloseTo(1.15, 2);
  await chooseLocation(page);
  const pin = page.getByRole('img', { name: '선택한 기억 위치', exact: true });
  await expect(pin.locator('svg')).toBeVisible();
  expect(await pin.evaluate(el => { const m = new DOMMatrix(getComputedStyle(el).transform); return [m.a, m.b, m.c, m.d]; })).toEqual([1, 0, 0, 1]);
  await expect.poll(() => pin.evaluate(el => { const r = el.getBoundingClientRect(); return Math.abs(r.bottom - parseFloat((el as HTMLElement).style.top)); })).toBeLessThan(1);
  await page.screenshot({ path: `test-results/screenshots/compat-pin-${info.project.name}.png`, animations: 'disabled' });
  await expect(page.getByRole('button', { name: '이 위치 선택' })).toBeEnabled();
});

test('날짜·한글 감정·사진·공개 설정이 정렬되고 선택한 값으로 저장된다', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await chooseLocation(page);
  await page.getByRole('button', { name: '이 위치 선택' }).click();
  const form = page.locator('.create-sheet');
  await form.locator('#memory-title').fill('울산에서 확인하는 가상의 하루');
  await form.locator('#memory-content').fill('브라우저 호환성 검증을 위해 작성한 가상의 기억입니다.');
  const date = form.locator('#memory-date');
  const emotion = form.getByRole('combobox', { name: '그날의 감정' });
  await expect(emotion).toHaveText(/평온/);
  await date.fill('2024-04-18');
  await date.scrollIntoViewIfNeeded();
  const dateBox = (await date.boundingBox())!;
  const emotionBox = (await emotion.boundingBox())!;
  expect(dateBox.height).toBeCloseTo(emotionBox.height, 0);
  if (info.project.name.startsWith('desktop')) expect(Math.abs(dateBox.y - emotionBox.y)).toBeLessThan(1);
  else expect(emotionBox.y).toBeGreaterThan(dateBox.y + dateBox.height);
  await emotion.click();
  await page.getByRole('option', { name: '사랑', exact: true }).click();
  await expect(emotion).toHaveText(/사랑/);
  await page.screenshot({ path: `test-results/screenshots/compat-fields-${info.project.name}.png`, animations: 'disabled' });
  const buffer = await readFile('docs/design/immersive-spatial/assets/taehwagang-memory.png');
  await form.locator('input[type=file]').setInputFiles({ name: 'fictional-compat.png', mimeType: 'image/png', buffer });
  await expect(form.locator('.memory-image-previews img')).toHaveCount(1);
  const anonymous = form.getByRole('switch', { name: '공개할 때 익명으로 표시' });
  await expect(anonymous).toBeDisabled();
  await form.locator('label[for="visibility-public"]').click();
  await expect(anonymous).toBeEnabled();
  await anonymous.uncheck();
  await form.getByRole('switch', { name: '대략적인 위치로 표시' }).check();
  const privacy = form.locator('.privacy-settings');
  await privacy.scrollIntoViewIfNeeded();
  for (const label of await privacy.locator(':scope > label').all()) {
    const text = (await label.locator(':scope > span:not([data-slot])').boundingBox())!;
    const control = (await label.getByRole('switch').boundingBox())!;
    expect(control.x).toBeGreaterThanOrEqual(text.x + text.width);
    expect(control.width).toBeGreaterThanOrEqual(44);
  }
  expect(await form.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({ path: `test-results/screenshots/compat-privacy-${info.project.name}.png`, animations: 'disabled' });
  await form.getByRole('button', { name: '기억 남기기', exact: true }).click();
  const detail = page.getByRole('dialog', { name: '기억 상세' });
  await expect(detail.getByRole('heading', { level: 2 })).toHaveText('울산에서 확인하는 가상의 하루');
  await expect(detail.locator('.spatial-detail-hero img')).toBeVisible();
  await expect(detail.locator('.spatial-emotion')).toHaveText('사랑');
  await detail.getByRole('button', { name: '기억 닫기' }).click();
  await page.getByLabel('지도 메뉴').getByRole('button', { name: '내 기억' }).click();
  await page.locator('.personal-map-mode summary').click();
  const myModes = page.locator('.personal-map-mode');
  for (const label of ['다크', '자세히', '기본']) {
    const option = myModes.getByRole('button', { name: new RegExp(`^${label}`) });
    await option.click();
    await expect(option).toHaveAttribute('aria-pressed', 'true');
  }
  expect(errors).toEqual([]);
});
