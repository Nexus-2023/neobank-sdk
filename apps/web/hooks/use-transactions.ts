'use client';

import { useMutation } from '@tanstack/react-query';
import { useSDK } from '../lib/sdk-provider';
import { type TransactionPayload } from '@raga-neobank/core';

interface BuildTransactionParams {
  vaultId: string;
  amount: string;
  chainId: number;
  type: 'deposit' | 'withdraw' | 'redeem';
}

export function useBuildTransaction() {
  const sdk = useSDK();

  return useMutation<TransactionPayload, Error, BuildTransactionParams>({
    mutationFn: async ({ vaultId, amount, chainId, type }) => {
      const payload = { vaultId, amount, chainId };
      
      if (type === 'deposit') {
        return sdk.transactions.buildDepositPayload(payload);
      } else if (type === 'withdraw') {
        return sdk.transactions.buildWithdrawPayload(payload);
      } else {
        return sdk.transactions.buildRedeemPayload(payload);
      }
    },
  });
}
