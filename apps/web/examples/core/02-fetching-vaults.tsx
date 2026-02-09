/**
 * Fetching Vaults
 *
 * Learn how to fetch and work with vault data using the SDK.
 */

import { NeobankSDK } from "@raga-neobank/core"
import type { Vault } from "@raga-neobank/core"

async function listAllVaults(sdk: NeobankSDK): Promise<Vault[]> {
  const vaults = await sdk.vaults.list()
  console.log(`Found ${vaults.length} vaults`)
  return vaults
}

async function getVaultById(
  sdk: NeobankSDK,
  vaultId: string,
): Promise<Vault | null> {
  try {
    const vault = await sdk.vaults.get(vaultId)

    console.log("Vault details:", {
      name: vault.vaultName,
      address: vault.vaultAddress,
      chainId: vault.chainId,
      isEnabled: vault.isEnabled,
      depositEnabled: vault.depositEnabled,
    })

    return vault
  } catch (error) {
    console.error(`Vault ${vaultId} not found`)
    return null
  }
}

function filterActiveVaults(vaults: Vault[]): Vault[] {
  return vaults.filter(vault => vault.isEnabled && vault.depositEnabled)
}

function filterVaultsByChain(vaults: Vault[], chainId: number): Vault[] {
  return vaults.filter(vault => vault.chainId === chainId)
}

function findVaultByAddress(
  vaults: Vault[],
  address: string,
): Vault | undefined {
  return vaults.find(
    vault => vault.vaultAddress.toLowerCase() === address.toLowerCase(),
  )
}

function formatVaultForDisplay(vault: Vault) {
  return {
    id: vault.id,
    name: vault.vaultName,
    address: truncateAddress(vault.vaultAddress),
    chain: getChainName(vault.chainId),
    status: vault.isEnabled ? "Active" : "Inactive",
    depositStatus: vault.depositEnabled ? "Open" : "Closed",
    strategies: vault.strategyAllocations?.length ?? 0,
  }
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: "Ethereum",
    8453: "Base",
    137: "Polygon",
    42161: "Arbitrum",
  }
  return chains[chainId] ?? `Chain ${chainId}`
}

async function vaultExample() {
  const sdk = new NeobankSDK({
    apiKey: process.env.NEXT_PUBLIC_NEOBANK_API_KEY!,
  })

  const allVaults = await listAllVaults(sdk)

  const baseVaults = filterVaultsByChain(filterActiveVaults(allVaults), 8453)

  console.log(`Active Base vaults: ${baseVaults.length}`)

  if (baseVaults.length > 0 && baseVaults[0]) {
    const vaultDetails = await getVaultById(sdk, baseVaults[0].id)

    if (vaultDetails) {
      console.log("Formatted:", formatVaultForDisplay(vaultDetails))
    }
  }

  return baseVaults
}

export {
  listAllVaults,
  getVaultById,
  filterActiveVaults,
  filterVaultsByChain,
  findVaultByAddress,
  formatVaultForDisplay,
  vaultExample,
}

/**
 * Notes
 *
 * Vault list is cached on the backend, so repeated calls are fast.
 * The vaults.list() endpoint is public and requires no authentication.
 *
 * Always check vault.isEnabled and vault.depositEnabled before allowing
 * user interactions.
 *
 * The strategyAllocations array shows how funds are distributed across
 * different strategies.
 *
 * Chain IDs: Ethereum (1), Base (8453), Polygon (137), Arbitrum (42161)
 */
