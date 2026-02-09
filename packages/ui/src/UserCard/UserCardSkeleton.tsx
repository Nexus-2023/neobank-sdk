"use client"

import { cn } from "../utils"

export type UserCardVariant = "default" | "compact" | "minimal"

export interface UserCardSkeletonProps {
  variant?: UserCardVariant
  className?: string
}

export function UserCardSkeleton({
  variant = "default",
  className,
}: UserCardSkeletonProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="raga-skeleton w-6 h-6 rounded-full" />
        <div className="raga-skeleton h-4 w-24 rounded" />
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div
        className={cn("flex items-center gap-3 p-3 rounded-lg", className)}
        style={{
          borderRadius: "var(--raga-radius-lg)",
          border: "1px solid var(--raga-border)",
          backgroundColor: "var(--raga-card)",
        }}
      >
        <div className="raga-skeleton w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="raga-skeleton h-4 w-28 rounded" />
          <div className="raga-skeleton h-3 w-20 rounded" />
        </div>
        <div className="raga-skeleton w-16 h-6 rounded-full shrink-0" />
      </div>
    )
  }

  return (
    <div
      className={cn("rounded-xl p-6", className)}
      style={{
        borderRadius: "var(--raga-radius-xl)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="raga-skeleton w-14 h-14 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="raga-skeleton h-5 w-32 rounded" />
          <div className="raga-skeleton h-4 w-48 rounded" />
          <div className="flex gap-2 pt-1">
            <div className="raga-skeleton h-6 w-16 rounded-full" />
            <div className="raga-skeleton h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div
        className="mt-6 pt-4 space-y-3"
        style={{ borderTop: "1px solid var(--raga-border)" }}
      >
        <div className="flex justify-between">
          <div className="raga-skeleton h-4 w-16 rounded" />
          <div className="raga-skeleton h-4 w-24 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="raga-skeleton h-4 w-20 rounded" />
          <div className="raga-skeleton h-4 w-28 rounded" />
        </div>
      </div>
    </div>
  )
}
