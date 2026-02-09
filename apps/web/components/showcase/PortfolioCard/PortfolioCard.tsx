"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { usePortfolio } from "@raga-neobank/react"
import type { Portfolio, PortfolioPosition } from "@raga-neobank/core"
import { RefreshCw, Wallet, Building2 } from "lucide-react"
import { formatCurrency, formatPercentage, formatAddress, calculatePnL } from "../shared/formatters"
import { PortfolioCardSkeleton, type PortfolioCardVariant } from "./PortfolioCardSkeleton"
import { PortfolioCardEmpty } from "./PortfolioCardEmpty"
import { PositionRow } from "./PositionRow"
import { ValueDisplay } from "./ValueDisplay"

export interface PortfolioCardProps {
  /** Portfolio data (uses internal hook if not provided) */
  portfolio?: Portfolio

  /** Visual variant */
  variant?: PortfolioCardVariant

  /** Display options */
  showBankInfo?: boolean
  showAddress?: boolean
  showChange?: boolean
  showPositionDetails?: boolean
  currencyDisplay?: "usd" | "asset" | "both"

  /** Callbacks */
  onPositionClick?: (position: PortfolioPosition) => void
  onDepositClick?: () => void

  /** State overrides (for demos) */
  isLoading?: boolean
  error?: Error | null

  /** Standard props */
  className?: string
}

interface PortfolioTotals {
  totalDeposited: number
  totalCurrent: number
  totalPnL: number
  pnlPercentage: number
  isPositive: boolean
  positionCount: number
}

function calculateTotals(positions?: PortfolioPosition[]): PortfolioTotals {
  if (!positions || positions.length === 0) {
    return {
      totalDeposited: 0,
      totalCurrent: 0,
      totalPnL: 0,
      pnlPercentage: 0,
      isPositive: true,
      positionCount: 0,
    }
  }

  const totalDeposited = positions.reduce(
    (sum, p) => sum + parseFloat(p.depositValueInUsd),
    0
  )
  const totalCurrent = positions.reduce(
    (sum, p) => sum + parseFloat(p.currentValueInUsd),
    0
  )
  const totalPnL = totalCurrent - totalDeposited
  const pnlPercentage = totalDeposited > 0 ? (totalPnL / totalDeposited) * 100 : 0

  return {
    totalDeposited,
    totalCurrent,
    totalPnL,
    pnlPercentage,
    isPositive: totalPnL >= 0,
    positionCount: positions.length,
  }
}

function PortfolioCardError({
  error,
  onRetry,
  className,
}: {
  error: Error
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed border-destructive/50 bg-destructive/5 p-6",
        className
      )}
    >
      <div className="text-center">
        <p className="text-sm font-medium text-destructive">
          Failed to load portfolio
        </p>
        <p className="text-xs text-destructive/75 mt-1">
          {error.message || "Unknown error"}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

function PortfolioCardMinimal({
  totals,
  showChange,
  className,
}: {
  totals: PortfolioTotals
  showChange?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-lg font-bold text-foreground">
        {formatCurrency(totals.totalCurrent)}
      </span>
      {showChange && totals.positionCount > 0 && (
        <span
          className={cn(
            "text-sm font-medium",
            totals.isPositive
              ? "text-[var(--showcase-positive)]"
              : "text-[var(--showcase-negative)]"
          )}
        >
          {formatPercentage(totals.pnlPercentage)}
        </span>
      )}
    </div>
  )
}

function PortfolioCardCompact({
  portfolio,
  totals,
  showChange,
  className,
}: {
  portfolio: Portfolio
  totals: PortfolioTotals
  showChange?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Portfolio Value</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(totals.totalCurrent)}
            </span>
            {showChange && totals.positionCount > 0 && (
              <span
                className={cn(
                  "text-sm font-medium",
                  totals.isPositive
                    ? "text-[var(--showcase-positive)]"
                    : "text-[var(--showcase-negative)]"
                )}
              >
                {formatPercentage(totals.pnlPercentage)}
              </span>
            )}
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {totals.positionCount} position{totals.positionCount !== 1 ? "s" : ""}
      </p>
    </div>
  )
}

export function PortfolioCard({
  portfolio: portfolioProp,
  variant = "default",
  showBankInfo = true,
  showAddress = true,
  showChange = true,
  showPositionDetails = false,
  currencyDisplay = "usd",
  onPositionClick,
  onDepositClick,
  isLoading: isLoadingProp,
  error: errorProp,
  className,
}: PortfolioCardProps) {
  // Use hook if no data provided
  const {
    data: hookData,
    isLoading: hookLoading,
    error: hookError,
    refetch,
  } = usePortfolio()

  const portfolio = portfolioProp ?? hookData
  const isLoading = isLoadingProp ?? (!portfolioProp && hookLoading)
  const error = errorProp ?? (!portfolioProp ? hookError : null)

  // Calculate totals
  const totals = useMemo(
    () => calculateTotals(portfolio?.positions),
    [portfolio]
  )

  // Loading state
  if (isLoading) {
    return <PortfolioCardSkeleton variant={variant} className={className} />
  }

  // Error state
  if (error) {
    return (
      <PortfolioCardError
        error={error instanceof Error ? error : new Error(String(error))}
        onRetry={() => refetch()}
        className={className}
      />
    )
  }

  // Empty state
  if (!portfolio?.positions?.length) {
    return <PortfolioCardEmpty onDeposit={onDepositClick} className={className} />
  }

  // Minimal variant
  if (variant === "minimal") {
    return (
      <PortfolioCardMinimal
        totals={totals}
        showChange={showChange}
        className={className}
      />
    )
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <PortfolioCardCompact
        portfolio={portfolio}
        totals={totals}
        showChange={showChange}
        className={className}
      />
    )
  }

  // Default full variant
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden",
        "shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            {showBankInfo && portfolio.bank && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Building2 className="w-3 h-3" />
                <span>{portfolio.bank.name}</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mb-1">Total Value</p>
            <ValueDisplay
              value={totals.totalCurrent}
              change={
                showChange
                  ? {
                      absolute: totals.totalPnL,
                      percentage: totals.pnlPercentage,
                      isPositive: totals.isPositive,
                    }
                  : undefined
              }
              size="lg"
              showChange={showChange}
            />
            {showAddress && portfolio.walletAddress && (
              <p className="text-xs text-muted-foreground mt-2">
                {formatAddress(portfolio.walletAddress)}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Positions */}
      <div className="p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">
          {totals.positionCount} Position{totals.positionCount !== 1 ? "s" : ""}
        </p>
        <div className="space-y-2">
          {portfolio.positions.map((position, index) => (
            <PositionRow
              key={`${position.vaultAddress}-${index}`}
              position={position}
              showDetails={showPositionDetails}
              currencyDisplay={currencyDisplay}
              onClick={onPositionClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
