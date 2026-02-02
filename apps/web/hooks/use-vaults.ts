'use client';

import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../lib/sdk-provider';
import { type Vault } from '@raga-neobank/core';

export function useVaults() {
  const sdk = useSDK();

  return useQuery<Vault[], Error>({
    queryKey: ['vaults'],
    queryFn: async () => {
      return sdk.vaults.list();
    },
  });
}
