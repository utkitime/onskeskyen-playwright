import { expect, test } from './fixtures.js';

function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}

test.describe('Ønskeskyen wishlist critical flows', () => {
  test.describe.configure({ mode: 'parallel' });

  test('authenticated user can access wishlist area', async ({ authenticatedPage, wishlistPage }) => {
    await wishlistPage.open();
    await wishlistPage.expectAuthenticatedSession();
    await expect(authenticatedPage).toHaveURL(/onskeskyen\.dk/i);
  });

  test('user can create a new wishlist', async ({ authenticatedPage, wishlistPage }) => {
    const wishlistName = uniqueName('PW Wishlist');

    await wishlistPage.open();
    await wishlistPage.expectAuthenticatedSession();
    await wishlistPage.createWishlist(wishlistName);
    await expect(authenticatedPage.getByText(wishlistName, { exact: false })).toBeVisible();
  });

  test('user can add an item to a wishlist', async ({ wishlistPage }) => {
    const wishlistName = uniqueName('PW Items');
    const productLink = 'https://store.google.com/dk/product/pixel_10a?hl=da';

    await wishlistPage.open();
    await wishlistPage.expectAuthenticatedSession();
    await wishlistPage.createWishlist(wishlistName);
    await wishlistPage.addItemToWishlist(wishlistName, productLink);
  });
});
