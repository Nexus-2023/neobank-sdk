"use client"

import { cn } from "../utils"
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react"
import type { PortfolioPosition } from "@raga-neobank/core"
import { formatCurrency, formatPercentage, calculatePnL, getChainName } from "../formatters"

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
  const chainName = getChainName(position.chainId)

  const handleClick = () => {
    onClick?.(position)
  }

  return (
    <div
      onClick={onClick ? handleClick : undefined}
      className={cn(
        "flex items-center justify-between py-3 px-4 rounded-lg transition-colors duration-150",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        borderRadius: "var(--raga-radius-lg)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            borderRadius: "var(--raga-radius-lg)",
            backgroundColor: pnl.isPositive
              ? "color-mix(in srgb, var(--raga-positive) 10%, transparent)"
              : "color-mix(in srgb, var(--raga-negative) 10%, transparent)",
          }}
        >
          {pnl.isPositive ? (
            <TrendingUp className="w-4 h-4" style={{ color: "var(--raga-positive)" }} />
          ) : (
            <TrendingDown className="w-4 h-4" style={{ color: "var(--raga-negative)" }} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium truncate" style={{ color: "var(--raga-foreground)" }}>
            {position.vaultName}
          </p>
          <p className="text-xs" style={{ color: "var(--raga-muted-foreground)" }}>
            {chainName}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0 ml-4">
        <p className="font-semibold" style={{ color: "var(--raga-foreground)" }}>
          {currencyDisplay === "usd" || currencyDisplay === "both"
            ? formatCurrency(position.currentValueInUsd)
            : position.currentValueInAsset}
        </p>
        <p
          className="text-xs font-medium"
          style={{
            color: pnl.isPositive
              ? "var(--raga-positive)"
              : "var(--raga-negative)",
          }}
        >
          {formatPercentage(pnl.percentage)}
        </p>
      </div>

      {onClick && (
        <ChevronRight
          className="w-4 h-4 ml-2 shrink-0"
          style={{ color: "var(--raga-muted-foreground)" }}
        />
      )}
    </div>
  )
}
