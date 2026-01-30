'use client';

import { useState, useEffect } from 'react';
import { NeobankSDK, type Vault, isNeobankError } from '@raga-neobank/core';

interface VaultListProps {
  sdk: NeobankSDK;
}

export function VaultList({ sdk }: VaultListProps) {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVaults() {
      try {
        setLoading(true);
        const data = await sdk.vaults.list();
        setVaults(data);
        setError(null);
      } catch (err) {
        if (isNeobankError(err)) {
          setError(`Error ${err.code}: ${err.message}`);
        } else {
          setError('Failed to fetch vaults');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchVaults();
  }, [sdk]);

  if (loading) {
    return <div className="loading">Loading vaults...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="vault-list">
      <h2>Available Vaults</h2>
      {vaults.length === 0 ? (
        <p>No vaults available</p>
      ) : (
        <div className="vaults-grid">
          {vaults.map((vault) => (
            <div key={vault.id} className="vault-card">
              <h3>{vault.vaultName}</h3>
              <div className="vault-info">
                <p>
                  <strong>Address:</strong>{' '}
                  <code>{vault.vaultAddress.slice(0, 10)}...{vault.vaultAddress.slice(-8)}</code>
                </p>
                <p>
                  <strong>Chain ID:</strong> {vault.chainId}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={vault.isEnabled ? 'status-enabled' : 'status-disabled'}>
                    {vault.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
                <p>
                  <strong>Deposits:</strong>{' '}
                  <span className={vault.depositEnabled ? 'status-enabled' : 'status-disabled'}>
                    {vault.depositEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
