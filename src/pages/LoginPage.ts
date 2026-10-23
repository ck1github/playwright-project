import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly inventoryTitle: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    // Accessible & resilient locators with standard data-test fallbacks
    this.usernameInput = page
      .getByPlaceholder('Username')
      .or(page.locator('[data-test="username"]'));
    this.passwordInput = page
      .getByPlaceholder('Password')
      .or(page.locator('[data-test="password"]'));
    this.loginButton = page
      .getByRole('button', { name: /login/i })
      .or(page.locator('[data-test="login-button"]'));
    this.errorMessage = page.locator('[data-test="error"]');
    this.inventoryTitle = page.locator('[data-test="title"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-link"]');
  }

  /**
   * Navigates to the SauceDemo home page and ensures login form is ready.
   */
  async goto(url = '/'): Promise<void> {
    await this.page.goto(url);
    await expect(this.loginButton, 'Login button should be visible on entry').toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Enters username and password and clicks the login button.
   */
  async login(username?: string, password?: string): Promise<void> {
    if (username !== undefined) {
      await this.usernameInput.fill(username);
    }
    if (password !== undefined) {
      await this.passwordInput.fill(password);
    }
    await this.loginButton.click();
  }

  /**
   * Verifies that the user has successfully landed on the inventory products page.
   */
  async assertLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/.*inventory\.html/, { timeout: 10000 });
    await expect(this.inventoryTitle).toHaveText('Products');
    await expect(this.shoppingCartBadge).toBeVisible();
  }

  /**
   * Retrieves the current error message text.
   */
  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    return (await this.errorMessage.textContent()) || '';
  }

  /**
   * Verifies the error banner text matches the expected error.
   */
  async assertErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    await expect(this.errorMessage).toContainText(expectedMessage);
  }
}
