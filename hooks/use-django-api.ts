"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  apiClient,
  type AuthUser,
  type Coupon,
  type Subscription,
  type SubscriptionPlan,
  type SubscriptionStatus,
  type Notification,
  type Transaction,
  type Invoice,
  type X402PricingRule,
  type X402Receipt,
  type X402Link,
  type X402Widget,
  type X402CreditPlan,
  type X402CreditSubscription,
  type X402CreditUsageEntry,
} from "@/lib/django-api-client"
import { X402_PAYMENT_COMPLETED_EVENT } from "@/lib/x402-payments"

// Hook pour l'authentification
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      if (!apiClient.isAuthenticated()) {
        setLoading(false)
        return
      }

      try {
        const response = await apiClient.getProfile()
        if (response.data) {
          setUser(response.data)
        } else {
          apiClient.clearTokens()
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        apiClient.clearTokens()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.login(email, password)
      if (response.data) {
        setUser(response.data.user)
        return { success: true, user: response.data.user }
      } else {
        setError(response.error || "Login failed")
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Login failed"
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await apiClient.logout()
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiClient.getProfile()
      if (response.data) {
        setUser(response.data)
      }
    } catch (err) {
      console.error("Profile refresh failed:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    error,
    login,
    logout,
    refreshProfile,
    isAuthenticated: !!user,
  }
}

// Hook pour les plans d'abonnement
export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.getPlans()
      if (response.data) {
        setPlans(response.data)
      } else {
        setError(response.error || "Failed to fetch plans")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch plans")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  }
}

// Hook pour l'abonnement utilisateur
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.getSubscriptionStatus()
      if (response.data) {
        setSubscription(response.data)
      } else if (!response.error && (response.status === 200 || response.status === 204)) {
        setSubscription(null)
      } else if (response.status === 404) {
        setSubscription(null)
      } else {
        setError(response.error || "Failed to fetch subscription")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch subscription")
    } finally {
      setLoading(false)
    }
  }, [])

  const subscribe = useCallback(
    async (
      planId: string | number,
      options: {
        walletAddress: string
        couponId?: string
        couponCode?: string
        email?: string
        firstName?: string
        lastName?: string
        phone?: string
        customerType?: "individual" | "business"
        companyName?: string
        vatNumber?: string
        billingAddress?: string
        billingCity?: string
        billingPostalCode?: string
        billingCountry?: string
        shippingAddress?: string
        shippingCity?: string
        shippingPostalCode?: string
        shippingCountry?: string
        quantity?: number
        metadata?: Record<string, unknown>
      },
    ) => {
    setLoading(true)
    setError(null)

    try {
        if (!options?.walletAddress) {
          const message = "Wallet address required to create subscription"
          setError(message)
          return { success: false, error: message }
        }

        const response = await apiClient.subscribe(String(planId), {
          walletAddress: options.walletAddress,
          couponId: options.couponId,
          couponCode: options.couponCode,
          email: options.email,
          firstName: options.firstName,
          lastName: options.lastName,
          phone: options.phone,
          customerType: options.customerType,
          companyName: options.companyName,
          vatNumber: options.vatNumber,
          billingAddress: options.billingAddress,
          billingCity: options.billingCity,
          billingPostalCode: options.billingPostalCode,
          billingCountry: options.billingCountry,
          shippingAddress: options.shippingAddress,
          shippingCity: options.shippingCity,
          shippingPostalCode: options.shippingPostalCode,
          shippingCountry: options.shippingCountry,
          quantity: options.quantity,
          metadata: options.metadata,
        })
        if (response.data) {
          const subscriptionData = response.data.subscription
          setSubscription(subscriptionData)
        return {
          success: true,
            subscription: subscriptionData,
            invoice: response.data.invoice,
            paymentIntent: response.data.payment_intent,
            paymentError: response.data.payment_error,
        }
      } else {
        setError(response.error || "Failed to subscribe")
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to subscribe"
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
    },
    [],
  )

  const cancel = useCallback(async (options: { atPeriodEnd?: boolean } = {}) => {
    setLoading(true)
    setError(null)

    try {
      if (!subscription) {
        setError("No subscription to cancel")
        return { success: false, error: "No subscription to cancel" }
      }

      const response = await apiClient.cancelSubscription(subscription.id, { atPeriodEnd: options.atPeriodEnd })
      if (response.data || response.status === 204) {
        await fetchSubscription()
        return { success: true, message: "Subscription cancelled" }
      } else {
        setError(response.error || "Failed to cancel subscription")
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to cancel subscription"
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [fetchSubscription, subscription])

  const reactivate = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!subscription) {
        setError("No subscription to resume")
        return { success: false, error: "No subscription to resume" }
      }

      const response = await apiClient.resumeSubscription(subscription.id)
      if (response.data || response.status === 204) {
        await fetchSubscription()
        return { success: true, message: "Subscription reactivated" }
      } else {
        setError(response.error || "Failed to reactivate subscription")
        return { success: false, error: response.error }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to reactivate subscription"
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [fetchSubscription, subscription])

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchSubscription()
    }
  }, [fetchSubscription])

  return {
    subscription,
    loading,
    error,
    subscribe,
    cancel,
    reactivate,
    refetch: fetchSubscription,
  }
}

// Hook pour les transactions
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  })

  const fetchPayments = useCallback(
    async (params?: {
      page?: number
      page_size?: number
      status?: string
      currency?: string
    }) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.listTransactions(params)
        if (response.data) {
          setTransactions(response.data.results)
          setPagination({
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous,
          })
        } else {
          setError(response.error || "Failed to fetch payments")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch payments")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const payInvoice = useCallback(
    async (invoiceId: string | number) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.payInvoice(String(invoiceId))
        if (response.data) {
          const payload = response.data as Invoice | { invoice: Invoice; payment_intent?: unknown; detail?: string }
          await fetchPayments()
          return {
            success: true,
            invoice: "invoice" in payload ? payload.invoice : payload,
            paymentIntent: "payment_intent" in payload ? payload.payment_intent : undefined,
            message: "detail" in payload ? payload.detail : undefined,
          }
        } else {
          setError(response.error || "Failed to pay invoice")
          return { success: false, error: response.error }
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : "Failed to pay invoice"
        setError(error)
        return { success: false, error }
      } finally {
        setLoading(false)
      }
    },
    [fetchPayments],
  )

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchPayments()
    }
  }, [fetchPayments])

  return {
    transactions,
    loading,
    error,
    pagination,
    fetchPayments,
    payInvoice,
    triggerSwap: payInvoice,
  }
}

export const usePaymentHistory = useTransactions

// Hook pour la liste des abonnements (admin)
export function useSubscriptionsList(initialParams?: Record<string, unknown>) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  })

  const fetchSubscriptions = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.listSubscriptions(params ?? initialParams)
        if (response.data) {
          setSubscriptions(response.data.results)
          setPagination({
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous,
          })
        } else {
          setError(response.error || "Failed to fetch subscriptions")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch subscriptions")
      } finally {
        setLoading(false)
      }
    },
    [initialParams],
  )

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchSubscriptions(initialParams)
    }
  }, [fetchSubscriptions, initialParams])

  return {
    subscriptions,
    loading,
    error,
    pagination,
    refetch: fetchSubscriptions,
  }
}

// Hook pour les factures
export function useInvoices(initialParams?: Record<string, unknown>) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  })

  const fetchInvoices = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.listInvoices(params ?? initialParams)
        if (response.data) {
          setInvoices(response.data.results)
          setPagination({
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous,
          })
        } else {
          setError(response.error || "Failed to fetch invoices")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch invoices")
      } finally {
        setLoading(false)
      }
    },
    [initialParams],
  )

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchInvoices(initialParams)
    }
  }, [fetchInvoices, initialParams])

  return {
    invoices,
    loading,
    error,
    pagination,
    refetch: fetchInvoices,
  }
}

// Hook pour les coupons
export function useCoupons(initialParams?: Record<string, unknown>) {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mutating, setMutating] = useState(false)

  const fetchCoupons = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.listCoupons(params ?? initialParams)
        if (response.data) {
          setCoupons(response.data.results)
        } else {
          setError(response.error || "Failed to fetch coupons")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch coupons")
      } finally {
        setLoading(false)
      }
    },
    [initialParams],
  )

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchCoupons(initialParams)
    }
  }, [fetchCoupons, initialParams])

  const withMutation = useCallback(
    async <T,>(mutation: () => Promise<T>) => {
      setMutating(true)
      try {
        return await mutation()
      } finally {
        setMutating(false)
      }
    },
    [],
  )

  const createCoupon = useCallback(
    async (payload: Parameters<typeof apiClient.createCoupon>[0]) => {
      return withMutation(async () => {
        const response = await apiClient.createCoupon(payload)
        if (response.error || !response.data) {
          return { success: false, error: response.error || "Failed to create coupon" }
        }
        setCoupons((prev) => [response.data!, ...prev])
        return { success: true, coupon: response.data }
      })
    },
    [withMutation],
  )

  const updateCoupon = useCallback(
    async (couponId: string, payload: Parameters<typeof apiClient.updateCoupon>[1]) => {
      return withMutation(async () => {
        const response = await apiClient.updateCoupon(couponId, payload)
        if (response.error || !response.data) {
          return { success: false, error: response.error || "Failed to update coupon" }
        }
        setCoupons((prev) => prev.map((coupon) => (coupon.id === couponId ? response.data! : coupon)))
        return { success: true, coupon: response.data }
      })
    },
    [withMutation],
  )

  const deleteCoupon = useCallback(
    async (couponId: string) => {
      return withMutation(async () => {
        const response = await apiClient.deleteCoupon(couponId)
        if (response.error && response.status !== 204) {
          return { success: false, error: response.error || "Failed to delete coupon" }
        }
        setCoupons((prev) => prev.filter((coupon) => coupon.id !== couponId))
        return { success: true }
      })
    },
    [withMutation],
  )

  return {
    coupons,
    loading,
    error,
    mutating,
    refetch: fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  }
}

// Hooks pour la gestion x402 --------------------------------------------------

export function useX402PricingRules() {
  const [rules, setRules] = useState<X402PricingRule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mutating, setMutating] = useState(false)

  const fetchRules = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.listX402PricingRules()
      if (response.data) {
        setRules(response.data)
      } else {
        setError(response.error || "Failed to fetch pricing rules")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pricing rules")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchRules()
    }
  }, [fetchRules])

  const withMutation = useCallback(async <T,>(mutation: () => Promise<T>) => {
    setMutating(true)
    try {
      return await mutation()
    } finally {
      setMutating(false)
    }
  }, [])

  const createRule = useCallback(
    async (payload: Parameters<typeof apiClient.createX402PricingRule>[0]) => {
      return withMutation(async () => {
        const response = await apiClient.createX402PricingRule(payload)
        if (response.error || !response.data) {
          return { success: false, error: response.error || "Failed to create pricing rule" }
        }
        setRules((prev) => [response.data!, ...prev])
        return { success: true, rule: response.data }
      })
    },
    [withMutation],
  )

  const updateRule = useCallback(
    async (ruleId: string, payload: Parameters<typeof apiClient.updateX402PricingRule>[1]) => {
      return withMutation(async () => {
        const response = await apiClient.updateX402PricingRule(ruleId, payload)
        if (response.error || !response.data) {
          return { success: false, error: response.error || "Failed to update pricing rule" }
        }
        setRules((prev) => prev.map((rule) => (rule.id === ruleId ? response.data! : rule)))
        return { success: true, rule: response.data }
      })
    },
    [withMutation],
  )

  const deleteRule = useCallback(
    async (ruleId: string) => {
      return withMutation(async () => {
        const response = await apiClient.deleteX402PricingRule(ruleId)
        if (response.error && response.status !== 204) {
          return { success: false, error: response.error || "Failed to delete pricing rule" }
        }
        setRules((prev) => prev.filter((rule) => rule.id !== ruleId))
        return { success: true }
      })
    },
    [withMutation],
  )

  const toggleRuleStatus = useCallback(
    async (rule: X402PricingRule) => {
      return updateRule(rule.id, { is_active: !rule.is_active })
    },
    [updateRule],
  )

  return {
    rules,
    loading,
    error,
    mutating,
    refetch: fetchRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRuleStatus,
  }
}

export function useX402Receipts(initialFilters?: Record<string, unknown>) {
  const [receipts, setReceipts] = useState<X402Receipt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)
  const filtersRef = useRef<Record<string, unknown> | undefined>(initialFilters)

  const fetchReceipts = useCallback(
    async (filters?: Record<string, unknown>) => {
      setLoading(true)
      setError(null)

      if (filters) {
        filtersRef.current = filters
      }

      try {
        const response = await apiClient.listX402Receipts(filters ?? filtersRef.current)
        if (response.data) {
          setReceipts(response.data.results)
          setCount(response.data.count)
        } else {
          setError(response.error || "Failed to fetch receipts")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch receipts")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchReceipts(initialFilters)
    }
  }, [fetchReceipts, initialFilters])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handlePaymentComplete = () => {
      void fetchReceipts()
    }

    window.addEventListener(X402_PAYMENT_COMPLETED_EVENT, handlePaymentComplete)
    return () => {
      window.removeEventListener(X402_PAYMENT_COMPLETED_EVENT, handlePaymentComplete)
    }
  }, [fetchReceipts])

  return {
    receipts,
    loading,
    error,
    count,
    refetch: fetchReceipts,
  }
}

export function useX402Links(initialFilters?: Record<string, unknown>) {
  const [links, setLinks] = useState<X402Link[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mutating, setMutating] = useState(false)
  const filtersRef = useRef<Record<string, unknown> | undefined>(initialFilters)

  const fetchLinks = useCallback(async (filters?: Record<string, unknown>) => {
    setLoading(true)
    setError(null)

    if (filters) {
      filtersRef.current = filters
    }

    try {
      const response = await apiClient.listX402Links(filters ?? filtersRef.current)
      if (response.data) {
        setLinks(response.data)
      } else {
        setError(response.error || "Failed to fetch payment links")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payment links")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchLinks(initialFilters)
    }
  }, [fetchLinks, initialFilters])

  const withMutation = useCallback(
    async <T,>(mutation: () => Promise<T>) => {
      setMutating(true)
      try {
        return await mutation()
      } finally {
        setMutating(false)
      }
    },
    [],
  )

  const createLink = useCallback(
    async (payload: Parameters<typeof apiClient.createX402Link>[0]) => {
      return withMutation(async () => {
        const response = await apiClient.createX402Link(payload)
        if (response.error || !response.data) {
          return { success: false, error: response.error || "Failed to create payment link" }
        }
        setLinks((prev) => [response.data!, ...prev])
        return { success: true, link: response.data }
      })
    },
    [withMutation],
  )

  const updateLink = useCallback(
    async (linkId: string, payload: Parameters<typeof apiClient.updateX402Link>[1]) => {
      return withMutation(async () => {
        const response = await apiClient.updateX402Link(linkId, payload)
        if (response.error || !response.data) {
          return { success: false, error: response.error || "Failed to update payment link" }
        }
        setLinks((prev) => prev.map((link) => (link.id === linkId ? response.data! : link)))
        return { success: true, link: response.data }
      })
    },
    [withMutation],
  )

  const deleteLink = useCallback(
    async (linkId: string) => {
      return withMutation(async () => {
        const response = await apiClient.deleteX402Link(linkId)
        if (response.error && response.status !== 204) {
          return { success: false, error: response.error || "Failed to delete payment link" }
        }
        setLinks((prev) => prev.filter((link) => link.id !== linkId))
        return { success: true }
      })
    },
    [withMutation],
  )

  return {
    links,
    loading,
    error,
    mutating,
    refetch: fetchLinks,
    createLink,
    updateLink,
    deleteLink,
  }
}

export function useX402Widgets(initialFilters?: Record<string, unknown>) {
  const [widgets, setWidgets] = useState<X402Widget[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mutating, setMutating] = useState(false)
  const filtersRef = useRef<Record<string, unknown> | undefined>(initialFilters)

  const fetchWidgets = useCallback(async (filters?: Record<string, unknown>) => {
    setLoading(true)
    setError(null)

    if (filters) {
      filtersRef.current = filters
    }

    try {
      const response = await apiClient.listX402Widgets(filters ?? filtersRef.current)
      if (response.data) {
        setWidgets(response.data)
      } else {
        setError(response.error || "Failed to fetch widgets")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch widgets")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchWidgets(initialFilters)
    }
  }, [fetchWidgets, initialFilters])

  const withMutation = useCallback(
    async <T,>(mutation: () => Promise<T>) => {
      setMutating(true)
      try {
        return await mutation()
      } finally {
        setMutating(false)
      }
    },
    [],
  )

  const createWidget = useCallback(
    async (payload: Parameters<typeof apiClient.createX402Widget>[0]) => {
      return withMutation(async () => {
        const response = await apiClient.createX402Widget(payload)
        if (response.error || !response.data) {
          return { success: false, error: response.error || "Failed to create widget" }
        }
        setWidgets((prev) => [response.data!, ...prev])
        return { success: true, widget: response.data }
      })
    },
    [withMutation],
  )

  const updateWidget = useCallback(
    async (widgetId: string, payload: Parameters<typeof apiClient.updateX402Widget>[1]) => {
      return withMutation(async () => {
        const response = await apiClient.updateX402Widget(widgetId, payload)
        if (response.error || !response.data) {
          return { success: false, error: response.error || "Failed to update widget" }
        }
        setWidgets((prev) => prev.map((widget) => (widget.id === widgetId ? response.data! : widget)))
        return { success: true, widget: response.data }
      })
    },
    [withMutation],
  )

  const deleteWidget = useCallback(
    async (widgetId: string) => {
      return withMutation(async () => {
        const response = await apiClient.deleteX402Widget(widgetId)
        if (response.error && response.status !== 204) {
          return { success: false, error: response.error || "Failed to delete widget" }
        }
        setWidgets((prev) => prev.filter((widget) => widget.id !== widgetId))
        return { success: true }
      })
    },
    [withMutation],
  )

  return {
    widgets,
    loading,
    error,
    mutating,
    refetch: fetchWidgets,
    createWidget,
    updateWidget,
    deleteWidget,
  }
}

export function useX402CreditPlans(initialFilters?: Record<string, unknown>) {
  const [plans, setPlans] = useState<X402CreditPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mutating, setMutating] = useState(false)
  const filtersRef = useRef<Record<string, unknown> | undefined>(initialFilters)

  const fetchPlans = useCallback(async (filters?: Record<string, unknown>) => {
    setLoading(true)
    setError(null)

    if (filters) {
      filtersRef.current = filters
    }

    try {
      const response = await apiClient.listX402CreditPlans(filters ?? filtersRef.current)
      if (response.data) {
        setPlans(response.data)
      } else {
        setError(response.error || "Failed to fetch credit plans")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch credit plans")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchPlans(initialFilters)
    }
  }, [fetchPlans, initialFilters])

  const withMutation = useCallback(
    async <T,>(mutation: () => Promise<T>) => {
      setMutating(true)
      try {
        return await mutation()
      } finally {
        setMutating(false)
      }
    },
    [],
  )

  const createPlan = useCallback(
    async (payload: Parameters<typeof apiClient.createX402CreditPlan>[0]) => {
      return withMutation(async () => {
        const response = await apiClient.createX402CreditPlan(payload)
        if (response.error || !response.data) {
          return { success: false, error: response.error || "Failed to create credit plan" }
        }
        setPlans((prev) => [response.data!, ...prev])
        return { success: true, plan: response.data }
      })
    },
    [withMutation],
  )

  const updatePlan = useCallback(
    async (planId: string, payload: Parameters<typeof apiClient.updateX402CreditPlan>[1]) => {
      return withMutation(async () => {
        const response = await apiClient.updateX402CreditPlan(planId, payload)
        if (response.error || !response.data) {
          return { success: false, error: response.error || "Failed to update credit plan" }
        }
        setPlans((prev) => prev.map((plan) => (plan.id === planId ? response.data! : plan)))
        return { success: true, plan: response.data }
      })
    },
    [withMutation],
  )

  const deletePlan = useCallback(
    async (planId: string) => {
      return withMutation(async () => {
        const response = await apiClient.deleteX402CreditPlan(planId)
        if (response.error && response.status !== 204) {
          return { success: false, error: response.error || "Failed to delete credit plan" }
        }
        setPlans((prev) => prev.filter((plan) => plan.id !== planId))
        return { success: true }
      })
    },
    [withMutation],
  )

  return {
    plans,
    loading,
    error,
    mutating,
    refetch: fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
  }
}

export function useX402CreditSubscriptions(initialFilters?: Record<string, unknown>) {
  const [subscriptions, setSubscriptions] = useState<X402CreditSubscription[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mutating, setMutating] = useState(false)
  const filtersRef = useRef<Record<string, unknown> | undefined>(initialFilters)

  const fetchSubscriptions = useCallback(async (filters?: Record<string, unknown>) => {
    setLoading(true)
    setError(null)

    if (filters) {
      filtersRef.current = filters
    }

    try {
      const response = await apiClient.listX402CreditSubscriptions(filters ?? filtersRef.current)
      if (response.data) {
        setSubscriptions(response.data.results)
        setCount(response.data.count)
      } else {
        setError(response.error || "Failed to fetch credit subscriptions")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch credit subscriptions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchSubscriptions(initialFilters)
    }
  }, [fetchSubscriptions, initialFilters])

  const withMutation = useCallback(
    async <T,>(mutation: () => Promise<T>) => {
      setMutating(true)
      try {
        return await mutation()
      } finally {
        setMutating(false)
      }
    },
    [],
  )

  const consumeCredits = useCallback(
    async (subscriptionId: string, payload: Parameters<typeof apiClient.consumeX402CreditSubscription>[1]) => {
      return withMutation(async () => {
        const response = await apiClient.consumeX402CreditSubscription(subscriptionId, payload)
        if (response.error || !response.data) {
          return { success: false, error: response.error || "Failed to consume credits" }
        }
        setSubscriptions((prev) => prev.map((sub) => (sub.id === subscriptionId ? response.data! : sub)))
        return { success: true, subscription: response.data }
      })
    },
    [withMutation],
  )

  return {
    subscriptions,
    loading,
    error,
    count,
    mutating,
    refetch: fetchSubscriptions,
    consumeCredits,
  }
}

export function useX402CreditUsage(initialFilters?: Record<string, unknown>) {
  const [usage, setUsage] = useState<X402CreditUsageEntry[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const filtersRef = useRef<Record<string, unknown> | undefined>(initialFilters)

  const fetchUsage = useCallback(async (filters?: Record<string, unknown>) => {
    setLoading(true)
    setError(null)

    if (filters) {
      filtersRef.current = filters
    }

    try {
      const response = await apiClient.listX402CreditUsage(filters ?? filtersRef.current)
      if (response.data) {
        setUsage(response.data.results)
        setCount(response.data.count)
      } else {
        setError(response.error || "Failed to fetch credit usage")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch credit usage")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchUsage(initialFilters)
    }
  }, [fetchUsage, initialFilters])

  return {
    usage,
    loading,
    error,
    count,
    refetch: fetchUsage,
  }
}

// Hook pour les notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(
    async (params?: {
      page?: number
      page_size?: number
      is_read?: boolean
    }) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.getNotifications(params)
        if (response.data) {
          setNotifications(response.data.results)
          setUnreadCount(response.data.results.filter((n) => !n.is_read).length)
        } else {
          setError(response.error || "Failed to fetch notifications")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch notifications")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await apiClient.markNotificationAsRead(notificationId)
      if (response.data) {
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to mark as read" }
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await apiClient.markAllNotificationsAsRead()
      if (response.data && !response.error) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
        return { success: true }
      }
      if (response.status === 404) {
        const ids = notifications.filter((n) => !n.is_read).map((n) => n.id)
        await Promise.all(ids.map((id) => apiClient.markNotificationAsRead(id)))
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to mark all as read" }
    }
  }, [notifications])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await apiClient.deleteNotification(notificationId)
      if (response.status === 204) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete notification" }
    }
  }, [])

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      fetchNotifications()
    }
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}

// Hook pour l'analytics
export function useAnalytics() {
  const trackEvent = useCallback(async (eventType: string, payload: Record<string, any> = {}) => {
    try {
      const response = await apiClient.trackEvent(eventType, payload)
      return Boolean(response.data)
    } catch {
      return false
    }
  }, [])

  return { trackEvent }
}
