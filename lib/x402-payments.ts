export interface X402PaymentChallengeHeaders {
  payTo: string
  amount: string
  currency: string
  network: string
  nonce: string
  callbackUrl?: string | null
}

export interface X402PaymentRequest extends X402PaymentChallengeHeaders {
  url: string
  method: string
}

export interface X402PaymentCompletedDetail extends X402PaymentRequest {
  receipt: string
}

export const X402_PAYMENT_COMPLETED_EVENT = "x402:payment-completed"

export function parseX402Challenge(headers: Headers): X402PaymentChallengeHeaders | null {
  const payTo = headers.get("X-402-PayTo")
  const amount = headers.get("X-402-Amount")
  const currency = headers.get("X-402-Currency")
  const network = headers.get("X-402-Network")
  const nonce = headers.get("X-402-Nonce")

  if (!payTo || !amount || !currency || !network || !nonce) {
    return null
  }

  return {
    payTo,
    amount,
    currency,
    network,
    nonce,
    callbackUrl: headers.get("X-402-Callback"),
  }
}

export async function openX402PaymentModal(params: X402PaymentRequest): Promise<string | null> {
  if (typeof window === "undefined") {
    return null
  }

  const message = [
    `Pay ${params.amount} ${params.currency} on ${params.network}`,
    `Recipient: ${params.payTo}`,
    `Nonce: ${params.nonce}`,
    "Enter the receipt token provided by your wallet:",
  ].join("\n")

  const receipt = window.prompt(message)
  if (!receipt) {
    return null
  }

  return receipt.trim()
}
