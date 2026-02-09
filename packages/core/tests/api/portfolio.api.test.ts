/**
 * API Integration Tests for PortfolioApi
 * Portfolio endpoint is currently failing - these tests will help diagnose
 * Following TDD and Vitest best practices
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PortfolioApi } from '../../src/api/portfolio';
import { BaseClient } from '../../src/api/base-client';
import { NeobankError } from '../../src/errors/neobank-error';
import type { ValidatedConfig } from '../../src/config';
import type { Portfolio, ApiResponse } from '../../src/types';

const mockConfig: ValidatedConfig = {
  apiKey: 'test-api-key',
  userAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  baseUrl: 'https://api.test.com',
  timeout: 5000,
};

const mockPortfolioData: Portfolio = {
  bank: {
    name: 'Test NeoBank',
    legalName: 'Test Bank Pvt Ltd',
  },
  walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  positions: [
    {
      vaultName: 'Morpho USDC Prime Vault',
      vaultAddress: '0x1234567890123456789012345678901234567890',
      chainId: 8453,
      decimals: 6,
      depositValueInAsset: '1000000',
      depositValueInUsd: '1000000',
      currentValueInAsset: '1030000',
      currentValueInUsd: '1030000',
    },
  ],
};

describe('PortfolioApi - Integration Tests', () => {
  let client: BaseClient;
  let portfolioApi: PortfolioApi;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup
    client = new BaseClient(mockConfig);
    portfolioApi = new PortfolioApi(client);
    fetchMock = vi.fn() as any;
    global.fetch = fetchMock as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPortfolio() - GET /api/v1/sdk/portfolio', () => {
    describe('Happy Path', () => {
      it('should fetch portfolio with positions successfully', async () => {
        // Arrange
        const mockResponse: ApiResponse<Portfolio> = {
          code: 200,
          message: 'Portfolio fetched successfully',
          detail: null,
          data: mockPortfolioData,
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        // Act
        const result = await portfolioApi.getPortfolio();

        // Assert
        expect(result).toEqual(mockPortfolioData);
        expect(result.bank.name).toBe('Test NeoBank');
        expect(result.positions).toHaveLength(1);
        expect(fetchMock).toHaveBeenCalledOnce();

        // Verify authentication headers are included
        expect(fetchMock).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/sdk/portfolio',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'x-api-key': 'test-api-key',
              'x-user-address': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            }),
          })
        );
      });

      it('should handle portfolio with no positions', async () => {
        // Arrange
        const emptyPortfolio: Portfolio = {
          ...mockPortfolioData,
          positions: [],
        };

        const mockResponse: ApiResponse<Portfolio> = {
          code: 200,
          message: 'Portfolio fetched successfully',
          detail: null,
          data: emptyPortfolio,
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        // Act
        const result = await portfolioApi.getPortfolio();

        // Assert
        expect(result.positions).toEqual([]);
        expect(result.positions).toHaveLength(0);
        expect(result.bank).toBeDefined();
        expect(result.walletAddress).toBeDefined();
      });

      it('should handle multiple positions', async () => {
        // Arrange
        const multiPositionPortfolio: Portfolio = {
          ...mockPortfolioData,
          positions: [
            mockPortfolioData.positions[0],
            {
              vaultName: 'Aave USDC Vault',
              vaultAddress: '0x2234567890123456789012345678901234567890',
              chainId: 1,
              decimals: 6,
              depositValueInAsset: '500000',
              depositValueInUsd: '500000',
              currentValueInAsset: '510000',
              currentValueInUsd: '510000',
            },
          ],
        };

        const mockResponse: ApiResponse<Portfolio> = {
          code: 200,
          message: 'Success',
          detail: null,
          data: multiPositionPortfolio,
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        // Act
        const result = await portfolioApi.getPortfolio();

        // Assert
        expect(result.positions).toHaveLength(2);
        expect(result.positions[0].vaultName).toBe('Morpho USDC Prime Vault');
        expect(result.positions[1].vaultName).toBe('Aave USDC Vault');
      });

      it('should correctly parse profit/loss from positions', async () => {
        // Arrange
        const mockResponse: ApiResponse<Portfolio> = {
          code: 200,
          message: 'Success',
          detail: null,
          data: mockPortfolioData,
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        // Act
        const result = await portfolioApi.getPortfolio();
        const position = result.positions[0];

        // Assert - verify profit calculation data
        const depositValue = BigInt(position.depositValueInUsd);
        const currentValue = BigInt(position.currentValueInUsd);
        const profit = currentValue - depositValue;

        expect(profit).toBeGreaterThan(0n);
        expect(position.currentValueInAsset).toBe('1030000');
        expect(position.depositValueInAsset).toBe('1000000');
      });
    });

    describe('Authentication', () => {
      it('should require userAddress in config', async () => {
        // Arrange
        const configWithoutUser: ValidatedConfig = {
          ...mockConfig,
          userAddress: undefined,
        };
        const clientWithoutUser = new BaseClient(configWithoutUser);
        const api = new PortfolioApi(clientWithoutUser);

        // Act & Assert
        await expect(api.getPortfolio()).rejects.toThrow(
          'userAddress is required for authenticated endpoints'
        );
      });

      it('should send correct auth headers', async () => {
        // Arrange
        const mockResponse: ApiResponse<Portfolio> = {
          code: 200,
          message: 'Success',
          detail: null,
          data: mockPortfolioData,
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        // Act
        await portfolioApi.getPortfolio();

        // Assert
        const callArgs = fetchMock.mock.calls[0];
        const headers = callArgs[1].headers;

        expect(headers['x-api-key']).toBe('test-api-key');
        expect(headers['x-user-address']).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
      });
    });

    describe('Error Scenarios - Debugging Portfolio Failures', () => {
      it('should handle 401 unauthorized (invalid API key)', async () => {
        // Arrange
        const errorResponse: ApiResponse<null> = {
          code: 401,
          message: 'Unauthorized',
          detail: 'Invalid API key',
          data: null,
        };

        fetchMock.mockResolvedValue({
          ok: false,
          status: 401,
          json: async () => errorResponse,
        });

        // Act & Assert
        await expect(portfolioApi.getPortfolio()).rejects.toThrow(NeobankError);
        await expect(portfolioApi.getPortfolio()).rejects.toThrow('Unauthorized');
      });

      it('should handle 403 forbidden (user not authorized)', async () => {
        // Arrange
        const errorResponse: ApiResponse<null> = {
          code: 403,
          message: 'Forbidden',
          detail: 'User not authorized for this bank',
          data: null,
        };

        fetchMock.mockResolvedValue({
          ok: false,
          status: 403,
          json: async () => errorResponse,
        });

        // Act & Assert
        await expect(portfolioApi.getPortfolio()).rejects.toThrow(NeobankError);
        await expect(portfolioApi.getPortfolio()).rejects.toThrow('Forbidden');
      });

      it('should handle 404 user not found', async () => {
        // Arrange
        const errorResponse: ApiResponse<null> = {
          code: 404,
          message: 'User not found',
          detail: 'No user exists with this address',
          data: null,
        };

        fetchMock.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => errorResponse,
        });

        // Act & Assert
        await expect(portfolioApi.getPortfolio()).rejects.toThrow('User not found');
      });

      it('should handle 500 internal server error', async () => {
        // Arrange
        const errorResponse: ApiResponse<null> = {
          code: 500,
          message: 'Internal server error',
          detail: 'Database query failed',
          data: null,
        };

        fetchMock.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => errorResponse,
        });

        // Act & Assert
        await expect(portfolioApi.getPortfolio()).rejects.toThrow('Internal server error');
      });

      it('should handle malformed response data', async () => {
        // Arrange - response with incorrect structure
        const malformedResponse: ApiResponse<any> = {
          code: 200,
          message: 'Success',
          detail: null,
          data: {
            // Missing required fields
            bank: { name: 'Test' },
            // Missing walletAddress
            // Missing positions
          },
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => malformedResponse,
        });

        // Act
        const result = await portfolioApi.getPortfolio();

        // Assert - SDK returns data as-is, components should handle
        expect(result).toBeDefined();
        expect(result.bank).toBeDefined();
      });

      it('should handle network timeout', async () => {
        // Arrange
        fetchMock.mockImplementationOnce(() => new Promise((_, reject) => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          setTimeout(() => reject(error), 10);
        }));

        // Act & Assert
        await expect(portfolioApi.getPortfolio()).rejects.toThrow('Request timeout');
      });

      it('should handle CORS errors', async () => {
        // Arrange
        fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

        // Act & Assert
        await expect(portfolioApi.getPortfolio()).rejects.toThrow(NeobankError);
      });

      it('should handle null data with success status (edge case)', async () => {
        // Arrange
        const mockResponse: ApiResponse<null> = {
          code: 200,
          message: 'Success',
          detail: null,
          data: null, // Unexpected: success but no data
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        // Act & Assert
        await expect(portfolioApi.getPortfolio()).rejects.toThrow('API returned null data');
      });
    });

    describe('Edge Cases', () => {
      it('should handle very large position values', async () => {
        // Arrange
        const largeValuePortfolio: Portfolio = {
          ...mockPortfolioData,
          positions: [{
            ...mockPortfolioData.positions[0],
            depositValueInAsset: '999999999999999999',
            currentValueInAsset: '1099999999999999999',
          }],
        };

        const mockResponse: ApiResponse<Portfolio> = {
          code: 200,
          message: 'Success',
          detail: null,
          data: largeValuePortfolio,
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        // Act
        const result = await portfolioApi.getPortfolio();

        // Assert
        expect(result.positions[0].currentValueInAsset).toBe('1099999999999999999');
        // Verify BigInt can handle it
        const value = BigInt(result.positions[0].currentValueInAsset);
        expect(value).toBeGreaterThan(0n);
      });

      it('should handle zero value positions', async () => {
        // Arrange
        const zeroValuePortfolio: Portfolio = {
          ...mockPortfolioData,
          positions: [{
            ...mockPortfolioData.positions[0],
            depositValueInAsset: '0',
            currentValueInAsset: '0',
          }],
        };

        const mockResponse: ApiResponse<Portfolio> = {
          code: 200,
          message: 'Success',
          detail: null,
          data: zeroValuePortfolio,
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        });

        // Act
        const result = await portfolioApi.getPortfolio();

        // Assert
        expect(result.positions[0].currentValueInAsset).toBe('0');
      });
    });
  });
});
