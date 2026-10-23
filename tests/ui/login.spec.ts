import { test, expect } from '../../src/fixtures/testFixtures';
import { env } from '../../src/utils/env';
import testData from '../../test-data/users.json' with { type: 'json' };

test.describe('UI: SauceDemo Authentication Suite', () => {
  test.beforeEach(async ({ loginPage }) => {
    // Navigate to base URL before each test
    await loginPage.goto('/');
  });

  test('Verify successful authentication redirects to inventory page [@smoke, @ui]', async ({
    loginPage,
    page,
  }) => {
    // Act: Perform login with valid standard credentials
    await loginPage.login(env.ui.standardUsername, env.ui.standardPassword);

    // Assert: Verify successful landing on inventory page
    await loginPage.assertLoginSuccess();

    // Additional UI stability assertion
    await expect(page).toHaveTitle(/Swag Labs/i);
  });

  test('Verify authentication failure for invalid credentials displays descriptive error [@regression, @ui, @negative]', async ({
    loginPage,
  }) => {
    const { invalidUser } = testData.ui;

    // Act: Attempt login with invalid credentials
    await loginPage.login(invalidUser.username, invalidUser.password);

    // Assert: Verify error banner is visible with expected text
    await loginPage.assertErrorMessage(invalidUser.expectedError);
  });

  test('Verify locked-out account receives explicit lockout notice [@regression, @ui, @negative]', async ({
    loginPage,
  }) => {
    const { lockedOutUser } = testData.ui;

    // Act: Attempt login with locked-out account
    await loginPage.login(env.ui.lockedUsername, env.ui.standardPassword);

    // Assert: Verify specific locked-out message
    await loginPage.assertErrorMessage(lockedOutUser.expectedError);
  });
});
