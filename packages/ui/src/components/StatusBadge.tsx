"use client"

import * as React from "react"
import { cn } from "../utils"

export type StatusBadgeVariant = "success" | "warning" | "error" | "neutral"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusBadgeVariant
  dot?: boolean
  children: React.ReactNode
}

const variantStyles: Record<StatusBadgeVariant, React.CSSProperties> = {
  success: { backgroundColor: "var(--raga-success-light)", color: "var(--raga-success)" },
  warning: { backgroundColor: "var(--raga-warning-light)", color: "var(--raga-warning)" },
  error: { backgroundColor: "var(--raga-error-light)", color: "var(--raga-error)" },
  neutral: { backgroundColor: "var(--raga-muted)", color: "var(--raga-muted-foreground)" },
}

const dotColors: Record<StatusBadgeVariant, string> = {
  success: "var(--raga-success)",
  warning: "var(--raga-warning)",
  error: "var(--raga-error)",
  neutral: "var(--raga-muted-foreground)",
}

export function StatusBadge({
  variant = "neutral",
  dot = false,
  className,
  style,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        className
      )}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: dotColors[variant] }}
        />
      )}
      {children}
    </span>
  )
}
