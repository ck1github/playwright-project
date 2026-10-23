import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ApiClient } from '../utils/apiClient';
import { env } from '../utils/env';

export interface TestFixtures {
  loginPage: LoginPage;
  apiClient: ApiClient;
}

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  apiClient: async ({ request }, use) => {
    const apiClient = new ApiClient(request, env.api.baseUrl);
    await use(apiClient);
  },
});

export { expect };
