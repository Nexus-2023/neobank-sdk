/**
 * Vault Selection Flow
 *
 * A complete vault browsing and selection flow using the Raga SDK.
 */

"use client"

import { useState, useMemo } from "react"
import { useVaults, useVault } from "@raga-neobank/react"
import type { Vault } from "@raga-neobank/core"

const CHAINS = {
  8453: { name: "Base", color: "#0052FF" },
  1: { name: "Ethereum", color: "#627EEA" },
  137: { name: "Polygon", color: "#8247E5" },
  42161: { name: "Arbitrum", color: "#28A0F0" },
} as const

type ChainId = keyof typeof CHAINS

interface VaultFilters {
  search: string
  chainId: ChainId | null
  activeOnly: boolean
  depositOpen: boolean
}

const defaultFilters: VaultFilters = {
  search: "",
  chainId: null,
  activeOnly: true,
  depositOpen: true,
}

interface VaultCardProps {
  vault: Vault
  isSelected: boolean
  onSelect: (vault: Vault) => void
}

function VaultCard({ vault, isSelected, onSelect }: VaultCardProps) {
  const chain = CHAINS[vault.chainId as ChainId]

  return (
    <div
      onClick={() => onSelect(vault)}
      style={{
        padding: "16px",
        border: isSelected ? "2px solid #6366f1" : "1px solid #e2e8f0",
        borderRadius: "12px",
        cursor: "pointer",
        backgroundColor: isSelected ? "#f5f3ff" : "#fff",
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontSize: "16px" }}>{vault.vaultName}</h3>
        {chain && (
          <span
            style={{
              fontSize: "12px",
              padding: "2px 8px",
              borderRadius: "4px",
              backgroundColor: chain.color + "20",
              color: chain.color,
            }}
          >
            {chain.name}
          </span>
        )}
      </div>

      <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
        <span
          style={{
            fontSize: "12px",
            padding: "2px 8px",
            borderRadius: "4px",
            backgroundColor: vault.isEnabled ? "#dcfce7" : "#f3f4f6",
            color: vault.isEnabled ? "#166534" : "#6b7280",
          }}
        >
          {vault.isEnabled ? "Active" : "Inactive"}
        </span>
        <span
          style={{
            fontSize: "12px",
            padding: "2px 8px",
            borderRadius: "4px",
            backgroundColor: vault.depositEnabled ? "#dbeafe" : "#f3f4f6",
            color: vault.depositEnabled ? "#1e40af" : "#6b7280",
          }}
        >
          {vault.depositEnabled ? "Deposits Open" : "Deposits Closed"}
        </span>
      </div>

      <p
        style={{
          marginTop: "8px",
          fontSize: "12px",
          color: "#64748b",
          fontFamily: "monospace",
        }}
      >
        {vault.vaultAddress.slice(0, 10)}...{vault.vaultAddress.slice(-8)}
      </p>
    </div>
  )
}

interface FilterBarProps {
  filters: VaultFilters
  onChange: (filters: VaultFilters) => void
  availableChains: ChainId[]
}

function FilterBar({ filters, onChange, availableChains }: FilterBarProps) {
  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <input
        type="text"
        placeholder="Search vaults..."
        value={filters.search}
        onChange={e => onChange({ ...filters, search: e.target.value })}
        style={{
          padding: "8px 12px",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          minWidth: "200px",
        }}
      />

      <select
        value={filters.chainId ?? ""}
        onChange={e =>
          onChange({
            ...filters,
            chainId: e.target.value ? (Number(e.target.value) as ChainId) : null,
          })
        }
        style={{
          padding: "8px 12px",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
        }}
      >
        <option value="">All Chains</option>
        {availableChains.map(chainId => (
          <option key={chainId} value={chainId}>
            {CHAINS[chainId].name}
          </option>
        ))}
      </select>

      <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <input
          type="checkbox"
          checked={filters.activeOnly}
          onChange={e => onChange({ ...filters, activeOnly: e.target.checked })}
        />
        Active only
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <input
          type="checkbox"
          checked={filters.depositOpen}
          onChange={e => onChange({ ...filters, depositOpen: e.target.checked })}
        />
        Deposits open
      </label>
    </div>
  )
}

function VaultDetails({ vaultId }: { vaultId: string }) {
  const { data: vault, isLoading } = useVault(vaultId)

  if (isLoading) {
    return <div>Loading details...</div>
  }

  if (!vault) {
    return <div>Vault not found</div>
  }

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
      }}
    >
      <h2 style={{ margin: "0 0 16px" }}>{vault.vaultName}</h2>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        <div>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
            Contract Address
          </p>
          <p style={{ margin: "4px 0", fontFamily: "monospace" }}>
            {vault.vaultAddress}
          </p>
        </div>

        <div>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
            Chain
          </p>
          <p style={{ margin: "4px 0" }}>
            {CHAINS[vault.chainId as ChainId]?.name || vault.chainId}
          </p>
        </div>

        <div>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
            Status
          </p>
          <p style={{ margin: "4px 0" }}>
            {vault.isEnabled ? "Active" : "Inactive"}
          </p>
        </div>

        <div>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
            Deposits
          </p>
          <p style={{ margin: "4px 0" }}>
            {vault.depositEnabled ? "Open" : "Closed"}
          </p>
        </div>
      </div>

      {vault.strategyAllocations && vault.strategyAllocations.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
            Strategy Allocations
          </p>
          <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
            {vault.strategyAllocations.map((alloc, i) => (
              <li key={i}>
                {alloc.strategyId}: {(alloc.allocationSplit * 100).toFixed(0)}%
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        style={{
          marginTop: "16px",
          padding: "12px 24px",
          backgroundColor: vault.depositEnabled ? "#6366f1" : "#e2e8f0",
          color: vault.depositEnabled ? "#fff" : "#64748b",
          border: "none",
          borderRadius: "8px",
          cursor: vault.depositEnabled ? "pointer" : "not-allowed",
          fontSize: "14px",
          fontWeight: "600",
        }}
        disabled={!vault.depositEnabled}
      >
        {vault.depositEnabled ? "Deposit to Vault" : "Deposits Closed"}
      </button>
    </div>
  )
}

export default function VaultSelectionFlow() {
  const [filters, setFilters] = useState<VaultFilters>(defaultFilters)
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null)

  const { data: vaults, isLoading, error } = useVaults()

  const availableChains = useMemo(() => {
    if (!vaults) return []
    const chains = [...new Set(vaults.map(v => v.chainId))]
    return chains.filter(c => c in CHAINS) as ChainId[]
  }, [vaults])

  const filteredVaults = useMemo(() => {
    if (!vaults) return []

    return vaults.filter(vault => {
      if (filters.search) {
        const search = filters.search.toLowerCase()
        if (
          !vault.vaultName.toLowerCase().includes(search) &&
          !vault.vaultAddress.toLowerCase().includes(search)
        ) {
          return false
        }
      }

      if (filters.chainId !== null && vault.chainId !== filters.chainId) {
        return false
      }

      if (filters.activeOnly && !vault.isEnabled) {
        return false
      }

      if (filters.depositOpen && !vault.depositEnabled) {
        return false
      }

      return true
    })
  }, [vaults, filters])

  if (isLoading) {
    return <div>Loading vaults...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div style={{ display: "flex", gap: "24px", padding: "24px" }}>
      <div style={{ flex: 2 }}>
        <h1 style={{ margin: "0 0 24px" }}>Select a Vault</h1>

        <FilterBar
          filters={filters}
          onChange={setFilters}
          availableChains={availableChains}
        />

        <p style={{ margin: "16px 0", color: "#64748b" }}>
          Showing {filteredVaults.length} of {vaults?.length || 0} vaults
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredVaults.map(vault => (
            <VaultCard
              key={vault.id}
              vault={vault}
              isSelected={vault.id === selectedVaultId}
              onSelect={v => setSelectedVaultId(v.id)}
            />
          ))}
        </div>

        {filteredVaults.length === 0 && (
          <p style={{ textAlign: "center", color: "#64748b" }}>
            No vaults match your filters
          </p>
        )}
      </div>

      <div style={{ flex: 1, minWidth: "300px" }}>
        <h2 style={{ margin: "0 0 16px" }}>Vault Details</h2>
        {selectedVaultId ? (
          <VaultDetails vaultId={selectedVaultId} />
        ) : (
          <p style={{ color: "#64748b" }}>Select a vault to view details</p>
        )}
      </div>
    </div>
  )
}

/**
 * This pattern demonstrates fetching all vaults with useVaults(),
 * client-side filtering with useMemo, selection state management,
 * fetching single vault details with useVault(id), and search/filter UI.
 *
 * Best practices: use useMemo for expensive filter operations,
 * show loading/empty/error states, disable actions for closed vaults,
 * and provide clear filter feedback.
 */
