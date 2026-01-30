'use client';

import { NeobankSDK } from '@raga-neobank/core';
import { VaultList } from '../components/VaultList';
import { Portfolio } from '../components/Portfolio';
import { TransactionBuilder } from '../components/TransactionBuilder';
import './demo.css';

// Initialize SDK with environment variables
const initSDK = () => {
  const apiKey = process.env.NEXT_PUBLIC_NEOBANK_API_KEY;
  const userAddress = process.env.NEXT_PUBLIC_USER_ADDRESS;
  const baseUrl = process.env.NEXT_PUBLIC_NEOBANK_BASE_URL;

  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_NEOBANK_API_KEY is not set. Please check your .env.local file.');
  }

  return new NeobankSDK({
    apiKey,
    userAddress,
    baseUrl,
  });
};

export default function Home() {
  let sdk: NeobankSDK;
  let sdkError: string | null = null;

  try {
    sdk = initSDK();
  } catch (error) {
    sdkError = error instanceof Error ? error.message : 'Failed to initialize SDK';
  }

  if (sdkError) {
    return (
      <div className="page">
        <main className="main">
          <h1>Raga Neobank SDK Demo</h1>
          <div className="error">
            <h2>Configuration Error</h2>
            <p>{sdkError}</p>
            <p>Please create a .env.local file based on .env.example and fill in your credentials.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <main className="main">
        <header className="header">
          <h1>Raga Neobank SDK Demo</h1>
          <p className="subtitle">Explore the @raga-neobank/core SDK capabilities</p>
        </header>

        <section className="section">
          <VaultList sdk={sdk} />
        </section>

        <section className="section">
          <Portfolio sdk={sdk} />
        </section>

        <section className="section">
          <TransactionBuilder sdk={sdk} />
        </section>

        <footer className="footer">
          <p>
            Powered by <strong>@raga-neobank/core</strong> v0.1.0
          </p>
          <p>
            <a href="https://github.com/Nexus-2023/neobank-sdk" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
