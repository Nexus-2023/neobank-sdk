# Raga Neobank SDK Examples

This folder contains example code demonstrating how to use the Raga Neobank SDK packages.

## Structure

```
examples/
├── core/           # @raga-neobank/core examples
├── react/          # @raga-neobank/react examples
└── patterns/       # Complete integration patterns
```

## Core SDK Examples

| File | Description |
|------|-------------|
| `01-basic-setup.tsx` | SDK initialization and configuration |
| `02-fetching-vaults.tsx` | Fetching vault data (list and details) |
| `03-user-portfolio.tsx` | User profile and portfolio queries |
| `04-building-transactions.tsx` | Building transaction payloads |
| `05-error-handling.tsx` | Error handling patterns |

## React Hooks Examples

| File | Description |
|------|-------------|
| `01-provider-setup.tsx` | NeobankProvider configuration |
| `02-query-hooks.tsx` | Using query hooks (useVaults, useUser, etc.) |
| `03-mutation-hooks.tsx` | Using mutation hooks (useBuildDeposit, etc.) |
| `04-query-invalidation.tsx` | Cache management patterns |

## Pattern Examples

| File | Description |
|------|-------------|
| `01-vault-selection-flow.tsx` | Complete vault browsing and selection |
| `02-deposit-flow.tsx` | End-to-end deposit transaction |
| `03-portfolio-dashboard.tsx` | Building a portfolio dashboard |

## Usage

These examples are self-contained and can be copied into your project. Each example includes:

1. **Description** - What the example demonstrates
2. **Key Concepts** - Main learning points
3. **Code** - Complete, runnable implementation
4. **Usage Notes** - Best practices and gotchas

## Prerequisites

Install the SDK packages:

```bash
npm install @raga-neobank/core @raga-neobank/react
```

Set up environment variables:

```bash
NEXT_PUBLIC_NEOBANK_API_KEY=your-api-key
NEXT_PUBLIC_USER_ADDRESS=0x...
```
