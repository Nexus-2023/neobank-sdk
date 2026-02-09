"use client"

import * as React from "react"
import {
  useBuildDeposit,
  useBuildWithdraw,
  useBuildRedeem,
} from "@raga-neobank/react"
import type { TransactionPayload } from "@raga-neobank/core"
import { Loader2, AlertCircle, CheckCircle, ArrowRight, RotateCcw } from "lucide-react"
import { cn } from "./utils"

export type TransactionType = "deposit" | "withdraw" | "redeem"

export interface TransactionWidgetProps {
  /** Target vault ID */
  vaultId: string
  /** Default transaction type */
  defaultType?: TransactionType
  /** Allowed transaction types (defaults to all) */
  allowedTypes?: TransactionType[]
  /** Default chain ID */
  defaultChainId?: number
  /** Asset symbol to display */
  assetSymbol?: string
  /** Show gas estimate in result */
  showGasEstimate?: boolean
  /** Callback on successful transaction build */
  onSuccess?: (payload: TransactionPayload) => void
  /** Callback on error */
  onError?: (error: Error) => void
  /** Additional class names */
  className?: string
  /** Custom labels */
  labels?: {
    deposit?: string
    withdraw?: string
    redeem?: string
    submit?: string
    amountLabel?: string
    amountPlaceholder?: string
  }
}

const DEFAULT_LABELS = {
  deposit: "Deposit",
  withdraw: "Withdraw",
  redeem: "Redeem",
  submit: "Build Transaction",
  amountLabel: "Amount",
  amountPlaceholder: "Enter amount...",
}

export function TransactionWidget({
  vaultId,
  defaultType = "deposit",
  allowedTypes = ["deposit", "withdraw", "redeem"],
  defaultChainId = 8453,
  assetSymbol = "USDC",
  showGasEstimate = true,
  onSuccess,
  onError,
  className,
  labels: labelsProp,
}: TransactionWidgetProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const [amount, setAmount] = React.useState("")
  const [activeType, setActiveType] = React.useState<TransactionType>(
    allowedTypes.includes(defaultType) ? defaultType : (allowedTypes[0] ?? defaultType)
  )

  // Hooks
  const deposit = useBuildDeposit()
  const withdraw = useBuildWithdraw()
  const redeem = useBuildRedeem()

  const mutations = {
    deposit,
    withdraw,
    redeem,
  }

  const mutation = mutations[activeType]

  const handleAction = () => {
    if (!amount) return

    mutation.mutate(
      {
        vaultId,
        amount,
        chainId: defaultChainId,
      },
      {
        onSuccess: (data) => onSuccess?.(data),
        onError: (error) => onError?.(error instanceof Error ? error : new Error(String(error))),
      }
    )
  }

  const handleReset = () => {
    mutation.reset()
    setAmount("")
  }

  const handleTypeChange = (type: TransactionType) => {
    setActiveType(type)
    mutation.reset()
  }

  const isPending = mutation.isPending
  const error = mutation.error
  const result = mutation.data

  // Calculate total gas
  const totalGas = result?.txs?.reduce(
    (acc, tx) => acc + BigInt(tx.gasEstimate || "0"),
    0n
  )

  return (
    <div
      className={cn("overflow-hidden", className)}
      style={{
        borderRadius: "var(--raga-radius-xl)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-background)",
        boxShadow: "var(--raga-shadow-sm)",
      }}
    >
      {/* Tabs */}
      {allowedTypes.length > 1 && (
        <div
          className="flex"
          style={{ borderBottom: "1px solid var(--raga-border)" }}
        >
          {allowedTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className="flex-1 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: activeType === type
                  ? "var(--raga-primary)"
                  : "var(--raga-muted-foreground)",
              }}
            >
              {labels[type] || type.charAt(0).toUpperCase() + type.slice(1)}
              {activeType === type && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: "var(--raga-primary)" }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="p-6">
        {!result ? (
          <div className="space-y-4">
            {/* Amount Input */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--raga-muted-foreground)" }}
              >
                {labels.amountLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={labels.amountPlaceholder}
                  className="w-full px-4 py-3 rounded-lg font-mono text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    border: "1px solid var(--raga-border)",
                    backgroundColor: "var(--raga-background)",
                    color: "var(--raga-foreground)",
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span
                    className="text-xs font-bold"
                    style={{ color: "var(--raga-muted-foreground)" }}
                  >
                    {assetSymbol}
                  </span>
                </div>
              </div>
              <p
                className="mt-1.5 text-xs"
                style={{ color: "var(--raga-muted-foreground)" }}
              >
                Enter amount in smallest units (e.g., 1000000 = 1 {assetSymbol})
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{
                  backgroundColor: "var(--raga-error-light)",
                  color: "var(--raga-error)",
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-sm">
                  {error.message || "Transaction build failed"}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleAction}
              disabled={isPending || !amount}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={
                isPending || !amount
                  ? {
                      backgroundColor: "var(--raga-muted)",
                      color: "var(--raga-muted-foreground)",
                      cursor: "not-allowed",
                    }
                  : {
                      backgroundColor: "var(--raga-primary)",
                      color: "var(--raga-primary-foreground)",
                    }
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  {labels.submit}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Success Result */
          <div className="space-y-4">
            {/* Success Header */}
            <div className="text-center">
              <div
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--raga-success-light)" }}
              >
                <CheckCircle className="w-6 h-6" style={{ color: "var(--raga-success)" }} />
              </div>
              <h3
                className="mt-3 font-semibold"
                style={{ color: "var(--raga-foreground)" }}
              >
                Transaction Ready
              </h3>
              <p className="text-sm" style={{ color: "var(--raga-muted-foreground)" }}>
                Simulation verified successfully
              </p>
            </div>

            {/* Transaction Details */}
            <div
              className="rounded-lg p-4 space-y-3"
              style={{ backgroundColor: "var(--raga-muted)" }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--raga-muted-foreground)" }}>
                  Input
                </span>
                <span
                  className="font-mono font-medium"
                  style={{ color: "var(--raga-foreground)" }}
                >
                  {result.summary.inputAmount} {result.summary.assetSymbol}
                </span>
              </div>

              {result.summary.preview && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--raga-muted-foreground)" }}>
                    Expected Output
                  </span>
                  <span
                    className="font-mono font-medium"
                    style={{ color: "var(--raga-success)" }}
                  >
                    {result.summary.preview.expectedOutput}{" "}
                    {result.summary.preview.outputSymbol}
                  </span>
                </div>
              )}

              {showGasEstimate && totalGas !== undefined && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--raga-muted-foreground)" }}>
                    Gas Estimate
                  </span>
                  <span
                    className="font-mono"
                    style={{ color: "var(--raga-foreground)" }}
                  >
                    {totalGas.toString()}
                  </span>
                </div>
              )}

              {result.txs && result.txs.length > 0 && (
                <div
                  className="pt-2"
                  style={{ borderTop: "1px solid var(--raga-border)" }}
                >
                  <p
                    className="text-xs font-medium mb-2"
                    style={{ color: "var(--raga-muted-foreground)" }}
                  >
                    Transaction Steps
                  </p>
                  <div className="space-y-1.5">
                    {result.txs.map((tx, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center font-medium"
                          style={{
                            backgroundColor: "var(--raga-background)",
                            color: "var(--raga-muted-foreground)",
                          }}
                        >
                          {tx.step}
                        </span>
                        <span style={{ color: "var(--raga-foreground)" }}>
                          {tx.description}
                        </span>
                        {tx.simulationSuccess && (
                          <CheckCircle
                            className="w-3 h-3 ml-auto"
                            style={{ color: "var(--raga-success)" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.summary.warnings && result.summary.warnings.length > 0 && (
                <div
                  className="pt-2"
                  style={{ borderTop: "1px solid var(--raga-border)" }}
                >
                  {result.summary.warnings.map((warning, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs"
                      style={{ color: "var(--raga-warning)" }}
                    >
                      <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                      {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              style={{
                border: "1px solid var(--raga-border)",
                color: "var(--raga-foreground)",
              }}
            >
              <RotateCcw className="w-4 h-4" />
              New Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
