/**
 * Query Hooks
 *
 * Learn how to use query hooks from @raga-neobank/react for data fetching.
 */

"use client"

import { useVaults, useVault, useUser, usePortfolio } from "@raga-neobank/react"

function VaultsList() {
  const { data: vaults, isLoading, error, refetch } = useVaults()

  if (isLoading) {
    return <div>Loading vaults...</div>
  }

  if (error) {
    return (
      <div>
        Error: {error.message}
        <button onClick={() => refetch()}>Retry</button>
      </div>
    )
  }

  if (!vaults || vaults.length === 0) {
    return <div>No vaults found</div>
  }

  return (
    <ul>
      {vaults.map(vault => (
        <li key={vault.id}>
          {vault.vaultName} - {vault.isEnabled ? "Active" : "Inactive"}
        </li>
      ))}
    </ul>
  )
}

function VaultDetails({ vaultId }: { vaultId: string }) {
  const { data: vault, isLoading, error, isFetching } = useVault(vaultId)

  if (isLoading) {
    return <div>Loading vault details...</div>
  }

  if (error) {
    return <div>Error loading vault: {error.message}</div>
  }

  if (!vault) {
    return <div>Vault not found</div>
  }

  return (
    <div>
      <h2>{vault.vaultName}</h2>
      <p>Address: {vault.vaultAddress}</p>
      <p>Chain: {vault.chainId}</p>
      <p>Status: {vault.isEnabled ? "Active" : "Inactive"}</p>
      <p>Deposits: {vault.depositEnabled ? "Open" : "Closed"}</p>
      {isFetching && <span>Refreshing...</span>}
    </div>
  )
}

function ConditionalVault({ vaultId }: { vaultId: string | null }) {
  // Handle null case before using the hook
  if (!vaultId) {
    return <div>Select a vault to view details</div>
  }

  return <VaultDetails vaultId={vaultId} />
}

function UserProfile() {
  const { data: user, isLoading, error } = useUser()

  if (isLoading) {
    return <div>Loading user...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!user) {
    return <div>Not logged in</div>
  }

  return (
    <div>
      <h2>User Profile</h2>
      <p>Address: {user.address}</p>
      <p>Status: {user.isEnabled ? "Active" : "Disabled"}</p>
      <p>Bank: {user.bankId}</p>
      <p>Joined: {new Date(user.createdOn).toLocaleDateString()}</p>
    </div>
  )
}

function Portfolio() {
  const { data: portfolio, isLoading, error, refetch } = usePortfolio()

  if (isLoading) {
    return <div>Loading portfolio...</div>
  }

  if (error) {
    return (
      <div>
        Error: {error.message}
        <button onClick={() => refetch()}>Retry</button>
      </div>
    )
  }

  if (!portfolio) {
    return <div>No portfolio data</div>
  }

  const totalDeposited = portfolio.positions.reduce(
    (sum, p) => sum + parseFloat(p.depositValueInUsd),
    0,
  )
  const totalCurrent = portfolio.positions.reduce(
    (sum, p) => sum + parseFloat(p.currentValueInUsd),
    0,
  )
  const totalPnL = totalCurrent - totalDeposited

  return (
    <div>
      <h2>Portfolio</h2>
      <p>Bank: {portfolio.bank.name}</p>
      <p>Wallet: {portfolio.walletAddress}</p>

      <h3>Summary</h3>
      <p>Total Deposited: ${totalDeposited.toFixed(2)}</p>
      <p>Current Value: ${totalCurrent.toFixed(2)}</p>
      <p>
        PnL: ${totalPnL.toFixed(2)} ({totalPnL >= 0 ? "+" : ""}
        {((totalPnL / totalDeposited) * 100).toFixed(2)}%)
      </p>

      <h3>Positions ({portfolio.positions.length})</h3>
      <ul>
        {portfolio.positions.map((pos, i) => {
          const deposited = parseFloat(pos.depositValueInUsd)
          const current = parseFloat(pos.currentValueInUsd)
          const pnl = current - deposited

          return (
            <li key={i}>
              <strong>{pos.vaultName}</strong>
              <br />
              Deposited: ${deposited.toFixed(2)}
              <br />
              Current: ${current.toFixed(2)}
              <br />
              PnL: ${pnl.toFixed(2)} ({pnl >= 0 ? "+" : ""}
              {((pnl / deposited) * 100).toFixed(2)}%)
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Dashboard() {
  const { data: user, isLoading: userLoading } = useUser()
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio()
  const { data: vaults, isLoading: vaultsLoading } = useVaults()

  const isLoading = userLoading || portfolioLoading || vaultsLoading

  if (isLoading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {user && (
        <section>
          <h2>Welcome, {user.address.slice(0, 8)}...</h2>
        </section>
      )}

      {portfolio && (
        <section>
          <h2>Your Positions: {portfolio.positions.length}</h2>
        </section>
      )}

      {vaults && (
        <section>
          <h2>Available Vaults: {vaults.length}</h2>
        </section>
      )}
    </div>
  )
}

function LiveVaults() {
  const { data: vaults, dataUpdatedAt } = useVaults()

  return (
    <div>
      <p>Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}</p>
      <p>Vaults: {vaults?.length ?? 0}</p>
    </div>
  )
}

export {
  VaultsList,
  VaultDetails,
  ConditionalVault,
  UserProfile,
  Portfolio,
  Dashboard,
  LiveVaults,
}

/**
 * Notes
 *
 * All query hooks return standard TanStack Query result:
 * - data: The fetched data (undefined while loading)
 * - isLoading: True during initial load
 * - isFetching: True during any fetch (including refetch)
 * - error: Error object if request failed
 * - refetch: Function to manually refetch
 *
 * Use isLoading for initial loading states.
 * Use isFetching for background refresh indicators.
 * The enabled option prevents fetching until condition is met.
 *
 * User and Portfolio hooks require userAddress in provider config.
 * Data is automatically cached and shared between components.
 * Use refetchInterval for real-time data updates.
 */
