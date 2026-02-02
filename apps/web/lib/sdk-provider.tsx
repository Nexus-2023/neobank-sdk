'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { NeobankSDK } from '@raga-neobank/core';

const SDKContext = createContext<NeobankSDK | null>(null);

interface SDKProviderProps {
  children: ReactNode;
  sdk: NeobankSDK;
}

export function SDKProvider({ children, sdk }: SDKProviderProps) {
  return <SDKContext.Provider value={sdk}>{children}</SDKContext.Provider>;
}

export function useSDK(): NeobankSDK {
  const sdk = useContext(SDKContext);
  if (!sdk) {
    throw new Error('useSDK must be used within SDKProvider');
  }
  return sdk;
}
