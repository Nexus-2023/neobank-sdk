# Raga Neobank SDK

SDK for integrating with the Raga Finance API. Three packages that build on each other—use what you need.

## Packages

| Package | What it does |
|---------|--------------|
| [@raga-neobank/core](./packages/core) | TypeScript API client. Zero dependencies. |
| [@raga-neobank/react](./packages/react) | React hooks with TanStack Query. |
| [@raga-neobank/ui](./packages/ui) | Drop-in components with built-in data fetching. |

## Install

Pick your level of abstraction:

```bash
# Just the API client
npm install @raga-neobank/core

# React hooks
npm install @raga-neobank/react @raga-neobank/core @tanstack/react-query

# Full component library
npm install @raga-neobank/ui @raga-neobank/react @raga-neobank/core @tanstack/react-query
```

## Quick Start

### Core (vanilla JS/TS)

```typescript
import { NeobankSDK } from '@raga-neobank/core';

const sdk = new NeobankSDK({
  apiKey: 'your-api-key',
  userAddress: '0x...',
});

const vaults = await sdk.vaults.list();
const portfolio = await sdk.portfolio.getPortfolio();
```

### React Hooks

```tsx
import { NeobankProvider, useVaults, usePortfolio } from '@raga-neobank/react';

function App() {
  return (
    <NeobankProvider config={{ apiKey: 'your-api-key', userAddress: '0x...' }}>
      <Dashboard />
    </NeobankProvider>
  );
}

function Dashboard() {
  const { data: vaults } = useVaults();
  const { data: portfolio } = usePortfolio();
  // ...
}
```

### UI Components

```tsx
import '@raga-neobank/ui/theme.css';
import { PortfolioCard, VaultShowcase } from '@raga-neobank/ui';
import { NeobankProvider } from '@raga-neobank/react';

function App() {
  return (
    <NeobankProvider config={{ apiKey: 'your-api-key', userAddress: '0x...' }}>
      <PortfolioCard showChange />
      <VaultShowcase showSearch showChainFilter />
    </NeobankProvider>
  );
}
```

## Development

```bash
# Install
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Demo app
cd apps/web && pnpm dev
```

## Requirements

- Node.js 18+
- React 19+ (for react and ui packages)

## License

MIT
