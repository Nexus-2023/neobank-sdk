"use client"

import { cn } from "../utils"

export type VaultShowcaseVariant = "grid" | "list" | "compact"

export interface VaultShowcaseSkeletonProps {
  variant?: VaultShowcaseVariant
  count?: number
  className?: string
}

function CardSkeleton() {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        borderRadius: "var(--raga-radius-xl)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="raga-skeleton w-11 h-11"
          style={{ borderRadius: "var(--raga-radius-lg)" }}
        />
        <div className="raga-skeleton w-16 h-6 rounded-full" />
      </div>
      <div className="raga-skeleton h-5 w-32 mb-2 rounded" />
      <div className="raga-skeleton h-4 w-20 mb-4 rounded" />
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <div className="raga-skeleton h-4 w-16 rounded" />
          <div className="raga-skeleton h-4 w-24 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="raga-skeleton h-4 w-20 rounded" />
          <div className="raga-skeleton h-4 w-16 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <div
          className="raga-skeleton flex-1 h-9"
          style={{ borderRadius: "var(--raga-radius-lg)" }}
        />
        <div
          className="raga-skeleton flex-1 h-9"
          style={{ borderRadius: "var(--raga-radius-lg)" }}
        />
      </div>
    </div>
  )
}

function RowSkeleton() {
  return (
    <div
      className="flex items-center gap-4 py-4 px-4 rounded-lg"
      style={{
        borderRadius: "var(--raga-radius-lg)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      <div
        className="raga-skeleton w-10 h-10 shrink-0"
        style={{ borderRadius: "var(--raga-radius-lg)" }}
      />
      <div className="flex-1 space-y-2">
        <div className="raga-skeleton h-5 w-36 rounded" />
        <div className="raga-skeleton h-4 w-24 rounded" />
      </div>
      <div className="text-right space-y-1 shrink-0">
        <div className="raga-skeleton h-4 w-8 ml-auto rounded" />
        <div className="raga-skeleton h-3 w-16 ml-auto rounded" />
      </div>
      <div
        className="raga-skeleton w-20 h-8 shrink-0"
        style={{ borderRadius: "var(--raga-radius-md)" }}
      />
    </div>
  )
}

function CompactSkeleton() {
  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-lg"
      style={{
        borderRadius: "var(--raga-radius-lg)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      <div
        className="raga-skeleton w-8 h-8 shrink-0"
        style={{ borderRadius: "var(--raga-radius-lg)" }}
      />
      <div className="raga-skeleton h-4 w-28 flex-1 rounded" />
      <div className="raga-skeleton h-4 w-16 shrink-0 rounded" />
    </div>
  )
}

export function VaultShowcaseSkeleton({
  variant = "grid",
  count = 3,
  className,
}: VaultShowcaseSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        {items.map((i) => (
          <CompactSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {items.map((i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {items.map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
