"use client"

import * as React from "react"
import { cn } from "../utils"

export interface ChainBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  chainId: number
}

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  10: "Optimism",
  137: "Polygon",
  8453: "Base",
  42161: "Arbitrum",
  43114: "Avalanche",
  56: "BSC",
}

export function ChainBadge({ chainId, className, style, ...props }: ChainBadgeProps) {
  const chainName = CHAIN_NAMES[chainId] || `Chain ${chainId}`

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
        className
      )}
      style={{
        backgroundColor: "var(--raga-muted)",
        color: "var(--raga-muted-foreground)",
        ...style,
      }}
      {...props}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: "var(--raga-success)" }}
      />
      {chainName}
    </span>
  )
}
