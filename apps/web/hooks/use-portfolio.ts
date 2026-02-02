'use client';

import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../lib/sdk-provider';
import { type Portfolio } from '@raga-neobank/core';

export function usePortfolio() {
  const sdk = useSDK();

  return useQuery<Portfolio, Error>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      return sdk.portfolio.getPortfolio();
    },
  });
}
