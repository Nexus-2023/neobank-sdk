import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseClient } from '../src/api/base-client';
import { NeobankError } from '../src/errors/neobank-error';
import type { ValidatedConfig } from '../src/config';
import type { ApiResponse } from '../src/types/api';

const mockConfig: ValidatedConfig = {
  apiKey: 'test-api-key',
  userAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  baseUrl: 'https://api.test.com',
  timeout: 5000,
};

describe('BaseClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('request', () => {
    it('should make successful authenticated request', async () => {
      const mockData = { id: '123', name: 'Test' };
      const mockResponse: ApiResponse<typeof mockData> = {
        code: 200,
        message: 'Success',
        detail: null,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const client = new BaseClient(mockConfig);
      const result = await client.request({
        endpoint: '/test',
        method: 'GET',
        requiresAuth: true,
      });

      expect(result).toEqual(mockData);
              expect(fetch).toHaveBeenCalledWith(
              'https://api.test.com/test',
              expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                  'x-api-key': 'test-api-key',
                  'x-user-address': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
                }),
              })
            );    });

    it('should throw NeobankError on API error', async () => {
      const mockResponse: ApiResponse<null> = {
        code: 404,
        message: 'Not found',
        detail: 'Resource does not exist',
        data: null,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => mockResponse,
      });

      const client = new BaseClient(mockConfig);

      await expect(
        client.request({
          endpoint: '/test',
          method: 'GET',
          requiresAuth: true,
        })
      ).rejects.toThrow(NeobankError);
    });

    it('should throw error if userAddress is missing for authenticated request', async () => {
      const configWithoutAddress: ValidatedConfig = {
        ...mockConfig,
        userAddress: undefined,
      };

      const client = new BaseClient(configWithoutAddress);

      await expect(
        client.request({
          endpoint: '/test',
          method: 'GET',
          requiresAuth: true,
        })
      ).rejects.toThrow('userAddress is required for authenticated endpoints');
    });
  });

  describe('publicRequest', () => {
    it('should make successful public request without auth headers', async () => {
      const mockData = [{ id: '1' }, { id: '2' }];
      const mockResponse: ApiResponse<typeof mockData> = {
        code: 200,
        message: 'Success',
        detail: null,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const client = new BaseClient(mockConfig);
      const result = await client.publicRequest({
        endpoint: '/public',
        method: 'GET',
      });

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/public',
        expect.objectContaining({
          method: 'GET',
          headers: expect.not.objectContaining({
            'x-api-key': expect.anything(),
            'userAddress': expect.anything(),
          }),
        })
      );
    });
  });
});
