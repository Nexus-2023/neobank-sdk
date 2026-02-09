"use client"

import { cn } from "@/lib/utils"
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
      className={cn(
        "rounded-xl border border-dashed border-border bg-card p-8 text-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Wallet className="w-6 h-6 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        No Positions Yet
      </h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        Start earning yield by depositing into a vault. Your positions will appear here.
      </p>

      {onDeposit && (
        <button
          onClick={onDeposit}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "text-sm font-medium"
          )}
        >
          Make a Deposit
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
