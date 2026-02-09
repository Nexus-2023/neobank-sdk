/**
 * Basic SDK Setup
 *
 * Learn how to initialize and configure the @raga-neobank/core SDK.
 */

import { NeobankSDK } from "@raga-neobank/core"

const sdkMinimal = new NeobankSDK({
  apiKey: "your-api-key",
})

const sdkFull = new NeobankSDK({
  apiKey: "your-api-key",
  userAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  baseUrl: "https://backend.raga.finance",
  timeout: 30000,
})

function createSDK() {
  const apiKey = process.env.NEXT_PUBLIC_NEOBANK_API_KEY
  const userAddress = process.env.NEXT_PUBLIC_USER_ADDRESS

  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_NEOBANK_API_KEY is required")
  }

  return new NeobankSDK({
    apiKey,
    userAddress: userAddress?.toLowerCase(),
  })
}

async function example() {
  const sdk = createSDK()

  const vaults = await sdk.vaults.list()
  const user = await sdk.user.getUser()
  const portfolio = await sdk.portfolio.getPortfolio()

  const depositPayload = await sdk.transactions.buildDepositPayload({
    vaultId: "vault-uuid",
    amount: "1000000",
    chainId: 8453,
  })

  return { vaults, user, portfolio, depositPayload }
}

export { createSDK, example }

/**
 * Notes
 *
 * The SDK works in both Node.js and browsers.
 *
 * For Next.js, use NEXT_PUBLIC_ prefix for client-side env vars.
 *
 * Authenticated endpoints (user, portfolio, transactions) require userAddress.
 * Public endpoints (vaults.list, vaults.get) work without it.
 *
 * The SDK instance can be reused throughout your application.
 */
