import { focusTaehwagang } from './helpers/place';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const onboardingState = JSON.stringify({ version: 1, completed: true });

test.beforeEach(async ({ page }) => {
  await page.addInitScript((state) => {
    window.localStorage.setItem('yeoun_2:onboarding:v1', state);
  }, onboardingState);
});

async function capture(page: import('@playwright/test').Page, name: string, project: string) {
  const directory = path.join(process.cwd(), 'test-results', 'screenshots');
  await mkdir(directory, { recursive: true });
  await page.screenshot({ path: path.join(directory, `${name}-${project}.png`), animations: 'disabled' });
}

test('실제 공개 기억을 미리보고 검색·상세·탐색으로 이동한다', async ({ page }, testInfo) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.goto('./');
  const map = page.getByLabel('울산 기억 지도. 기억 남기기 버튼으로 장소 선택을 시작하세요.');
  await expect(map).toBeVisible();
  await expect(page.locator('.raster-memory-marker').first()).toBeVisible();
  const lineMap = page.locator('.ulsan-line-map');
  await expect(lineMap).toBeVisible();
  const viewWidth = async () => Number((await lineMap.getAttribute('viewBox'))!.split(' ')[2]);
  const initialWidth = await viewWidth();
  await page.getByRole('button', { name: '지도 확대' }).click();
  await expect.poll(async () => initialWidth / await viewWidth()).toBeCloseTo(2, 2);
  await page.getByRole('button', { name: '지도 축소' }).click();
  await expect.poll(async () => initialWidth / await viewWidth()).toBeCloseTo(1, 2);
  await map.dragTo(map, { sourcePosition: { x: 250, y: 400 }, targetPosition: { x: 280, y: 420 }, force: true });
  await page.waitForTimeout(4000);

  // Marker order changes with viewport grouping. A cross-place cluster opens
  // a closer map, while this known 100m place group opens the reading preview.
  await focusTaehwagang(page);
  await page.getByRole('button', { name: /태화강 국가정원.*기억/ }).click();
  await expect(page.getByLabel('장소의 기억 미리보기')).toBeVisible();
  await capture(page, 'live-preview', testInfo.project.name);
  await page.getByRole('button', { name: '선택한 기억 자세히 읽기' }).click();
  const detail = page.getByRole('dialog', { name: '기억 상세' });
  await expect(detail).toBeVisible();
  await expect(detail.locator('.spatial-detail-body')).not.toBeEmpty();
  await capture(page, 'live-detail', testInfo.project.name);
  await detail.getByRole('button', { name: '다른 기억 읽기' }).click();
  await expect(page.getByLabel('장소의 기억 목록')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('장소의 기억 미리보기')).toBeHidden();

  await page.getByRole('combobox', { name: '장소 이름' }).fill('태화강');
  await expect(page.getByRole('region', { name: '장소 검색 결과' })).toBeVisible();
  await page.getByRole('option', { name: /태화강 국가정원/ }).first().click();
  await expect(page.getByText('이곳에 기억 남기기')).toBeVisible();
  await page.getByRole('button', { name: '탐색', exact: true }).click();
  await expect(page.getByLabel('주변의 공개 기억')).toBeVisible();
  await capture(page, 'live-explore', testInfo.project.name);
  await page.getByRole('button', { name: '탐색 닫기' }).click();
  await expect(page.getByLabel('주변의 공개 기억')).toBeHidden();
  expect(browserErrors).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test('격리된 브라우저에서 사진 첨부·공개 기록 작성·수정·삭제가 동작한다', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('./');
  await page.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
  await expect(page.getByRole('heading', { name: '이 브라우저에 기억을 이어서 기록하세요' })).toBeVisible();
  await page.getByRole('button', { name: '로컬 시연 세션 시작' }).click();
  await page.getByRole('button', { name: '기억을 남길 장소 선택하기' }).click();
  await expect(page.getByRole('region', { name: '기억을 남길 장소 선택' })).toBeVisible();
  await page.getByRole('button', { name: '이 위치 선택' }).click();
  const form = page.locator('.create-sheet');
  await expect(form).toBeVisible();
  const title = `시연 테스트 ${testInfo.project.name}`;
  await form.locator('#memory-location-name').fill('울산 시연 장소');
  await form.locator('#memory-title').fill(title);
  await form.locator('#memory-content').fill('격리된 브라우저에서 작성한 가상의 시연 기록입니다.');
  await form.locator('input[type=date]').fill('2026-10-01');
  await form.locator('input[type=file]').setInputFiles(path.join(process.cwd(), 'tests/fixtures/memory-photo.png'));
  await expect(form.locator('.memory-image-previews img')).toBeVisible();
  await form.locator('label[for="visibility-public"]').click();
  await form.getByRole('button', { name: '기억 남기기' }).click();
  await expect(page.getByRole('dialog', { name: '기억 상세' })).toBeVisible();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await expect(page.locator('.spatial-detail-hero img')).toBeVisible();
  await page.getByRole('button', { name: '기억 닫기' }).click();
  await expect(page.getByLabel('지도 메뉴').getByRole('button', { name: '내 기억' })).toBeVisible();
  await page.getByLabel('지도 메뉴').getByRole('button', { name: '내 기억' }).click();
  await expect(page.getByRole('dialog', { name: '마이페이지' }).getByText(title)).toBeVisible();
  await page.getByRole('dialog', { name: '마이페이지' }).getByText(title).click();
  await page.getByRole('button', { name: '수정' }).click();
  const editForm = page.locator('.create-sheet');
  const editedTitle = `${title} 수정`;
  await editForm.locator('#memory-title').fill(editedTitle);
  await editForm.getByRole('button', { name: '변경 내용 저장하기' }).click();
  await expect(page.getByLabel('기억 상세 내용').getByRole('heading', { name: editedTitle })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: '삭제', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '마이페이지' }).getByText(editedTitle)).toBeHidden();
  await capture(page, 'live-my-map', testInfo.project.name);
});
