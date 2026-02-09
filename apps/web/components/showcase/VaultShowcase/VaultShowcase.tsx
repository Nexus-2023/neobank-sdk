"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { useVaults } from "@raga-neobank/react"
import type { Vault } from "@raga-neobank/core"
import { RefreshCw, Grid3X3, List, LayoutList, Search, X } from "lucide-react"
import { VaultItem, type VaultItemVariant } from "./VaultItem"
import { VaultShowcaseSkeleton, type VaultShowcaseVariant } from "./VaultShowcaseSkeleton"
import { VaultShowcaseEmpty } from "./VaultShowcaseEmpty"

export interface VaultShowcaseProps {
  /** Vault data (uses internal hook if not provided) */
  vaults?: Vault[]

  /** Display variant */
  variant?: VaultShowcaseVariant

  /** Show variant toggle buttons */
  showVariantToggle?: boolean

  /** Show search filter */
  showSearch?: boolean

  /** Show chain filter */
  showChainFilter?: boolean

  /** Filter by chain IDs */
  chainIds?: number[]

  /** Only show enabled vaults */
  enabledOnly?: boolean

  /** Display options passed to VaultItem */
  showAddress?: boolean
  showChain?: boolean
  showStrategies?: boolean
  showActions?: boolean

  /** Callbacks */
  onVaultSelect?: (vault: Vault) => void
  onDeposit?: (vault: Vault) => void
  onWithdraw?: (vault: Vault) => void

  /** State overrides */
  isLoading?: boolean
  error?: Error | null

  /** Standard props */
  className?: string
}

const CHAIN_OPTIONS: { id: number; name: string }[] = [
  { id: 1, name: "Ethereum" },
  { id: 8453, name: "Base" },
  { id: 137, name: "Polygon" },
  { id: 42161, name: "Arbitrum" },
  { id: 10, name: "Optimism" },
]

function VaultShowcaseError({
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
        "rounded-xl border-2 border-dashed border-destructive/50 bg-destructive/5 p-8",
        className
      )}
    >
      <div className="text-center">
        <p className="text-sm font-medium text-destructive">
          Failed to load vaults
        </p>
        <p className="text-xs text-destructive/75 mt-1">
          {error.message || "Unknown error"}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

function VariantToggle({
  variant,
  onChange,
}: {
  variant: VaultShowcaseVariant
  onChange: (variant: VaultShowcaseVariant) => void
}) {
  const options: { value: VaultShowcaseVariant; icon: React.ReactNode; label: string }[] = [
    { value: "grid", icon: <Grid3X3 className="w-4 h-4" />, label: "Grid" },
    { value: "list", icon: <List className="w-4 h-4" />, label: "List" },
    { value: "compact", icon: <LayoutList className="w-4 h-4" />, label: "Compact" },
  ]

  return (
    <div className="inline-flex items-center rounded-lg border border-border p-1 bg-muted/30">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            variant === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={option.label}
        >
          {option.icon}
        </button>
      ))}
    </div>
  )
}

export function VaultShowcase({
  vaults: vaultsProp,
  variant: initialVariant = "grid",
  showVariantToggle = true,
  showSearch = true,
  showChainFilter = true,
  chainIds,
  enabledOnly = false,
  showAddress = true,
  showChain = true,
  showStrategies = true,
  showActions = true,
  onVaultSelect,
  onDeposit,
  onWithdraw,
  isLoading: isLoadingProp,
  error: errorProp,
  className,
}: VaultShowcaseProps) {
  const [variant, setVariant] = useState<VaultShowcaseVariant>(initialVariant)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChains, setSelectedChains] = useState<number[]>(chainIds || [])

  // Use hook if no data provided
  const {
    data: hookData,
    isLoading: hookLoading,
    error: hookError,
    refetch,
  } = useVaults()

  const vaults = vaultsProp ?? hookData
  const isLoading = isLoadingProp ?? (!vaultsProp && hookLoading)
  const error = errorProp ?? (!vaultsProp ? hookError : null)

  // Filter vaults
  const filteredVaults = useMemo(() => {
    if (!vaults) return []

    return vaults.filter((vault) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !vault.vaultName.toLowerCase().includes(query) &&
          !vault.vaultAddress.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Chain filter
      if (selectedChains.length > 0 && !selectedChains.includes(vault.chainId)) {
        return false
      }

      // Enabled filter
      if (enabledOnly && !vault.isEnabled) {
        return false
      }

      return true
    })
  }, [vaults, searchQuery, selectedChains, enabledOnly])

  const isFiltered = searchQuery.length > 0 || selectedChains.length > 0

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedChains([])
  }

  const toggleChain = (chainId: number) => {
    setSelectedChains((prev) =>
      prev.includes(chainId)
        ? prev.filter((id) => id !== chainId)
        : [...prev, chainId]
    )
  }

  // Map variant to VaultItem variant
  const itemVariant: VaultItemVariant =
    variant === "grid" ? "card" : variant === "list" ? "row" : "compact"

  // Loading state
  if (isLoading) {
    return <VaultShowcaseSkeleton variant={variant} className={className} />
  }

  // Error state
  if (error) {
    return (
      <VaultShowcaseError
        error={error instanceof Error ? error : new Error(String(error))}
        onRetry={() => refetch()}
        className={className}
      />
    )
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      {(showVariantToggle || showSearch || showChainFilter) && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vaults..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
          )}

          {/* Chain Filter */}
          {showChainFilter && (
            <div className="flex items-center gap-1">
              {CHAIN_OPTIONS.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => toggleChain(chain.id)}
                  className={cn(
                    "px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                    selectedChains.includes(chain.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {chain.name}
                </button>
              ))}
            </div>
          )}

          {/* Variant Toggle */}
          {showVariantToggle && (
            <div className="ml-auto">
              <VariantToggle variant={variant} onChange={setVariant} />
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      {vaults && vaults.length > 0 && (
        <p className="text-xs text-muted-foreground mb-3">
          {filteredVaults.length} of {vaults.length} vaults
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="ml-2 text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </p>
      )}

      {/* Empty state */}
      {filteredVaults.length === 0 ? (
        <VaultShowcaseEmpty
          isFiltered={isFiltered}
          onClearFilters={isFiltered ? clearFilters : undefined}
        />
      ) : (
        /* Vault grid/list */
        <div
          className={cn(
            variant === "grid" && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
            variant === "list" && "space-y-3",
            variant === "compact" && "space-y-2"
          )}
        >
          {filteredVaults.map((vault) => (
            <VaultItem
              key={vault.id}
              vault={vault}
              variant={itemVariant}
              showAddress={showAddress}
              showChain={showChain}
              showStrategies={showStrategies}
              showActions={showActions}
              onSelect={onVaultSelect}
              onDeposit={onDeposit}
              onWithdraw={onWithdraw}
            />
          ))}
        </div>
      )}
    </div>
  )
}
