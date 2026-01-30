'use client';

import { useState } from 'react';
import { NeobankSDK, type TransactionPayload, isNeobankError } from '@raga-neobank/core';

interface TransactionBuilderProps {
  sdk: NeobankSDK;
}

export function TransactionBuilder({ sdk }: TransactionBuilderProps) {
  const [vaultId, setVaultId] = useState('');
  const [amount, setAmount] = useState('');
  const [chainId, setChainId] = useState('8453');
  const [txType, setTxType] = useState<'deposit' | 'withdraw' | 'redeem'>('deposit');
  const [result, setResult] = useState<TransactionPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildTransaction = async () => {
    if (!vaultId || !amount || !chainId) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        vaultId,
        amount,
        chainId: parseInt(chainId),
      };

      let txPayload: TransactionPayload;
      if (txType === 'deposit') {
        txPayload = await sdk.transactions.buildDepositPayload(payload);
      } else if (txType === 'withdraw') {
        txPayload = await sdk.transactions.buildWithdrawPayload(payload);
      } else {
        txPayload = await sdk.transactions.buildRedeemPayload(payload);
      }

      setResult(txPayload);
    } catch (err) {
      if (isNeobankError(err)) {
        setError(`Error ${err.code}: ${err.message} - ${err.detail || 'No details'}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to build transaction');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-builder">
      <h2>Transaction Builder</h2>

      <div className="form">
        <div className="form-group">
          <label htmlFor="txType">Transaction Type:</label>
          <select
            id="txType"
            value={txType}
            onChange={(e) => setTxType(e.target.value as 'deposit' | 'withdraw' | 'redeem')}
          >
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="redeem">Redeem</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="vaultId">Vault ID:</label>
          <input
            id="vaultId"
            type="text"
            value={vaultId}
            onChange={(e) => setVaultId(e.target.value)}
            placeholder="6e9b8e9f-bb3e-4e8a-b9ea-f3ab27449b38"
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (smallest unit):</label>
          <input
            id="amount"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="chainId">Chain ID:</label>
          <input
            id="chainId"
            type="text"
            value={chainId}
            onChange={(e) => setChainId(e.target.value)}
            placeholder="8453"
          />
        </div>

        <button onClick={buildTransaction} disabled={loading} className="build-button">
          {loading ? 'Building...' : `Build ${txType} Transaction`}
        </button>
      </div>

      {error && <div className="error">Error: {error}</div>}

      {result && (
        <div className="result">
          <h3>Transaction Payload</h3>
          <div className="result-summary">
            <p>
              <strong>Vault:</strong> {result.vaultName}
            </p>
            <p>
              <strong>Asset:</strong> {result.summary.assetSymbol}
            </p>
            <p>
              <strong>Amount:</strong> {result.summary.inputAmount}
            </p>
            {result.summary.warnings.length > 0 && (
              <div className="warnings">
                <strong>Warnings:</strong>
                <ul>
                  {result.summary.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <h4>Transaction Steps ({result.txs.length})</h4>
          {result.txs.map((tx) => (
            <div key={tx.step} className="tx-step">
              <p>
                <strong>Step {tx.step}:</strong> {tx.description}
              </p>
              <p>
                <strong>Type:</strong> {tx.type}
              </p>
              <p>
                <strong>To:</strong> <code>{tx.to}</code>
              </p>
              <p>
                <strong>Gas Estimate:</strong> {tx.gasEstimate}
              </p>
              <p>
                <strong>Simulation:</strong>{' '}
                <span className={tx.simulationSuccess ? 'status-enabled' : 'status-disabled'}>
                  {tx.simulationSuccess ? 'Success' : 'Failed'}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
