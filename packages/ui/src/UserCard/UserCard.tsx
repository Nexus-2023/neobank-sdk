"use client"

import { cn } from "../utils"
import { useUser } from "@raga-neobank/react"
import type { User } from "@raga-neobank/core"
import { User as UserIcon, Building2, Calendar, RefreshCw, Copy, Check, ExternalLink } from "lucide-react"
import { useState, useCallback } from "react"
import { formatAddress, formatDate } from "../formatters"
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
      className="inline-flex items-center gap-1.5 text-sm font-mono transition-colors"
      style={{ color: "var(--raga-muted-foreground)" }}
    >
      {formatAddress(address)}
      {copied ? (
        <Check className="w-3.5 h-3.5" style={{ color: "var(--raga-positive)" }} />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  )
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={
        enabled
          ? {
              backgroundColor: "color-mix(in srgb, var(--raga-positive) 10%, transparent)",
              color: "var(--raga-positive)",
            }
          : {
              backgroundColor: "var(--raga-muted)",
              color: "var(--raga-muted-foreground)",
            }
      }
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: enabled ? "var(--raga-positive)" : "var(--raga-muted-foreground)",
        }}
      />
      {enabled ? "Active" : "Inactive"}
    </span>
  )
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
      className={cn("rounded-xl border-2 border-dashed p-6", className)}
      style={{
        borderRadius: "var(--raga-radius-xl)",
        borderColor: "color-mix(in srgb, var(--raga-error) 50%, transparent)",
        backgroundColor: "var(--raga-error-light)",
      }}
    >
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: "var(--raga-error)" }}>
          Failed to load user
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: "color-mix(in srgb, var(--raga-error) 75%, transparent)" }}
        >
          {error.message || "Unknown error"}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
            style={{
              borderRadius: "var(--raga-radius-lg)",
              backgroundColor: "var(--raga-error)",
            }}
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
      className={cn("rounded-xl border border-dashed p-6 text-center", className)}
      style={{
        borderRadius: "var(--raga-radius-xl)",
        borderColor: "var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
        style={{ backgroundColor: "var(--raga-muted)" }}
      >
        <UserIcon className="w-5 h-5" style={{ color: "var(--raga-muted-foreground)" }} />
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--raga-foreground)" }}>
        Not Connected
      </p>
      <p className="text-xs" style={{ color: "var(--raga-muted-foreground)" }}>
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
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "color-mix(in srgb, var(--raga-primary) 10%, transparent)" }}
      >
        <UserIcon className="w-3.5 h-3.5" style={{ color: "var(--raga-primary)" }} />
      </div>
      <span className="text-sm font-mono" style={{ color: "var(--raga-foreground)" }}>
        {formatAddress(user.address)}
      </span>
      {showStatus && (
        <span
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: user.isEnabled
              ? "var(--raga-positive)"
              : "var(--raga-muted-foreground)",
          }}
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
        "flex items-center gap-3 p-3 transition-colors",
        onViewDetails && "cursor-pointer",
        className
      )}
      style={{
        borderRadius: "var(--raga-radius-lg)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: "color-mix(in srgb, var(--raga-primary) 10%, transparent)" }}
      >
        <UserIcon className="w-5 h-5" style={{ color: "var(--raga-primary)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm truncate" style={{ color: "var(--raga-foreground)" }}>
          {formatAddress(user.address, { prefixLength: 8, suffixLength: 6 })}
        </p>
        <p className="text-xs" style={{ color: "var(--raga-muted-foreground)" }}>
          User Account
        </p>
      </div>
      {showStatus && <StatusBadge enabled={user.isEnabled} />}
      {onViewDetails && (
        <ExternalLink className="w-4 h-4 shrink-0" style={{ color: "var(--raga-muted-foreground)" }} />
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
      className={cn("rounded-xl overflow-hidden", className)}
      style={{
        borderRadius: "var(--raga-radius-xl)",
        border: "1px solid var(--raga-border)",
        backgroundColor: "var(--raga-card)",
      }}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "color-mix(in srgb, var(--raga-primary) 10%, transparent)" }}
          >
            <UserIcon className="w-7 h-7" style={{ color: "var(--raga-primary)" }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm mb-1" style={{ color: "var(--raga-muted-foreground)" }}>
              Wallet Address
            </p>
            <AddressCopy address={user.address} />

            <div className="flex flex-wrap gap-2 mt-3">
              {showStatus && <StatusBadge enabled={user.isEnabled} />}
              {showBank && user.bankId && (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: "var(--raga-muted)",
                    color: "var(--raga-muted-foreground)",
                  }}
                >
                  <Building2 className="w-3 h-3" />
                  Bank Connected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDates && (user.createdOn || user.updatedOn) && (
        <div
          className="px-6 py-4"
          style={{
            borderTop: "1px solid var(--raga-border)",
            backgroundColor: "color-mix(in srgb, var(--raga-muted) 30%, transparent)",
          }}
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            {user.createdOn && (
              <div>
                <p className="text-xs mb-0.5" style={{ color: "var(--raga-muted-foreground)" }}>
                  Created
                </p>
                <p className="font-medium flex items-center gap-1.5" style={{ color: "var(--raga-foreground)" }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: "var(--raga-muted-foreground)" }} />
                  {formatDate(user.createdOn)}
                </p>
              </div>
            )}
            {user.updatedOn && (
              <div>
                <p className="text-xs mb-0.5" style={{ color: "var(--raga-muted-foreground)" }}>
                  Updated
                </p>
                <p className="font-medium flex items-center gap-1.5" style={{ color: "var(--raga-foreground)" }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: "var(--raga-muted-foreground)" }} />
                  {formatDate(user.updatedOn)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {onViewDetails && (
        <div className="px-6 py-3" style={{ borderTop: "1px solid var(--raga-border)" }}>
          <button
            onClick={() => onViewDetails(user)}
            className="w-full py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
            style={{ color: "var(--raga-primary)" }}
          >
            View Details
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
