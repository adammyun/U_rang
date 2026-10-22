import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const onboardingState = JSON.stringify({ version: 1, completed: true });

test.beforeEach(async ({ page }) => {
  await page.addInitScript((state) => {
    window.localStorage.setItem('yeoun_2:onboarding:v1', state);
  }, onboardingState);
});

test('메인 기억 지도를 표시하고 화면을 캡처한다', async ({ page }, testInfo) => {
  await page.goto('./');

  await expect(page).toHaveTitle('유랑 — 기억이 머무는 지도');
  await expect(page.getByRole('button', { name: '유랑 화면 새로고침' })).toBeVisible();
  await expect(page.getByLabel('울산 기억 지도. 기억 남기기 버튼으로 장소 선택을 시작하세요.')).toBeVisible();
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

test('지도 조정과 장소 기억 열람이 동작한다', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: /^지도 조정 열기/ }).click();
  await expect(
    page.getByRole('heading', { name: '지도와 기억' }),
  ).toBeVisible();

  const detailMode = page.getByRole('button', { name: /^자세히/ });
  await detailMode.click();
  await expect(detailMode).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '지도 조정 닫기' }).click();

  const marker = page.locator('.raster-memory-marker').first();
  await expect(marker).toBeVisible({ timeout: 20_000 });
  await marker.click();
  await expect(page.getByLabel('장소의 기억 미리보기')).toBeVisible();
  await page.getByRole('button', { name: '이 장소의 다른 기억 보기' }).click();
  await expect(page.getByLabel('장소의 기억 목록')).toBeVisible();
  await page.getByRole('button', { name: '장소 기억 닫기' }).click();
  await expect(page.getByLabel('장소의 기억 목록')).toBeHidden();
  await expect(page.getByLabel('장소의 기억 미리보기')).toBeVisible();
});
