"use client"

import { useState } from "react"
import { isNeobankError } from "@raga-neobank/core"
import { useBuildTransaction } from "../hooks/use-transactions"

export function TransactionBuilder() {
  const [vaultId, setVaultId] = useState("e63b2ca2-75e8-43fa-9f1f-bc753502ecc8")
  const [amount, setAmount] = useState("1000000")
  const [chainId, setChainId] = useState("8453")
  const [txType, setTxType] = useState<"deposit" | "withdraw" | "redeem">(
    "deposit",
  )

  const {
    mutate: buildTransaction,
    data: result,
    isPending: loading,
    error: mutationError,
    reset,
  } = useBuildTransaction()

  const [validationError, setValidationError] = useState<string | null>(null)

  const handleBuild = () => {
    setValidationError(null)
    if (!vaultId || !amount || !chainId) {
      setValidationError("Please fill in all fields")
      return
    }

    buildTransaction({
      vaultId,
      amount,
      chainId: parseInt(chainId),
      type: txType,
    })
  }

  const getErrorMessage = (err: any) => {
    if (isNeobankError(err)) {
      return `Error ${err.code}: ${err.message} - ${err.detail || "No details"}`
    }
    if (err instanceof Error) {
      return err.message
    }
    return "Failed to build transaction"
  }

  const error =
    validationError || (mutationError ? getErrorMessage(mutationError) : null)

  return (
    <div className="transaction-builder">
      <h2>Transaction Builder</h2>

      <div className="form">
        <div className="form-group">
          <label htmlFor="txType">Transaction Type:</label>
          <select
            id="txType"
            value={txType}
            onChange={e => {
              setTxType(e.target.value as "deposit" | "withdraw" | "redeem")
              reset()
            }}
          >
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="redeem">Redeem</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="vaultId">Vault ID:</label>
          <input
            id="vaultId"
            type="text"
            value={vaultId}
            onChange={e => setVaultId(e.target.value)}
            placeholder="6e9b8e9f-bb3e-4e8a-b9ea-f3ab27449b38"
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (smallest unit):</label>
          <input
            id="amount"
            type="text"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="1000000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="chainId">Chain ID:</label>
          <input
            id="chainId"
            type="text"
            value={chainId}
            onChange={e => setChainId(e.target.value)}
            placeholder="8453"
          />
        </div>

        <button
          onClick={handleBuild}
          disabled={loading}
          className="build-button"
        >
          {loading ? "Building..." : `Build ${txType} Transaction`}
        </button>
      </div>

      {error && (
        <div className="error">
          <h3>Transaction Error</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="result">
          <h3>Transaction Payload</h3>
          <div className="result-summary">
            <p>
              <strong>Vault:</strong> {result.vaultName}
            </p>
            <p>
              <strong>Asset:</strong> {result.summary.assetSymbol}
            </p>
            <p>
              <strong>Amount:</strong> {result.summary.inputAmount}
            </p>
            {result.summary.warnings.length > 0 && (
              <div className="warnings">
                <strong>Warnings:</strong>
                <ul>
                  {result.summary.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <h4>Transaction Steps ({result.txs.length})</h4>
          {result.txs.map(tx => (
            <div key={tx.step} className="tx-step">
              <p>
                <strong>Step {tx.step}:</strong> {tx.description}
              </p>
              <p>
                <strong>Type:</strong> {tx.type}
              </p>
              <p>
                <strong>To:</strong> <code>{tx.to}</code>
              </p>
              <p>
                <strong>Gas Estimate:</strong> {tx.gasEstimate}
              </p>
              <p>
                <strong>Simulation:</strong>{" "}
                <span
                  className={
                    tx.simulationSuccess ? "status-enabled" : "status-disabled"
                  }
                >
                  {tx.simulationSuccess ? "Success" : "Failed"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
