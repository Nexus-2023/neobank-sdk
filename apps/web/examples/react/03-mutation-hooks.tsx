/**
 * Mutation Hooks
 *
 * Learn how to use mutation hooks from @raga-neobank/react
 * to build transaction payloads.
 */

"use client"

import { useState } from "react"
import {
  useBuildDeposit,
  useBuildWithdraw,
  useBuildRedeem,
} from "@raga-neobank/react"
import type { TransactionPayload } from "@raga-neobank/core"

function DepositForm({ vaultId }: { vaultId: string }) {
  const [amount, setAmount] = useState("")

  const {
    mutate: buildDeposit,
    data: payload,
    isPending,
    isError,
    error,
    isSuccess,
    reset,
  } = useBuildDeposit()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    buildDeposit({
      vaultId,
      amount,
      chainId: 8453,
    })
  }

  if (isSuccess && payload) {
    return (
      <div>
        <h3>Transaction Ready!</h3>
        <p>Vault: {payload.vaultName}</p>
        <p>Steps: {payload.txs.length}</p>
        <p>
          Expected: {payload.summary.preview.expectedOutput}{" "}
          {payload.summary.preview.outputSymbol}
        </p>
        <button onClick={() => reset()}>Build Another</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Amount (e.g., 1000000)"
        disabled={isPending}
      />
      <button type="submit" disabled={isPending || !amount}>
        {isPending ? "Building..." : "Build Deposit"}
      </button>
      {isError && <p>Error: {error?.message}</p>}
    </form>
  )
}

function DepositWithCallbacks({ vaultId }: { vaultId: string }) {
  const [amount, setAmount] = useState("")
  const [result, setResult] = useState<TransactionPayload | null>(null)

  const { mutate: buildDeposit, isPending } = useBuildDeposit()

  const handleBuild = () => {
    buildDeposit(
      {
        vaultId,
        amount,
        chainId: 8453,
      },
      {
        onSuccess: payload => {
          console.log("Success!", payload)
          setResult(payload)
        },
        onError: error => {
          console.error("Failed:", error)
        },
        onSettled: () => {
          console.log("Build complete")
        },
      }
    )
  }

  return (
    <div>
      <input
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <button onClick={handleBuild} disabled={isPending}>
        Build
      </button>
      {result && <pre>{JSON.stringify(result.summary, null, 2)}</pre>}
    </div>
  )
}

type TxType = "deposit" | "withdraw" | "redeem"

function TransactionBuilder({ vaultId }: { vaultId: string }) {
  const [txType, setTxType] = useState<TxType>("deposit")
  const [amount, setAmount] = useState("")

  const deposit = useBuildDeposit()
  const withdraw = useBuildWithdraw()
  const redeem = useBuildRedeem()

  const mutations = { deposit, withdraw, redeem }
  const mutation = mutations[txType]

  const handleBuild = () => {
    mutation.mutate({
      vaultId,
      amount,
      chainId: 8453,
    })
  }

  const handleReset = () => {
    mutation.reset()
    setAmount("")
  }

  const handleTypeChange = (type: TxType) => {
    mutation.reset()
    setTxType(type)
    setAmount("")
  }

  return (
    <div>
      <div>
        {(["deposit", "withdraw", "redeem"] as const).map(type => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            style={{ fontWeight: txType === type ? "bold" : "normal" }}
          >
            {type}
          </button>
        ))}
      </div>

      {!mutation.data ? (
        <>
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount"
          />
          <button onClick={handleBuild} disabled={mutation.isPending}>
            {mutation.isPending ? "Building..." : `Build ${txType}`}
          </button>
          {mutation.error && <p>Error: {mutation.error.message}</p>}
        </>
      ) : (
        <div>
          <h3>Ready!</h3>
          <p>Steps: {mutation.data.txs.length}</p>
          <button onClick={handleReset}>Reset</button>
        </div>
      )}
    </div>
  )
}

function AsyncMutation({ vaultId }: { vaultId: string }) {
  const [status, setStatus] = useState<string>("")

  const { mutateAsync: buildDeposit, isPending } = useBuildDeposit()

  const handleBuild = async () => {
    try {
      setStatus("Building...")

      const payload = await buildDeposit({
        vaultId,
        amount: "1000000",
        chainId: 8453,
      })

      setStatus("Simulating wallet...")

      await simulateWallet(payload)

      setStatus("Success!")
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`)
    }
  }

  return (
    <div>
      <button onClick={handleBuild} disabled={isPending}>
        Build & Send
      </button>
      <p>{status}</p>
    </div>
  )
}

async function simulateWallet(payload: TransactionPayload) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log("Would send to wallet:", payload)
}

function ValidatedDeposit({ vaultId }: { vaultId: string }) {
  const [amount, setAmount] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  const { mutate: buildDeposit, isPending, error } = useBuildDeposit()

  const validate = (value: string): boolean => {
    if (!/^\d+$/.test(value)) {
      setValidationError("Amount must be a positive integer")
      return false
    }

    if (BigInt(value) < 1000n) {
      setValidationError("Minimum amount is 1000")
      return false
    }

    setValidationError(null)
    return true
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (value) validate(value)
  }

  const handleSubmit = () => {
    if (!validate(amount)) return

    buildDeposit({
      vaultId,
      amount,
      chainId: 8453,
    })
  }

  return (
    <div>
      <input
        value={amount}
        onChange={e => handleAmountChange(e.target.value)}
        placeholder="Amount (min 1000)"
      />
      {validationError && <p style={{ color: "orange" }}>{validationError}</p>}
      {error && <p style={{ color: "red" }}>{error.message}</p>}
      <button onClick={handleSubmit} disabled={isPending || !!validationError}>
        Build
      </button>
    </div>
  )
}

export {
  DepositForm,
  DepositWithCallbacks,
  TransactionBuilder,
  AsyncMutation,
  ValidatedDeposit,
}

/**
 * Notes
 *
 * Mutation hooks return:
 * - mutate: Function to trigger mutation
 * - mutateAsync: Promise-based version of mutate
 * - data: Result after success
 * - isPending: True while mutation is in progress
 * - isSuccess: True after successful mutation
 * - isError: True after failed mutation
 * - error: Error object if failed
 * - reset: Function to clear mutation state
 *
 * Use mutate() for callback-based flow.
 * Use mutateAsync() for async/await flow.
 * Always call reset() before building a new transaction.
 *
 * The hooks include built-in Zod validation for request params.
 * Amount must be a string of digits (smallest units).
 * Chain ID 8453 = Base network.
 */
