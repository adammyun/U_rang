import { defineConfig } from '@playwright/test';

const host = '127.0.0.1';
const port = 4173;
const baseURL = `http://${host}:${port}/yeoun_2/`;

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'desktop-webkit',
      testMatch: ['**/browser-compat.spec.ts', '**/usability.spec.ts', '**/navigation-map-photos.spec.ts', '**/place-notes.spec.ts', '**/demo-release.spec.ts', '**/personal-space.spec.ts', '**/comments.spec.ts', '**/density-emotions.spec.ts', '**/panorama-ux.spec.ts'],
      use: { browserName: 'webkit', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-webkit',
      testMatch: ['**/browser-compat.spec.ts', '**/usability.spec.ts', '**/navigation-map-photos.spec.ts', '**/place-notes.spec.ts', '**/demo-release.spec.ts', '**/personal-space.spec.ts', '**/comments.spec.ts', '**/density-emotions.spec.ts', '**/panorama-ux.spec.ts'],
      use: { browserName: 'webkit', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
    },
  ],
  webServer: {
    command:
      'pnpm build:pages && pnpm exec vite preview --config vite.pages.config.ts --host 127.0.0.1 --port 4173',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
