/**
 * Building Transaction Payloads
 *
 * Learn how to build simulation-verified transaction payloads
 * for deposits, withdrawals, and redemptions.
 */

import { NeobankSDK } from "@raga-neobank/core"
import type {
  TransactionPayload,
  TransactionPayloadRequest,
  TransactionStep,
} from "@raga-neobank/core"

async function buildDeposit(
  sdk: NeobankSDK,
  vaultId: string,
  amount: string,
  chainId: number = 8453
): Promise<TransactionPayload> {
  const payload = await sdk.transactions.buildDepositPayload({
    vaultId,
    amount,
    chainId,
  })

  console.log("Deposit payload built:", {
    vault: payload.vaultName,
    steps: payload.txs.length,
    input: `${payload.summary.inputAmount} ${payload.summary.assetSymbol}`,
    output: `${payload.summary.preview.expectedOutput} ${payload.summary.preview.outputSymbol}`,
  })

  return payload
}

async function buildWithdraw(
  sdk: NeobankSDK,
  vaultId: string,
  amount: string,
  chainId: number = 8453
): Promise<TransactionPayload> {
  const payload = await sdk.transactions.buildWithdrawPayload({
    vaultId,
    amount,
    chainId,
  })

  return payload
}

async function buildRedeem(
  sdk: NeobankSDK,
  vaultId: string,
  amount: string,
  chainId: number = 8453
): Promise<TransactionPayload> {
  const payload = await sdk.transactions.buildRedeemPayload({
    vaultId,
    amount,
    chainId,
  })

  return payload
}

function analyzeTransactionSteps(payload: TransactionPayload) {
  const steps = payload.txs

  console.log("\nTransaction Steps:")
  steps.forEach((step, index) => {
    console.log(`\nStep ${step.step}:`)
    console.log(`  Type: ${step.type}`)
    console.log(`  Description: ${step.description}`)
    console.log(`  To: ${step.to}`)
    console.log(`  Gas Estimate: ${step.gasEstimate}`)
    console.log(`  Simulation: ${step.simulationSuccess ? "PASSED" : "FAILED"}`)
  })

  const allPassed = steps.every(s => s.simulationSuccess)
  console.log(`\nAll simulations passed: ${allPassed}`)

  return { steps, allPassed }
}

function calculateTotalGas(payload: TransactionPayload): bigint {
  return payload.txs.reduce(
    (total, tx) => total + BigInt(tx.gasEstimate || "0"),
    0n
  )
}

function formatGasEstimate(gas: bigint, gasPrice: bigint = 1000000000n): string {
  const costWei = gas * gasPrice
  const costEth = Number(costWei) / 1e18
  return `${costEth.toFixed(6)} ETH`
}

function checkWarnings(payload: TransactionPayload): string[] {
  const warnings = payload.summary.warnings || []

  if (warnings.length > 0) {
    console.log("\nWarnings:")
    warnings.forEach(w => console.log(`  - ${w}`))
  }

  return warnings
}

function hasEnoughBalance(payload: TransactionPayload): boolean {
  const required = BigInt(payload.summary.inputAmount)
  const available = BigInt(payload.summary.userBalance || "0")

  const sufficient = available >= required

  if (!sufficient) {
    console.log("Insufficient balance:")
    console.log(`  Required: ${payload.summary.inputAmount}`)
    console.log(`  Available: ${payload.summary.userBalance}`)
  }

  return sufficient
}

interface WalletTransaction {
  to: string
  data: string
  value: string
  gasLimit: string
}

function prepareForWallet(step: TransactionStep): WalletTransaction {
  return {
    to: step.to,
    data: step.data,
    value: step.value,
    gasLimit: step.gasEstimate,
  }
}

function prepareAllTransactions(payload: TransactionPayload): WalletTransaction[] {
  return payload.txs.map(prepareForWallet)
}

async function transactionExample() {
  const sdk = new NeobankSDK({
    apiKey: process.env.NEXT_PUBLIC_NEOBANK_API_KEY!,
    userAddress: process.env.NEXT_PUBLIC_USER_ADDRESS,
  })

  const vaultId = "6e9b8e9f-bb3e-4e8a-b9ea-f3ab27449b38"
  const amount = "1000000"

  const payload = await buildDeposit(sdk, vaultId, amount)

  const { allPassed } = analyzeTransactionSteps(payload)

  if (!allPassed) {
    throw new Error("Transaction simulation failed")
  }

  if (!hasEnoughBalance(payload)) {
    throw new Error("Insufficient balance")
  }

  const warnings = checkWarnings(payload)

  const totalGas = calculateTotalGas(payload)
  console.log(`\nTotal Gas: ${totalGas.toString()}`)
  console.log(`Estimated Cost: ${formatGasEstimate(totalGas)}`)

  const transactions = prepareAllTransactions(payload)
  console.log(`\nReady to send ${transactions.length} transaction(s)`)

  return { payload, transactions, warnings }
}

export {
  buildDeposit,
  buildWithdraw,
  buildRedeem,
  analyzeTransactionSteps,
  calculateTotalGas,
  formatGasEstimate,
  checkWarnings,
  hasEnoughBalance,
  prepareForWallet,
  prepareAllTransactions,
  transactionExample,
}

/**
 * Notes
 *
 * Transaction amounts are in smallest units (wei for ETH, 6 decimals for USDC).
 * Example: 1 USDC = "1000000" (not "1" or "1.0")
 *
 * Always check simulationSuccess for each step before proceeding.
 * The txs array contains pre-signed transaction data ready for wallet.
 * Execute transactions in order (step 1, then step 2, etc.)
 *
 * Common transaction types:
 * - "approve": Token approval for vault contract
 * - "deposit": Actual deposit into vault
 * - "withdraw": Withdraw from vault
 * - "redeem": Redeem vault shares for underlying
 *
 * Gas estimates are conservative - actual gas may be lower.
 * Check warnings[] for any important information about the transaction.
 */
