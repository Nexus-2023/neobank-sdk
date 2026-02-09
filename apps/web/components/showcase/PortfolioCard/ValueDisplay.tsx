"use client"

import { cn } from "@/lib/utils"
import { formatCurrency, formatPercentage } from "../shared/formatters"

export interface ValueDisplayProps {
  value: string | number
  change?: {
    absolute: number
    percentage: number
    isPositive: boolean
  }
  size?: "sm" | "md" | "lg"
  showChange?: boolean
  className?: string
}

export function ValueDisplay({
  value,
  change,
  size = "md",
  showChange = true,
  className,
}: ValueDisplayProps) {
  const sizeClasses = {
    sm: "text-lg font-semibold",
    md: "text-2xl font-bold",
    lg: "text-3xl font-bold",
  }

  const changeSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <span className={cn("text-foreground", sizeClasses[size])}>
        {formatCurrency(value)}
      </span>
      {showChange && change && (
        <span
          className={cn(
            changeSizeClasses[size],
            "font-medium",
            change.isPositive
              ? "text-[var(--showcase-positive)]"
              : "text-[var(--showcase-negative)]"
          )}
        >
          {formatCurrency(change.absolute, { showSign: true })} (
          {formatPercentage(change.percentage)})
        </span>
      )}
    </div>
  )
}
