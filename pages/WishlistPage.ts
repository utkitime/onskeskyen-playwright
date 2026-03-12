import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

export class WishlistPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/');
  }

  async expectAuthenticatedSession() {
    await expect(this.page).not.toHaveURL(/\/login/i);
  }

  async createWishlist(name: string) {
    await this.assertAuthenticatedUi();
    await this.openCreateWishlistFlow();
    await this.fillWishlistNameIfPresent(name);
    await this.submitCreateWishlist();

    const createdNameVisible = await this.page
      .getByText(name, { exact: false })
      .first()
      .isVisible()
      .catch(() => false);

    // Some UI variants create a wishlist without showing editable name in the modal.
    // In that case, the submit dialog closes and user stays authenticated.
    if (!createdNameVisible) {
      await expect(this.page.getByTestId('createWishlistSubmitButton')).toBeHidden({ timeout: 10000 });
      await this.expectAuthenticatedSession();
    }
  }

  async addItemToWishlist(wishlistName: string, productLink: string) {
    await this.assertAuthenticatedUi();
    await this.openWishlistByName(wishlistName);
    await this.openAddItemFlow();
    await this.fillProductLink(productLink);
    await this.submitAddItem();
    await expect(this.page.getByTestId('new-wish-form-submit-btn')).toBeHidden({ timeout: 10000 });
    await this.expectAuthenticatedSession();
  }

  private async openCreateWishlistFlow() {
    const createButtons: Locator[] = [
      this.page.locator('div').filter({ hasText: /^Create wishlist$/ }).nth(2),
      this.page.locator('div').filter({ hasText: /^Create wishlist$/ }).first(),
      this.page.getByRole('button', { name: /opret ønskeliste|ny ønskeliste|create wishlist|new wishlist/i }),
      this.page.getByRole('link', { name: /opret ønskeliste|ny ønskeliste|create wishlist|new wishlist/i }),
      this.page.locator('[data-testid="create-wishlist"]'),
    ];

    await this.clickFirstVisible(createButtons, 'Could not find "create wishlist" trigger.');
  }

  private async fillWishlistNameIfPresent(name: string) {
    const nameInputs: Locator[] = [
      this.page.getByLabel(/ønskeliste.*navn|wishlist.*name|titel|title|navn|name/i),
      this.page.getByPlaceholder(/ønskeliste.*navn|wishlist.*name|titel|title|name/i),
      this.page.locator('[data-testid="wishlist-name"]'),
      this.page.locator('input[name="name"], input[name="title"]'),
    ];

    for (const candidate of nameInputs) {
      const visible = await candidate
        .first()
        .waitFor({ state: 'visible', timeout: 2000 })
        .then(() => true)
        .catch(() => false);
      if (!visible) {
        continue;
      }

      await candidate.first().fill(name);
      return;
    }
  }

  private async submitCreateWishlist() {
    const submitButtons: Locator[] = [
      this.page.getByTestId('createWishlistSubmitButton'),
      this.page.getByRole('button', { name: /opret|gem|create|save/i }),
      this.page.locator('[data-testid="save-wishlist"]'),
      this.page.locator('button[type="submit"]'),
    ];

    await this.clickFirstVisible(submitButtons, 'Could not find wishlist save button.');
  }

  private async openAddItemFlow() {
    const addButtons: Locator[] = [
      this.page.getByRole('button', { name: /^Create wish$/i }),
      this.page.getByRole('button', { name: /tilføj ønske|tilføj gave|add item|add wish/i }),
      this.page.getByRole('link', { name: /tilføj ønske|tilføj gave|add item|add wish/i }),
      this.page.locator('[data-testid="add-item"]'),
    ];

    await this.clickFirstVisible(addButtons, 'Could not find "add item" trigger.');
  }

  private async fillProductLink(productLink: string) {
    const linkInputs: Locator[] = [
      this.page.getByRole('textbox', { name: /^Insert product link$/i }),
      this.page.getByRole('dialog').getByRole('textbox', { name: /^Insert product link$/i }),
      this.page.getByPlaceholder(/insert product link|indsæt produktlink/i),
      this.page.locator('input[type="url"], input[name*="link" i], input[id*="link" i]'),
    ];

    const field = await this.firstVisible(linkInputs, 'Could not find "Insert product link" input.');
    await field.fill(productLink);
  }

  private async submitAddItem() {
    const submitButtons: Locator[] = [
      this.page.getByTestId('new-wish-form-submit-btn'),
      this.page.getByRole('button', { name: /tilføj|gem|add|save|opret|create/i }),
      this.page.locator('[data-testid="save-item"]'),
      this.page.locator('button[type="submit"]'),
    ];

    await this.clickFirstVisible(submitButtons, 'Could not find add item submit button.');
  }

  private async clickFirstVisible(candidates: Locator[], errorMessage: string) {
    const locator = await this.firstVisible(candidates, errorMessage);
    await locator.click();
  }

  private async firstVisible(candidates: Locator[], errorMessage: string): Promise<Locator> {
    for (const candidate of candidates) {
      if (
        await candidate
          .first()
          .waitFor({ state: 'visible', timeout: 8000 })
          .then(() => true)
          .catch(() => false)
      ) {
        return candidate.first();
      }
    }

    throw new Error(`${errorMessage} Update locators in pages/WishlistPage.ts for your UI.`);
  }

  private async assertAuthenticatedUi() {
    const hasLoginButton = await this.page
      .getByRole('button', { name: /^Log ind$/i })
      .first()
      .isVisible()
      .catch(() => false);

    if (hasLoginButton || /\/login/i.test(this.page.url())) {
      throw new Error('User is not authenticated. Login is required before wishlist actions.');
    }
  }

  private async openWishlistByName(wishlistName: string) {
    const wishlistSelectors: Locator[] = [
      this.page.getByTestId(`wl-${wishlistName}`),
      this.page.getByText(wishlistName, { exact: false }),
    ];

    await this.clickFirstVisible(
      wishlistSelectors,
      `Could not open wishlist "${wishlistName}".`
    );
  }
}
