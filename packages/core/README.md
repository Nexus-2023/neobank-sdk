# @raga-neobank/core

Type-safe SDK for the Raga Neobank API. Zero dependencies. Works in Node.js and browsers.

## Install

```bash
npm install @raga-neobank/core
```

## Usage

```typescript
import { NeobankSDK } from '@raga-neobank/core';

const sdk = new NeobankSDK({
  apiKey: 'your-api-key',
  userAddress: '0x...',
});

// List vaults
const vaults = await sdk.vaults.list();

// Get portfolio
const portfolio = await sdk.portfolio.getPortfolio();

// Build a deposit transaction
const tx = await sdk.transactions.buildDepositPayload({
  vaultId: 'vault-uuid',
  amount: '1000000', // 1 USDC (6 decimals)
  chainId: 8453,
});
```

## API

### `sdk.vaults`

| Method | Description |
|--------|-------------|
| `list()` | Get all available vaults |
| `getById(vaultId)` | Get a specific vault |

### `sdk.user`

| Method | Description |
|--------|-------------|
| `getUser()` | Get authenticated user details |

### `sdk.portfolio`

| Method | Description |
|--------|-------------|
| `getPortfolio()` | Get user positions and bank info |

### `sdk.transactions`

| Method | Description |
|--------|-------------|
| `buildDepositPayload(params)` | Build deposit tx payload |
| `buildWithdrawPayload(params)` | Build withdraw tx payload |
| `buildRedeemPayload(params)` | Build redeem tx payload |

## Configuration

```typescript
interface NeobankConfig {
  apiKey: string;
  userAddress?: string;  // Required for authenticated endpoints
  baseUrl?: string;      // Default: https://backend.raga.finance
  timeout?: number;      // Default: 30000ms
}
```

## Error Handling

```typescript
import { isNeobankError } from '@raga-neobank/core';

try {
  await sdk.portfolio.getPortfolio();
} catch (error) {
  if (isNeobankError(error)) {
    console.error(`API Error [${error.code}]: ${error.message}`);
  }
}
```

## Types

All types are exported:

```typescript
import type {
  Vault,
  User,
  Portfolio,
  PortfolioPosition,
  TransactionPayload,
  TransactionStep,
} from '@raga-neobank/core';
```

## Requirements

- Node.js 18+ (uses native `fetch`)
- Or any modern browser

## License

MIT
