import { test, expect } from '../../src/fixtures/testFixtures';
import {
  getTestDesignAdapter,
  validateTestCaseStructure,
  TestCaseProposal,
} from '../../src/ai/testDesignAdapter';
import testData from '../../test-data/users.json' with { type: 'json' };
import { env } from '../../src/utils/env';

test.describe('Integration: AI Test Design Adapter & Multi-Tier Verification', () => {
  test('Verify AI Test Design Adapter generates valid test proposals from feature requirements [@smoke, @ai]', async () => {
    // Arrange: Instantiate the provider-neutral test design adapter
    const adapter = getTestDesignAdapter(env.ai.provider, env.ai.apiKey);
    const requirement = {
      requirementText:
        'Users must authenticate with valid username and password, while invalid credentials return clear error banners and locked accounts are blocked.',
      featureName: 'SauceDemo Secure Login',
      targetTier: 'UI' as const,
    };

    // Act: Generate structured test proposals
    const result = await adapter.generateTestCases(requirement);

    // Assert: Verify metadata and output completeness
    expect(result.provider).toBeDefined();
    expect(result.featureName).toBe('SauceDemo Secure Login');
    expect(result.testCases.length).toBeGreaterThanOrEqual(2);

    // Assert: Every generated test case strictly obeys the QA architecture contract
    for (const tc of result.testCases) {
      expect(validateTestCaseStructure(tc), `Test case ${tc.id} failed structure validation`).toBe(
        true,
      );
      expect(tc.steps.length).toBeGreaterThan(0);
      expect(tc.expectedResults.length).toBeGreaterThan(0);
      expect(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).toContain(tc.riskPriority);
    }

    // Verify specific expected case exists
    const smokeAuthCase = result.testCases.find((tc: TestCaseProposal) =>
      tc.tags.includes('@smoke'),
    );
    expect(smokeAuthCase, 'Expected a @smoke tagged test proposal').toBeDefined();
    expect(smokeAuthCase?.suggestedType).toBe('UI');
  });

  test('Verify multi-tier coordination: API user check combined with UI session authentication [@regression, @integration]', async ({
    apiClient,
    loginPage,
  }) => {
    // Tier 1 (API): Verify backend user service health before launching UI flow
    const apiCheck = await apiClient.get('/users/1');
    expect(apiCheck.status).toBe(200);

    // Tier 2 (UI): Execute standard user login on UI layer
    await loginPage.goto('/');
    await loginPage.login(env.ui.standardUsername, env.ui.standardPassword);
    await loginPage.assertLoginSuccess();

    // Verify cross-layer state consistency
    const cartVisible = await loginPage.shoppingCartBadge.isVisible();
    expect(cartVisible, 'Shopping cart should be visible post-login').toBe(true);

    // Confirm test data correlation
    expect(testData.ui.standardUser.username).toBe(env.ui.standardUsername);
  });
});
