import { expect, test } from './fixtures.js';
import type { Locator, Page } from '@playwright/test';

async function firstVisible(candidates: Locator[], errorMessage: string): Promise<Locator> {
  for (const candidate of candidates) {
    const visible = await candidate
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    if (visible) {
      return candidate.first();
    }
  }
  throw new Error(errorMessage);
}

async function findCreateWishlistTarget(page: Page): Promise<Locator> {
  return firstVisible(
    [
      page.locator('div').filter({ hasText: /^Create wishlist$/ }).nth(2),
      page.locator('div').filter({ hasText: /^Create wishlist$/ }).first(),
      page.getByRole('button', { name: /create wishlist|new wishlist|opret ønskeliste|ny ønskeliste/i }),
      page.getByRole('link', { name: /create wishlist|new wishlist|opret ønskeliste|ny ønskeliste/i }),
      page.getByTestId('createWishlistSubmitButton'),
    ],
    'Could not find a stable "create wishlist" visual target on the page.'
  );
}

test.describe('Visual regression', () => {
  test.skip(!process.env.RUN_VISUAL, 'Set RUN_VISUAL=1 to run screenshot assertions.');

  test('create wishlist card matches baseline', async ({ wishlistPage, authenticatedPage }) => {
    await wishlistPage.open();
    const createWishlistCard = await findCreateWishlistTarget(authenticatedPage);

    await expect(createWishlistCard).toBeVisible();
    await expect(createWishlistCard).toHaveScreenshot('create-wishlist-card.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.02,
    });
  });
});
