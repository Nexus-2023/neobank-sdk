"use client"

import { cn } from "../utils"

export type PortfolioCardVariant = "default" | "compact" | "minimal"

export interface PortfolioCardSkeletonProps {
  variant?: PortfolioCardVariant
  className?: string
}

export function PortfolioCardSkeleton({
  variant = "default",
  className,
}: PortfolioCardSkeletonProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="raga-skeleton h-5 w-24 rounded" />
        <div className="raga-skeleton h-4 w-16 rounded" />
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div
        className={cn("rounded-xl p-4", className)}
        style={{
          borderRadius: "var(--raga-radius-xl)",
          border: "1px solid var(--raga-border)",
          backgroundColor: "var(--raga-card)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="raga-skeleton h-4 w-20 rounded" />
            <div className="raga-skeleton h-6 w-28 rounded" />
          </div>
          <div className="raga-skeleton h-8 w-8 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("rounded-xl overflow-hidden", className)}
      style={{
        borderRadius: "var(--raga-radius-xl)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      {/* Header */}
      <div
        className="p-6"
        style={{ borderBottom: "1px solid var(--raga-border)" }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="raga-skeleton h-4 w-24 rounded" />
            <div className="raga-skeleton h-8 w-36 rounded" />
            <div className="raga-skeleton h-4 w-28 rounded" />
          </div>
          <div className="raga-skeleton h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Positions */}
      <div className="p-4 space-y-3">
        <div className="raga-skeleton h-4 w-20 mb-4 rounded" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{
              borderRadius: "var(--raga-radius-lg)",
              border: "1px solid var(--raga-border)",
            }}
          >
            <div
              className="raga-skeleton h-8 w-8 shrink-0"
              style={{ borderRadius: "var(--raga-radius-lg)" }}
            />
            <div className="flex-1 space-y-2">
              <div className="raga-skeleton h-4 w-32 rounded" />
              <div className="raga-skeleton h-3 w-16 rounded" />
            </div>
            <div className="text-right space-y-2">
              <div className="raga-skeleton h-4 w-20 ml-auto rounded" />
              <div className="raga-skeleton h-3 w-12 ml-auto rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
