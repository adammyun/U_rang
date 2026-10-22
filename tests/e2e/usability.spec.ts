import { mkdir } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('yeoun_2:onboarding:v1', JSON.stringify({ version: 1, completed: true })));
  await mkdir('test-results/screenshots', { recursive: true });
});

async function selectLocation(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
  await page.getByRole('button', { name: '로컬 시연 세션 시작' }).click();
  await page.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
}

test('강조된 작성 CTA로 장소를 고르는 동안 기억 조각만 숨기고 취소하면 복원한다', async ({ page }, info) => {
  await selectLocation(page);
  const cta = page.getByRole('button', { name: '기억을 남길 장소 선택하기' });
  const contrast = await cta.evaluate(el => {
    const style = getComputedStyle(el);
    const luminance = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    return (luminance(style.backgroundColor) + .05) / (luminance(style.color) + .05);
  });
  expect(contrast).toBeGreaterThan(7);
  await expect(page.locator('.atlas-stamp')).toHaveCount(0);
  const pin = page.getByRole('img', { name: '선택한 기억 위치' });
  await expect(pin).toBeVisible();
  await expect(page.locator('.ulsan-line-map')).toBeVisible();
  await expect(page.getByRole('link', { name: '© OpenStreetMap contributors' })).toBeVisible();
  await page.screenshot({ path: `test-results/screenshots/usability-select-${info.project.name}.png`, animations: 'disabled' });
  await page.getByRole('button', { name: '취소', exact: true }).click();
  await expect.poll(() => page.locator('.atlas-stamp').count()).toBeGreaterThan(0);
  await expect(pin).toBeHidden();
  await cta.click();
  await page.getByRole('button', { name: '이 위치 선택' }).click();
  await expect(page.locator('.atlas-stamp')).toHaveCount(0);
  await page.getByRole('button', { name: '기록 닫기' }).click();
  await expect.poll(() => page.locator('.atlas-stamp').count()).toBeGreaterThan(0);
  await page.screenshot({ path: `test-results/screenshots/usability-cta-${info.project.name}.png`, animations: 'disabled' });
});

test('감정 태그는 접히는 동안 애니메이션을 보이고 즉시 키보드 조작에서 제외된다', async ({ page }, info) => {
  await page.goto('./');
  const picker = page.locator('.atlas-emotion-picker');
  const toggle = picker.getByRole('button', { name: /^감정 태그/ });
  const tags = picker.locator('.atlas-emotion-tags');
  await toggle.click();
  await picker.getByRole('button', { name: '평온', exact: true }).click();
  // Observe the 260ms exit in the browser itself. Separate automation round
  // trips can outlive the animation under load even when the UI is correct.
  const fold = picker.evaluate(el => new Promise(resolve => {
    const observer = new MutationObserver(() => {
      if (el.getAttribute('data-state') !== 'closing') return;
      const group = el.querySelector('.atlas-emotion-tags')!;
      const button = group.querySelector('button')!;
      observer.disconnect();
      resolve({ state: el.getAttribute('data-state'), inert: group.hasAttribute('inert'), hidden: group.getAttribute('aria-hidden'), animation: getComputedStyle(button).animationName });
    });
    observer.observe(el, { attributes: true, attributeFilter: ['data-state'] });
  }));
  await toggle.click();
  expect(await fold).toEqual({ state: 'closing', inert: true, hidden: 'true', animation: 'atlas-tag-fold' });
  await expect(picker).toHaveAttribute('data-state', 'closed');
  await expect(tags).toBeHidden();
  await expect(page).toHaveURL(/emotion=peaceful/);
  await toggle.click();
  await toggle.click();
  await toggle.click();
  // Reopening cancels the exit cleanup rather than removing the new open row.
  await page.waitForTimeout(350);
  await expect(picker).toHaveAttribute('data-state', 'open');
  await expect(picker.getByRole('button', { name: '평온', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: `test-results/screenshots/usability-emotions-${info.project.name}.png`, animations: 'disabled' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await toggle.click();
  await expect(picker).toHaveAttribute('data-state', 'closed');
  await expect(tags).toBeHidden();
});

test('사진 용량·형식·장수 경고는 선택 버튼 곁에 표시되고 재선택 후 해제된다', async ({ page }, info) => {
  await selectLocation(page);
  await page.getByRole('button', { name: '이 위치 선택' }).click();
  const form = page.locator('.create-sheet');
  await form.locator('#memory-title').fill('그대로 남아 있어야 하는 제목');
  await form.locator('#memory-content').fill('사진 선택 실패 후에도 유지할 가상의 본문입니다.');
  const input = form.locator('input[type=file]');
  const images = form.getByRole('region', { name: '기억 사진' });
  const warning = images.getByRole('alert');
  await input.setInputFiles({ name: 'too-large.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
  await expect(warning).toHaveText('사진 한 장은 5MB 이하여야 합니다.');
  await expect(warning).toBeInViewport();
  const button = images.getByRole('button', { name: '사진 선택' });
  const buttonBox = (await button.boundingBox())!;
  const warningBox = (await warning.boundingBox())!;
  expect(warningBox.y - buttonBox.y - buttonBox.height).toBeLessThan(30);
  await expect(button).toHaveAttribute('aria-describedby', (await warning.getAttribute('id'))!);
  await expect(form.locator('#memory-title')).toHaveValue('그대로 남아 있어야 하는 제목');
  await expect(form.locator('#memory-content')).toHaveValue('사진 선택 실패 후에도 유지할 가상의 본문입니다.');
  await page.screenshot({ path: `test-results/screenshots/usability-photo-error-${info.project.name}.png`, animations: 'disabled' });
  await input.setInputFiles('tests/fixtures/memory-photo.png');
  await expect(warning).toBeHidden();
  await expect(images.locator('.memory-image-previews img')).toHaveCount(1);
  await input.setInputFiles({ name: 'unsupported.gif', mimeType: 'image/gif', buffer: Buffer.alloc(1) });
  await expect(warning).toHaveText('JPG, PNG, WEBP 이미지만 업로드할 수 있습니다.');
  await input.setInputFiles(Array.from({ length: 5 }, (_, i) => ({ name: `extra-${i}.png`, mimeType: 'image/png', buffer: Buffer.alloc(1) })));
  await expect(warning).toHaveText('사진은 한 기억에 최대 5장까지 첨부할 수 있습니다.');
  await expect(images.locator('.memory-image-previews img')).toHaveCount(1);
});

test('내 기억은 지도로 시작하고 목록·필터·상세에서 공개 지도로 돌아간다', async ({ page }, info) => {
  await selectLocation(page);
  await page.getByRole('button', { name: '이 위치 선택' }).click();
  const form = page.locator('.create-sheet');
  await form.locator('#memory-title').fill('돌아오는 길의 가상 기억');
  await form.locator('#memory-content').fill('내 기억 지도 검증용이며 실제 개인 경험이 아닙니다.');
  await form.locator('#memory-date').fill('2022-05-16');
  await form.getByRole('button', { name: '기억 남기기', exact: true }).click();
  await page.getByRole('button', { name: '기억 닫기' }).click();
  await page.getByLabel('지도 메뉴').getByRole('link', { name: '내 기억' }).click();
  const archive = page.getByLabel('내 기억 목록', { exact: true });
  await expect(archive).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('내가 남긴기억들');
  const back = page.getByRole('link', { name: '모두의 지도로 돌아가기' });
  await expect(back).toBeVisible();
  expect((await page.locator('.map-zoom').boundingBox())!.height).toBeLessThanOrEqual(90);
  const attribution = (await page.locator('.raster-attribution').boundingBox())!;
  expect(page.viewportSize()!.height - attribution.y - attribution.height).toBeLessThan(8);
  await expect(page.locator('[data-sonner-toast]')).toBeHidden({ timeout: 6000 });
  await page.screenshot({ path: `test-results/screenshots/usability-my-map-${info.project.name}.png`, animations: 'disabled' });
  await page.getByRole('button', { name: '내 기억 목록 펼치기' }).click();
  await expect(archive).toBeVisible();
  await archive.getByRole('combobox', { name: '공개 범위' }).selectOption('private');
  await archive.getByRole('combobox', { name: '기억 연도' }).selectOption('2022');
  await archive.getByLabel('감정 필터').getByRole('button', { name: '평온', exact: true }).click();
  await expect(page).toHaveURL(/visibility=private/);
  const card = archive.getByRole('button', { name: /돌아오는 길의 가상 기억/ });
  await expect(archive.locator('.memory-list')).toHaveAttribute('aria-busy', 'false');
  await expect(card).toBeVisible();
  await expect(card).toBeEnabled();
  await card.scrollIntoViewIfNeeded();
  expect(await archive.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await expect(page.getByRole('button', { name: '내 기억 목록 닫기' })).toBeInViewport();
  await page.screenshot({ path: `test-results/screenshots/usability-my-archive-${info.project.name}.png`, animations: 'disabled' });
  await card.click();
  const detail = page.getByRole('dialog', { name: '기억 상세' });
  await expect(detail.getByRole('button', { name: '수정', exact: true })).toBeVisible();
  await detail.getByRole('button', { name: '뒤로가기', exact: true }).click();
  await expect(detail).toBeHidden();
  await expect(archive).toBeVisible();
  await page.getByRole('button', { name: '내 기억 목록 닫기' }).click();
  await expect(archive).toBeHidden();
  await expect(page.getByRole('button', { name: '내 기억 목록 펼치기' })).toBeFocused();
  await back.click();
  await expect(page).not.toHaveURL(/my-map/);
  await page.getByRole('button', { name: '탐색', exact: true }).click();
  await expect(page.getByLabel('주변의 공개 기억').getByText('돌아오는 길의 가상 기억')).toHaveCount(0);
});
