import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/da/', { waitUntil: 'domcontentloaded' });
    await this.acceptCookiesIfVisible();
  }

  async login(email: string, password: string) {
    await this.open();

    const openLoginButton = this.page.getByRole('button', { name: /^Log ind$/i });
    await openLoginButton.waitFor({ state: 'visible', timeout: 15000 });
    await openLoginButton.click();

    const continueWithEmail = await this.firstVisible(
      [
        this.page.getByRole('button', { name: /^photo\s*Fortsæt med e-mail$/i }).first(),
        this.page.getByRole('button', { name: /^Fortsæt med e-mail$/i }).first(),
        this.page.getByRole('dialog').getByRole('button', { name: /Fortsæt med e-mail/i }).first(),
      ],
      'Could not find "Fortsæt med e-mail" button.'
    );
    await continueWithEmail.click();
    await this.clickContinueWithEmailIfStillVisible();

    const emailField = await this.firstVisible(
      [
        this.page.getByRole('textbox', { name: /^E-mail$/i }).first(),
        this.page.getByRole('dialog').getByRole('textbox', { name: /^E-mail$/i }).first(),
        this.page.locator('input[type="email"]').first(),
      ],
      'Could not find email input on login page.'
    );
    await emailField.fill(email);

    const passwordField = await this.firstVisible(
      [
        this.page.getByTestId('loginPasswordInput').first(),
        this.page.getByRole('dialog').getByTestId('loginPasswordInput').first(),
        this.page.locator('input[type="password"]').first(),
      ],
      'Could not find password input on login page.'
    );
    await passwordField.fill(password);

    const submitButton = await this.firstVisible(
      [
        this.page.getByRole('dialog').getByRole('button', { name: /^Log ind$/i }).first(),
        this.page.getByRole('button', { name: /^Log ind$/i }).nth(1),
      ],
      'Could not find dialog "Log ind" submit button.'
    );
    await submitButton.click();
  }

  async expectLoggedIn() {
    await expect(this.page).not.toHaveURL(/\/login/i);
    await expect(this.page.getByRole('dialog').getByRole('button', { name: /^Log ind$/i })).toBeHidden({
      timeout: 15000,
    });
    await expect(this.page.getByRole('button', { name: /^Log ind$/i }).first()).toBeHidden({
      timeout: 15000,
    });
  }

  private async acceptCookiesIfVisible() {
    const allowAll = this.page.getByRole('button', { name: /^Allow all$/i }).first();
    const visible = await allowAll
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true)
      .catch(() => false);

    if (visible) {
      await allowAll.click();
    }
  }

  private async firstVisible(candidates: Locator[], errorMessage: string): Promise<Locator> {
    for (const candidate of candidates) {
      const visible = await candidate
        .waitFor({ state: 'visible', timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      if (visible) {
        return candidate;
      }
    }

    throw new Error(errorMessage);
  }

  private async clickContinueWithEmailIfStillVisible() {
    const continueWithEmailCandidates = [
      this.page.getByRole('button', { name: /^photo\s*Fortsæt med e-mail$/i }).first(),
      this.page.getByRole('button', { name: /^Fortsæt med e-mail$/i }).first(),
      this.page.getByRole('dialog').getByRole('button', { name: /Fortsæt med e-mail/i }).first(),
    ];

    for (const candidate of continueWithEmailCandidates) {
      const stillVisible = await candidate.isVisible().catch(() => false);
      if (stillVisible) {
        await candidate.click().catch(() => undefined);
        break;
      }
    }
  }
}
