import { expect } from '@playwright/test';
import type { Frame, Locator, Page } from '@playwright/test';

export class WishlistPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/da/', { waitUntil: 'domcontentloaded' });
    await this.dismissCookieBannerIfPresent();
  }

  async expectAuthenticatedSession() {
    await this.dismissCookieBannerIfPresent();
    await expect(this.page).not.toHaveURL(/\/login/i);
  }

  async createWishlist(name: string) {
    await this.assertAuthenticatedUi();
    await this.dismissCookieBannerIfPresent();
    await this.openCreateWishlistFlow();
    await this.fillWishlistNameIfPresent(name);
    await this.submitCreateWishlist(name);

    const createdNameVisible = await this.page
      .getByText(name, { exact: false })
      .first()
      .isVisible()
      .catch(() => false);

    if (!createdNameVisible) {
      await expect(this.page.getByTestId('createWishlistSubmitButton')).toBeHidden({ timeout: 5000 });
    }
  }

  async addItemToWishlist(productLink: string) {
    await this.assertAuthenticatedUi();
    await this.dismissCookieBannerIfPresent();
    await this.page.getByTestId('new-wish-btn').click();
    await this.fillProductLink(productLink);
    const wishlistItem = this.page.getByTestId('select-wishlist-list-item-0').first();
    await wishlistItem.waitFor({ state: 'visible', timeout: 10000 });
    await Promise.all([
      this.page.waitForResponse(
        res => res.request().postData()?.includes('"createWish"') ?? false,
        { timeout: 15000 }
      ),
      wishlistItem.getByRole('heading').click(),
    ]);
  }

  private async openCreateWishlistFlow() {
    const createButtons: Locator[] = [
      this.page.getByTestId('plus-button').first(),
      this.page.locator('div').filter({ hasText: /^Create wishlist$/ }).first(),
      this.page.getByRole('button', { name: /opret ønskeliste|ny ønskeliste|create wishlist|new wishlist/i }),
      this.page.getByRole('link', { name: /opret ønskeliste|ny ønskeliste|create wishlist|new wishlist/i }),
    ];

    await this.clickFirstVisible(createButtons, 'Could not find "create wishlist" trigger.');
  }

  private async fillWishlistNameIfPresent(name: string) {
    const nameInputs: Locator[] = [
      this.page.getByTestId('create-wishlist-title-input'),
      this.page.getByLabel(/ønskeliste.*navn|wishlist.*name|titel|title|navn|name/i),
      this.page.getByPlaceholder(/ønskeliste.*navn|wishlist.*name|titel|title|name/i),
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

  private async submitCreateWishlist(wishlistName: string) {
    const exactSubmit = this.page.getByTestId('createWishlistSubmitButton').first();
    const exactSubmitVisible = await exactSubmit
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false);
    if (exactSubmitVisible) {
      await exactSubmit.click();
      return;
    }

    const createdWishlistVisible = await this.page
      .getByTestId(`wl-${wishlistName}`)
      .first()
      .isVisible()
      .catch(() => false);
    if (createdWishlistVisible) {
      return;
    }

    const hasLoginButton = await this.page
      .getByRole('button', { name: /^Log ind$/i })
      .first()
      .isVisible()
      .catch(() => false);
    if (hasLoginButton || /\/login/i.test(this.page.url())) {
      throw new Error('Lost authenticated session while creating wishlist.');
    }

    const submitButtons: Locator[] = [
      this.page.getByTestId('createWishlistSubmitButton'),
      this.page.getByRole('button', { name: /opret|gem|create|save/i }),
      this.page.locator('[data-testid="save-wishlist"]'),
      this.page.locator('button[type="submit"]'),
    ];

    await this.clickFirstVisible(
      submitButtons,
      `Could not find wishlist save button (url: ${this.page.url()}).`
    );
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

  private async clickFirstVisible(candidates: Locator[], errorMessage: string) {
    const locator = await this.firstVisible(candidates, errorMessage);
    await locator.click();
  }

  private async firstVisible(candidates: Locator[], errorMessage: string): Promise<Locator> {
    for (const candidate of candidates) {
      if (
        await candidate
          .first()
          .waitFor({ state: 'visible', timeout: 3000 })
          .then(() => true)
          .catch(() => false)
      ) {
        return candidate.first();
      }
    }

    throw new Error(`${errorMessage} Update locators in pages/WishlistPage.ts for your UI.`);
  }

  private async assertAuthenticatedUi() {
    const hasLoginDialogSubmit = await this.page
      .getByRole('dialog')
      .getByRole('button', { name: /^Log ind$/i })
      .first()
      .isVisible()
      .catch(() => false);

    if (/\/login/i.test(this.page.url()) || hasLoginDialogSubmit) {
      throw new Error('User is not authenticated. Login is required before wishlist actions.');
    }
  }

  private async dismissCookieBannerIfPresent() {
    const acceptedOnPage = await this.tryAcceptCookiesInScope(this.page);
    if (acceptedOnPage) {
      return;
    }

    for (const frame of this.page.frames()) {
      const acceptedInFrame = await this.tryAcceptCookiesInScope(frame);
      if (acceptedInFrame) {
        return;
      }
    }
  }

  private async tryAcceptCookiesInScope(scope: Page | Frame): Promise<boolean> {
    const candidates: Locator[] = [
      scope.getByRole('button', { name: /^Allow all$/i }).first(),
      scope.getByRole('button', { name: /accept all|accepter alle|tillad alle|godkend alle/i }).first(),
      scope.getByRole('button', { name: /accept|accepter|tillad|godkend|ok/i }).first(),
    ];

    for (const candidate of candidates) {
      const visible = await candidate
        .waitFor({ state: 'visible', timeout: 1500 })
        .then(() => true)
        .catch(() => false);

      if (visible) {
        await candidate.click({ timeout: 2500 }).catch(() => undefined);
        return true;
      }
    }

    return false;
  }
}
