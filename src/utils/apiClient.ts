import { APIRequestContext, APIResponse, expect } from '@playwright/test';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  raw: APIResponse;
}

export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  private resolveUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const sanitizedBase = this.baseUrl.replace(/\/+$/, '');
    const sanitizedEndpoint = endpoint.replace(/^\/+/, '');
    return `${sanitizedBase}/${sanitizedEndpoint}`;
  }

  async get<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint);
    const response = await this.request.get(url, {
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
      params: options.params,
      timeout: options.timeout,
    });
    return this.formatResponse<T>(response);
  }

  async post<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint);
    const response = await this.request.post(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      data: options.data,
      params: options.params,
      timeout: options.timeout,
    });
    return this.formatResponse<T>(response);
  }

  async put<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint);
    const response = await this.request.put(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      data: options.data,
      params: options.params,
      timeout: options.timeout,
    });
    return this.formatResponse<T>(response);
  }

  async delete<T = unknown>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint);
    const response = await this.request.delete(url, {
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
      params: options.params,
      timeout: options.timeout,
    });
    return this.formatResponse<T>(response);
  }

  private async formatResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
    let responseData: T;
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('application/json')) {
      responseData = (await response.json()) as T;
    } else {
      responseData = (await response.text()) as unknown as T;
    }

    return {
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      data: responseData,
      raw: response,
    };
  }

  /**
   * Lightweight maintainable schema and field validator.
   * Asserts presence and types of expected keys on the target object.
   */
  static assertSchema<T extends object>(
    target: unknown,
    schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'object' | 'array'>,
    context = 'Response Schema',
  ): asserts target is T {
    expect(target, `${context} must be defined`).toBeTruthy();
    expect(typeof target, `${context} must be an object`).toBe('object');

    const obj = target as Record<string, unknown>;
    for (const [key, expectedType] of Object.entries(schema)) {
      expect(key in obj, `${context} missing expected property: ${key}`).toBe(true);

      const actualValue = obj[key];
      if (expectedType === 'array') {
        expect(Array.isArray(actualValue), `${context}.${key} must be an array`).toBe(true);
      } else {
        expect(typeof actualValue, `${context}.${key} must be of type ${expectedType}`).toBe(
          expectedType,
        );
      }
    }
  }
}
