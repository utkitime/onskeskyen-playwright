import { test } from '@playwright/test';
import { ensureAuthenticated } from './helpers/auth.js';

test('authenticate and persist storage state', async ({ page }) => {
  await ensureAuthenticated(page);
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
