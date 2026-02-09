"use client"

import { cn } from "@/lib/utils"
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react"
import type { PortfolioPosition } from "@raga-neobank/core"
import { formatCurrency, formatPercentage, calculatePnL } from "../shared/formatters"

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  8453: "Base",
  137: "Polygon",
  42161: "Arbitrum",
  10: "Optimism",
  43114: "Avalanche",
  56: "BSC",
}

export interface PositionRowProps {
  position: PortfolioPosition
  showDetails?: boolean
  currencyDisplay?: "usd" | "asset" | "both"
  onClick?: (position: PortfolioPosition) => void
  className?: string
}

export function PositionRow({
  position,
  showDetails = false,
  currencyDisplay = "usd",
  onClick,
  className,
}: PositionRowProps) {
  const pnl = calculatePnL(position.depositValueInUsd, position.currentValueInUsd)
  const chainName = CHAIN_NAMES[position.chainId] || `Chain ${position.chainId}`

  const handleClick = () => {
    onClick?.(position)
  }

  return (
    <div
      onClick={onClick ? handleClick : undefined}
      className={cn(
        "flex items-center justify-between py-3 px-4 rounded-lg",
        "border border-border bg-card",
        "transition-colors duration-150",
        onClick && "cursor-pointer hover:bg-muted/50",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            pnl.isPositive ? "bg-[var(--showcase-positive)]/10" : "bg-[var(--showcase-negative)]/10"
          )}
        >
          {pnl.isPositive ? (
            <TrendingUp className="w-4 h-4 text-[var(--showcase-positive)]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-[var(--showcase-negative)]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate">{position.vaultName}</p>
          <p className="text-xs text-muted-foreground">{chainName}</p>
        </div>
      </div>

      <div className="text-right shrink-0 ml-4">
        <p className="font-semibold text-foreground">
          {currencyDisplay === "usd" || currencyDisplay === "both"
            ? formatCurrency(position.currentValueInUsd)
            : position.currentValueInAsset}
        </p>
        <p
          className={cn(
            "text-xs font-medium",
            pnl.isPositive
              ? "text-[var(--showcase-positive)]"
              : "text-[var(--showcase-negative)]"
          )}
        >
          {formatPercentage(pnl.percentage)}
        </p>
      </div>

      {onClick && (
        <ChevronRight className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
      )}
    </div>
  )
}
