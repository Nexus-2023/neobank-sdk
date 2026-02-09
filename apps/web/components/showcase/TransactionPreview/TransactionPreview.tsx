"use client"

import { cn } from "@/lib/utils"
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
import { formatAddress } from "../shared/formatters"

export type TransactionPreviewVariant = "default" | "compact" | "steps-only"

export interface TransactionPreviewProps {
  /** Transaction payload to display */
  payload: TransactionPayload

  /** Visual variant */
  variant?: TransactionPreviewVariant

  /** Display options */
  showVaultInfo?: boolean
  showSteps?: boolean
  showSummary?: boolean
  showWarnings?: boolean
  showGasEstimate?: boolean
  expandSteps?: boolean

  /** Current step being executed (0-indexed, -1 for none) */
  currentStep?: number

  /** Completed steps */
  completedSteps?: number[]

  /** Standard props */
  className?: string
}

const STEP_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  approve: { label: "Approve", icon: <Shield className="w-4 h-4" />, color: "text-blue-500" },
  deposit: { label: "Deposit", icon: <ArrowRight className="w-4 h-4" />, color: "text-green-500" },
  withdraw: { label: "Withdraw", icon: <ArrowRight className="w-4 h-4 rotate-180" />, color: "text-orange-500" },
  redeem: { label: "Redeem", icon: <ArrowRight className="w-4 h-4 rotate-180" />, color: "text-purple-500" },
}

function formatGas(gasEstimate: string): string {
  const gas = parseInt(gasEstimate, 10)
  if (isNaN(gas)) return gasEstimate
  if (gas >= 1000000) return `${(gas / 1000000).toFixed(2)}M`
  if (gas >= 1000) return `${(gas / 1000).toFixed(1)}K`
  return gas.toString()
}

function formatGasCost(gasCostInWei: string): string {
  const cost = parseFloat(gasCostInWei)
  if (isNaN(cost)) return gasCostInWei
  const costInEth = cost / 1e18
  if (costInEth < 0.0001) return "< 0.0001 ETH"
  return `${costInEth.toFixed(4)} ETH`
}

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
  const defaultConfig = { label: "Action", icon: <ArrowRight className="w-4 h-4" />, color: "text-foreground" }
  const config = STEP_TYPE_CONFIG[step.type] ?? defaultConfig

  const getStatusIcon = () => {
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-[var(--showcase-positive)]" />
    }
    if (isActive) {
      return (
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      )
    }
    if (!step.simulationSuccess) {
      return <AlertCircle className="w-5 h-5 text-[var(--showcase-negative)]" />
    }
    return (
      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center text-xs font-medium text-muted-foreground">
        {index + 1}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-lg border transition-colors",
        isActive
          ? "border-primary bg-primary/5"
          : isCompleted
            ? "border-[var(--showcase-positive)]/30 bg-[var(--showcase-positive)]/5"
            : "border-border bg-card"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 p-3",
          showDetails && "cursor-pointer"
        )}
        onClick={() => showDetails && setExpanded(!expanded)}
      >
        {getStatusIcon()}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", config.color)}>
              {config.label}
            </span>
            {!step.simulationSuccess && (
              <span className="text-xs text-[var(--showcase-negative)] bg-[var(--showcase-negative)]/10 px-1.5 py-0.5 rounded">
                Simulation Failed
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {step.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Fuel className="w-3 h-3" />
            {formatGas(step.gasEstimate)}
          </span>
          {showDetails && (
            expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )
          )}
        </div>
      </div>

      {showDetails && expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-border mt-0 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div>
              <span className="text-muted-foreground">From:</span>
              <span className="ml-1 font-mono">{formatAddress(step.from)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">To:</span>
              <span className="ml-1 font-mono">{formatAddress(step.to)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Gas Cost:</span>
              <span className="ml-1">{formatGasCost(step.gasCostInWei)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Value:</span>
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
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {payload.summary.inputAmount} {payload.summary.assetSymbol}
          </p>
          <p className="text-xs text-muted-foreground">{payload.vaultName}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground" />
        <div className="text-right">
          <p className="text-sm font-medium text-[var(--showcase-positive)]">
            {payload.summary.preview.expectedOutput} {payload.summary.preview.outputSymbol}
          </p>
          <p className="text-xs text-muted-foreground">
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

  // Compact variant
  if (variant === "compact") {
    return (
      <TransactionPreviewCompact
        payload={payload}
        showWarnings={showWarnings}
        className={className}
      />
    )
  }

  // Steps only variant
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

  // Default full variant
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      {/* Vault Info */}
      {showVaultInfo && (
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Vault</p>
              <p className="font-medium text-foreground">{payload.vaultName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-0.5">Address</p>
              <p className="font-mono text-sm text-foreground">
                {formatAddress(payload.vaultAddress)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {showSummary && (
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">You Send</p>
              <p className="text-xl font-bold text-foreground">
                {payload.summary.inputAmount} {payload.summary.assetSymbol}
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">You Receive</p>
              <p className="text-xl font-bold text-[var(--showcase-positive)]">
                {payload.summary.preview.expectedOutput}{" "}
                {payload.summary.preview.outputSymbol}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Rate: 1 {payload.summary.assetSymbol} ={" "}
            {payload.summary.preview.exchangeRate} {payload.summary.preview.outputSymbol}
          </p>
        </div>
      )}

      {/* Warnings */}
      {showWarnings && hasWarnings && (
        <div className="px-5 py-3 border-b border-border bg-amber-500/10">
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

      {/* Steps */}
      {showSteps && (
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-foreground">
              Transaction Steps ({payload.txs.length})
            </p>
            {showGasEstimate && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
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

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
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
