import type { ValidatedConfig } from '../config';
import type { ApiResponse } from '../types/api';
import { NeobankError } from '../errors/neobank-error';

/**
 * Request options for API calls
 */
interface RequestOptions {
  endpoint: string;
  method: 'GET' | 'POST';
  body?: object;
  requiresAuth?: boolean;
}

/**
 * Base HTTP client for all API requests
 * Handles authentication, request/response processing, and error handling
 */
export class BaseClient {
  constructor(private readonly config: ValidatedConfig) {}

  /**
   * Makes an authenticated API request
   * @throws {NeobankError} If the request fails or returns an error
   */
  async request<T>(options: RequestOptions): Promise<T> {
    const url = `${this.config.baseUrl}${options.endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication headers if required
    if (options.requiresAuth !== false) {
      headers['x-api-key'] = this.config.apiKey;

      if (this.config.userAddress) {
        headers['x-user-address'] = this.config.userAddress;
      } else {
        throw new Error('userAddress is required for authenticated endpoints');
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      let responseData: ApiResponse<T>;
      try {
        responseData = await response.json() as ApiResponse<T>;
      } catch (parseError) {
        throw new NeobankError(
          'Failed to parse API response',
          500,
          response.status,
          'Invalid JSON response from server'
        );
      }

      // Check for HTTP errors
      if (!response.ok) {
        throw NeobankError.fromApiResponse(
          responseData.message || 'Request failed',
          responseData.code || response.status,
          response.status,
          responseData.detail
        );
      }

      // Check for API-level errors
      if (responseData.data === null && responseData.code >= 400) {
        throw NeobankError.fromApiResponse(
          responseData.message,
          responseData.code,
          response.status,
          responseData.detail
        );
      }

      // Return unwrapped data
      if (responseData.data === null) {
        throw new NeobankError(
          'API returned null data',
          responseData.code,
          response.status,
          responseData.detail
        );
      }

      return responseData.data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw NeobankError as-is
      if (error instanceof NeobankError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NeobankError(
            `Request timeout after ${this.config.timeout}ms`,
            408,
            408,
            'Request was aborted due to timeout'
          );
        }

        throw new NeobankError(
          'Network request failed',
          0,
          0,
          error.message
        );
      }

      // Unknown error
      throw new NeobankError(
        'An unknown error occurred',
        500,
        500,
        String(error)
      );
    }
  }

  /**
   * Makes a public API request (no authentication required)
   * @throws {NeobankError} If the request fails or returns an error
   */
  async publicRequest<T>(options: Omit<RequestOptions, 'requiresAuth'>): Promise<T> {
    return this.request<T>({ ...options, requiresAuth: false });
  }
}
