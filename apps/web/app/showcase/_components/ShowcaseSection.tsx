"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Copy, Check } from "lucide-react"

export interface ShowcaseSectionProps {
  title: string
  description: string
  children: React.ReactNode
  codeSnippet?: string
  className?: string
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative mt-4 rounded-lg bg-muted overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">Usage</span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-background/50 transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[var(--showcase-positive)]" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-foreground/90">{code}</code>
      </pre>
    </div>
  )
}

export function ShowcaseSection({
  title,
  description,
  children,
  codeSnippet,
  className,
}: ShowcaseSectionProps) {
  const [showCode, setShowCode] = useState(false)

  return (
    <section
      className={cn("py-12 border-b border-border last:border-b-0", className)}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
      </div>

      <div className="space-y-8">{children}</div>

      {codeSnippet && (
        <div className="mt-8">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                showCode && "rotate-180",
              )}
            />
            {showCode ? "Hide code" : "Show code"}
          </button>
          {showCode && <CodeBlock code={codeSnippet} />}
        </div>
      )}
    </section>
  )
}

export function ShowcaseGrid({
  children,
  columns = 3,
  className,
}: {
  children: React.ReactNode
  columns?: 1 | 2 | 3
  className?: string
}) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  }

  return (
    <div className={cn("grid gap-6", colClasses[columns], className)}>
      {children}
    </div>
  )
}

export function ShowcaseItem({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
        {label}
      </p>
      {children}
    </div>
  )
}
