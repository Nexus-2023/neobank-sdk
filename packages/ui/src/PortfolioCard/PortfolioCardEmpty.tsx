"use client"

import { cn } from "../utils"
import { Wallet, ArrowRight } from "lucide-react"

export interface PortfolioCardEmptyProps {
  onDeposit?: () => void
  className?: string
}

export function PortfolioCardEmpty({
  onDeposit,
  className,
}: PortfolioCardEmptyProps) {
  return (
    <div
      className={cn("rounded-xl p-8 text-center", className)}
      style={{
        borderRadius: "var(--raga-radius-xl)",
        border: "1px dashed var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: "var(--raga-muted)" }}
      >
        <Wallet className="w-6 h-6" style={{ color: "var(--raga-muted-foreground)" }} />
      </div>

      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--raga-foreground)" }}
      >
        No Positions Yet
      </h3>

      <p
        className="text-sm mb-6 max-w-xs mx-auto"
        style={{ color: "var(--raga-muted-foreground)" }}
      >
        Start earning yield by depositing into a vault. Your positions will appear here.
      </p>

      {onDeposit && (
        <button
          onClick={onDeposit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            borderRadius: "var(--raga-radius-lg)",
            backgroundColor: "var(--raga-primary)",
            color: "var(--raga-primary-foreground)",
          }}
        >
          Make a Deposit
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
