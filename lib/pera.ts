import { PeraWalletConnect } from "@perawallet/connect"

let pera: PeraWalletConnect | null = null

function getPera(): PeraWalletConnect {
  if (!pera) {
    pera = new PeraWalletConnect()
    pera.connector?.on("disconnect", () => {
      try {
        localStorage.removeItem("pera_wallet_accounts")
      } catch {}
    })
  }
  return pera
}

export async function connectWallet(): Promise<string> {
  if (typeof window === "undefined") throw new Error("No window")
  const instance = getPera()
  try {
    const existing = await instance.reconnectSession()
    if (existing && existing.length > 0) {
      try { localStorage.setItem("pera_wallet_accounts", JSON.stringify(existing)) } catch {}
      return existing[0]
    }
  } catch {}
  const accounts = await instance.connect()
  if (!accounts || accounts.length === 0) throw new Error("No accounts")
  try { localStorage.setItem("pera_wallet_accounts", JSON.stringify(accounts)) } catch {}
  return accounts[0]
}

export async function disconnectWallet(): Promise<void> {
  if (!pera) return
  try { await pera.disconnect() } catch {}
  try { localStorage.removeItem("pera_wallet_accounts") } catch {}
}
