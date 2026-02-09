/**
 * End-to-End Deposit Flow
 *
 * A complete deposit transaction flow from amount input to execution.
 */

"use client"

import { useState } from "react"
import { useVault, useBuildDeposit } from "@raga-neobank/react"
import type { TransactionPayload } from "@raga-neobank/core"

type FlowStep = "input" | "confirm" | "executing" | "success" | "error"

interface DepositState {
  step: FlowStep
  amount: string
  payload: TransactionPayload | null
  currentTxIndex: number
  error: string | null
}

function AmountInput({
  amount,
  balance,
  assetSymbol,
  decimals,
  onChange,
  onNext,
  isPending,
}: {
  amount: string
  balance: string
  assetSymbol: string
  decimals: number
  onChange: (value: string) => void
  onNext: () => void
  isPending: boolean
}) {
  const formatDisplay = (wei: string) => {
    const value = parseFloat(wei) / Math.pow(10, decimals)
    return value.toLocaleString(undefined, { maximumFractionDigits: decimals })
  }

  const handleMax = () => {
    onChange(balance)
  }

  const isValid = amount && BigInt(amount) > 0 && BigInt(amount) <= BigInt(balance)

  return (
    <div style={{ padding: "24px" }}>
      <h2>Enter Amount</h2>

      <div style={{ position: "relative", marginBottom: "16px" }}>
        <input
          type="text"
          value={amount}
          onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="0"
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "24px",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            fontFamily: "monospace",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button
            onClick={handleMax}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              backgroundColor: "#f1f5f9",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            MAX
          </button>
          <span style={{ fontWeight: "600" }}>{assetSymbol}</span>
        </div>
      </div>

      <p style={{ color: "#64748b", fontSize: "14px" }}>
        Balance: {formatDisplay(balance)} {assetSymbol}
      </p>

      {amount && (
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          You will deposit: {formatDisplay(amount)} {assetSymbol}
        </p>
      )}

      <button
        onClick={onNext}
        disabled={!isValid || isPending}
        style={{
          width: "100%",
          padding: "16px",
          marginTop: "24px",
          backgroundColor: isValid ? "#6366f1" : "#e2e8f0",
          color: isValid ? "#fff" : "#94a3b8",
          border: "none",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: isValid ? "pointer" : "not-allowed",
        }}
      >
        {isPending ? "Building Transaction..." : "Continue"}
      </button>
    </div>
  )
}

function Confirmation({
  payload,
  onConfirm,
  onBack,
}: {
  payload: TransactionPayload
  onConfirm: () => void
  onBack: () => void
}) {
  return (
    <div style={{ padding: "24px" }}>
      <h2>Confirm Transaction</h2>

      <div
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: "12px" }}>
          VAULT
        </p>
        <p style={{ margin: 0, fontWeight: "600" }}>{payload.vaultName}</p>
      </div>

      <div
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: "0 0 4px", color: "#64748b", fontSize: "12px" }}>
              YOU DEPOSIT
            </p>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
              {payload.summary.inputAmount} {payload.summary.assetSymbol}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 4px", color: "#64748b", fontSize: "12px" }}>
              YOU RECEIVE
            </p>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#16a34a" }}>
              {payload.summary.preview.expectedOutput} {payload.summary.preview.outputSymbol}
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: "12px" }}>
          TRANSACTION STEPS ({payload.txs.length})
        </p>
        {payload.txs.map((tx, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 0",
              borderBottom: i < payload.txs.length - 1 ? "1px solid #e2e8f0" : "none",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              {tx.step}
            </span>
            <span>{tx.description}</span>
            {tx.simulationSuccess && (
              <span style={{ marginLeft: "auto", color: "#16a34a" }}>✓</span>
            )}
          </div>
        ))}
      </div>

      {payload.summary.warnings && payload.summary.warnings.length > 0 && (
        <div
          style={{
            backgroundColor: "#fef3c7",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <p style={{ margin: "0 0 8px", color: "#92400e", fontWeight: "600" }}>
            Warnings
          </p>
          {payload.summary.warnings.map((warning, i) => (
            <p key={i} style={{ margin: "4px 0", color: "#92400e", fontSize: "14px" }}>
              • {warning}
            </p>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: "16px",
            backgroundColor: "#f1f5f9",
            color: "#475569",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 2,
            padding: "16px",
            backgroundColor: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Confirm Deposit
        </button>
      </div>
    </div>
  )
}

function Executing({
  payload,
  currentIndex,
}: {
  payload: TransactionPayload
  currentIndex: number
}) {
  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <div
        style={{
          width: "64px",
          height: "64px",
          margin: "0 auto 24px",
          border: "3px solid #e2e8f0",
          borderTopColor: "#6366f1",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

      <h2>Processing Transaction</h2>

      <div style={{ marginTop: "24px", textAlign: "left" }}>
        {payload.txs.map((tx, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              backgroundColor: i === currentIndex ? "#f5f3ff" : "transparent",
              borderRadius: "8px",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor:
                  i < currentIndex
                    ? "#16a34a"
                    : i === currentIndex
                      ? "#6366f1"
                      : "#e2e8f0",
                color: i <= currentIndex ? "#fff" : "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              {i < currentIndex ? "✓" : tx.step}
            </span>
            <span
              style={{
                color: i <= currentIndex ? "#1e293b" : "#94a3b8",
              }}
            >
              {tx.description}
            </span>
            {i === currentIndex && (
              <span style={{ marginLeft: "auto", color: "#6366f1" }}>
                Processing...
              </span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function Success({
  payload,
  onClose,
}: {
  payload: TransactionPayload
  onClose: () => void
}) {
  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <div
        style={{
          width: "64px",
          height: "64px",
          margin: "0 auto 24px",
          backgroundColor: "#dcfce7",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
        }}
      >
        ✓
      </div>

      <h2>Deposit Successful!</h2>
      <p style={{ color: "#64748b" }}>
        Your deposit of {payload.summary.inputAmount} {payload.summary.assetSymbol}{" "}
        has been completed.
      </p>

      <div
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          padding: "16px",
          margin: "24px 0",
        }}
      >
        <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: "12px" }}>
          YOU RECEIVED
        </p>
        <p style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: "#16a34a" }}>
          {payload.summary.preview.expectedOutput} {payload.summary.preview.outputSymbol}
        </p>
      </div>

      <button
        onClick={onClose}
        style={{
          width: "100%",
          padding: "16px",
          backgroundColor: "#6366f1",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Done
      </button>
    </div>
  )
}

function ErrorState({
  error,
  onRetry,
  onClose,
}: {
  error: string
  onRetry: () => void
  onClose: () => void
}) {
  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <div
        style={{
          width: "64px",
          height: "64px",
          margin: "0 auto 24px",
          backgroundColor: "#fee2e2",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          color: "#dc2626",
        }}
      >
        ✕
      </div>

      <h2>Transaction Failed</h2>
      <p style={{ color: "#64748b" }}>{error}</p>

      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: "16px",
            backgroundColor: "#f1f5f9",
            color: "#475569",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onRetry}
          style={{
            flex: 1,
            padding: "16px",
            backgroundColor: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

interface DepositFlowProps {
  vaultId: string
  onComplete?: () => void
}

export default function DepositFlow({ vaultId, onComplete }: DepositFlowProps) {
  const { data: vault } = useVault(vaultId)
  const { mutate: buildDeposit, isPending } = useBuildDeposit()

  const [state, setState] = useState<DepositState>({
    step: "input",
    amount: "",
    payload: null,
    currentTxIndex: 0,
    error: null,
  })

  const userBalance = "10000000"

  const handleBuildTransaction = () => {
    buildDeposit(
      {
        vaultId,
        amount: state.amount,
        chainId: vault?.chainId || 8453,
      },
      {
        onSuccess: payload => {
          setState(prev => ({
            ...prev,
            step: "confirm",
            payload,
          }))
        },
        onError: error => {
          setState(prev => ({
            ...prev,
            step: "error",
            error: error.message,
          }))
        },
      }
    )
  }

  const handleConfirm = async () => {
    if (!state.payload) return

    setState(prev => ({ ...prev, step: "executing" }))

    for (let i = 0; i < state.payload.txs.length; i++) {
      setState(prev => ({ ...prev, currentTxIndex: i }))

      await new Promise(resolve => setTimeout(resolve, 2000))

      if (Math.random() < 0.1) {
        setState(prev => ({
          ...prev,
          step: "error",
          error: "User rejected transaction",
        }))
        return
      }
    }

    setState(prev => ({ ...prev, step: "success" }))
  }

  const handleReset = () => {
    setState({
      step: "input",
      amount: "",
      payload: null,
      currentTxIndex: 0,
      error: null,
    })
  }

  const handleClose = () => {
    handleReset()
    onComplete?.()
  }

  if (!vault) {
    return <div>Loading vault...</div>
  }

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        backgroundColor: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        overflow: "hidden",
      }}
    >
      {state.step === "input" && (
        <AmountInput
          amount={state.amount}
          balance={userBalance}
          assetSymbol="USDC"
          decimals={6}
          onChange={amount => setState(prev => ({ ...prev, amount }))}
          onNext={handleBuildTransaction}
          isPending={isPending}
        />
      )}

      {state.step === "confirm" && state.payload && (
        <Confirmation
          payload={state.payload}
          onConfirm={handleConfirm}
          onBack={() => setState(prev => ({ ...prev, step: "input" }))}
        />
      )}

      {state.step === "executing" && state.payload && (
        <Executing payload={state.payload} currentIndex={state.currentTxIndex} />
      )}

      {state.step === "success" && state.payload && (
        <Success payload={state.payload} onClose={handleClose} />
      )}

      {state.step === "error" && state.error && (
        <ErrorState
          error={state.error}
          onRetry={handleReset}
          onClose={handleClose}
        />
      )}
    </div>
  )
}

/**
 * This pattern demonstrates multi-step form flow, amount validation,
 * building transaction payload with useBuildDeposit, showing transaction
 * steps from payload.txs, and success/error states.
 *
 * In a real application, get user balance from wallet/chain, execute
 * actual transactions using payload.txs data, wait for confirmations,
 * and update portfolio after success.
 */
