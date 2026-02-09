/**
 * Shared formatting utilities for @raga-neobank/ui components
 */

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(
  value: string | number,
  options: {
    decimals?: number
    showSign?: boolean
    compact?: boolean
  } = {}
): string {
  const { decimals = 2, showSign = false, compact = false } = options

  const num = typeof value === "string" ? parseFloat(value) : value

  if (isNaN(num)) return "$0.00"

  const sign = showSign && num > 0 ? "+" : ""

  if (compact && Math.abs(num) >= 1000) {
    const suffixes = ["", "K", "M", "B", "T"]
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3)
    const scaled = num / Math.pow(1000, tier)
    return `${sign}$${scaled.toFixed(1)}${suffixes[tier]}`
  }

  return `${sign}$${num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

/**
 * Format a number as percentage
 */
export function formatPercentage(
  value: string | number,
  options: {
    decimals?: number
    showSign?: boolean
  } = {}
): string {
  const { decimals = 2, showSign = true } = options

  const num = typeof value === "string" ? parseFloat(value) : value

  if (isNaN(num)) return "0.00%"

  const sign = showSign && num > 0 ? "+" : ""

  return `${sign}${num.toFixed(decimals)}%`
}

/**
 * Format an Ethereum address with truncation
 */
export function formatAddress(
  address: string,
  options: {
    prefixLength?: number
    suffixLength?: number
  } = {}
): string {
  const { prefixLength = 6, suffixLength = 4 } = options

  if (!address || address.length < prefixLength + suffixLength + 3) {
    return address || ""
  }

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`
}

/**
 * Format asset amount with decimals
 */
export function formatAssetAmount(
  amount: string | number,
  decimals: number = 6,
  displayDecimals: number = 4
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount

  if (isNaN(num)) return "0"

  const adjusted = num / Math.pow(10, decimals)

  return adjusted.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  })
}

/**
 * Calculate PnL (profit and loss)
 */
export function calculatePnL(
  depositValue: string | number,
  currentValue: string | number
): {
  absolute: number
  percentage: number
  isPositive: boolean
} {
  const deposit = typeof depositValue === "string" ? parseFloat(depositValue) : depositValue
  const current = typeof currentValue === "string" ? parseFloat(currentValue) : currentValue

  const absolute = current - deposit
  const percentage = deposit > 0 ? (absolute / deposit) * 100 : 0

  return {
    absolute,
    percentage,
    isPositive: absolute >= 0,
  }
}

/**
 * Format gas estimate
 */
export function formatGas(gasEstimate: string): string {
  const gas = parseInt(gasEstimate, 10)
  if (isNaN(gas)) return gasEstimate
  if (gas >= 1000000) return `${(gas / 1000000).toFixed(2)}M`
  if (gas >= 1000) return `${(gas / 1000).toFixed(1)}K`
  return gas.toString()
}

/**
 * Format gas cost in Wei to ETH
 */
export function formatGasCost(gasCostInWei: string): string {
  const cost = parseFloat(gasCostInWei)
  if (isNaN(cost)) return gasCostInWei
  const costInEth = cost / 1e18
  if (costInEth < 0.0001) return "< 0.0001 ETH"
  return `${costInEth.toFixed(4)} ETH`
}

/**
 * Format date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

/**
 * Chain configuration
 */
export const CHAIN_CONFIG: Record<number, { name: string; color: string }> = {
  1: { name: "Ethereum", color: "bg-blue-500" },
  8453: { name: "Base", color: "bg-blue-600" },
  137: { name: "Polygon", color: "bg-purple-500" },
  42161: { name: "Arbitrum", color: "bg-blue-400" },
  10: { name: "Optimism", color: "bg-red-500" },
  43114: { name: "Avalanche", color: "bg-red-600" },
  56: { name: "BSC", color: "bg-yellow-500" },
}

export function getChainName(chainId: number): string {
  return CHAIN_CONFIG[chainId]?.name || `Chain ${chainId}`
}
