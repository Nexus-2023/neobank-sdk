# @raga-neobank/ui

Pre-built React components for the Raga Neobank SDK. Drop-in widgets that handle their own data fetching and state management.

## Install

```bash
npm install @raga-neobank/ui @raga-neobank/react @raga-neobank/core @tanstack/react-query
```

## Setup

1. Import the theme CSS:

```tsx
import '@raga-neobank/ui/theme.css';
```

2. Wrap your app with the provider:

```tsx
import { NeobankProvider } from '@raga-neobank/react';

function App() {
  return (
    <NeobankProvider config={{ apiKey: 'your-api-key', userAddress: '0x...' }}>
      <YourApp />
    </NeobankProvider>
  );
}
```

## Components

### PortfolioCard

Displays portfolio value, positions, and PnL.

```tsx
import { PortfolioCard } from '@raga-neobank/ui';

// Auto-fetches from context
<PortfolioCard showBankInfo showChange />

// Pass data directly
<PortfolioCard portfolio={data} variant="compact" />
```

Variants: `default`, `compact`, `minimal`

### VaultShowcase

Browse vaults with search, chain filters, and layout options.

```tsx
import { VaultShowcase } from '@raga-neobank/ui';

<VaultShowcase
  showSearch
  showChainFilter
  onVaultSelect={(vault) => router.push(`/vault/${vault.id}`)}
  onDeposit={(vault) => openDepositModal(vault)}
/>
```

Variants: `grid`, `list`, `compact`

### VaultCard

Single vault display with deposit/withdraw actions.

```tsx
import { VaultCard } from '@raga-neobank/ui';

<VaultCard
  vaultId="vault-uuid"
  onDeposit={handleDeposit}
  onWithdraw={handleWithdraw}
/>
```

### UserCard

User account information with wallet address and status.

```tsx
import { UserCard } from '@raga-neobank/ui';

<UserCard showBank showDates showStatus />
```

Variants: `default`, `compact`, `minimal`

### TransactionPreview

Visualize transaction payloads with step progress.

```tsx
import { TransactionPreview } from '@raga-neobank/ui';

<TransactionPreview
  payload={transactionPayload}
  currentStep={1}
  completedSteps={[0]}
  expandSteps
/>
```

Variants: `default`, `compact`, `steps-only`

### TransactionWidget

Complete transaction builder with type tabs and simulation.

```tsx
import { TransactionWidget } from '@raga-neobank/ui';

<TransactionWidget
  vaultId="vault-uuid"
  allowedTypes={['deposit', 'withdraw']}
  onSuccess={(payload) => signAndSend(payload)}
/>
```

## Utility Components

```tsx
import { StatusBadge, AddressDisplay, ChainBadge } from '@raga-neobank/ui';

<StatusBadge variant="success" dot>Active</StatusBadge>
<AddressDisplay address="0x742d35..." showCopy />
<ChainBadge chainId={8453} />
```

## Formatters

```tsx
import {
  formatCurrency,
  formatPercentage,
  formatAddress,
  formatAssetAmount,
  formatGas,
  formatDate,
  calculatePnL,
  getChainName,
} from '@raga-neobank/ui';

formatCurrency(1234.56)                    // "$1,234.56"
formatCurrency(1234.56, { compact: true }) // "$1.2K"
formatPercentage(5.25)                     // "+5.25%"
formatAddress("0x742d35Cc6634...")         // "0x742d...bEb0"
getChainName(8453)                         // "Base"
```

## Theming

Override CSS variables to match your brand:

```css
:root {
  --raga-primary: #6366f1;
  --raga-primary-foreground: #ffffff;
  --raga-positive: #22c55e;
  --raga-negative: #ef4444;
  --raga-background: #ffffff;
  --raga-foreground: #0f172a;
  --raga-card: #ffffff;
  --raga-border: #e2e8f0;
  --raga-muted: #f1f5f9;
  --raga-muted-foreground: #64748b;
  --raga-radius-lg: 0.75rem;
  --raga-radius-xl: 1rem;
}
```

Dark mode: add a `.dark` class to your root element. The theme CSS includes dark mode overrides.

## Requirements

- React 19+
- `@raga-neobank/react`
- `@raga-neobank/core`
- Tailwind CSS 4 (optional, for utility classes)

## License

MIT
