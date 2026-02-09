/**
 * Portfolio Dashboard
 *
 * Compose multiple SDK hooks into a complete portfolio dashboard.
 */

"use client"

import { useState, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  neobankKeys,
  useUser,
  usePortfolio,
  useVaults,
} from "@raga-neobank/react"
import type { Vault, PortfolioPosition } from "@raga-neobank/core"

const CHAINS: Record<number, { name: string; color: string }> = {
  8453: { name: "Base", color: "#0052FF" },
  1: { name: "Ethereum", color: "#627EEA" },
  137: { name: "Polygon", color: "#8247E5" },
  42161: { name: "Arbitrum", color: "#28A0F0" },
}

interface MetricCardProps {
  label: string
  value: string
  subValue?: string
  trend?: "up" | "down" | "neutral"
}

function MetricCard({ label, value, subValue, trend }: MetricCardProps) {
  const trendColors = {
    up: "#16a34a",
    down: "#dc2626",
    neutral: "#64748b",
  }

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
      }}
    >
      <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{label}</p>
      <p style={{ margin: "8px 0 0", fontSize: "24px", fontWeight: "600" }}>
        {value}
      </p>
      {subValue && (
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "14px",
            color: trend ? trendColors[trend] : "#64748b",
          }}
        >
          {subValue}
        </p>
      )}
    </div>
  )
}

interface PositionRowProps {
  position: PortfolioPosition
  vault?: Vault
  onViewVault: (vaultAddress: string) => void
}

function PositionRow({ position, vault, onViewVault }: PositionRowProps) {
  const deposited = parseFloat(position.depositValueInUsd)
  const current = parseFloat(position.currentValueInUsd)
  const pnl = current - deposited
  const pnlPercent = deposited > 0 ? (pnl / deposited) * 100 : 0
  const isPositive = pnl >= 0

  const chain = vault ? CHAINS[vault.chainId] : null

  return (
    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
      <td style={{ padding: "16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <p style={{ margin: 0, fontWeight: "500" }}>{position.vaultName}</p>
            {chain && (
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: chain.color + "20",
                  color: chain.color,
                }}
              >
                {chain.name}
              </span>
            )}
          </div>
        </div>
      </td>
      <td style={{ padding: "16px 12px", textAlign: "right" }}>
        ${deposited.toFixed(2)}
      </td>
      <td style={{ padding: "16px 12px", textAlign: "right" }}>
        ${current.toFixed(2)}
      </td>
      <td
        style={{
          padding: "16px 12px",
          textAlign: "right",
          color: isPositive ? "#16a34a" : "#dc2626",
        }}
      >
        <div>
          {isPositive ? "+" : ""}${pnl.toFixed(2)}
        </div>
        <div style={{ fontSize: "12px" }}>
          {isPositive ? "+" : ""}
          {pnlPercent.toFixed(2)}%
        </div>
      </td>
      <td style={{ padding: "16px 12px", textAlign: "right" }}>
        <button
          onClick={() => onViewVault(position.vaultAddress)}
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            backgroundColor: "#f1f5f9",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          View Vault
        </button>
      </td>
    </tr>
  )
}

interface PositionsTableProps {
  positions: PortfolioPosition[]
  vaults: Vault[]
  onViewVault: (vaultAddress: string) => void
}

function PositionsTable({
  positions,
  vaults,
  onViewVault,
}: PositionsTableProps) {
  const vaultMap = useMemo(() => {
    return vaults.reduce(
      (acc, vault) => {
        acc[vault.vaultAddress] = vault
        return acc
      },
      {} as Record<string, Vault>
    )
  }, [vaults])

  if (positions.length === 0) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#64748b",
        }}
      >
        <p>No positions yet</p>
        <p style={{ fontSize: "14px" }}>
          Deposit into a vault to see your positions here
        </p>
      </div>
    )
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
          <th
            style={{
              padding: "12px",
              textAlign: "left",
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "500",
            }}
          >
            Vault
          </th>
          <th
            style={{
              padding: "12px",
              textAlign: "right",
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "500",
            }}
          >
            Deposited
          </th>
          <th
            style={{
              padding: "12px",
              textAlign: "right",
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "500",
            }}
          >
            Current
          </th>
          <th
            style={{
              padding: "12px",
              textAlign: "right",
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "500",
            }}
          >
            PnL
          </th>
          <th
            style={{
              padding: "12px",
              textAlign: "right",
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "500",
            }}
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {positions.map((position, index) => (
          <PositionRow
            key={index}
            position={position}
            vault={vaultMap[position.vaultAddress]}
            onViewVault={onViewVault}
          />
        ))}
      </tbody>
    </table>
  )
}

function RefreshButton({ onRefresh }: { onRefresh: () => void }) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      style={{
        padding: "8px 16px",
        fontSize: "14px",
        backgroundColor: isRefreshing ? "#e2e8f0" : "#f1f5f9",
        border: "none",
        borderRadius: "8px",
        cursor: isRefreshing ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </button>
  )
}

export default function PortfolioDashboard() {
  const queryClient = useQueryClient()
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null)

  const { data: user, isLoading: userLoading, error: userError } = useUser()
  const {
    data: portfolio,
    isLoading: portfolioLoading,
    error: portfolioError,
  } = usePortfolio()
  const {
    data: vaults,
    isLoading: vaultsLoading,
    error: vaultsError,
  } = useVaults()

  const metrics = useMemo(() => {
    if (!portfolio) {
      return {
        totalDeposited: 0,
        totalCurrent: 0,
        totalPnL: 0,
        pnlPercent: 0,
        positionCount: 0,
      }
    }

    const totalDeposited = portfolio.positions.reduce(
      (sum, p) => sum + parseFloat(p.depositValueInUsd),
      0
    )
    const totalCurrent = portfolio.positions.reduce(
      (sum, p) => sum + parseFloat(p.currentValueInUsd),
      0
    )
    const totalPnL = totalCurrent - totalDeposited
    const pnlPercent = totalDeposited > 0 ? (totalPnL / totalDeposited) * 100 : 0

    return {
      totalDeposited,
      totalCurrent,
      totalPnL,
      pnlPercent,
      positionCount: portfolio.positions.length,
    }
  }, [portfolio])

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: neobankKeys.all })
  }

  const isLoading = userLoading || portfolioLoading || vaultsLoading

  if (isLoading) {
    return (
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                height: "100px",
                backgroundColor: "#f1f5f9",
                borderRadius: "12px",
                animation: "pulse 2s infinite",
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  const error = userError || portfolioError || vaultsError
  if (error) {
    return (
      <div
        style={{
          padding: "24px",
          backgroundColor: "#fef2f2",
          borderRadius: "12px",
          color: "#dc2626",
        }}
      >
        <h3 style={{ margin: "0 0 8px" }}>Error Loading Dashboard</h3>
        <p style={{ margin: 0 }}>{error.message}</p>
        <button
          onClick={handleRefresh}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            backgroundColor: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Portfolio Dashboard</h1>
          {user && (
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
              {user.address.slice(0, 8)}...{user.address.slice(-6)}
            </p>
          )}
        </div>
        <RefreshButton onRefresh={handleRefresh} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <MetricCard
          label="Total Deposited"
          value={`$${metrics.totalDeposited.toFixed(2)}`}
        />
        <MetricCard
          label="Current Value"
          value={`$${metrics.totalCurrent.toFixed(2)}`}
        />
        <MetricCard
          label="Total PnL"
          value={`${metrics.totalPnL >= 0 ? "+" : ""}$${metrics.totalPnL.toFixed(2)}`}
          subValue={`${metrics.pnlPercent >= 0 ? "+" : ""}${metrics.pnlPercent.toFixed(2)}%`}
          trend={
            metrics.totalPnL > 0
              ? "up"
              : metrics.totalPnL < 0
                ? "down"
                : "neutral"
          }
        />
        <MetricCard
          label="Active Positions"
          value={metrics.positionCount.toString()}
        />
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "16px" }}>Your Positions</h2>
          <span style={{ fontSize: "14px", color: "#64748b" }}>
            {portfolio?.positions.length || 0} positions
          </span>
        </div>

        <PositionsTable
          positions={portfolio?.positions || []}
          vaults={vaults || []}
          onViewVault={setSelectedVaultId}
        />
      </div>

      {selectedVaultId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setSelectedVaultId(null)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px" }}>Vault Details</h3>
            <p style={{ color: "#64748b" }}>Vault ID: {selectedVaultId}</p>
            <button
              onClick={() => setSelectedVaultId(null)}
              style={{
                marginTop: "16px",
                padding: "8px 16px",
                backgroundColor: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * This pattern demonstrates combining multiple queries (useUser, usePortfolio,
 * useVaults), calculating aggregate metrics with useMemo, position breakdown
 * with PnL calculation, global refresh with queryClient.invalidateQueries,
 * and loading/error states for multiple queries.
 *
 * Best practices: use useMemo for expensive calculations, combine loading
 * states for UX, provide refresh functionality, show meaningful empty states,
 * and handle errors gracefully.
 */
