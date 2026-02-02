"use client"

import { useMemo } from "react"
import { NeobankSDK } from "@raga-neobank/core"
import { SDKProvider } from "../lib/sdk-provider"
import { VaultList } from "../components/VaultList"
import { Portfolio } from "../components/Portfolio"
import { TransactionBuilder } from "../components/TransactionBuilder"
import { UserProfile } from "../components/UserProfile"
import "./demo.css"

export default function Home() {
  const sdk = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_NEOBANK_API_KEY
    const userAddress =
      process.env.NEXT_PUBLIC_USER_ADDRESS?.toLowerCase() || ""

    if (!apiKey) {
      return null
    }

    return new NeobankSDK({
      apiKey,
      userAddress,
    })
  }, [])

  if (!sdk) {
    return (
      <div className="page">
        <main className="main">
          <h1>Raga Neobank SDK Demo</h1>
          <div className="error">
            <h2>Configuration Error</h2>
            <p>
              NEXT_PUBLIC_NEOBANK_API_KEY is not set. Please check your
              .env.local file.
            </p>
            <p>
              Please create a .env.local file based on .env.example and fill in
              your credentials.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <SDKProvider sdk={sdk}>
      <div className="page">
        <main className="main">
          <header className="header">
            <h1>Raga Neobank SDK Demo</h1>
            <p className="subtitle">
              Explore the @raga-neobank/core SDK capabilities
            </p>
          </header>

          <section className="section">
            <UserProfile />
          </section>

          <section className="section">
            <VaultList />
          </section>

          <section className="section">
            <Portfolio />
          </section>

          <section className="section">
            <TransactionBuilder />
          </section>

          <footer className="footer">
            <p>
              Powered by <strong>@raga-neobank/core</strong> v0.1.0
            </p>
            <p>
              <a
                href="https://github.com/Nexus-2023/neobank-sdk"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </p>
          </footer>
        </main>
      </div>
    </SDKProvider>
  )
}
