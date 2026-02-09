/**
 * Query Invalidation & Cache Management
 *
 * Learn how to manage query cache using the neobankKeys factory
 * from @raga-neobank/react.
 */

"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
  neobankKeys,
  useVaults,
  usePortfolio,
  useBuildDeposit,
} from "@raga-neobank/react"

/**
 * The neobankKeys factory provides consistent query keys:
 *
 * neobankKeys.all                    -> ['raga-neobank']
 * neobankKeys.vaults.all()           -> ['raga-neobank', 'vaults']
 * neobankKeys.vaults.detail(id)      -> ['raga-neobank', 'vaults', id]
 * neobankKeys.user(address)          -> ['raga-neobank', 'user', address]
 * neobankKeys.portfolio(address)     -> ['raga-neobank', 'portfolio', address]
 */

function RefreshButton() {
  const queryClient = useQueryClient()

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: neobankKeys.all })
  }

  const refreshVaults = () => {
    queryClient.invalidateQueries({ queryKey: neobankKeys.vaults.all() })
  }

  const refreshPortfolio = () => {
    const userAddress = "0x..."
    queryClient.invalidateQueries({
      queryKey: neobankKeys.portfolio(userAddress),
    })
  }

  return (
    <div>
      <button onClick={refreshAll}>Refresh All</button>
      <button onClick={refreshVaults}>Refresh Vaults</button>
      <button onClick={refreshPortfolio}>Refresh Portfolio</button>
    </div>
  )
}

function DepositWithRefresh({ vaultId }: { vaultId: string }) {
  const queryClient = useQueryClient()
  const { mutate: buildDeposit, isPending } = useBuildDeposit()

  const handleDeposit = () => {
    buildDeposit(
      {
        vaultId,
        amount: "1000000",
        chainId: 8453,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: neobankKeys.portfolio(),
          })
        },
      }
    )
  }

  return (
    <button onClick={handleDeposit} disabled={isPending}>
      {isPending ? "Building..." : "Deposit & Refresh"}
    </button>
  )
}

function OptimisticPortfolio() {
  const queryClient = useQueryClient()
  const { data: portfolio } = usePortfolio()

  const simulateDeposit = (vaultName: string, amount: string) => {
    const queryKey = neobankKeys.portfolio()

    queryClient.cancelQueries({ queryKey })

    const previousPortfolio = queryClient.getQueryData(queryKey)

    queryClient.setQueryData(queryKey, (old: typeof portfolio) => {
      if (!old) return old

      const positions = old.positions.map(pos => {
        if (pos.vaultName === vaultName) {
          const newDeposit =
            parseFloat(pos.depositValueInUsd) + parseFloat(amount)
          return {
            ...pos,
            depositValueInUsd: newDeposit.toFixed(2),
            currentValueInUsd: newDeposit.toFixed(2),
          }
        }
        return pos
      })

      return { ...old, positions }
    })

    return () => {
      queryClient.setQueryData(queryKey, previousPortfolio)
    }
  }

  const handleOptimisticDeposit = async () => {
    const rollback = simulateDeposit("USDC Growth Vault", "100.00")

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          Math.random() > 0.5 ? resolve(null) : reject(new Error("Failed"))
        }, 1000)
      })

      queryClient.invalidateQueries({ queryKey: neobankKeys.portfolio() })
    } catch (error) {
      rollback()
      console.error("Deposit failed, rolled back")
    }
  }

  return (
    <div>
      <h3>Portfolio (Optimistic)</h3>
      {portfolio?.positions.map((pos, i) => (
        <p key={i}>
          {pos.vaultName}: ${pos.currentValueInUsd}
        </p>
      ))}
      <button onClick={handleOptimisticDeposit}>
        Optimistic Deposit (+$100)
      </button>
    </div>
  )
}

function VaultListWithPrefetch() {
  const queryClient = useQueryClient()
  const { data: vaults } = useVaults()

  const prefetchVault = (vaultId: string) => {
    queryClient.prefetchQuery({
      queryKey: neobankKeys.vaults.detail(vaultId),
      queryFn: async () => {
        const response = await fetch(`/api/vaults/${vaultId}`)
        return response.json()
      },
      staleTime: 60000,
    })
  }

  return (
    <ul>
      {vaults?.map(vault => (
        <li
          key={vault.id}
          onMouseEnter={() => prefetchVault(vault.id)}
        >
          {vault.vaultName}
        </li>
      ))}
    </ul>
  )
}

function CacheDebugger() {
  const queryClient = useQueryClient()

  const inspectCache = () => {
    const queries = queryClient.getQueryCache().findAll({
      queryKey: neobankKeys.all,
    })

    console.log("Cached queries:", queries.length)
    queries.forEach(query => {
      console.log({
        key: query.queryKey,
        state: query.state.status,
        dataUpdatedAt: new Date(query.state.dataUpdatedAt).toISOString(),
        stale: query.isStale(),
      })
    })
  }

  const clearCache = () => {
    queryClient.removeQueries({ queryKey: neobankKeys.all })
    console.log("Cache cleared")
  }

  return (
    <div>
      <button onClick={inspectCache}>Inspect Cache</button>
      <button onClick={clearCache}>Clear Cache</button>
    </div>
  )
}

function SelectiveRefresh() {
  const queryClient = useQueryClient()

  const refetchStale = () => {
    queryClient.refetchQueries({
      queryKey: neobankKeys.all,
      type: "stale",
    })
  }

  const refetchActive = () => {
    queryClient.refetchQueries({
      queryKey: neobankKeys.all,
      type: "active",
    })
  }

  const refetchInactive = () => {
    queryClient.refetchQueries({
      queryKey: neobankKeys.all,
      type: "inactive",
    })
  }

  return (
    <div>
      <button onClick={refetchStale}>Refetch Stale</button>
      <button onClick={refetchActive}>Refetch Active</button>
      <button onClick={refetchInactive}>Refetch Inactive</button>
    </div>
  )
}

export {
  RefreshButton,
  DepositWithRefresh,
  OptimisticPortfolio,
  VaultListWithPrefetch,
  CacheDebugger,
  SelectiveRefresh,
}

/**
 * Notes
 *
 * Use neobankKeys for consistent query key references.
 *
 * invalidateQueries marks queries as stale and triggers refetch.
 * refetchQueries immediately refetches matching queries.
 * removeQueries completely removes queries from cache.
 * setQueryData directly updates cache (use for optimistic updates).
 *
 * For optimistic updates:
 * - Cancel in-flight queries
 * - Save previous value
 * - Update cache optimistically
 * - Rollback on error
 * - Refetch on success
 *
 * Prefetching improves perceived performance.
 *
 * Query types for selective operations:
 * - 'all': All queries
 * - 'active': Queries with observers
 * - 'inactive': Queries without observers
 * - 'stale': Queries marked as stale
 */
