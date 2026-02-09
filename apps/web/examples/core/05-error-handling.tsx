/**
 * Error Handling
 *
 * Learn how to handle errors from the @raga-neobank/core SDK.
 */

import { NeobankSDK, NeobankError, isNeobankError } from "@raga-neobank/core"

async function fetchWithErrorHandling(sdk: NeobankSDK) {
  try {
    const vaults = await sdk.vaults.list()
    return vaults
  } catch (error) {
    if (isNeobankError(error)) {
      console.error("SDK Error:", {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        detail: error.detail,
      })
    } else {
      console.error("Unknown error:", error)
    }
    throw error
  }
}

function handleErrorByCode(error: NeobankError): string {
  // Use statusCode for HTTP-based error handling
  switch (error.statusCode) {
    case 401:
      return "Invalid API key. Please check your credentials."

    case 403:
      return "Access denied. You don't have permission for this action."

    case 404:
      return "The requested resource was not found."

    case 400:
      return `Invalid request: ${error.detail || error.message}`

    case 500:
    case 502:
    case 503:
      return "Server error. Please try again later."

    default:
      return error.message || "An unexpected error occurred."
  }
}

function handleByStatusCode(error: NeobankError): {
  message: string
  retry: boolean
  waitTime?: number
} {
  switch (error.statusCode) {
    case 400:
      return { message: "Bad request - check your parameters", retry: false }

    case 401:
      return { message: "Authentication failed", retry: false }

    case 403:
      return { message: "Access forbidden", retry: false }

    case 404:
      return { message: "Resource not found", retry: false }

    case 429:
      return { message: "Rate limited", retry: true, waitTime: 5000 }

    case 500:
    case 502:
    case 503:
      return { message: "Server error", retry: true, waitTime: 1000 }

    default:
      return { message: error.message, retry: false }
  }
}

async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (isNeobankError(error)) {
        const { retry, waitTime } = handleByStatusCode(error)

        if (!retry || attempt === maxRetries) {
          throw error
        }

        const delay = waitTime || baseDelay * Math.pow(2, attempt - 1)
        console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`)
        await sleep(delay)
      } else {
        if (attempt === maxRetries) throw error

        const delay = baseDelay * Math.pow(2, attempt - 1)
        console.log(`Network error. Retrying in ${delay}ms...`)
        await sleep(delay)
      }
    }
  }

  throw lastError
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface ErrorDisplay {
  title: string
  message: string
  action?: string
}

function getErrorDisplay(error: unknown): ErrorDisplay {
  if (!isNeobankError(error)) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        title: "Connection Error",
        message: "Unable to connect to the server.",
        action: "Check your internet connection and try again.",
      }
    }

    return {
      title: "Unexpected Error",
      message: "Something went wrong.",
      action: "Please try again later.",
    }
  }

  switch (error.statusCode) {
    case 401:
      return {
        title: "Authentication Required",
        message: "Your session has expired or is invalid.",
        action: "Please log in again.",
      }

    case 403:
      return {
        title: "Access Denied",
        message: "You don't have permission to perform this action.",
        action: "Contact support if you think this is a mistake.",
      }

    case 404:
      return {
        title: "Not Found",
        message: "The requested item could not be found.",
        action: "It may have been moved or deleted.",
      }

    case 429:
      return {
        title: "Too Many Requests",
        message: "You've made too many requests.",
        action: "Please wait a moment and try again.",
      }

    case 500:
    case 502:
    case 503:
      return {
        title: "Server Error",
        message: "We're experiencing technical difficulties.",
        action: "Please try again in a few minutes.",
      }

    default:
      return {
        title: "Error",
        message: error.message || "An error occurred.",
        action: error.detail || undefined,
      }
  }
}

async function errorHandlingExample() {
  const sdk = new NeobankSDK({
    apiKey: process.env.NEXT_PUBLIC_NEOBANK_API_KEY!,
    userAddress: process.env.NEXT_PUBLIC_USER_ADDRESS,
  })

  try {
    const vaults = await fetchWithRetry(
      () => sdk.vaults.list(),
      3,
      1000
    )

    console.log(`Fetched ${vaults.length} vaults`)
    return vaults
  } catch (error) {
    const display = getErrorDisplay(error)

    console.log("\nError Display:")
    console.log(`Title: ${display.title}`)
    console.log(`Message: ${display.message}`)
    if (display.action) {
      console.log(`Action: ${display.action}`)
    }

    throw error
  }
}

export {
  fetchWithErrorHandling,
  handleErrorByCode,
  handleByStatusCode,
  fetchWithRetry,
  getErrorDisplay,
  errorHandlingExample,
}

/**
 * Notes
 *
 * Always use isNeobankError() to check if an error is from the SDK.
 *
 * NeobankError properties:
 * - message: Human-readable error message
 * - code: API-specific error code (number)
 * - statusCode: HTTP status code
 * - detail: Additional context (may be null)
 *
 * Common HTTP status codes:
 * - 400: Bad request (invalid input)
 * - 401: Unauthorized (invalid API key)
 * - 403: Forbidden (access denied)
 * - 404: Not found
 * - 429: Rate limited
 * - 500/502/503: Server errors
 *
 * Retry logic should only apply to transient errors (5xx, network).
 * Never retry on 4xx errors (except 429 after waiting).
 * Use exponential backoff for retries to avoid overwhelming the server.
 */
