import type { Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { requiredEnv } from './env.js';

async function anyVisibleLoginButton(page: Page): Promise<boolean> {
  const locator = page.getByRole('button', { name: /log ind/i });
  const count = await locator.count().catch(() => 0);

  for (let index = 0; index < count; index += 1) {
    if (await locator.nth(index).isVisible().catch(() => false)) {
      return true;
    }
  }

  return false;
}

export async function ensureAuthenticated(page: Page) {
  const loginPage = new LoginPage(page);
  const email = requiredEnv('ONSKESKYEN_EMAIL');
  const password = requiredEnv('ONSKESKYEN_PASSWORD');

  await loginPage.login(email, password);

  const hasHeaderLoginButton = await anyVisibleLoginButton(page);
  if (!hasHeaderLoginButton && !/\/login/i.test(page.url())) {
    return;
  }

  throw new Error('Authentication failed: "Log ind" button is still visible after login.');
}
