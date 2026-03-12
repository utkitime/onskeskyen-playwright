import type { Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { requiredEnv } from './env.js';

export async function ensureAuthenticated(page: Page) {
  await page.goto('/da/', { waitUntil: 'domcontentloaded' });

  const onLoginUrl = /\/login/i.test(page.url());
  const hasLoginButton = await page
    .getByRole('button', { name: /^Log ind$/i })
    .first()
    .isVisible()
    .catch(() => false);

  if (!onLoginUrl && !hasLoginButton) {
    return;
  }

  const loginPage = new LoginPage(page);
  await loginPage.login(requiredEnv('ONSKESKYEN_EMAIL'), requiredEnv('ONSKESKYEN_PASSWORD'));
  await loginPage.expectLoggedIn();
}
