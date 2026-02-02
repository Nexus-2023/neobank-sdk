"use client"

import { isNeobankError } from "@raga-neobank/core"
import { useVaults } from "../hooks/use-vaults"

export function VaultList() {
  const { data: vaults = [], isLoading, error, refetch } = useVaults()

  if (isLoading) {
    return <div className="loading">Loading vaults...</div>
  }

  if (error) {
    let errorMessage = "Failed to fetch vaults"
    if (isNeobankError(error)) {
      errorMessage = `Error ${error.code}: ${error.message}`
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return (
      <div className="error">
        <h3>Vaults Error</h3>
        <p>{errorMessage}</p>
        <button onClick={() => refetch()} className="retry-button">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="vault-list">
      <h2>Available Vaults</h2>
      {vaults.length === 0 ? (
        <p>No vaults available</p>
      ) : (
        <div className="vaults-grid">
          {vaults.map(vault => (
            <div key={vault.id} className="vault-card">
              <h3>{vault.vaultName}</h3>
              <div className="vault-info">
                <p>
                  <strong>Address:</strong>{" "}
                  <code>
                    {vault.vaultAddress.slice(0, 10)}...
                    {vault.vaultAddress.slice(-8)}
                  </code>
                </p>
                <p>
                  <strong>Chain ID:</strong> {vault.chainId}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      vault.isEnabled ? "status-enabled" : "status-disabled"
                    }
                  >
                    {vault.isEnabled ? "Enabled" : "Disabled"}
                  </span>
                </p>
                <p>
                  <strong>vault ID:</strong> <span>{vault.id}</span>
                </p>
                <p>
                  <strong>Deposits:</strong>{" "}
                  <span
                    className={
                      vault.depositEnabled
                        ? "status-enabled"
                        : "status-disabled"
                    }
                  >
                    {vault.depositEnabled ? "Enabled" : "Disabled"}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
