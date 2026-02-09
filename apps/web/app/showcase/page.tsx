"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Package, Sparkles } from "lucide-react"
import {
  PortfolioCard,
  PortfolioCardSkeleton,
  PortfolioCardEmpty,
  VaultShowcase,
  VaultShowcaseSkeleton,
  VaultShowcaseEmpty,
  VaultItem,
  UserCard,
  UserCardSkeleton,
  TransactionPreview,
} from "@raga-neobank/ui"
import type {
  Portfolio,
  Vault,
  User,
  TransactionPayload,
} from "@raga-neobank/core"
import {
  ShowcaseSection,
  ShowcaseGrid,
  ShowcaseItem,
} from "./_components/ShowcaseSection"

// Mock data for demonstrations
const MOCK_PORTFOLIO: Portfolio = {
  bank: {
    name: "Raga Finance",
    legalName: "Raga Finance Inc.",
  },
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  positions: [
    {
      vaultName: "High Yield USDC",
      vaultAddress: "0x1234567890123456789012345678901234567890",
      chainId: 8453,
      decimals: 6,
      depositValueInAsset: "10000000000",
      depositValueInUsd: "10000.00",
      currentValueInAsset: "10850000000",
      currentValueInUsd: "10850.00",
    },
    {
      vaultName: "ETH Growth Vault",
      vaultAddress: "0x2345678901234567890123456789012345678901",
      chainId: 1,
      decimals: 18,
      depositValueInAsset: "5000000000000000000",
      depositValueInUsd: "5000.00",
      currentValueInAsset: "4800000000000000000",
      currentValueInUsd: "4800.00",
    },
    {
      vaultName: "Stable Yield",
      vaultAddress: "0x3456789012345678901234567890123456789012",
      chainId: 137,
      decimals: 6,
      depositValueInAsset: "2500000000",
      depositValueInUsd: "2500.00",
      currentValueInAsset: "2575000000",
      currentValueInUsd: "2575.00",
    },
  ],
}

const MOCK_VAULTS: Vault[] = [
  {
    id: "vault-1",
    curatorId: "curator-1",
    vaultName: "High Yield USDC",
    vaultAddress: "0x1234567890123456789012345678901234567890",
    chainId: 8453,
    isEnabled: true,
    depositEnabled: true,
    strategyAllocations: [
      { strategyId: "strat-1", allocationSplit: 60 },
      { strategyId: "strat-2", allocationSplit: 40 },
    ],
  },
  {
    id: "vault-2",
    curatorId: "curator-1",
    vaultName: "ETH Growth Vault",
    vaultAddress: "0x2345678901234567890123456789012345678901",
    chainId: 1,
    isEnabled: true,
    depositEnabled: true,
    strategyAllocations: [{ strategyId: "strat-3", allocationSplit: 100 }],
  },
  {
    id: "vault-3",
    curatorId: "curator-2",
    vaultName: "Stable Yield",
    vaultAddress: "0x3456789012345678901234567890123456789012",
    chainId: 137,
    isEnabled: true,
    depositEnabled: false,
    strategyAllocations: [],
  },
  {
    id: "vault-4",
    curatorId: "curator-2",
    vaultName: "Arbitrum Optimizer",
    vaultAddress: "0x4567890123456789012345678901234567890123",
    chainId: 42161,
    isEnabled: false,
    depositEnabled: false,
    strategyAllocations: [
      { strategyId: "strat-4", allocationSplit: 50 },
      { strategyId: "strat-5", allocationSplit: 50 },
    ],
  },
]

const MOCK_USER: User = {
  id: "user-1",
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  isEnabled: true,
  bankId: "bank-1",
  createdOn: "2024-01-15T10:30:00Z",
  updatedOn: "2024-06-20T14:45:00Z",
}

const MOCK_TX_PAYLOAD: TransactionPayload = {
  vaultId: "vault-1",
  vaultName: "High Yield USDC",
  vaultAddress: "0x1234567890123456789012345678901234567890",
  chainId: 8453,
  txs: [
    {
      step: 1,
      type: "approve",
      description: "Approve USDC spending",
      to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
      value: "0",
      data: "0x095ea7b3...",
      gasEstimate: "46000",
      gasCostInWei: "920000000000000",
      simulationSuccess: true,
    },
    {
      step: 2,
      type: "deposit",
      description: "Deposit USDC into vault",
      to: "0x1234567890123456789012345678901234567890",
      from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
      value: "0",
      data: "0x6e553f65...",
      gasEstimate: "185000",
      gasCostInWei: "3700000000000000",
      simulationSuccess: true,
    },
  ],
  summary: {
    inputAmount: "1000",
    assetSymbol: "USDC",
    decimals: 6,
    preview: {
      expectedOutput: "985.50",
      outputSymbol: "rvUSDC",
      exchangeRate: "0.9855",
    },
    warnings: [],
    userBalance: "5000",
  },
}

const MOCK_TX_WITH_WARNING: TransactionPayload = {
  ...MOCK_TX_PAYLOAD,
  summary: {
    ...MOCK_TX_PAYLOAD.summary,
    warnings: ["Slippage may exceed 1% due to current market conditions"],
  },
}

const PORTFOLIO_CARD_CODE = `import { PortfolioCard } from "@raga-neobank/ui"

// Basic usage (fetches from hook)
<PortfolioCard />

// With external data
<PortfolioCard portfolio={portfolioData} />

// Variants: "default" | "compact" | "minimal"
<PortfolioCard variant="compact" />`

const VAULT_SHOWCASE_CODE = `import { VaultShowcase } from "@raga-neobank/ui"

// Basic usage (fetches from hook)
<VaultShowcase />

// With external data
<VaultShowcase vaults={vaultList} />

// Variants: "grid" | "list" | "compact"
<VaultShowcase variant="list" />

// With filtering and search
<VaultShowcase showSearch showChainFilter />`

const USER_CARD_CODE = `import { UserCard } from "@raga-neobank/ui"

// Basic usage (fetches from hook)
<UserCard />

// With external data
<UserCard user={userData} />

// Variants: "default" | "compact" | "minimal"
<UserCard variant="compact" />`

const TX_PREVIEW_CODE = `import { TransactionPreview } from "@raga-neobank/ui"

// Full preview
<TransactionPreview payload={txPayload} />

// Compact variant
<TransactionPreview payload={txPayload} variant="compact" />

// Steps only (for execution flow)
<TransactionPreview
  payload={txPayload}
  variant="steps-only"
  currentStep={1}
  completedSteps={[0]}
/>`

export default function ShowcasePage() {
  const [portfolioVariant, setPortfolioVariant] = useState<
    "default" | "compact" | "minimal"
  >("default")
  const [showBankInfo, setShowBankInfo] = useState(true)
  const [showAddress, setShowAddress] = useState(true)
  const [showChange, setShowChange] = useState(true)

  const [vaultVariant, setVaultVariant] = useState<"grid" | "list" | "compact">(
    "grid",
  )
  const [userVariant, setUserVariant] = useState<
    "default" | "compact" | "minimal"
  >("default")
  const [txVariant, setTxVariant] = useState<
    "default" | "compact" | "steps-only"
  >("default")
  const [currentTxStep, setCurrentTxStep] = useState(-1)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <Badge variant="outline" className="text-xs">
              4 Components
            </Badge>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">
            Component Showcase
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Plug-and-play React components from{" "}
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
              @raga-neobank/ui
            </code>{" "}
            powered by{" "}
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
              @raga-neobank/react
            </code>{" "}
            hooks. Ready for production use.
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Package className="w-3 h-3" />
              @raga-neobank/ui
            </Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">Tailwind CSS</Badge>
            <Badge variant="secondary">Dark Mode</Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* PortfolioCard Section */}
        <ShowcaseSection
          title="PortfolioCard"
          description="Display user portfolio with positions, P&L tracking, and bank information. Supports multiple variants and customizable display options."
          codeSnippet={PORTFOLIO_CARD_CODE}
        >
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Variants
            </h3>
            <ShowcaseGrid columns={3}>
              <ShowcaseItem label="Default">
                <PortfolioCard portfolio={MOCK_PORTFOLIO} variant="default" />
              </ShowcaseItem>
              <ShowcaseItem label="Compact">
                <PortfolioCard portfolio={MOCK_PORTFOLIO} variant="compact" />
              </ShowcaseItem>
              <ShowcaseItem label="Minimal">
                <div className="p-4 border border-border rounded-lg bg-card">
                  <p className="text-xs text-muted-foreground mb-2">
                    Header Balance
                  </p>
                  <PortfolioCard portfolio={MOCK_PORTFOLIO} variant="minimal" />
                </div>
              </ShowcaseItem>
            </ShowcaseGrid>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              States
            </h3>
            <ShowcaseGrid columns={3}>
              <ShowcaseItem label="Loading">
                <PortfolioCardSkeleton variant="default" />
              </ShowcaseItem>
              <ShowcaseItem label="Error">
                <PortfolioCard error={new Error("Failed to fetch portfolio")} />
              </ShowcaseItem>
              <ShowcaseItem label="Empty">
                <PortfolioCardEmpty onDeposit={() => {}} />
              </ShowcaseItem>
            </ShowcaseGrid>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Interactive Demo
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <h4 className="text-sm font-medium text-foreground">Options</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">
                      Variant
                    </label>
                    <div className="flex gap-1.5">
                      {(["default", "compact", "minimal"] as const).map(v => (
                        <button
                          key={v}
                          onClick={() => setPortfolioVariant(v)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                            portfolioVariant === v
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={showBankInfo}
                        onChange={e => setShowBankInfo(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-muted-foreground">Bank Info</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={showAddress}
                        onChange={e => setShowAddress(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-muted-foreground">Address</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={showChange}
                        onChange={e => setShowChange(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-muted-foreground">Show P&L</span>
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <PortfolioCard
                  portfolio={MOCK_PORTFOLIO}
                  variant={portfolioVariant}
                  showBankInfo={showBankInfo}
                  showAddress={showAddress}
                  showChange={showChange}
                />
              </div>
            </div>
          </div>
        </ShowcaseSection>

        {/* VaultShowcase Section */}
        <ShowcaseSection
          title="VaultShowcase"
          description="Browse and filter available vaults with multiple layout options. Includes search, chain filtering, and interactive controls."
          codeSnippet={VAULT_SHOWCASE_CODE}
        >
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Layouts
            </h3>
            <ShowcaseGrid columns={3}>
              <ShowcaseItem label="Card (Grid)">
                <VaultItem
                  vault={MOCK_VAULTS[0]!}
                  variant="card"
                  showActions={false}
                />
              </ShowcaseItem>
              <ShowcaseItem label="Row (List)">
                <VaultItem
                  vault={MOCK_VAULTS[0]!}
                  variant="row"
                  showActions={false}
                />
              </ShowcaseItem>
              <ShowcaseItem label="Compact">
                <VaultItem vault={MOCK_VAULTS[0]!} variant="compact" />
              </ShowcaseItem>
            </ShowcaseGrid>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              States
            </h3>
            <ShowcaseGrid columns={3}>
              <ShowcaseItem label="Loading">
                <VaultShowcaseSkeleton variant="grid" count={2} />
              </ShowcaseItem>
              <ShowcaseItem label="Empty">
                <VaultShowcaseEmpty />
              </ShowcaseItem>
              <ShowcaseItem label="No Results">
                <VaultShowcaseEmpty isFiltered onClearFilters={() => {}} />
              </ShowcaseItem>
            </ShowcaseGrid>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Interactive Demo
            </h3>
            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30 mb-4">
              <div className="flex items-center gap-4">
                <label className="text-xs text-muted-foreground">Layout:</label>
                <div className="flex gap-1.5">
                  {(["grid", "list", "compact"] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setVaultVariant(v)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                        vaultVariant === v
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <VaultShowcase
              vaults={MOCK_VAULTS}
              variant={vaultVariant}
              showSearch
              showChainFilter
              showVariantToggle={false}
              onVaultSelect={v => console.log("Selected:", v.vaultName)}
              onDeposit={v => console.log("Deposit:", v.vaultName)}
            />
          </div>
        </ShowcaseSection>

        {/* UserCard Section */}
        <ShowcaseSection
          title="UserCard"
          description="Display user account information with wallet address, status, and metadata. Multiple variants for different contexts."
          codeSnippet={USER_CARD_CODE}
        >
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Variants
            </h3>
            <ShowcaseGrid columns={3}>
              <ShowcaseItem label="Default">
                <UserCard user={MOCK_USER} variant="default" />
              </ShowcaseItem>
              <ShowcaseItem label="Compact">
                <UserCard user={MOCK_USER} variant="compact" />
              </ShowcaseItem>
              <ShowcaseItem label="Minimal">
                <div className="p-4 border border-border rounded-lg bg-card">
                  <p className="text-xs text-muted-foreground mb-2">
                    Header User
                  </p>
                  <UserCard user={MOCK_USER} variant="minimal" />
                </div>
              </ShowcaseItem>
            </ShowcaseGrid>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              States
            </h3>
            <ShowcaseGrid columns={3}>
              <ShowcaseItem label="Loading">
                <UserCardSkeleton variant="default" />
              </ShowcaseItem>
              <ShowcaseItem label="Error">
                <UserCard error={new Error("User not found")} />
              </ShowcaseItem>
              <ShowcaseItem label="Not Connected">
                <UserCard user={undefined} />
              </ShowcaseItem>
            </ShowcaseGrid>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Interactive Demo
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Variant
                  </label>
                  <div className="flex gap-1.5">
                    {(["default", "compact", "minimal"] as const).map(v => (
                      <button
                        key={v}
                        onClick={() => setUserVariant(v)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                          userVariant === v
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <UserCard user={MOCK_USER} variant={userVariant} />
              </div>
            </div>
          </div>
        </ShowcaseSection>

        {/* TransactionPreview Section */}
        <ShowcaseSection
          title="TransactionPreview"
          description="Display transaction details before execution, including steps, gas estimates, and warnings. Track execution progress."
          codeSnippet={TX_PREVIEW_CODE}
        >
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Variants
            </h3>
            <ShowcaseGrid columns={2}>
              <ShowcaseItem label="Default">
                <TransactionPreview
                  payload={MOCK_TX_PAYLOAD}
                  variant="default"
                />
              </ShowcaseItem>
              <ShowcaseItem label="Compact">
                <TransactionPreview
                  payload={MOCK_TX_PAYLOAD}
                  variant="compact"
                />
              </ShowcaseItem>
            </ShowcaseGrid>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              With Warnings
            </h3>
            <div className="max-w-lg">
              <TransactionPreview
                payload={MOCK_TX_WITH_WARNING}
                variant="default"
              />
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Execution Flow
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Simulate transaction execution by clicking the buttons below:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentTxStep(-1)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                      currentTxStep === -1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setCurrentTxStep(0)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                      currentTxStep === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    Step 1
                  </button>
                  <button
                    onClick={() => setCurrentTxStep(1)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                      currentTxStep === 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    Step 2
                  </button>
                  <button
                    onClick={() => setCurrentTxStep(2)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-500 text-white"
                  >
                    Complete
                  </button>
                </div>
              </div>
              <div>
                <TransactionPreview
                  payload={MOCK_TX_PAYLOAD}
                  variant="steps-only"
                  currentStep={currentTxStep}
                  completedSteps={
                    currentTxStep === 2
                      ? [0, 1]
                      : currentTxStep === 1
                        ? [0]
                        : []
                  }
                  expandSteps
                />
              </div>
            </div>
          </div>
        </ShowcaseSection>

        {/* Live Data Section */}
        <ShowcaseSection
          title="Live Data"
          description="These components fetch real data from your configured API. Set up your environment variables to see live data."
        >
          <ShowcaseGrid columns={2}>
            <ShowcaseItem label="Portfolio (Live)">
              <PortfolioCard />
            </ShowcaseItem>
            <ShowcaseItem label="User (Live)">
              <UserCard />
            </ShowcaseItem>
          </ShowcaseGrid>
          <div className="mt-8">
            <ShowcaseItem label="Vaults (Live)">
              <VaultShowcase showSearch showChainFilter />
            </ShowcaseItem>
          </div>
        </ShowcaseSection>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm text-muted-foreground text-center">
            Components from{" "}
            <code className="bg-muted px-1 rounded">@raga-neobank/ui</code>{" "}
            powered by{" "}
            <code className="bg-muted px-1 rounded">@raga-neobank/react</code>
          </p>
        </div>
      </footer>
    </div>
  )
}
