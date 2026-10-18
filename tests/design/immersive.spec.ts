import { test, expect } from '@playwright/test';
import { join } from 'node:path';

const screenshots = join(process.cwd(), 'docs/design/immersive-spatial/screenshots');

async function ready(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.memory-marker[data-place="taehwa"]:visible').first().waitFor();
  // Prefer the live MapLibre view; the intentional non-WebGL fallback remains testable.
  await page.waitForFunction(() => document.getElementById('mapFallback')?.hidden, null, { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(400);
}

test.describe('Apple Spatial Memory preview', () => {
  test('desktop: map, place preview, editorial detail', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await ready(page);
    await expect(page.locator('#contextPanel')).toBeHidden();
    await expect(page.locator('#editorialPanel')).toBeHidden();
    await expect(page.locator('.memory-marker[data-place="taehwa"]:visible').first()).toHaveClass(/is-hint/);
    await page.screenshot({ path: join(screenshots, 'desktop-default.png'), fullPage: true });

    await page.locator('.memory-marker[data-place="taehwa"]:visible').first().click();
    await expect(page.locator('#contextPanel')).toBeVisible();
    await expect(page.locator('.memory-marker[data-place="taehwa"]:visible').first()).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.memory-marker.is-hint:visible')).toHaveCount(0);
    await page.waitForTimeout(850);
    await page.screenshot({ path: join(screenshots, 'desktop-place.png'), fullPage: true });

    await page.getByRole('button', { name: '선택한 기억 자세히 읽기' }).click();
    await expect(page.locator('#editorialPanel')).toBeVisible();
    await expect(page.locator('#editorialPanel img')).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(screenshots, 'desktop-detail.png'), fullPage: true });
    await page.getByRole('button', { name: '지도로 돌아가기' }).click();
    await expect(page.locator('#contextPanel')).toBeVisible();
    await page.getByRole('button', { name: '이 장소의 다른 기억 보기' }).click();
    await expect(page.locator('#explorePanel')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('desktop: search results and place-specific content', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await ready(page);
    await page.locator('#placeSearch').fill('태화');
    await expect(page.locator('#searchResultLabel')).toHaveText('검색 결과 · 1곳');
    await expect(page.locator('#placeSearch')).toHaveAttribute('aria-expanded', 'true');
    await page.screenshot({ path: join(screenshots, 'desktop-search.png'), fullPage: true });

    await page.locator('#placeSearch').fill('없는 장소');
    await expect(page.locator('#searchEmpty')).toBeVisible();
    await page.locator('#placeSearch').fill('대왕암');
    await page.locator('[data-search-place="daewangam"]').click();
    await expect(page.locator('#contextTitle')).toHaveText('바다를 향해 걷던 날');
    await page.locator('#openStory').click();
    await expect(page.locator('#detailTitle')).toContainText('바다를 향해');
    await expect(page.locator('#heroNoPhoto')).toBeVisible();
  });

  test('mobile: map and scrollable bottom sheet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ready(page);
    await page.screenshot({ path: join(screenshots, 'mobile-default.png'), fullPage: true });
    await page.locator('.memory-marker[data-place="taehwa"]:visible').first().click();
    await expect(page.locator('#contextPanel')).toBeVisible();
    await expect(page.locator('.floating-nav')).toBeHidden();
    await expect(page.locator('.map-actions')).toBeHidden();
    await page.waitForTimeout(850);
    await page.screenshot({ path: join(screenshots, 'mobile-place.png'), fullPage: true });
    await page.getByRole('button', { name: '선택한 기억 자세히 읽기' }).click();
    await expect(page.locator('#editorialPanel')).toBeVisible();
    const scrollable = page.locator('.editorial-scroll');
    await scrollable.evaluate((node) => { node.scrollTop = node.scrollHeight; });
    await expect(page.locator('.story-footer')).toBeInViewport();
    await scrollable.evaluate((node) => { node.scrollTop = 0; });
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(screenshots, 'mobile-detail.png'), fullPage: true });
  });

  test('hover and narrow mobile controls remain usable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await ready(page);
    const create = page.locator('#navCreate');
    const restingColor = await create.evaluate((node) => getComputedStyle(node).backgroundColor);
    await create.hover();
    await expect.poll(() => create.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(restingColor);

    const marker = page.locator('.memory-marker[data-place="taehwa"]:visible').first();
    await marker.hover();
    await expect.poll(() => marker.locator('span').evaluate((node) => getComputedStyle(node).transform)).not.toBe('none');

    await page.setViewportSize({ width: 320, height: 700 });
    const nav = await page.locator('.floating-nav').boundingBox();
    expect(nav).not.toBeNull();
    expect(nav!.x).toBeGreaterThanOrEqual(0);
    expect(nav!.x + nav!.width).toBeLessThanOrEqual(320);
    await expect(page.locator('#placeSearch')).toBeVisible();
    await page.locator('.memory-marker[data-place="taehwa"]:visible').first().click();
    await expect(page.locator('#contextPanel')).toBeVisible();
    await expect(page.locator('#closeContext')).toBeInViewport();
  });
});
