import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
import { WishlistPage } from '../pages/WishlistPage.js';
import { ensureAuthenticated } from './helpers/auth.js';

type Fixtures = {
  authenticatedPage: Page;
  wishlistPage: WishlistPage;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use) => {
    await ensureAuthenticated(page);
    await use(page);
  },

  wishlistPage: async ({ authenticatedPage }, use) => {
    await use(new WishlistPage(authenticatedPage));
  },
});

export { expect } from '@playwright/test';
