export class RegistrationValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "RegistrationValidationError"
  }
}

export interface NormalizedRegistrationPayload {
  email: string
  password: string
  wallet_address: string
  username?: string
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null
}

function extractWalletAddress(data: UnknownRecord): string | null {
  const rawWallet =
    typeof data.wallet_address === "string"
      ? data.wallet_address
      : typeof data.walletAddress === "string"
        ? data.walletAddress
        : null

  if (!rawWallet) {
    return null
  }

  const trimmed = rawWallet.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function normalizeRegistrationBody(body: unknown): NormalizedRegistrationPayload {
  if (!isRecord(body)) {
    throw new RegistrationValidationError("Invalid JSON body")
  }

  const email = typeof body.email === "string" ? body.email.trim() : ""
  const password = typeof body.password === "string" ? body.password : ""
  const usernameInput = typeof body.username === "string" ? body.username.trim() : ""
  const walletAddress = extractWalletAddress(body)

  if (!email || !password || !walletAddress) {
    throw new RegistrationValidationError("Email, password and wallet_address are required")
  }

  const resolvedUsername = usernameInput || email.split("@")[0]

  const payload: NormalizedRegistrationPayload = {
    email,
    password,
    wallet_address: walletAddress,
  }

  if (resolvedUsername) {
    payload.username = resolvedUsername
  }

  return payload
}
