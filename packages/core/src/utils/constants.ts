/**
 * Default configuration constants
 */
export const DEFAULT_BASE_URL = "https://backend.raga.finance"
export const DEFAULT_TIMEOUT = 30000 // 30 seconds

/**
 * API endpoints
 */
export const ENDPOINTS = {
  BUILD_DEPOSIT_PAYLOAD: "/api/v1/sdk/buildTxPayload/deposit",
  BUILD_WITHDRAW_PAYLOAD: "/api/v1/sdk/buildTxPayload/withdraw",
  BUILD_REDEEM_PAYLOAD: "/api/v1/sdk/buildTxPayload/redeem",
  GET_USER: "/api/v1/sdk/getUser",
  GET_PORTFOLIO: "/api/v1/sdk/portfolio",
  LIST_VAULTS: "/api/v1/vault/list",
  GET_VAULT: "/api/v1/vault",
} as const
