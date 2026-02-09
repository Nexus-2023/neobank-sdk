"use client"

import { cn } from "../utils"
import { Vault, Search } from "lucide-react"

export interface VaultShowcaseEmptyProps {
  message?: string
  isFiltered?: boolean
  onClearFilters?: () => void
  className?: string
}

export function VaultShowcaseEmpty({
  message,
  isFiltered = false,
  onClearFilters,
  className,
}: VaultShowcaseEmptyProps) {
  return (
    <div
      className={cn("rounded-xl p-12 text-center", className)}
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
        {isFiltered ? (
          <Search className="w-6 h-6" style={{ color: "var(--raga-muted-foreground)" }} />
        ) : (
          <Vault className="w-6 h-6" style={{ color: "var(--raga-muted-foreground)" }} />
        )}
      </div>

      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--raga-foreground)" }}
      >
        {isFiltered ? "No Matching Vaults" : "No Vaults Available"}
      </h3>

      <p
        className="text-sm mb-6 max-w-sm mx-auto"
        style={{ color: "var(--raga-muted-foreground)" }}
      >
        {message ||
          (isFiltered
            ? "Try adjusting your filters to find more vaults."
            : "There are no vaults available at this time. Check back later.")}
      </p>

      {isFiltered && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            borderRadius: "var(--raga-radius-lg)",
            backgroundColor: "var(--raga-muted)",
            color: "var(--raga-foreground)",
          }}
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
