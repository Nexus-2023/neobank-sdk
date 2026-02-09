"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "../utils"

export interface AddressDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  address: string
  truncate?: boolean
  showCopy?: boolean
  prefixLength?: number
  suffixLength?: number
}

export function AddressDisplay({
  address,
  truncate = true,
  showCopy = true,
  prefixLength = 6,
  suffixLength = 4,
  className,
  ...props
}: AddressDisplayProps) {
  const [copied, setCopied] = React.useState(false)

  const displayAddress = truncate
    ? `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`
    : address

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-sm",
        className
      )}
      {...props}
    >
      <code
        className="px-1.5 py-0.5 rounded text-xs"
        style={{
          backgroundColor: "var(--raga-muted)",
          color: "var(--raga-muted-foreground)",
        }}
      >
        {displayAddress}
      </code>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="p-1 rounded transition-colors"
          style={{ color: "var(--raga-muted-foreground)" }}
          title="Copy address"
        >
          {copied ? (
            <Check className="w-3 h-3" style={{ color: "var(--raga-success)" }} />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  )
}
