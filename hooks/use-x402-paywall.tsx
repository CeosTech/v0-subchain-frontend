"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/django-api-client"
import {
  X402_PAYMENT_COMPLETED_EVENT,
  openX402PaymentModal,
  parseX402Challenge,
  type X402PaymentChallengeHeaders,
  type X402PaymentCompletedDetail,
} from "@/lib/x402-payments"

interface PaywallRequestState {
  challenge: X402PaymentChallengeHeaders
  url: string
  method: string
  resolve: (receipt: string | null) => void
}

interface X402PaywallContextValue {
  openPayment: (request: { challenge: X402PaymentChallengeHeaders; url: string; method: string }) => Promise<string | null>
  fetchWithPaywall: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
}

const X402PaywallContext = createContext<X402PaywallContextValue | null>(null)

const buildRequestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") return input
  if (input instanceof URL) return input.toString()
  return input.url
}

const cloneRequestInit = (init?: RequestInit): RequestInit => {
  if (!init) {
    return { headers: new Headers() }
  }

  const cloned: RequestInit = {
    ...init,
  }

  const existingHeaders = init.headers instanceof Headers ? init.headers : new Headers(init.headers ?? undefined)
  cloned.headers = new Headers(existingHeaders)

  return cloned
}

const determineMethod = (input: RequestInfo | URL, init?: RequestInit) => {
  if (init?.method) return init.method
  if (typeof input === "object" && "method" in input) {
    return (input as Request).method
  }
  return "GET"
}

export function useX402Paywall() {
  const ctx = useContext(X402PaywallContext)
  if (!ctx) {
    throw new Error("useX402Paywall must be used within an X402PaywallProvider")
  }
  return ctx
}

export function useX402Request() {
  const { fetchWithPaywall } = useX402Paywall()
  return fetchWithPaywall
}

export function X402PaywallProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<PaywallRequestState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingRef = useRef(false)

  const openPayment = useCallback<X402PaywallContextValue["openPayment"]>(
    async ({ challenge, url, method }) => {
      if (pendingRef.current) {
        return null
      }

      pendingRef.current = true

      return new Promise<string | null>((resolve) => {
        setError(null)
        setCurrentRequest({ challenge, url, method, resolve })
        setDialogOpen(true)
      })
    },
    [],
  )

  const cancelRequest = useCallback(() => {
    if (!currentRequest) return
    pendingRef.current = false
    currentRequest.resolve(null)
    setCurrentRequest(null)
    setDialogOpen(false)
    setError(null)
    setLoading(false)
  }, [currentRequest])

  const handleConfirm = useCallback(async () => {
    if (!currentRequest) return

    const { challenge, url, method, resolve } = currentRequest

    setLoading(true)
    setError(null)

    try {
      const receipt = await openX402PaymentModal({ ...challenge, url, method })
      if (!receipt) {
        setError("Payment was cancelled or no receipt was provided.")
        return
      }

      pendingRef.current = false
      resolve(receipt)
      setCurrentRequest(null)
      setDialogOpen(false)
      toast({ title: "Payment receipt submitted", description: "Retrying the original request with the provided receipt." })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to complete payment"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [currentRequest, toast])

  const handleDialogChange = useCallback(
    (open: boolean) => {
      if (!open) {
        cancelRequest()
      }
    },
    [cancelRequest],
  )

  const fetchWithPaywall = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const originalResponse = await fetch(input, init)

      if (originalResponse.status !== 402) {
        return originalResponse
      }

      const challenge = parseX402Challenge(originalResponse.headers)
      if (!challenge) {
        return originalResponse
      }

      const requestUrl = buildRequestUrl(input)
      const method = determineMethod(input, init)

      const receipt = await openPayment({ challenge, url: requestUrl, method })

      if (!receipt) {
        return originalResponse
      }

      const retryInit = cloneRequestInit(init)
      const headers = retryInit.headers instanceof Headers ? retryInit.headers : new Headers(retryInit.headers ?? undefined)
      headers.set("X-402-Receipt", receipt)
      retryInit.headers = headers

      let retryTarget: RequestInfo | URL = requestUrl
      if (typeof input === "object" && "method" in input) {
        retryTarget = new Request(input as Request, retryInit)
      }

      const retryResponse = await fetch(retryTarget, retryInit)

      if (retryResponse.ok && typeof window !== "undefined") {
        const detail: X402PaymentCompletedDetail = {
          ...challenge,
          url: requestUrl,
          method,
          receipt,
        }
        window.dispatchEvent(new CustomEvent<X402PaymentCompletedDetail>(X402_PAYMENT_COMPLETED_EVENT, { detail }))
      }

      return retryResponse
    },
    [openPayment],
  )

  useEffect(() => {
    apiClient.setFetchImplementation(fetchWithPaywall)
    return () => {
      apiClient.setFetchImplementation()
    }
  }, [fetchWithPaywall])

  const contextValue = useMemo(
    () => ({
      openPayment,
      fetchWithPaywall,
    }),
    [fetchWithPaywall, openPayment],
  )

  return (
    <X402PaywallContext.Provider value={contextValue}>
      {children}
      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Micropayment required</DialogTitle>
            <DialogDescription>
              Complete the payment to continue with the requested operation. Use your Algorand wallet to send the
              specified amount and paste the receipt token when prompted.
            </DialogDescription>
          </DialogHeader>
          {currentRequest ? (
            <div className="space-y-4">
              <div className="rounded-md border border-white/10 bg-muted/30 p-4 text-sm">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Request</span><span className="font-medium">{currentRequest.method.toUpperCase()} {currentRequest.url}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold">{currentRequest.challenge.amount} {currentRequest.challenge.currency}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Network</span><span className="font-medium capitalize">{currentRequest.challenge.network}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Pay to</span><span className="truncate font-mono text-xs sm:text-sm">{currentRequest.challenge.payTo}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Nonce</span><span className="font-mono text-xs sm:text-sm">{currentRequest.challenge.nonce}</span></div>
                </div>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={cancelRequest} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? "Processing..." : "Open Wallet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </X402PaywallContext.Provider>
  )
}
