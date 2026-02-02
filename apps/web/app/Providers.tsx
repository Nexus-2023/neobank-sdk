"use client"
import React from "react"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

const queryClient = new QueryClient()
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {" "}
      {children}{" "}
      <ReactQueryDevtools
        initialIsOpen={false}
        theme="dark"
        client={queryClient}
      />
    </QueryClientProvider>
  )
}
