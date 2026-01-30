'use client';

import { useState, useEffect } from 'react';
import { NeobankSDK, type Portfolio as PortfolioType, isNeobankError } from '@raga-neobank/core';

interface PortfolioProps {
  sdk: NeobankSDK;
}

export function Portfolio({ sdk }: PortfolioProps) {
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        setLoading(true);
        const data = await sdk.portfolio.getPortfolio();
        setPortfolio(data);
        setError(null);
      } catch (err) {
        if (isNeobankError(err)) {
          setError(`Error ${err.code}: ${err.message}`);
        } else {
          setError('Failed to fetch portfolio');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [sdk]);

  if (loading) {
    return <div className="loading">Loading portfolio...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!portfolio) {
    return <div>No portfolio data available</div>;
  }

  const formatUSD = (value: string, decimals: number) => {
    return `$${(Number(value) / Math.pow(10, decimals)).toFixed(2)}`;
  };

  return (
    <div className="portfolio">
      <h2>Portfolio</h2>
      <div className="portfolio-header">
        <p>
          <strong>Bank:</strong> {portfolio.bank.name}
        </p>
        <p>
          <strong>Wallet:</strong>{' '}
          <code>{portfolio.walletAddress.slice(0, 10)}...{portfolio.walletAddress.slice(-8)}</code>
        </p>
      </div>

      <h3>Positions</h3>
      {portfolio.positions.length === 0 ? (
        <p>No positions</p>
      ) : (
        <div className="positions-grid">
          {portfolio.positions.map((position, index) => {
            const profit = BigInt(position.currentValueInUsd) - BigInt(position.depositValueInUsd);
            const profitPercent = (Number(profit) / Number(position.depositValueInUsd)) * 100;

            return (
              <div key={index} className="position-card">
                <h4>{position.vaultName}</h4>
                <div className="position-info">
                  <p>
                    <strong>Deposited:</strong> {formatUSD(position.depositValueInUsd, position.decimals)}
                  </p>
                  <p>
                    <strong>Current Value:</strong> {formatUSD(position.currentValueInUsd, position.decimals)}
                  </p>
                  <p>
                    <strong>Profit/Loss:</strong>{' '}
                    <span className={profitPercent >= 0 ? 'profit' : 'loss'}>
                      {profitPercent >= 0 ? '+' : ''}
                      {profitPercent.toFixed(2)}%
                    </span>
                  </p>
                  <p>
                    <strong>Chain:</strong> {position.chainId}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
