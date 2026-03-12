import { expect, test } from './fixtures.js';

test.describe('Visual regression', () => {
  test.skip(!process.env.RUN_VISUAL, 'Set RUN_VISUAL=1 to run screenshot assertions.');

  test('create wishlist card matches baseline', async ({ wishlistPage, authenticatedPage }) => {
    await wishlistPage.open();
    const createWishlistCard = authenticatedPage
      .locator('div')
      .filter({ hasText: /^Create wishlist$/ })
      .first();

    await expect(createWishlistCard).toBeVisible();
    await expect(createWishlistCard).toHaveScreenshot('create-wishlist-card.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.02,
    });
  });
});
