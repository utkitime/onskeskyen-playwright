import { expect, test } from './fixtures.js';

function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}

test.describe('Ønskeskyen wishlist critical flows', () => {

  test('authenticated user can access wishlist area', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).toHaveURL(/onskeskyen\.dk\/overview/i);
  });

  test('user can create a new wishlist', async ({ authenticatedPage, wishlistPage }) => {
    const wishlistName = uniqueName('PW Wishlist');

    await wishlistPage.open();
    await wishlistPage.createWishlist(wishlistName);
    await expect(authenticatedPage.getByText(wishlistName, { exact: false })).toBeVisible();
  });

  test('user can add an item to a wishlist', async ({ wishlistPage }) => {
    const productLink = 'https://store.google.com/dk/product/pixel_10a?hl=da';

    await wishlistPage.open();
    await wishlistPage.addItemToWishlist(productLink);
  });
});
