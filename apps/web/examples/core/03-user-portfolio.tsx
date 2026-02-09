/**
 * User Profile and Portfolio
 *
 * Learn how to fetch authenticated user data including profile
 * information and portfolio positions.
 */

import { NeobankSDK } from "@raga-neobank/core"
import type { User, Portfolio, PortfolioPosition } from "@raga-neobank/core"

async function getUserProfile(sdk: NeobankSDK): Promise<User> {
  const user = await sdk.user.getUser()

  console.log("User profile:", {
    id: user.id,
    address: user.address,
    isEnabled: user.isEnabled,
    bankId: user.bankId,
    createdOn: user.createdOn,
  })

  return user
}

async function getPortfolio(sdk: NeobankSDK): Promise<Portfolio> {
  const portfolio = await sdk.portfolio.getPortfolio()

  console.log("Portfolio:", {
    bank: portfolio.bank.name,
    wallet: portfolio.walletAddress,
    positions: portfolio.positions.length,
  })

  return portfolio
}

interface PortfolioMetrics {
  totalDeposited: number
  totalCurrent: number
  totalPnL: number
  pnlPercentage: number
  positionCount: number
}

function calculatePortfolioMetrics(portfolio: Portfolio): PortfolioMetrics {
  const positions = portfolio.positions

  const totalDeposited = positions.reduce(
    (sum, pos) => sum + parseFloat(pos.depositValueInUsd),
    0
  )

  const totalCurrent = positions.reduce(
    (sum, pos) => sum + parseFloat(pos.currentValueInUsd),
    0
  )

  const totalPnL = totalCurrent - totalDeposited
  const pnlPercentage = totalDeposited > 0
    ? (totalPnL / totalDeposited) * 100
    : 0

  return {
    totalDeposited,
    totalCurrent,
    totalPnL,
    pnlPercentage,
    positionCount: positions.length,
  }
}

interface PositionWithPnL extends PortfolioPosition {
  pnl: number
  pnlPercentage: number
  isProfit: boolean
}

function calculatePositionPnL(position: PortfolioPosition): PositionWithPnL {
  const deposited = parseFloat(position.depositValueInUsd)
  const current = parseFloat(position.currentValueInUsd)
  const pnl = current - deposited
  const pnlPercentage = deposited > 0 ? (pnl / deposited) * 100 : 0

  return {
    ...position,
    pnl,
    pnlPercentage,
    isProfit: pnl >= 0,
  }
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

function formatPosition(position: PositionWithPnL) {
  return {
    vault: position.vaultName,
    deposited: formatUSD(parseFloat(position.depositValueInUsd)),
    current: formatUSD(parseFloat(position.currentValueInUsd)),
    pnl: formatUSD(position.pnl),
    pnlPercentage: formatPercentage(position.pnlPercentage),
    status: position.isProfit ? "Profit" : "Loss",
  }
}

async function portfolioExample() {
  const sdk = new NeobankSDK({
    apiKey: process.env.NEXT_PUBLIC_NEOBANK_API_KEY!,
    userAddress: process.env.NEXT_PUBLIC_USER_ADDRESS,
  })

  const user = await getUserProfile(sdk)
  console.log(`Welcome, ${user.address}`)

  const portfolio = await getPortfolio(sdk)

  const metrics = calculatePortfolioMetrics(portfolio)
  console.log("\nPortfolio Summary:")
  console.log(`Total Deposited: ${formatUSD(metrics.totalDeposited)}`)
  console.log(`Current Value: ${formatUSD(metrics.totalCurrent)}`)
  console.log(`Total PnL: ${formatUSD(metrics.totalPnL)} (${formatPercentage(metrics.pnlPercentage)})`)

  console.log("\nPositions:")
  portfolio.positions.forEach(pos => {
    const withPnL = calculatePositionPnL(pos)
    console.log(formatPosition(withPnL))
  })

  return { user, portfolio, metrics }
}

export {
  getUserProfile,
  getPortfolio,
  calculatePortfolioMetrics,
  calculatePositionPnL,
  formatUSD,
  formatPercentage,
  portfolioExample,
}

/**
 * Notes
 *
 * Both endpoints require authentication (x-api-key and x-user-address headers).
 * The SDK automatically sends these headers when userAddress is configured.
 *
 * Portfolio values are returned as strings to preserve precision.
 * Always use parseFloat() when doing calculations with USD values.
 *
 * For asset values (depositValueInAsset, currentValueInAsset), use the
 * decimals field to convert to human-readable format:
 * realValue = parseInt(assetValue) / Math.pow(10, decimals)
 *
 * The bank object contains information about the managing institution.
 */
