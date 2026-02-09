"use client"

import { cn } from "../utils"
import type { TransactionPayload, TransactionStep } from "@raga-neobank/core"
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Fuel,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useState } from "react"
import { formatAddress, formatGas, formatGasCost } from "../formatters"

export type TransactionPreviewVariant = "default" | "compact" | "steps-only"

export interface TransactionPreviewProps {
  payload: TransactionPayload
  variant?: TransactionPreviewVariant
  showVaultInfo?: boolean
  showSteps?: boolean
  showSummary?: boolean
  showWarnings?: boolean
  showGasEstimate?: boolean
  expandSteps?: boolean
  currentStep?: number
  completedSteps?: number[]
  className?: string
}

const STEP_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; colorStyle: React.CSSProperties }> = {
  approve: { label: "Approve", icon: <Shield className="w-4 h-4" />, colorStyle: { color: "#3b82f6" } },
  deposit: { label: "Deposit", icon: <ArrowRight className="w-4 h-4" />, colorStyle: { color: "var(--raga-positive)" } },
  withdraw: { label: "Withdraw", icon: <ArrowRight className="w-4 h-4 rotate-180" />, colorStyle: { color: "#f97316" } },
  redeem: { label: "Redeem", icon: <ArrowRight className="w-4 h-4 rotate-180" />, colorStyle: { color: "#a855f7" } },
}

const DEFAULT_STEP_CONFIG = { label: "Transaction", icon: <ArrowRight className="w-4 h-4" />, colorStyle: { color: "var(--raga-foreground)" } }

function StepItem({
  step,
  index,
  isActive,
  isCompleted,
  showDetails,
}: {
  step: TransactionStep
  index: number
  isActive?: boolean
  isCompleted?: boolean
  showDetails?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const config = STEP_TYPE_CONFIG[step.type] ?? DEFAULT_STEP_CONFIG

  const getStatusIcon = () => {
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5" style={{ color: "var(--raga-positive)" }} />
    }
    if (isActive) {
      return (
        <div
          className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--raga-primary)", borderTopColor: "transparent" }}
        />
      )
    }
    if (!step.simulationSuccess) {
      return <AlertCircle className="w-5 h-5" style={{ color: "var(--raga-negative)" }} />
    }
    return (
      <div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-medium"
        style={{ borderColor: "var(--raga-muted-foreground)", color: "var(--raga-muted-foreground)" }}
      >
        {index + 1}
      </div>
    )
  }

  const getContainerStyle = (): React.CSSProperties => {
    if (isActive) {
      return {
        borderRadius: "var(--raga-radius-lg)",
        border: "1px solid var(--raga-primary)",
        backgroundColor: "color-mix(in srgb, var(--raga-primary) 5%, transparent)",
      }
    }
    if (isCompleted) {
      return {
        borderRadius: "var(--raga-radius-lg)",
        border: "1px solid color-mix(in srgb, var(--raga-positive) 30%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--raga-positive) 5%, transparent)",
      }
    }
    return {
      borderRadius: "var(--raga-radius-lg)",
      border: "1px solid var(--raga-border)",
      backgroundColor: "var(--raga-card)",
    }
  }

  return (
    <div className="transition-colors" style={getContainerStyle()}>
      <div
        className={cn("flex items-center gap-3 p-3", showDetails && "cursor-pointer")}
        onClick={() => showDetails && setExpanded(!expanded)}
      >
        {getStatusIcon()}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={config.colorStyle}>
              {config.label}
            </span>
            {!step.simulationSuccess && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  color: "var(--raga-negative)",
                  backgroundColor: "color-mix(in srgb, var(--raga-negative) 10%, transparent)",
                }}
              >
                Simulation Failed
              </span>
            )}
          </div>
          <p className="text-xs truncate" style={{ color: "var(--raga-muted-foreground)" }}>
            {step.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs flex items-center gap-1" style={{ color: "var(--raga-muted-foreground)" }}>
            <Fuel className="w-3 h-3" />
            {formatGas(step.gasEstimate)}
          </span>
          {showDetails && (
            expanded ? (
              <ChevronUp className="w-4 h-4" style={{ color: "var(--raga-muted-foreground)" }} />
            ) : (
              <ChevronDown className="w-4 h-4" style={{ color: "var(--raga-muted-foreground)" }} />
            )
          )}
        </div>
      </div>

      {showDetails && expanded && (
        <div
          className="px-3 pb-3 pt-0 mt-0 space-y-2 text-xs"
          style={{ borderTop: "1px solid var(--raga-border)" }}
        >
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div>
              <span style={{ color: "var(--raga-muted-foreground)" }}>From:</span>
              <span className="ml-1 font-mono">{formatAddress(step.from)}</span>
            </div>
            <div>
              <span style={{ color: "var(--raga-muted-foreground)" }}>To:</span>
              <span className="ml-1 font-mono">{formatAddress(step.to)}</span>
            </div>
            <div>
              <span style={{ color: "var(--raga-muted-foreground)" }}>Gas Cost:</span>
              <span className="ml-1">{formatGasCost(step.gasCostInWei)}</span>
            </div>
            <div>
              <span style={{ color: "var(--raga-muted-foreground)" }}>Value:</span>
              <span className="ml-1">{step.value === "0" ? "0" : step.value}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TransactionPreviewCompact({
  payload,
  showWarnings,
  className,
}: {
  payload: TransactionPayload
  showWarnings?: boolean
  className?: string
}) {
  const hasWarnings = payload.summary.warnings?.length > 0

  return (
    <div
      className={cn("rounded-lg p-4", className)}
      style={{
        borderRadius: "var(--raga-radius-lg)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--raga-foreground)" }}>
            {payload.summary.inputAmount} {payload.summary.assetSymbol}
          </p>
          <p className="text-xs" style={{ color: "var(--raga-muted-foreground)" }}>{payload.vaultName}</p>
        </div>
        <ArrowRight className="w-5 h-5" style={{ color: "var(--raga-muted-foreground)" }} />
        <div className="text-right">
          <p className="text-sm font-medium" style={{ color: "var(--raga-positive)" }}>
            {payload.summary.preview.expectedOutput} {payload.summary.preview.outputSymbol}
          </p>
          <p className="text-xs" style={{ color: "var(--raga-muted-foreground)" }}>
            {payload.txs.length} step{payload.txs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {showWarnings && hasWarnings && (
        <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-amber-700 dark:text-amber-400">
            {payload.summary.warnings[0]}
          </div>
        </div>
      )}
    </div>
  )
}

function TransactionPreviewStepsOnly({
  payload,
  currentStep,
  completedSteps,
  expandSteps,
  className,
}: {
  payload: TransactionPayload
  currentStep?: number
  completedSteps?: number[]
  expandSteps?: boolean
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {payload.txs.map((step, index) => (
        <StepItem
          key={index}
          step={step}
          index={index}
          isActive={currentStep === index}
          isCompleted={completedSteps?.includes(index)}
          showDetails={expandSteps}
        />
      ))}
    </div>
  )
}

export function TransactionPreview({
  payload,
  variant = "default",
  showVaultInfo = true,
  showSteps = true,
  showSummary = true,
  showWarnings = true,
  showGasEstimate = true,
  expandSteps = false,
  currentStep = -1,
  completedSteps = [],
  className,
}: TransactionPreviewProps) {
  const totalGas = payload.txs.reduce(
    (sum, step) => sum + parseInt(step.gasEstimate, 10),
    0
  )
  const hasWarnings = payload.summary.warnings?.length > 0

  if (variant === "compact") {
    return (
      <TransactionPreviewCompact
        payload={payload}
        showWarnings={showWarnings}
        className={className}
      />
    )
  }

  if (variant === "steps-only") {
    return (
      <TransactionPreviewStepsOnly
        payload={payload}
        currentStep={currentStep}
        completedSteps={completedSteps}
        expandSteps={expandSteps}
        className={className}
      />
    )
  }

  return (
    <div
      className={cn("overflow-hidden", className)}
      style={{
        borderRadius: "var(--raga-radius-xl)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      {showVaultInfo && (
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--raga-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-0.5" style={{ color: "var(--raga-muted-foreground)" }}>Vault</p>
              <p className="font-medium" style={{ color: "var(--raga-foreground)" }}>{payload.vaultName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs mb-0.5" style={{ color: "var(--raga-muted-foreground)" }}>Address</p>
              <p className="font-mono text-sm" style={{ color: "var(--raga-foreground)" }}>
                {formatAddress(payload.vaultAddress)}
              </p>
            </div>
          </div>
        </div>
      )}

      {showSummary && (
        <div
          className="px-5 py-4"
          style={{
            borderBottom: "1px solid var(--raga-border)",
            backgroundColor: "color-mix(in srgb, var(--raga-muted) 30%, transparent)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--raga-muted-foreground)" }}>You Send</p>
              <p className="text-xl font-bold" style={{ color: "var(--raga-foreground)" }}>
                {payload.summary.inputAmount} {payload.summary.assetSymbol}
              </p>
            </div>
            <ArrowRight className="w-6 h-6" style={{ color: "var(--raga-muted-foreground)" }} />
            <div className="text-right">
              <p className="text-xs mb-1" style={{ color: "var(--raga-muted-foreground)" }}>You Receive</p>
              <p className="text-xl font-bold" style={{ color: "var(--raga-positive)" }}>
                {payload.summary.preview.expectedOutput} {payload.summary.preview.outputSymbol}
              </p>
            </div>
          </div>
          <p className="text-xs text-center mt-3" style={{ color: "var(--raga-muted-foreground)" }}>
            Rate: 1 {payload.summary.assetSymbol} = {payload.summary.preview.exchangeRate} {payload.summary.preview.outputSymbol}
          </p>
        </div>
      )}

      {showWarnings && hasWarnings && (
        <div
          className="px-5 py-3 bg-amber-500/10"
          style={{ borderBottom: "1px solid var(--raga-border)" }}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              {payload.summary.warnings.map((warning, index) => (
                <p key={index} className="text-sm text-amber-700 dark:text-amber-400">
                  {warning}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSteps && (
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium" style={{ color: "var(--raga-foreground)" }}>
              Transaction Steps ({payload.txs.length})
            </p>
            {showGasEstimate && (
              <span className="text-xs flex items-center gap-1" style={{ color: "var(--raga-muted-foreground)" }}>
                <Fuel className="w-3.5 h-3.5" />
                Total: {formatGas(totalGas.toString())} gas
              </span>
            )}
          </div>
          <div className="space-y-2">
            {payload.txs.map((step, index) => (
              <StepItem
                key={index}
                step={step}
                index={index}
                isActive={currentStep === index}
                isCompleted={completedSteps?.includes(index)}
                showDetails={expandSteps}
              />
            ))}
          </div>
        </div>
      )}

      <div
        className="px-5 py-3"
        style={{
          borderTop: "1px solid var(--raga-border)",
          backgroundColor: "color-mix(in srgb, var(--raga-muted) 30%, transparent)",
        }}
      >
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--raga-muted-foreground)" }}>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Estimated time: ~{payload.txs.length * 15}s
          </span>
          <span>Balance: {payload.summary.userBalance} {payload.summary.assetSymbol}</span>
        </div>
      </div>
    </div>
  )
}
