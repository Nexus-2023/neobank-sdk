/**
 * API Integration Tests for VaultsApi
 * Following TDD and Vitest best practices
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VaultsApi } from '../../src/api/vaults';
import { BaseClient } from '../../src/api/base-client';
import { NeobankError } from '../../src/errors/neobank-error';
import type { ValidatedConfig } from '../../src/config';
import type { Vault, ApiResponse } from '../../src/types';

const mockConfig: ValidatedConfig = {
  apiKey: 'test-api-key',
  userAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  baseUrl: 'https://api.test.com',
  timeout: 5000,
};

const mockVaultData: Vault = {
  id: '6e9b8e9f-bb3e-4e8a-b9ea-f3ab27449b38',
  curatorId: '6e9b8e9f-bb3e-4e8a-b9ea-f3ab27449b39',
  vaultName: 'Test Vault',
  vaultAddress: '0x1234567890123456789012345678901234567890',
  chainId: 8453,
  isEnabled: true,
  depositEnabled: true,
  strategyAllocations: [
    {
      strategyId: '6e9b8e9f-bb3e-4e8a-b9ea-f3ab27449b40',
      allocationSplit: 100,
    },
  ],
};

describe('VaultsApi - Integration Tests', () => {
  let client: BaseClient;
  let vaultsApi: VaultsApi;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup - fresh instance for each test
    client = new BaseClient(mockConfig);
    vaultsApi = new VaultsApi(client);

    // Mock global fetch with proper typing
    fetchMock = vi.fn() as any;
    global.fetch = fetchMock as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('list() - GET /api/v1/vault/list', () => {
    describe('Happy Path', () => {
      it('should fetch all vaults successfully', async () => {
        // Arrange
        const mockResponse: ApiResponse<Vault[]> = {
          code: 200,
          message: 'Vaults fetched successfully',
          detail: null,
          data: [mockVaultData],
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        // Act
        const result = await vaultsApi.list();

        // Assert
        expect(result).toEqual([mockVaultData]);
        expect(result).toHaveLength(1);
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(fetchMock).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/vault/list',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
      });

      it('should return empty array when no vaults exist', async () => {
        // Arrange
        const mockResponse: ApiResponse<Vault[]> = {
          code: 200,
          message: 'Success',
          detail: null,
          data: [],
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        // Act
        const result = await vaultsApi.list();

        // Assert
        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
      });

      it('should handle multiple vaults', async () => {
        // Arrange
        const vault2: Vault = { ...mockVaultData, id: 'different-id', vaultName: 'Vault 2' };
        const mockResponse: ApiResponse<Vault[]> = {
          code: 200,
          message: 'Success',
          detail: null,
          data: [mockVaultData, vault2],
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        // Act
        const result = await vaultsApi.list();

        // Assert
        expect(result).toHaveLength(2);
        expect(result[0].vaultName).toBe('Test Vault');
        expect(result[1].vaultName).toBe('Vault 2');
      });
    });

    describe('Error Scenarios', () => {
      it('should handle 500 server errors', async () => {
        // Arrange
        const errorResponse: ApiResponse<null> = {
          code: 500,
          message: 'Internal server error',
          detail: 'Database connection failed',
          data: null,
        };

        fetchMock.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => errorResponse,
        });

        // Act & Assert
        await expect(vaultsApi.list()).rejects.toThrow(NeobankError);
        await expect(vaultsApi.list()).rejects.toThrow('Internal server error');
      });

      it('should handle network errors', async () => {
        // Arrange
        fetchMock.mockRejectedValueOnce(new Error('Network error'));

        // Act & Assert
        await expect(vaultsApi.list()).rejects.toThrow(NeobankError);
        await expect(vaultsApi.list()).rejects.toThrow('Network request failed');
      });

      it('should handle timeout', async () => {
        // Arrange
        fetchMock.mockImplementationOnce(() => new Promise((_, reject) => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          setTimeout(() => reject(error), 10);
        }));

        // Act & Assert
        await expect(vaultsApi.list()).rejects.toThrow(NeobankError);
        await expect(vaultsApi.list()).rejects.toThrow('Request timeout');
      });

      it('should handle malformed JSON response', async () => {
        // Arrange
        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => {
            throw new Error('Invalid JSON');
          },
        });

        // Act & Assert
        await expect(vaultsApi.list()).rejects.toThrow(NeobankError);
        await expect(vaultsApi.list()).rejects.toThrow('Failed to parse API response');
      });
    });
  });

  describe('get(vaultId) - GET /api/v1/vault/{vaultId}', () => {
    const vaultId = '6e9b8e9f-bb3e-4e8a-b9ea-f3ab27449b38';

    describe('Happy Path', () => {
      it('should fetch vault by ID successfully', async () => {
        // Arrange
        const mockResponse: ApiResponse<Vault> = {
          code: 200,
          message: 'Vault fetched successfully',
          detail: null,
          data: mockVaultData,
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        // Act
        const result = await vaultsApi.get(vaultId);

        // Assert
        expect(result).toEqual(mockVaultData);
        expect(fetchMock).toHaveBeenCalledWith(
          `https://api.test.com/api/v1/vault/${vaultId}`,
          expect.any(Object)
        );
      });
    });

    describe('Input Validation', () => {
      it('should reject invalid UUID format', async () => {
        // Arrange
        const invalidId = 'not-a-uuid';

        // Act & Assert
        await expect(vaultsApi.get(invalidId)).rejects.toThrow('vaultId must be a valid UUID');
      });

      it('should reject empty string', async () => {
        // Act & Assert
        await expect(vaultsApi.get('')).rejects.toThrow('vaultId must be a valid UUID');
      });

      it('should reject partial UUID', async () => {
        // Arrange
        const partialUuid = '6e9b8e9f-bb3e-4e8a';

        // Act & Assert
        await expect(vaultsApi.get(partialUuid)).rejects.toThrow('vaultId must be a valid UUID');
      });
    });

    describe('Error Scenarios', () => {
      it('should handle 404 not found', async () => {
        // Arrange
        const errorResponse: ApiResponse<null> = {
          code: 404,
          message: 'Vault not found',
          detail: 'No vault exists with this ID',
          data: null,
        };

        fetchMock.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => errorResponse,
        });

        // Act & Assert
        await expect(vaultsApi.get(vaultId)).rejects.toThrow(NeobankError);
        await expect(vaultsApi.get(vaultId)).rejects.toThrow('Vault not found');
      });
    });
  });
});
