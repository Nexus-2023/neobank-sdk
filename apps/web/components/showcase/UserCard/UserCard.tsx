"use client"

import { cn } from "@/lib/utils"
import { useUser } from "@raga-neobank/react"
import type { User } from "@raga-neobank/core"
import { User as UserIcon, Building2, Calendar, RefreshCw, Copy, Check, ExternalLink } from "lucide-react"
import { useState, useCallback } from "react"
import { formatAddress } from "../shared/formatters"
import { UserCardSkeleton, type UserCardVariant } from "./UserCardSkeleton"

export interface UserCardProps {
  /** User data (uses internal hook if not provided) */
  user?: User

  /** Visual variant */
  variant?: UserCardVariant

  /** Display options */
  showBank?: boolean
  showDates?: boolean
  showStatus?: boolean

  /** Callbacks */
  onViewDetails?: (user: User) => void

  /** State overrides */
  isLoading?: boolean
  error?: Error | null

  /** Standard props */
  className?: string
}

function AddressCopy({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [address])

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
    >
      {formatAddress(address)}
      {copied ? (
        <Check className="w-3.5 h-3.5 text-[var(--showcase-positive)]" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  )
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        enabled
          ? "bg-[var(--showcase-positive)]/10 text-[var(--showcase-positive)]"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          enabled ? "bg-[var(--showcase-positive)]" : "bg-muted-foreground"
        )}
      />
      {enabled ? "Active" : "Inactive"}
    </span>
  )
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

function UserCardError({
  error,
  onRetry,
  className,
}: {
  error: Error
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed border-destructive/50 bg-destructive/5 p-6",
        className
      )}
    >
      <div className="text-center">
        <p className="text-sm font-medium text-destructive">
          Failed to load user
        </p>
        <p className="text-xs text-destructive/75 mt-1">
          {error.message || "Unknown error"}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

function UserCardEmpty({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border bg-card p-6 text-center",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
        <UserIcon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">Not Connected</p>
      <p className="text-xs text-muted-foreground">
        Connect your wallet to view your profile
      </p>
    </div>
  )
}

function UserCardMinimal({
  user,
  showStatus,
  className,
}: {
  user: User
  showStatus?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
        <UserIcon className="w-3.5 h-3.5 text-primary" />
      </div>
      <span className="text-sm font-mono text-foreground">
        {formatAddress(user.address)}
      </span>
      {showStatus && (
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            user.isEnabled ? "bg-[var(--showcase-positive)]" : "bg-muted-foreground"
          )}
        />
      )}
    </div>
  )
}

function UserCardCompact({
  user,
  showStatus,
  onViewDetails,
  className,
}: {
  user: User
  showStatus?: boolean
  onViewDetails?: (user: User) => void
  className?: string
}) {
  return (
    <div
      onClick={() => onViewDetails?.(user)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-border bg-card",
        "transition-colors",
        onViewDetails && "cursor-pointer hover:bg-muted/50",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <UserIcon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm text-foreground truncate">
          {formatAddress(user.address, { prefixLength: 8, suffixLength: 6 })}
        </p>
        <p className="text-xs text-muted-foreground">User Account</p>
      </div>
      {showStatus && <StatusBadge enabled={user.isEnabled} />}
      {onViewDetails && (
        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
      )}
    </div>
  )
}

export function UserCard({
  user: userProp,
  variant = "default",
  showBank = true,
  showDates = true,
  showStatus = true,
  onViewDetails,
  isLoading: isLoadingProp,
  error: errorProp,
  className,
}: UserCardProps) {
  // Use hook if no data provided
  const {
    data: hookData,
    isLoading: hookLoading,
    error: hookError,
    refetch,
  } = useUser()

  const user = userProp ?? hookData
  const isLoading = isLoadingProp ?? (!userProp && hookLoading)
  const error = errorProp ?? (!userProp ? hookError : null)

  // Loading state
  if (isLoading) {
    return <UserCardSkeleton variant={variant} className={className} />
  }

  // Error state
  if (error) {
    return (
      <UserCardError
        error={error instanceof Error ? error : new Error(String(error))}
        onRetry={() => refetch()}
        className={className}
      />
    )
  }

  // Empty state
  if (!user) {
    return <UserCardEmpty className={className} />
  }

  // Minimal variant
  if (variant === "minimal") {
    return (
      <UserCardMinimal
        user={user}
        showStatus={showStatus}
        className={className}
      />
    )
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <UserCardCompact
        user={user}
        showStatus={showStatus}
        onViewDetails={onViewDetails}
        className={className}
      />
    )
  }

  // Default full variant
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <UserIcon className="w-7 h-7 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
            <AddressCopy address={user.address} />

            <div className="flex flex-wrap gap-2 mt-3">
              {showStatus && <StatusBadge enabled={user.isEnabled} />}
              {showBank && user.bankId && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  <Building2 className="w-3 h-3" />
                  Bank Connected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDates && (user.createdOn || user.updatedOn) && (
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {user.createdOn && (
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Created</p>
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatDate(user.createdOn)}
                </p>
              </div>
            )}
            {user.updatedOn && (
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Updated</p>
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatDate(user.updatedOn)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {onViewDetails && (
        <div className="px-6 py-3 border-t border-border">
          <button
            onClick={() => onViewDetails(user)}
            className="w-full py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5"
          >
            View Details
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
