"use client"

import { cn } from "../utils"
import { Shield, TrendingUp, ArrowDownToLine } from "lucide-react"
import type { Vault } from "@raga-neobank/core"
import { formatAddress, CHAIN_CONFIG } from "../formatters"

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
      <span className="text-xs" style={{ color: "var(--raga-muted-foreground)" }}>
        Chain {chainId}
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs"
      style={{ color: "var(--raga-muted-foreground)" }}
    >
      <span className={cn("w-2 h-2 rounded-full", chain.color)} />
      {chain.name}
    </span>
  )
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className="w-2 h-2 rounded-full"
      style={{
        backgroundColor: active ? "var(--raga-positive)" : "var(--raga-muted-foreground)",
      }}
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
          "flex items-center gap-3 py-2 px-3 transition-colors",
          onSelect && "cursor-pointer",
          className,
        )}
        style={{
          borderRadius: "var(--raga-radius-lg)",
          border: "1px solid var(--raga-border)",
          backgroundColor: "var(--raga-card)",
        }}
      >
        <div
          className="w-8 h-8 flex items-center justify-center shrink-0"
          style={{
            borderRadius: "var(--raga-radius-lg)",
            backgroundColor: "color-mix(in srgb, var(--raga-primary) 10%, transparent)",
          }}
        >
          <Shield className="w-4 h-4" style={{ color: "var(--raga-primary)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate" style={{ color: "var(--raga-foreground)" }}>
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
          "flex items-center gap-4 py-4 px-4 transition-all duration-150",
          onSelect && "cursor-pointer",
          className,
        )}
        style={{
          borderRadius: "var(--raga-radius-lg)",
          border: "1px solid var(--raga-border)",
          backgroundColor: "var(--raga-card)",
        }}
      >
        <div
          className="w-10 h-10 flex items-center justify-center shrink-0"
          style={{
            borderRadius: "var(--raga-radius-lg)",
            backgroundColor: "color-mix(in srgb, var(--raga-primary) 10%, transparent)",
          }}
        >
          <Shield className="w-5 h-5" style={{ color: "var(--raga-primary)" }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate" style={{ color: "var(--raga-foreground)" }}>
              {vault.vaultName}
            </p>
            <span
              className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "var(--raga-muted)" }}
            >
              <StatusDot active={vault.isEnabled} />
              {vault.isEnabled ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {showChain && <ChainBadge chainId={vault.chainId} />}
            {showAddress && (
              <span className="text-xs" style={{ color: "var(--raga-muted-foreground)" }}>
                {formatAddress(vault.vaultAddress)}
              </span>
            )}
          </div>
        </div>

        {showStrategies && vault.strategyAllocations?.length > 0 && (
          <div className="text-right shrink-0">
            <p className="text-sm font-medium" style={{ color: "var(--raga-foreground)" }}>
              {vault.strategyAllocations.length}
            </p>
            <p className="text-xs" style={{ color: "var(--raga-muted-foreground)" }}>
              strategies
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={e => {
                e.stopPropagation()
                onDeposit?.(vault)
              }}
              disabled={!vault.depositEnabled}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                vault.depositEnabled
                  ? {
                      borderRadius: "var(--raga-radius-md)",
                      backgroundColor: "var(--raga-primary)",
                      color: "var(--raga-primary-foreground)",
                    }
                  : {
                      borderRadius: "var(--raga-radius-md)",
                      backgroundColor: "var(--raga-muted)",
                      color: "var(--raga-muted-foreground)",
                      cursor: "not-allowed",
                    }
              }
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
        "rounded-xl p-5 transition-all duration-200",
        onSelect && "cursor-pointer",
        className,
      )}
      style={{
        borderRadius: "var(--raga-radius-xl)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 flex items-center justify-center"
          style={{
            borderRadius: "var(--raga-radius-lg)",
            backgroundColor: "color-mix(in srgb, var(--raga-primary) 10%, transparent)",
          }}
        >
          <Shield className="w-5 h-5" style={{ color: "var(--raga-primary)" }} />
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
          style={{ backgroundColor: "var(--raga-muted)" }}
        >
          <StatusDot active={vault.isEnabled} />
          {vault.isEnabled ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold mb-1" style={{ color: "var(--raga-foreground)" }}>
        {vault.vaultName}
      </h3>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-4">
        {showChain && <ChainBadge chainId={vault.chainId} />}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {showAddress && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--raga-muted-foreground)" }}>
              Address
            </span>
            <span className="font-mono text-xs" style={{ color: "var(--raga-foreground)" }}>
              {formatAddress(vault.vaultAddress)}
            </span>
          </div>
        )}
        {showStrategies && vault.strategyAllocations?.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--raga-muted-foreground)" }}>
              Strategies
            </span>
            <span className="font-medium" style={{ color: "var(--raga-foreground)" }}>
              {vault.strategyAllocations.length} active
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={e => {
              e.stopPropagation()
              onDeposit?.(vault)
            }}
            disabled={!vault.depositEnabled}
            className="flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
            style={
              vault.depositEnabled
                ? {
                    borderRadius: "var(--raga-radius-lg)",
                    backgroundColor: "var(--raga-primary)",
                    color: "var(--raga-primary-foreground)",
                  }
                : {
                    borderRadius: "var(--raga-radius-lg)",
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
              onClick={e => {
                e.stopPropagation()
                onWithdraw(vault)
              }}
              className="flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
              style={{
                borderRadius: "var(--raga-radius-lg)",
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
    </div>
  )
}
