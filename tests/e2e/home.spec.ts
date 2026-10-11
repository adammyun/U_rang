import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const onboardingState = JSON.stringify({ version: 1, completed: true });

test.beforeEach(async ({ page }) => {
  await page.addInitScript((state) => {
    window.localStorage.setItem('yeoun:onboarding:v1', state);
  }, onboardingState);
});

test('메인 기억 지도를 표시하고 화면을 캡처한다', async ({ page }, testInfo) => {
  await page.goto('./');

  await expect(page).toHaveTitle('여운 — 기억이 머무는 지도');
  await expect(page.getByRole('button', { name: '여운 화면 새로고침' })).toBeVisible();
  await expect(page.getByLabel('기억 지도. 지점을 클릭하거나 길게 눌러 기억을 남기세요.')).toBeVisible();
  await expect(page.getByRole('button', { name: '기억을 남길 장소 선택하기' })).toBeVisible();
  await expect(page.locator('.raster-memory-marker').first()).toBeVisible({ timeout: 20_000 });

  await page.evaluate(() => document.fonts.ready);

  const screenshotDirectory = path.join(process.cwd(), 'test-results', 'screenshots');
  await mkdir(screenshotDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(screenshotDirectory, `main-${testInfo.project.name}.png`),
    animations: 'disabled',
    fullPage: true,
  });
});
