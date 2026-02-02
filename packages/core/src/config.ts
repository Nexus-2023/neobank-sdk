import { DEFAULT_BASE_URL, DEFAULT_TIMEOUT } from './utils/constants';
import { isNonEmptyString, isValidEthereumAddress } from './utils/validation';

/**
 * Configuration options for the Neobank SDK
 */
export interface NeobankConfig {
  /**
   * API key for authentication (required)
   */
  apiKey: string;

  /**
   * User's Ethereum address (optional, can be set per request)
   */
  userAddress?: string;

  /**
   * Base URL for the API (defaults to production URL)
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds (defaults to 30000ms)
   */
  timeout?: number;
}

/**
 * Validated and normalized configuration
 */
export interface ValidatedConfig {
  apiKey: string;
  userAddress?: string;
  baseUrl: string;
  timeout: number;
}

/**
 * Validates the SDK configuration
 * @throws {Error} If configuration is invalid
 */
export function validateConfig(config: NeobankConfig): ValidatedConfig {
  if (!isNonEmptyString(config.apiKey)) {
    throw new Error('apiKey is required and must be a non-empty string');
  }

  if (config.userAddress && !isValidEthereumAddress(config.userAddress)) {
    throw new Error('userAddress must be a valid Ethereum address (0x-prefixed 40-character hex string)');
  }

  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  const timeout = config.timeout || DEFAULT_TIMEOUT;

  if (timeout <= 0) {
    throw new Error('timeout must be a positive number');
  }

  return {
    apiKey: config.apiKey,
    userAddress: config.userAddress?.toLowerCase(),
    baseUrl,
    timeout,
  };
}
