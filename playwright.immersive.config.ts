import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/design',
  outputDir: 'test-results/immersive',
  reporter: 'list',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4330/',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm preview:immersive',
    url: 'http://127.0.0.1:4330/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
