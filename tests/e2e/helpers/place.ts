import { expect, type Page } from '@playwright/test';

/** Select a real search result so tests do not depend on overview cluster density. */
export async function focusTaehwagang(page: Page) {
  await page.getByRole('combobox', { name: '장소 이름' }).fill('태화강');
  await page.getByRole('option', { name: /^태화강 국가정원 / }).click();
  await expect(page.getByRole('button', { name: '태화강 국가정원 산책로의 기억 5개', exact: true })).toBeVisible();
}

export async function focusSeongnam(page: Page) {
  await page.getByRole('combobox', { name: '장소 이름' }).fill('성남동');
  await page.getByRole('option', { name: /성남동 문화의거리/ }).click();
  await expect(page.getByRole('button', { name: '골목의 작은 불빛', exact: true })).toBeVisible();
  await expect.poll(() => page.locator('.ulsan-line-map').evaluate(el => {
    const width = Number(el.getAttribute('viewBox')!.split(' ')[2]);
    return Math.log2(el.clientWidth / width) + 12;
  })).toBeCloseTo(14.2, 3);
}
