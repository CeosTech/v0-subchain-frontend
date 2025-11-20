import { PeraWalletConnect } from "@perawallet/connect"

const ACCOUNTS_STORAGE_KEY = "pera_wallet_accounts"
export const pera = typeof window !== "undefined" ? new PeraWalletConnect() : null

if (pera?.connector) {
  pera.connector.on("disconnect", () => {
    clearStoredAccounts()
  })
}

function requirePera(): PeraWalletConnect {
  if (!pera) {
    throw new Error("Pera Wallet is only available in the browser")
  }
  return pera
}

function persistAccounts(accounts: string[]): void {
  try {
    if (typeof localStorage === "undefined") return
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
  } catch {}
}

function clearStoredAccounts(): void {
  try {
    if (typeof localStorage === "undefined") return
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY)
  } catch {}
}

async function reconnectExistingSession(instance: PeraWalletConnect): Promise<string | null> {
  try {
    const existing = await instance.reconnectSession()
    if (existing && existing.length > 0) {
      persistAccounts(existing)
      return existing[0]
    }
  } catch {}
  return null
}

export async function resumeWalletSession(): Promise<string | null> {
  if (typeof window === "undefined") return null
  const instance = requirePera()
  return reconnectExistingSession(instance)
}

export async function connectWallet(options?: { forceNewConnection?: boolean }): Promise<string> {
  if (typeof window === "undefined") throw new Error("Wallet connection unavailable")

  const instance = requirePera()

  if (options?.forceNewConnection && instance.session?.accounts?.length) {
    await instance.disconnect()
  }

  const cachedAccounts = instance.session?.accounts
  if (!options?.forceNewConnection && cachedAccounts?.length) {
    persistAccounts(cachedAccounts)
    return cachedAccounts[0]
  }

  try {
    const accounts = await instance.connect()
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts")
    }
    persistAccounts(accounts)
    return accounts[0]
  } catch (error: unknown) {
    const typedError = error as { data?: { type?: string }; message?: string }
    const isSessionAlreadyConnectedError =
      typedError?.data?.type === "SESSION_ALREADY_CONNECTED" ||
      (typeof typedError?.message === "string" &&
        typedError.message.toLowerCase().includes("session currently connected"))

    if (isSessionAlreadyConnectedError) {
      await instance.disconnect()
      const accounts = await instance.connect()
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts")
      }
      persistAccounts(accounts)
      return accounts[0]
    }
    throw error
  }
}

export async function disconnectWallet(): Promise<void> {
  if (!pera) return
  try {
    await pera.disconnect()
  } catch {}
  clearStoredAccounts()
}
