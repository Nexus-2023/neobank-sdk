"use client"

import { cn } from "@/lib/utils"
import { Shield, TrendingUp, ArrowDownToLine, ExternalLink } from "lucide-react"
import type { Vault } from "@raga-neobank/core"
import { formatAddress } from "../shared/formatters"

const CHAIN_CONFIG: Record<number, { name: string; color: string }> = {
  1: { name: "Ethereum", color: "bg-blue-500" },
  8453: { name: "Base", color: "bg-blue-600" },
  137: { name: "Polygon", color: "bg-purple-500" },
  42161: { name: "Arbitrum", color: "bg-blue-400" },
  10: { name: "Optimism", color: "bg-red-500" },
  43114: { name: "Avalanche", color: "bg-red-600" },
  56: { name: "BSC", color: "bg-yellow-500" },
}

export type VaultItemVariant = "card" | "row" | "compact"

export interface VaultItemProps {
  vault: Vault
  variant?: VaultItemVariant
  showAddress?: boolean
  showChain?: boolean
  showStrategies?: boolean
  showActions?: boolean
  onDeposit?: (vault: Vault) => void
  onWithdraw?: (vault: Vault) => void
  onSelect?: (vault: Vault) => void
  className?: string
}

function ChainBadge({ chainId }: { chainId: number }) {
  const chain = CHAIN_CONFIG[chainId]
  if (!chain) {
    return (
      <span className="text-xs text-muted-foreground">
        Chain {chainId}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn("w-2 h-2 rounded-full", chain.color)} />
      {chain.name}
    </span>
  )
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "w-2 h-2 rounded-full",
        active ? "bg-[var(--showcase-positive)]" : "bg-muted-foreground"
      )}
    />
  )
}

export function VaultItem({
  vault,
  variant = "card",
  showAddress = true,
  showChain = true,
  showStrategies = true,
  showActions = true,
  onDeposit,
  onWithdraw,
  onSelect,
  className,
}: VaultItemProps) {
  const handleClick = () => onSelect?.(vault)

  // Compact variant - minimal inline display
  if (variant === "compact") {
    return (
      <div
        onClick={onSelect ? handleClick : undefined}
        className={cn(
          "flex items-center gap-3 py-2 px-3 rounded-lg",
          "border border-border bg-card",
          "transition-colors",
          onSelect && "cursor-pointer hover:bg-muted/50",
          className
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">
            {vault.vaultName}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusDot active={vault.isEnabled} />
          {showChain && <ChainBadge chainId={vault.chainId} />}
        </div>
      </div>
    )
  }

  // Row variant - horizontal list item
  if (variant === "row") {
    return (
      <div
        onClick={onSelect ? handleClick : undefined}
        className={cn(
          "flex items-center gap-4 py-4 px-4 rounded-lg",
          "border border-border bg-card",
          "transition-all duration-150",
          "hover:shadow-sm hover:border-primary/20",
          onSelect && "cursor-pointer",
          className
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground truncate">
              {vault.vaultName}
            </p>
            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-muted">
              <StatusDot active={vault.isEnabled} />
              {vault.isEnabled ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {showChain && <ChainBadge chainId={vault.chainId} />}
            {showAddress && (
              <span className="text-xs text-muted-foreground">
                {formatAddress(vault.vaultAddress)}
              </span>
            )}
          </div>
        </div>

        {showStrategies && vault.strategyAllocations?.length > 0 && (
          <div className="text-right shrink-0">
            <p className="text-sm font-medium text-foreground">
              {vault.strategyAllocations.length}
            </p>
            <p className="text-xs text-muted-foreground">strategies</p>
          </div>
        )}

        {showActions && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeposit?.(vault)
              }}
              disabled={!vault.depositEnabled}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                vault.depositEnabled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Deposit
            </button>
          </div>
        )}
      </div>
    )
  }

  // Card variant - default grid card
  return (
    <div
      onClick={onSelect ? handleClick : undefined}
      className={cn(
        "rounded-xl border border-border bg-card p-5",
        "transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        onSelect && "cursor-pointer",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-muted">
          <StatusDot active={vault.isEnabled} />
          {vault.isEnabled ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-1">{vault.vaultName}</h3>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-4">
        {showChain && <ChainBadge chainId={vault.chainId} />}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {showAddress && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Address</span>
            <span className="font-mono text-xs text-foreground">
              {formatAddress(vault.vaultAddress)}
            </span>
          </div>
        )}
        {showStrategies && vault.strategyAllocations?.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Strategies</span>
            <span className="font-medium text-foreground">
              {vault.strategyAllocations.length} active
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeposit?.(vault)
            }}
            disabled={!vault.depositEnabled}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
              "flex items-center justify-center gap-1.5",
              vault.depositEnabled
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
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
              className="flex-1 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowDownToLine className="w-4 h-4" />
              Withdraw
            </button>
          )}
        </div>
      )}
    </div>
  )
}
