/**
 * AI-Assisted Test Design Adapter
 * Provider-neutral interface and deterministic mock adapter for generating
 * structured test cases from requirements, suitable for enterprise QA test planning.
 */

export type RiskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SuggestedType = 'UI' | 'API' | 'INTEGRATION' | 'E2E' | 'SECURITY';

export interface TestCaseProposal {
  id: string;
  title: string;
  preconditions: string[];
  steps: string[];
  expectedResults: string[];
  riskPriority: RiskPriority;
  suggestedType: SuggestedType;
  tags: string[];
}

export interface RequirementInput {
  requirementText: string;
  featureName?: string;
  targetTier?: 'UI' | 'API' | 'INTEGRATION';
}

export interface TestDesignResult {
  provider: string;
  featureName: string;
  testCases: TestCaseProposal[];
  coverageNotes: string;
  generatedAt: string;
}

export interface ITestDesignAdapter {
  generateTestCases(input: RequirementInput): Promise<TestDesignResult>;
}

/**
 * Validates that an object conforms to the strict TestCaseProposal contract.
 */
export function validateTestCaseStructure(testCase: unknown): testCase is TestCaseProposal {
  if (!testCase || typeof testCase !== 'object') {
    return false;
  }
  const tc = testCase as Record<string, unknown>;
  const hasStringId = typeof tc.id === 'string' && tc.id.length > 0;
  const hasStringTitle = typeof tc.title === 'string' && tc.title.length > 0;
  const hasPreconditions =
    Array.isArray(tc.preconditions) && tc.preconditions.every((p) => typeof p === 'string');
  const hasSteps =
    Array.isArray(tc.steps) && tc.steps.length > 0 && tc.steps.every((s) => typeof s === 'string');
  const hasExpectedResults =
    Array.isArray(tc.expectedResults) &&
    tc.expectedResults.length > 0 &&
    tc.expectedResults.every((r) => typeof r === 'string');
  const hasValidPriority = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(
    tc.riskPriority as string,
  );
  const hasValidType = ['UI', 'API', 'INTEGRATION', 'E2E', 'SECURITY'].includes(
    tc.suggestedType as string,
  );
  const hasTags = Array.isArray(tc.tags);

  return (
    hasStringId &&
    hasStringTitle &&
    hasPreconditions &&
    hasSteps &&
    hasExpectedResults &&
    hasValidPriority &&
    hasValidType &&
    hasTags
  );
}

/**
 * Deterministic Mock Adapter: Generates realistic test case structures
 * without external dependencies, credentials, or API costs.
 */
export class MockTestDesignAdapter implements ITestDesignAdapter {
  async generateTestCases(input: RequirementInput): Promise<TestDesignResult> {
    const text = input.requirementText.toLowerCase();
    const feature = input.featureName || 'Authentication & Core Flow';
    const testCases: TestCaseProposal[] = [];

    if (text.includes('login') || text.includes('auth') || text.includes('credential')) {
      testCases.push({
        id: 'TC-AUTH-001',
        title: `Verify successful user authentication with valid credentials for ${feature}`,
        preconditions: [
          'User account is active and provisioned',
          'Application landing page is accessible',
        ],
        steps: [
          'Navigate to the login view',
          'Enter standard registered username and password',
          'Click the primary submit button',
        ],
        expectedResults: [
          'User session is established with authenticated token',
          'User is redirected to the home/inventory dashboard',
          'Session cookie/storage contains active token',
        ],
        riskPriority: 'CRITICAL',
        suggestedType: 'UI',
        tags: ['@smoke', '@auth', '@p1'],
      });

      testCases.push({
        id: 'TC-AUTH-002',
        title: `Verify authentication rejection and error messaging for locked or invalid accounts`,
        preconditions: ['User account is locked or credentials are intentionally mismatching'],
        steps: [
          'Navigate to login view',
          'Enter invalid credentials or locked account identifier',
          'Submit the login form',
        ],
        expectedResults: [
          'Authentication fails with an explicit, accessible error banner',
          'User is not redirected and remains on the login view',
          'No privileged session token is issued',
        ],
        riskPriority: 'HIGH',
        suggestedType: 'UI',
        tags: ['@regression', '@auth', '@negative'],
      });
    }

    if (
      text.includes('api') ||
      text.includes('endpoint') ||
      text.includes('rest') ||
      text.includes('user')
    ) {
      testCases.push({
        id: 'TC-API-001',
        title: `Verify REST API endpoint schema contract and 200 OK status`,
        preconditions: ['API gateway or mock service is reachable via network'],
        steps: [
          'Send HTTP GET request to resource collection endpoint with Accept application/json header',
          'Inspect HTTP response status code, headers, and body payload',
        ],
        expectedResults: [
          'HTTP status code is 200 OK',
          'Response Content-Type contains application/json',
          'Payload conforms to the defined schema with required keys and correct types',
        ],
        riskPriority: 'CRITICAL',
        suggestedType: 'API',
        tags: ['@smoke', '@api', '@contract'],
      });

      testCases.push({
        id: 'TC-API-002',
        title: `Verify REST API graceful 404 response on non-existent resource ID`,
        preconditions: ['API gateway is reachable'],
        steps: [
          'Send HTTP GET request targeting non-existent resource ID (e.g. /users/999999)',
          'Inspect HTTP status code and response body',
        ],
        expectedResults: [
          'HTTP status code is 404 Not Found',
          'Response does not leak unhandled stack traces or sensitive internals',
        ],
        riskPriority: 'MEDIUM',
        suggestedType: 'API',
        tags: ['@regression', '@api', '@negative'],
      });
    }

    // Default fallback case if no specific keywords matched
    if (testCases.length === 0) {
      testCases.push({
        id: 'TC-GEN-001',
        title: `Verify base functional behavior for: ${input.requirementText.slice(0, 50)}...`,
        preconditions: ['System under test is in steady state'],
        steps: ['Execute target operation', 'Verify primary outcome'],
        expectedResults: ['Operation completes successfully within SLA limits'],
        riskPriority: 'MEDIUM',
        suggestedType: input.targetTier || 'INTEGRATION',
        tags: ['@functional'],
      });
    }

    return {
      provider: 'Deterministic-Mock-Engine-v1',
      featureName: feature,
      testCases,
      coverageNotes: `Generated ${testCases.length} test proposal(s) covering functional, boundary, and negative scenarios.`,
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Adapter Factory: Pluggable factory allowing seamless swapping between Mock,
 * OpenAI, Anthropic, or internal LLM endpoints without altering test assertions.
 */
export function getTestDesignAdapter(provider = 'mock', _apiKey?: string): ITestDesignAdapter {
  switch (provider.toLowerCase()) {
    case 'mock':
    default:
      return new MockTestDesignAdapter();
    // Real providers can be instantiated here when API credentials are provided:
    // case 'openai':
    //   return new OpenAITestDesignAdapter(apiKey);
    // case 'anthropic':
    //   return new AnthropicTestDesignAdapter(apiKey);
  }
}
