import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 180_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'https://onskeskyen.dk',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on',
    headless: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});