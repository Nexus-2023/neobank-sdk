'use client';

import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../lib/sdk-provider';
import { type User } from '@raga-neobank/core';

export function useUser() {
  const sdk = useSDK();

  return useQuery<User, Error>({
    queryKey: ['user'],
    queryFn: async () => {
      return sdk.user.getUser();
    },
  });
}
