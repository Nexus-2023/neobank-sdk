"use client"

import * as React from "react"
import { useVaults } from "@raga-neobank/react"
import type { Vault } from "@raga-neobank/core"
import { Shield, TrendingUp, ArrowDownToLine, RefreshCw } from "lucide-react"
import { cn } from "./utils"
import { StatusBadge } from "./components/StatusBadge"
import { AddressDisplay } from "./components/AddressDisplay"
import { ChainBadge } from "./components/ChainBadge"

export type VaultCardVariant = "default" | "compact"

export interface VaultCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Vault ID to fetch data for (uses internal hook) */
  vaultId?: string
  /** Pass vault data directly (skips internal fetch) */
  vault?: Vault
  /** Visual variant */
  variant?: VaultCardVariant
  /** Show vault address */
  showAddress?: boolean
  /** Show chain badge */
  showChain?: boolean
  /** Show action buttons */
  showActions?: boolean
  /** Callback when deposit is clicked */
  onDeposit?: (vault: Vault) => void
  /** Callback when withdraw is clicked */
  onWithdraw?: (vault: Vault) => void
  /** Callback when card is selected */
  onSelect?: (vault: Vault) => void
  /** Override loading state */
  isLoading?: boolean
  /** Override error state */
  error?: Error | null
}

function VaultCardSkeleton({ variant = "default", className }: { variant?: VaultCardVariant; className?: string }) {
  const isCompact = variant === "compact"

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        isCompact ? "p-4" : "p-6",
        className
      )}
      style={{
        borderRadius: "var(--raga-radius-xl)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-background)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className={cn("raga-skeleton rounded-lg", isCompact ? "w-8 h-8" : "w-10 h-10")} />
        <div className="flex-1 space-y-2">
          <div className={cn("raga-skeleton rounded", isCompact ? "h-4 w-24" : "h-5 w-32")} />
          <div className="raga-skeleton rounded h-3 w-16" />
        </div>
        <div className="raga-skeleton rounded h-5 w-12" />
      </div>
      {!isCompact && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-between">
            <div className="raga-skeleton rounded h-3 w-16" />
            <div className="raga-skeleton rounded h-3 w-24" />
          </div>
          <div className="raga-skeleton rounded-lg h-10 w-full" />
        </div>
      )}
    </div>
  )
}

function VaultCardError({
  error,
  onRetry,
  className
}: {
  error: Error
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={cn("rounded-xl p-6", className)}
      style={{
        borderRadius: "var(--raga-radius-xl)",
        border: "2px dashed var(--raga-error)",
        backgroundColor: "var(--raga-error-light)",
      }}
    >
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: "var(--raga-error)" }}>
          Failed to load vault
        </p>
        <p className="text-xs mt-1 opacity-75" style={{ color: "var(--raga-error)" }}>
          {error.message || "Unknown error"}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--raga-error)" }}
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

export function VaultCard({
  vaultId,
  vault: vaultProp,
  variant = "default",
  showAddress = true,
  showChain = true,
  showActions = true,
  onDeposit,
  onWithdraw,
  onSelect,
  isLoading: isLoadingProp,
  error: errorProp,
  className,
  ...props
}: VaultCardProps) {
  // Only fetch if vaultId is provided and no vault prop
  const { data: vaults, isLoading: isFetching, error: fetchError, refetch } = useVaults()

  const vault = vaultProp || vaults?.find(v => v.id === vaultId)
  const isLoading = isLoadingProp ?? (vaultId && !vaultProp && isFetching)
  const error = errorProp ?? (vaultId && !vaultProp ? fetchError : null)

  const isCompact = variant === "compact"

  if (isLoading) {
    return <VaultCardSkeleton variant={variant} className={className} />
  }

  if (error) {
    return (
      <VaultCardError
        error={error instanceof Error ? error : new Error(String(error))}
        onRetry={() => refetch()}
        className={className}
      />
    )
  }

  if (!vault) {
    return (
      <VaultCardError
        error={new Error("Vault not found")}
        className={className}
      />
    )
  }

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(vault)
    }
  }

  return (
    <div
      onClick={onSelect ? handleCardClick : undefined}
      className={cn(
        "transition-all duration-200",
        onSelect && "cursor-pointer",
        isCompact ? "p-4" : "p-6",
        className
      )}
      style={{
        borderRadius: "var(--raga-radius-xl)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-background)",
        boxShadow: "var(--raga-shadow-sm)",
      }}
      {...props}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex items-center justify-center rounded-lg",
            isCompact ? "w-8 h-8" : "w-10 h-10"
          )}
          style={{ backgroundColor: "color-mix(in srgb, var(--raga-primary) 10%, transparent)" }}
        >
          <Shield
            className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")}
            style={{ color: "var(--raga-primary)" }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={cn("font-semibold truncate", isCompact ? "text-sm" : "text-base")}
            style={{ color: "var(--raga-foreground)" }}
          >
            {vault.vaultName}
          </h3>
          <StatusBadge
            variant={vault.isEnabled ? "success" : "neutral"}
            dot
            className="mt-1"
          >
            {vault.isEnabled ? "Active" : "Inactive"}
          </StatusBadge>
        </div>

        {showChain && <ChainBadge chainId={vault.chainId} />}
      </div>

      {/* Details (not shown in compact) */}
      {!isCompact && (
        <div className="mt-4 space-y-3">
          {showAddress && (
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--raga-muted-foreground)" }}>Address</span>
              <AddressDisplay address={vault.vaultAddress} />
            </div>
          )}

          {vault.strategyAllocations && vault.strategyAllocations.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--raga-muted-foreground)" }}>Strategies</span>
              <span className="font-medium" style={{ color: "var(--raga-foreground)" }}>
                {vault.strategyAllocations.length} active
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && !isCompact && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeposit?.(vault)
            }}
            disabled={!vault.depositEnabled}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            style={
              vault.depositEnabled
                ? {
                    backgroundColor: "var(--raga-primary)",
                    color: "var(--raga-primary-foreground)",
                  }
                : {
                    backgroundColor: "var(--raga-muted)",
                    color: "var(--raga-muted-foreground)",
                    cursor: "not-allowed",
                  }
            }
          >
            <TrendingUp className="w-4 h-4" />
            Deposit
          </button>

          {onWithdraw && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onWithdraw(vault)
              }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                border: "1px solid var(--raga-border)",
                color: "var(--raga-foreground)",
              }}
            >
              <ArrowDownToLine className="w-4 h-4" />
              Withdraw
            </button>
          )}
        </div>
      )}

      {/* Compact action */}
      {showActions && isCompact && vault.depositEnabled && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDeposit?.(vault)
          }}
          className="mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-colors"
          style={{
            backgroundColor: "var(--raga-primary)",
            color: "var(--raga-primary-foreground)",
          }}
        >
          Deposit
        </button>
      )}
    </div>
  )
}
