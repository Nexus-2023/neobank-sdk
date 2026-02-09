"use client"

import { cn } from "@/lib/utils"

export type VaultShowcaseVariant = "grid" | "list" | "compact"

export interface VaultShowcaseSkeletonProps {
  variant?: VaultShowcaseVariant
  count?: number
  className?: string
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-muted", className)} />
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-11 h-11 rounded-lg" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <Skeleton className="h-5 w-32 mb-2" />
      <Skeleton className="h-4 w-20 mb-4" />
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-9 rounded-lg" />
        <Skeleton className="flex-1 h-9 rounded-lg" />
      </div>
    </div>
  )
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 px-4 rounded-lg border border-border bg-card">
      <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="text-right space-y-1 shrink-0">
        <Skeleton className="h-4 w-8 ml-auto" />
        <Skeleton className="h-3 w-16 ml-auto" />
      </div>
      <Skeleton className="w-20 h-8 rounded-md shrink-0" />
    </div>
  )
}

function CompactSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg border border-border bg-card">
      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
      <Skeleton className="h-4 w-28 flex-1" />
      <Skeleton className="h-4 w-16 shrink-0" />
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
