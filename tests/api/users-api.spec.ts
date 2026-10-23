import { test, expect } from '../../src/fixtures/testFixtures';
import { ApiClient } from '../../src/utils/apiClient';
import testData from '../../test-data/users.json' with { type: 'json' };

/**
 * REST API Automation Suite
 * Target: JSONPlaceholder mock API (https://jsonplaceholder.typicode.com)
 *
 * NOTE: JSONPlaceholder is a mock REST API server.
 * POST/PUT/DELETE calls return simulated success responses (e.g. 201 Created with generated id),
 * but mutations are not persisted to a real database. This is ideal for resilient contract and integration testing.
 */
test.describe('API: REST Endpoints Automation Suite', () => {
  interface UserDto {
    id: number;
    name: string;
    username: string;
    email: string;
  }

  interface PostDto {
    id: number;
    title: string;
    body: string;
    userId: number;
  }

  test('GET /users/1 - Verify status 200 and validate response schema and fields [@smoke, @api]', async ({
    apiClient,
  }) => {
    // Act: Retrieve single user resource
    const response = await apiClient.get<UserDto>('/users/1');

    // Assert HTTP status
    expect(response.status, 'Expected HTTP 200 OK').toBe(200);
    expect(response.headers['content-type']).toContain('application/json');

    // Assert response payload schema using helper
    ApiClient.assertSchema<UserDto>(response.data, {
      id: 'number',
      name: 'string',
      username: 'string',
      email: 'string',
    });

    // Assert specific field values matching test data contract
    expect(response.data.id).toBe(1);
    expect(response.data.username).toBe(testData.api.sampleUser.username);
    expect(response.data.email).toBe(testData.api.sampleUser.email);
  });

  test('POST /posts - Verify 201 Created and response payload contract [@regression, @api]', async ({
    apiClient,
  }) => {
    const payload = testData.api.samplePost;

    // Act: Create a new resource
    const response = await apiClient.post<PostDto>('/posts', { data: payload });

    // Assert HTTP status
    expect(response.status, 'Expected HTTP 201 Created for resource generation').toBe(201);
    expect(response.headers['content-type']).toContain('application/json');

    // Assert response schema
    ApiClient.assertSchema<PostDto>(response.data, {
      id: 'number',
      title: 'string',
      body: 'string',
      userId: 'number',
    });

    // Assert returned values echo back the posted data
    expect(response.data.title).toBe(payload.title);
    expect(response.data.body).toBe(payload.body);
    expect(response.data.userId).toBe(payload.userId);
    expect(response.data.id).toBeGreaterThan(0);
  });

  test('GET /users/999999 - Verify negative validation returns 404 Not Found [@regression, @api, @negative]', async ({
    apiClient,
  }) => {
    // Act: Attempt to retrieve non-existent entity
    const response = await apiClient.get('/users/999999');

    // Assert: Verify standard 404 response
    expect(response.status, 'Non-existent resource must return 404 Not Found').toBe(404);
  });
});
