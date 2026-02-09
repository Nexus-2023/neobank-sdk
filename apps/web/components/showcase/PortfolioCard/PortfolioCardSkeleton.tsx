"use client"

import { cn } from "@/lib/utils"

export type PortfolioCardVariant = "default" | "compact" | "minimal"

export interface PortfolioCardSkeletonProps {
  variant?: PortfolioCardVariant
  className?: string
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-muted",
        className
      )}
    />
  )
}

export function PortfolioCardSkeleton({
  variant = "default",
  className,
}: PortfolioCardSkeletonProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-4",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Positions */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-3 w-12 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
