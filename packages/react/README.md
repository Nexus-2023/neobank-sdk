# @raga-neobank/react

React hooks for the Raga Neobank SDK. Built on TanStack Query for caching, loading states, and mutations.

## Install

```bash
npm install @raga-neobank/react @raga-neobank/core @tanstack/react-query
```

## Setup

Wrap your app with the provider:

```tsx
import { NeobankProvider } from '@raga-neobank/react';

function App() {
  return (
    <NeobankProvider
      config={{
        apiKey: 'your-api-key',
        userAddress: '0x...',
      }}
    >
      <YourApp />
    </NeobankProvider>
  );
}
```

## Hooks

### Queries

```tsx
import { useVaults, useVault, useUser, usePortfolio } from '@raga-neobank/react';

function Dashboard() {
  const { data: vaults, isLoading } = useVaults();
  const { data: vault } = useVault('vault-uuid');
  const { data: user } = useUser();
  const { data: portfolio } = usePortfolio();

  // ...
}
```

### Mutations

```tsx
import { useBuildDeposit, useBuildWithdraw, useBuildRedeem } from '@raga-neobank/react';

function DepositForm() {
  const { mutate: buildDeposit, isPending, data } = useBuildDeposit();

  const handleSubmit = () => {
    buildDeposit({
      vaultId: 'vault-uuid',
      amount: '1000000',
      chainId: 8453,
    });
  };

  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? 'Building...' : 'Deposit'}
    </button>
  );
}
```

## Query Keys

For manual cache invalidation:

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { neobankKeys } from '@raga-neobank/react';

function RefreshButton() {
  const queryClient = useQueryClient();

  return (
    <button onClick={() => queryClient.invalidateQueries({ queryKey: neobankKeys.vaults.all() })}>
      Refresh
    </button>
  );
}
```

Available keys:
- `neobankKeys.vaults.all()`
- `neobankKeys.vaults.byId(vaultId)`
- `neobankKeys.user()`
- `neobankKeys.portfolio()`

## Direct SDK Access

```tsx
import { useNeobank } from '@raga-neobank/react';

function MyComponent() {
  const { sdk, config } = useNeobank();

  // Use sdk directly for custom operations
  const result = await sdk.vaults.list();
}
```

## Provider Options

```tsx
<NeobankProvider
  config={{
    apiKey: 'your-api-key',
    userAddress: '0x...',
    baseUrl: 'https://backend.raga.finance',
  }}
  queryClient={customQueryClient} // Optional: bring your own QueryClient
>
```

## Requirements

- React 19+
- `@raga-neobank/core`
- `@tanstack/react-query` 5+

## License

MIT
