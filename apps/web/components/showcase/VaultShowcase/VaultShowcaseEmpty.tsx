"use client"

import { cn } from "@/lib/utils"
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
      className={cn(
        "rounded-xl border border-dashed border-border bg-card p-12 text-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        {isFiltered ? (
          <Search className="w-6 h-6 text-muted-foreground" />
        ) : (
          <Vault className="w-6 h-6 text-muted-foreground" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {isFiltered ? "No Matching Vaults" : "No Vaults Available"}
      </h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        {message ||
          (isFiltered
            ? "Try adjusting your filters to find more vaults."
            : "There are no vaults available at this time. Check back later.")}
      </p>

      {isFiltered && onClearFilters && (
        <button
          onClick={onClearFilters}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-muted text-foreground",
            "hover:bg-muted/80 transition-colors",
            "text-sm font-medium"
          )}
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
