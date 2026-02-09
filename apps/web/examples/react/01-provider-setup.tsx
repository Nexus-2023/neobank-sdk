/**
 * NeobankProvider Setup
 *
 * Learn how to set up the NeobankProvider for your React application.
 */

"use client"

import { NeobankProvider } from "@raga-neobank/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, useEffect } from "react"

function BasicSetup({ children }: { children: React.ReactNode }) {
  return (
    <NeobankProvider
      config={{
        apiKey: process.env.NEXT_PUBLIC_NEOBANK_API_KEY!,
      }}
    >
      {children}
    </NeobankProvider>
  )
}

function FullSetup({ children }: { children: React.ReactNode }) {
  return (
    <NeobankProvider
      config={{
        apiKey: process.env.NEXT_PUBLIC_NEOBANK_API_KEY!,
        userAddress: process.env.NEXT_PUBLIC_USER_ADDRESS,
        baseUrl: process.env.NEXT_PUBLIC_NEOBANK_BASE_URL,
        timeout: 30000,
      }}
    >
      {children}
    </NeobankProvider>
  )
}

function SetupWithQueryClient({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 3,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <NeobankProvider
        config={{
          apiKey: process.env.NEXT_PUBLIC_NEOBANK_API_KEY!,
          userAddress: process.env.NEXT_PUBLIC_USER_ADDRESS,
        }}
        queryClient={queryClient}
      >
        {children}
      </NeobankProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

function DynamicUserSetup({ children }: { children: React.ReactNode }) {
  const [userAddress, setUserAddress] = useState<string | undefined>()

  useEffect(() => {
    const connected = localStorage.getItem("connectedWallet")
    if (connected) {
      setUserAddress(connected)
    }
  }, [])

  return (
    <NeobankProvider
      config={{
        apiKey: process.env.NEXT_PUBLIC_NEOBANK_API_KEY!,
        userAddress,
      }}
    >
      {children}
    </NeobankProvider>
  )
}

type Environment = "development" | "staging" | "production"

function getConfig(env: Environment) {
  const configs = {
    development: {
      apiKey: process.env.NEXT_PUBLIC_NEOBANK_API_KEY_DEV!,
      baseUrl: "https://dev.backend.raga.finance",
    },
    staging: {
      apiKey: process.env.NEXT_PUBLIC_NEOBANK_API_KEY_STAGING!,
      baseUrl: "https://staging.backend.raga.finance",
    },
    production: {
      apiKey: process.env.NEXT_PUBLIC_NEOBANK_API_KEY!,
      baseUrl: "https://backend.raga.finance",
    },
  }

  return configs[env]
}

function EnvironmentAwareSetup({ children }: { children: React.ReactNode }) {
  const env = (process.env.NEXT_PUBLIC_ENV || "production") as Environment
  const config = getConfig(env)

  return (
    <NeobankProvider
      config={{
        ...config,
        userAddress: process.env.NEXT_PUBLIC_USER_ADDRESS,
      }}
    >
      {children}
    </NeobankProvider>
  )
}

export default function App({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: true,
      },
    },
  })

  const isDev = process.env.NODE_ENV === "development"

  return (
    <QueryClientProvider client={queryClient}>
      <NeobankProvider
        config={{
          apiKey: process.env.NEXT_PUBLIC_NEOBANK_API_KEY!,
          userAddress: process.env.NEXT_PUBLIC_USER_ADDRESS,
        }}
        queryClient={queryClient}
      >
        {children}
      </NeobankProvider>
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export {
  BasicSetup,
  FullSetup,
  SetupWithQueryClient,
  DynamicUserSetup,
  EnvironmentAwareSetup,
}

/**
 * Notes
 *
 * NeobankProvider must wrap all components that use SDK hooks.
 * It automatically creates a QueryClient if not provided.
 * Pass your own QueryClient for more control over caching.
 *
 * The userAddress can be updated dynamically (e.g., after wallet connect).
 * When userAddress changes, relevant queries are automatically invalidated.
 *
 * Use ReactQueryDevtools in development to debug queries.
 *
 * Configuration options:
 * - apiKey (required): Your API key
 * - userAddress (optional): User's wallet address
 * - baseUrl (optional): Override API base URL
 * - timeout (optional): Request timeout in ms
 */
